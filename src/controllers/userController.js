// User controller
const UserService = require('../services/UserService');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class UserController {
    /**
     * Get all users with optional pagination and filtering
     */
    async getAllUsers(req, res) {
        try {
            // For now, we'll implement basic pagination
            // In a real app, you'd add filtering, sorting, etc.
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Get total count
            const total = await UserService.countUsers();

            // Get users with pagination
            const users = await UserService.getUsersPaginated(skip, limit);

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    pagination: {
                        total,
                        page,
                        limit,
                        pages: Math.ceil(total / limit)
                    }
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
            // Default to 500 for unexpected errors
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users',
                error: error.message
            });
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof NotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user'
            });
        }
    }

    /**
     * Create a new user
     */
    async createUser(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
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
            res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }
    }

    /**
     * Update user by ID
     */
    async updateUser(req, res) {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    errors: error.errors || []
                });
            }
            if (error instanceof NotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof ConflictError) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    }

    /**
     * Delete user by ID
     */
    async deleteUser(req, res) {
        try {
            const result = await UserService.deleteUser(req.params.id);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof NotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
}

module.exports = new UserController();