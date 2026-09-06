/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (statusCode >= 500) {
        console.error('Unhandled Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

/**
 * 404 Not Found route handler
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        message: `API Route Not Found - ${req.method} ${req.originalUrl}`
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
