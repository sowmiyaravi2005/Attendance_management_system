const db = require('../config/db');

class AttendanceService {
    /**
     * Mark or update attendance record for an employee on a given date
     */
    static markAttendance(data) {
        const { employee_id, attendance_date, check_in_time, check_out_time, status, notes } = data;

        if (!employee_id || !attendance_date) {
            throw { statusCode: 400, message: 'employee_id and attendance_date are required' };
        }

        // Check if employee exists and is active
        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
        if (!employee) {
            throw { statusCode: 404, message: `Employee with ID ${employee_id} not found` };
        }

        // Determine default status based on check-in time if status is not explicitly provided
        let finalStatus = status;
        if (!finalStatus) {
            if (check_in_time) {
                // Assuming standard shift starts at 09:15
                const [hours, minutes] = check_in_time.split(':').map(Number);
                const checkInMinutes = hours * 60 + minutes;
                const standardMinutes = 9 * 60 + 15; // 09:15 AM

                finalStatus = checkInMinutes > standardMinutes ? 'Late' : 'Present';
            } else {
                finalStatus = 'Absent';
            }
        }

        // Check if attendance entry already exists for this date
        const existingRecord = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?')
            .get(employee_id, attendance_date);

        if (existingRecord) {
            // Update existing record
            const updatedCheckIn = check_in_time !== undefined ? check_in_time : existingRecord.check_in_time;
            const updatedCheckOut = check_out_time !== undefined ? check_out_time : existingRecord.check_out_time;
            const updatedNotes = notes !== undefined ? notes : existingRecord.notes;

            const stmt = db.prepare(`
                UPDATE attendance
                SET check_in_time = ?, check_out_time = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            stmt.run(updatedCheckIn, updatedCheckOut, finalStatus, updatedNotes, existingRecord.id);

            return this.getAttendanceRecordById(existingRecord.id);
        } else {
            // Insert new record
            const stmt = db.prepare(`
                INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(employee_id, attendance_date, check_in_time || null, check_out_time || null, finalStatus, notes || '');
            return this.getAttendanceRecordById(result.lastInsertRowid);
        }
    }

    static getAttendanceRecordById(id) {
        return db.prepare(`
            SELECT 
                a.*,
                e.employee_code,
                e.first_name,
                e.last_name,
                (e.first_name || ' ' || e.last_name) as employee_name,
                e.email,
                e.department,
                e.designation
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.id = ?
        `).get(id);
    }

    /**
     * Get paginated attendance logs with optional date range, employee search, department filter, and status filter
     */
    static getAttendanceRecords({ date, startDate, endDate, employeeId, department, status, search, page = 1, limit = 10 }) {
        let query = `
            SELECT 
                a.*,
                e.employee_code,
                e.first_name,
                e.last_name,
                (e.first_name || ' ' || e.last_name) as employee_name,
                e.email,
                e.department,
                e.designation
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND a.attendance_date = ?';
            params.push(date);
        } else if (startDate && endDate) {
            query += ' AND a.attendance_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (employeeId) {
            query += ' AND a.employee_id = ?';
            params.push(employeeId);
        }

        if (department) {
            query += ' AND e.department = ?';
            params.push(department);
        }

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // Count total for pagination
        const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
        const totalResult = db.prepare(countQuery).get(...params);
        const total = totalResult ? totalResult.count : 0;

        query += ' ORDER BY a.attendance_date DESC, e.first_name ASC';

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const records = db.prepare(query).all(...params);

        return {
            records,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1
            }
        };
    }

    /**
     * Get Attendance Summary metrics (Percentages and Breakdown)
     */
    static getAttendanceSummary({ date, startDate, endDate }) {
        let dateCondition = '';
        const params = [];

        if (date) {
            dateCondition = 'WHERE attendance_date = ?';
            params.push(date);
        } else if (startDate && endDate) {
            dateCondition = 'WHERE attendance_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        } else {
            // Default to today's date if not specified
            const today = new Date().toISOString().split('T')[0];
            dateCondition = 'WHERE attendance_date = ?';
            params.push(today);
        }

        const summary = db.prepare(`
            SELECT 
                COUNT(*) as totalRecords,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentCount,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateCount,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentCount,
                SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as halfDayCount,
                SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as leaveCount
            FROM attendance
            ${dateCondition}
        `).get(...params);

        const activeEmployees = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'").get().count;

        const totalRecords = summary.totalRecords || 0;
        const presentCount = summary.presentCount || 0;
        const lateCount = summary.lateCount || 0;
        const absentCount = summary.absentCount || 0;
        const halfDayCount = summary.halfDayCount || 0;
        const leaveCount = summary.leaveCount || 0;

        const effectivePresent = presentCount + lateCount + (halfDayCount * 0.5);
        const overallAttendanceRate = activeEmployees > 0 ? ((effectivePresent / activeEmployees) * 100).toFixed(1) : 0;

        return {
            date: date || (startDate && endDate ? `${startDate} to ${endDate}` : new Date().toISOString().split('T')[0]),
            totalActiveEmployees: activeEmployees,
            totalRecordsLogged: totalRecords,
            present: presentCount,
            late: lateCount,
            absent: absentCount,
            halfDay: halfDayCount,
            leave: leaveCount,
            attendancePercentage: parseFloat(overallAttendanceRate)
        };
    }

    /**
     * Employee-wise attendance log history
     */
    static getEmployeeAttendanceHistory(employeeId, { page = 1, limit = 20 }) {
        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
        if (!employee) {
            throw { statusCode: 404, message: `Employee with ID ${employeeId} not found` };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const offset = (pageNum - 1) * limitNum;

        const total = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE employee_id = ?').get(employeeId).count;

        const records = db.prepare(`
            SELECT * FROM attendance
            WHERE employee_id = ?
            ORDER BY attendance_date DESC
            LIMIT ? OFFSET ?
        `).all(employeeId, limitNum, offset);

        return {
            employee: {
                id: employee.id,
                employee_code: employee.employee_code,
                name: `${employee.first_name} ${employee.last_name}`,
                department: employee.department,
                designation: employee.designation
            },
            history: records,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1
            }
        };
    }
}

module.exports = AttendanceService;
