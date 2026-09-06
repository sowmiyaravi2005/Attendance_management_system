const EmployeeService = require('../services/employeeService');

class EmployeeController {
    static async getEmployees(req, res, next) {
        try {
            const { search, department, status, sortBy, order, page, limit } = req.query;
            const result = EmployeeService.getAllEmployees({ search, department, status, sortBy, order, page, limit });
            return res.json({
                success: true,
                data: result.employees,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async getEmployeeById(req, res, next) {
        try {
            const employee = EmployeeService.getEmployeeById(req.params.id);
            return res.json({
                success: true,
                data: employee
            });
        } catch (error) {
            next(error);
        }
    }

    static async createEmployee(req, res, next) {
        try {
            const newEmployee = EmployeeService.createEmployee(req.body);
            return res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: newEmployee
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateEmployee(req, res, next) {
        try {
            const updatedEmployee = EmployeeService.updateEmployee(req.params.id, req.body);
            return res.json({
                success: true,
                message: 'Employee updated successfully',
                data: updatedEmployee
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteEmployee(req, res, next) {
        try {
            const result = EmployeeService.deleteEmployee(req.params.id);
            return res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    static async getDepartments(req, res, next) {
        try {
            const departments = EmployeeService.getDepartmentsList();
            return res.json({
                success: true,
                data: departments
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = EmployeeController;
