const AuthService = require('../services/authService');

class AuthController {
    static async login(req, res, next) {
        try {
            const { email, username, password } = req.body;
            const loginIdentifier = email || username;
            if (!loginIdentifier || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            const result = AuthService.login(loginIdentifier, password);
            return res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req, res, next) {
        try {
            const userProfile = AuthService.getUserProfile(req.user.id);
            return res.json({
                success: true,
                data: userProfile
            });
        } catch (error) {
            next(error);
        }
    }

    static async register(req, res, next) {
        try {
            const { fullName, email, password, role } = req.body;
            const result = AuthService.register({ fullName, email, password, role });
            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
