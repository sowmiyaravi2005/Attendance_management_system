const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/export-attendance', ReportController.exportAttendanceCSV);

module.exports = router;
