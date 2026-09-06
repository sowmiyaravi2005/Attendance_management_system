const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All employee routes require authentication
router.use(authenticateToken);

router.get('/', EmployeeController.getEmployees);
router.get('/departments', EmployeeController.getDepartments);
router.get('/:id', EmployeeController.getEmployeeById);
router.post('/', authorizeRoles('admin', 'manager'), EmployeeController.createEmployee);
router.put('/:id', authorizeRoles('admin', 'manager'), EmployeeController.updateEmployee);
router.delete('/:id', authorizeRoles('admin'), EmployeeController.deleteEmployee);

module.exports = router;
