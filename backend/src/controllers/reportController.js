const ReportService = require('../services/reportService');

class ReportController {
    static async exportAttendanceCSV(req, res, next) {
        try {
            const { startDate, endDate, department, status } = req.query;
            const csvData = ReportService.generateAttendanceCSV({ startDate, endDate, department, status });

            const filename = `attendance_report_${startDate || 'all'}_to_${endDate || 'all'}.csv`;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.status(200).send(csvData);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReportController;
