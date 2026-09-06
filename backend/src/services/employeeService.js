const db = require('../config/db');

class EmployeeService {
    static getAllEmployees({ search = '', department = '', status = '', sortBy = 'created_at', order = 'DESC', page = 1, limit = 10 }) {
        let query = 'SELECT * FROM employees WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        // Count total records for pagination metadata
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const totalResult = db.prepare(countQuery).get(...params);
        const total = totalResult ? totalResult.count : 0;

        // Sorting validation
        const validSortColumns = ['id', 'employee_code', 'first_name', 'last_name', 'email', 'department', 'designation', 'status', 'created_at'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder}`;

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const employees = db.prepare(query).all(...params);

        return {
            employees,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1
            }
        };
    }

    static getEmployeeById(id) {
        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
        if (!employee) {
            throw { statusCode: 404, message: `Employee with ID ${id} not found` };
        }

        // Calculate attendance summary stats for this employee
        const attendanceStats = db.prepare(`
            SELECT 
                COUNT(*) as totalDaysLogged,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentDays,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateDays,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
                SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as halfDays,
                SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as leaveDays
            FROM attendance
            WHERE employee_id = ?
        `).get(id);

        const totalDays = attendanceStats.totalDaysLogged || 0;
        const presentCount = (attendanceStats.presentDays || 0) + (attendanceStats.lateDays || 0) + ((attendanceStats.halfDays || 0) * 0.5);
        const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 100;

        return {
            ...employee,
            attendanceStats: {
                ...attendanceStats,
                attendancePercentage: parseFloat(attendancePercentage)
            }
        };
    }

    static createEmployee(data) {
        const { employee_code, first_name, last_name, email, phone, department, designation, status = 'Active', hire_date } = data;

        if (!employee_code || !first_name || !last_name || !email || !phone || !department || !designation || !hire_date) {
            throw { statusCode: 400, message: 'All required employee fields must be provided' };
        }

        // Check duplicates
        const existingEmail = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
        if (existingEmail) {
            throw { statusCode: 400, message: 'An employee with this email already exists' };
        }

        const existingCode = db.prepare('SELECT id FROM employees WHERE employee_code = ?').get(employee_code);
        if (existingCode) {
            throw { statusCode: 400, message: 'An employee with this Employee Code already exists' };
        }

        const stmt = db.prepare(`
            INSERT INTO employees (employee_code, first_name, last_name, email, phone, department, designation, status, hire_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(employee_code, first_name, last_name, email, phone, department, designation, status, hire_date);
        return this.getEmployeeById(result.lastInsertRowid);
    }

    static updateEmployee(id, data) {
        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
        if (!employee) {
            throw { statusCode: 404, message: `Employee with ID ${id} not found` };
        }

        const { employee_code, first_name, last_name, email, phone, department, designation, status, hire_date } = data;

        if (email && email !== employee.email) {
            const existingEmail = db.prepare('SELECT id FROM employees WHERE email = ? AND id != ?').get(email, id);
            if (existingEmail) throw { statusCode: 400, message: 'Email address is already in use by another employee' };
        }

        if (employee_code && employee_code !== employee.employee_code) {
            const existingCode = db.prepare('SELECT id FROM employees WHERE employee_code = ? AND id != ?').get(employee_code, id);
            if (existingCode) throw { statusCode: 400, message: 'Employee code is already in use' };
        }

        const updatedFields = {
            employee_code: employee_code || employee.employee_code,
            first_name: first_name || employee.first_name,
            last_name: last_name || employee.last_name,
            email: email || employee.email,
            phone: phone || employee.phone,
            department: department || employee.department,
            designation: designation || employee.designation,
            status: status || employee.status,
            hire_date: hire_date || employee.hire_date
        };

        const stmt = db.prepare(`
            UPDATE employees 
            SET employee_code = ?, first_name = ?, last_name = ?, email = ?, phone = ?, department = ?, designation = ?, status = ?, hire_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            updatedFields.employee_code,
            updatedFields.first_name,
            updatedFields.last_name,
            updatedFields.email,
            updatedFields.phone,
            updatedFields.department,
            updatedFields.designation,
            updatedFields.status,
            updatedFields.hire_date,
            id
        );

        return this.getEmployeeById(id);
    }

    static deleteEmployee(id) {
        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
        if (!employee) {
            throw { statusCode: 404, message: `Employee with ID ${id} not found` };
        }

        db.prepare('DELETE FROM employees WHERE id = ?').run(id);
        return { message: `Employee ${employee.first_name} ${employee.last_name} (${employee.employee_code}) successfully deleted` };
    }

    static getDepartmentsList() {
        const departments = db.prepare('SELECT DISTINCT department FROM employees ORDER BY department ASC').all();
        return departments.map(d => d.department);
    }
}

module.exports = EmployeeService;
