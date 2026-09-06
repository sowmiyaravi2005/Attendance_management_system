const DashboardService = require('../services/dashboardService');

class DashboardController {
    static async getStats(req, res, next) {
        try {
            const stats = DashboardService.getDashboardStats();
            return res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DashboardController;
