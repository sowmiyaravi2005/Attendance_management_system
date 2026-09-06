const AttendanceService = require('../services/attendanceService');

class AttendanceController {
    static async markAttendance(req, res, next) {
        try {
            const record = AttendanceService.markAttendance(req.body);
            return res.status(201).json({
                success: true,
                message: 'Attendance record marked successfully',
                data: record
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAttendanceRecords(req, res, next) {
        try {
            const { date, startDate, endDate, employeeId, department, status, search, page, limit } = req.query;
            const result = AttendanceService.getAttendanceRecords({ date, startDate, endDate, employeeId, department, status, search, page, limit });
            return res.json({
                success: true,
                data: result.records,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAttendanceSummary(req, res, next) {
        try {
            const { date, startDate, endDate } = req.query;
            const summary = AttendanceService.getAttendanceSummary({ date, startDate, endDate });
            return res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }

    static async getEmployeeAttendanceHistory(req, res, next) {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            const result = AttendanceService.getEmployeeAttendanceHistory(id, { page, limit });
            return res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AttendanceController;
