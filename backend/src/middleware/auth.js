const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'twite_ai_super_secret_jwt_key_2026';

/**
 * Middleware to authenticate JWT token from Authorization header
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token missing or invalid' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

/**
 * Middleware to restrict access to specific roles (e.g. ['admin'])
 */
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}` 
            });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles,
    JWT_SECRET
};
