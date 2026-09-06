const db = require('../config/db');

class DashboardService {
    static getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];

        // 1. Employee totals
        const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
        const activeEmployees = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'").get().count;
        const inactiveEmployees = totalEmployees - activeEmployees;

        // 2. Today's Attendance breakdown
        const todayStats = db.prepare(`
            SELECT 
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentToday,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateToday,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentToday,
                SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as halfDayToday,
                SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as leaveToday,
                COUNT(*) as totalLoggedToday
            FROM attendance
            WHERE attendance_date = ?
        `).get(today);

        const presentToday = (todayStats.presentToday || 0) + (todayStats.lateToday || 0); // Both present and late count as present
        const absentToday = todayStats.absentToday || (activeEmployees - (todayStats.totalLoggedToday || 0));
        const lateToday = todayStats.lateToday || 0;

        // 3. Department-wise employee counts
        const departmentCounts = db.prepare(`
            SELECT department, COUNT(*) as employeeCount,
                   SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as activeCount
            FROM employees
            GROUP BY department
            ORDER BY employeeCount DESC
        `).all();

        // 4. Department-wise attendance breakdown for today
        const departmentAttendance = db.prepare(`
            SELECT 
                e.department,
                COUNT(e.id) as totalEmployees,
                SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) as presentCount,
                SUM(CASE WHEN a.status = 'Absent' OR a.id IS NULL THEN 1 ELSE 0 END) as absentCount
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = ?
            WHERE e.status = 'Active'
            GROUP BY e.department
        `).all(today);

        // 5. Recent 7 Days Attendance Trend
        const recentTrends = db.prepare(`
            SELECT 
                attendance_date as date,
                SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late
            FROM attendance
            GROUP BY attendance_date
            ORDER BY attendance_date DESC
            LIMIT 7
        `).all().reverse();

        return {
            todayDate: today,
            summaryCards: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                presentToday,
                absentToday,
                lateToday,
                attendancePercentage: activeEmployees > 0 ? parseFloat(((presentToday / activeEmployees) * 100).toFixed(1)) : 0
            },
            departmentCounts,
            departmentAttendance,
            recentTrends
        };
    }
}

module.exports = DashboardService;
