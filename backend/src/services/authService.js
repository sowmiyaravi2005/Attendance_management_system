const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

class AuthService {
    static normalizeEmail(email) {
        return (email || '').trim().toLowerCase();
    }

    static login(email, password) {
        const normalizedInput = AuthService.normalizeEmail(email);

        if (!normalizedInput || !password) {
            throw { statusCode: 400, message: 'Email and password are required' };
        }

        const user = db.prepare(
            `SELECT *
             FROM users
             WHERE LOWER(TRIM(username)) = ?`
        ).get(normalizedInput);

        if (!user) {
            throw { statusCode: 401, message: 'No account found with that email' };
        }

        // Attempt bcrypt comparison (works for API-registered users with real hashed passwords)
        let isMatch = false;
        try {
            isMatch = bcrypt.compareSync(password, user.password_hash);
        } catch (bcryptError) {
            console.error('[Auth] bcrypt compareSync error:', bcryptError.message);
            isMatch = false;
        }

        // Fallback: seed demo accounts have placeholder hashes, allow plaintext match
        if (!isMatch) {
            const isDemoAdmin   = user.username === 'admin'   && password === 'admin123';
            const isDemoManager = user.username === 'manager' && password === 'manager123';
            if (isDemoAdmin || isDemoManager) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            throw { statusCode: 401, message: 'Incorrect password. Please try again.' };
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, fullName: user.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role
            }
        };
    }

    static getUserProfile(userId) {
        const user = db.prepare('SELECT id, username, full_name as fullName, role, created_at FROM users WHERE id = ?').get(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }
        return user;
    }

    static register({ fullName, email, password, role = 'admin' }) {
        if (!fullName || !email || !password) {
            throw { statusCode: 400, message: 'Full name, email, and password are required' };
        }

        const cleanEmail = AuthService.normalizeEmail(email);
        const username = cleanEmail;

        // Check duplicate user
        const existingUser = db.prepare(
            `SELECT id
             FROM users
             WHERE LOWER(TRIM(username)) = ?`
        ).get(cleanEmail);
        if (existingUser) {
            throw { statusCode: 400, message: 'An account with this email address already exists' };
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare(`
            INSERT INTO users (username, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        `);

        const result = stmt.run(username, passwordHash, fullName, role);

        const token = jwt.sign(
            { id: result.lastInsertRowid, username, role, fullName },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: result.lastInsertRowid,
                username,
                fullName,
                role
            }
        };
    }
}

module.exports = AuthService;
