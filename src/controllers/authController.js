// Auth controller
const AuthService = require('../services/AuthService');
const { ValidationError, AuthenticationError, NotFoundError, ConflictError } = require('../utils/errors');

class AuthController {
    /**
     * Register a new user
     */
    async register(req, res) {
        try {
            const result = await AuthService.register(req.body);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    token: result.token
                }
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    errors: error.errors || []
                });
            }
            if (error instanceof ConflictError) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            // Default to 400 for other known errors
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }

    /**
     * Login user
     */
    async login(req, res) {
        try {
            const result = await AuthService.login(req.body);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    token: result.token
                }
            });
        } catch (error) {
            if (error instanceof AuthenticationError) {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            // Default to 401 for auth failures
            res.status(401).json({
                success: false,
                message: error.message || 'Authentication failed'
            });
        }
    }

    /**
     * Get user profile
     */
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await AuthService.getProfile(userId);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    errors: error.errors || []
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile'
            });
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updatedUser = await AuthService.updateProfile(userId, req.body);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    errors: error.errors || []
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }

    /**
     * Logout user
     * (In a stateless JWT setup, logout is handled client-side by removing the token)
     */
    async logout(req, res) {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
}

module.exports = new AuthController();