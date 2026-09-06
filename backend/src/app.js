const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

// Import Database connection (initializes DB)
require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Swagger API Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        message: 'Mini Attendance Management System API is running smooth',
        timestamp: new Date()
    });
});

// Serve built frontend assets in production deployments
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../public');
    const indexPath = path.join(publicPath, 'index.html');

    if (fs.existsSync(indexPath)) {
        app.use(express.static(publicPath));
        app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api')) {
                return next();
            }
            return res.sendFile(indexPath);
        });
    }
}

// Central Error & 404 Handlers
app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚀 Twite AI Mini Attendance System Backend API`);
        console.log(`📡 Server running on: http://localhost:${PORT}`);
        console.log(`📖 Swagger API Docs:  http://localhost:${PORT}/api-docs`);
        console.log(`=======================================================`);
    });
}

module.exports = app;
