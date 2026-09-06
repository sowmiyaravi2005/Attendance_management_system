const db = require('../config/db');

class ReportService {
    static generateAttendanceCSV({ startDate, endDate, department, status }) {
        let query = `
            SELECT 
                e.employee_code AS "Employee Code",
                (e.first_name || ' ' || e.last_name) AS "Employee Name",
                e.email AS "Email",
                e.department AS "Department",
                e.designation AS "Designation",
                a.attendance_date AS "Attendance Date",
                COALESCE(a.check_in_time, 'N/A') AS "Check In Time",
                COALESCE(a.check_out_time, 'N/A') AS "Check Out Time",
                a.status AS "Status",
                COALESCE(a.notes, '') AS "Notes"
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (startDate && endDate) {
            query += ' AND a.attendance_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (department) {
            query += ' AND e.department = ?';
            params.push(department);
        }

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.attendance_date DESC, e.employee_code ASC';

        const rows = db.prepare(query).all(...params);

        if (rows.length === 0) {
            return 'Employee Code,Employee Name,Email,Department,Designation,Attendance Date,Check In Time,Check Out Time,Status,Notes\n';
        }

        const headers = Object.keys(rows[0]).map(h => `"${h}"`).join(',');
        const csvRows = rows.map(row => {
            return Object.values(row).map(val => {
                const escaped = String(val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',');
        });

        return [headers, ...csvRows].join('\n');
    }
}

module.exports = ReportService;
