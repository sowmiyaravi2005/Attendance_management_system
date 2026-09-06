const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager'), AttendanceController.markAttendance);
router.get('/', AttendanceController.getAttendanceRecords);
router.get('/summary', AttendanceController.getAttendanceSummary);
router.get('/employee/:id', AttendanceController.getEmployeeAttendanceHistory);

module.exports = router;
