// User service
const User = require('../models/User');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const UserSnapshot = require('../models/UserSnapshot');

class UserService {
    /**
     * Get users with pagination
     * @param {number} skip - Number of documents to skip
     * @param {number} limit - Maximum number of documents to return
     * @returns {Promise<Array>} Array of user public profiles
     */
    static async getUsersPaginated(skip, limit) {
        try {
            const users = await User.find({})
                .skip(skip)
                .limit(limit)
                .select('-password -__v')
                .sort({ createdAt: -1 });

            // Convert to plain objects and ensure no password
            return users.map(user => user.toObject ? user.toObject() : user);
        } catch (error) {
            throw new Error('Failed to retrieve users');
        }
    }

    /**
     * Count total users
     * @returns {Promise<number>} Total count
     */
    static async countUsers() {
        try {
            return await User.countDocuments({});
        } catch (error) {
            throw new Error('Failed to count users');
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User public profile
     */
    static async getUserById(userId) {
        try {
            // Validate ObjectId format
            if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new ValidationError('Invalid user ID format');
            }

            const user = await User.findById(userId).select('-password -__v');
            if (!user) {
                throw new NotFoundError('User not found');
            }
            return user;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            throw new Error('Failed to retrieve user');
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user public profile
     */
    static async createUser(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { email: userData.email.toLowerCase() },
                    { username: userData.username }
                ]
            });

            if (existingUser) {
                throw new ConflictError('User with this email or username already exists');
            }

            // Create new user
            const user = new User({
                username: userData.username,
                email: userData.email.toLowerCase(),
                password: userData.password,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                role: userData.role || 'student',
                preferences: userData.preferences || {}
            });

            // Save user
            const savedUser = await user.save();
            return savedUser;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof ConflictError) {
                throw error;
            }
            throw new Error('Failed to create user');
        }
    }

    /**
     * Update user by ID
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user public profile
     */
    static async updateUser(userId, updateData) {
        try {
            // Validate ObjectId format
            if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new ValidationError('Invalid user ID format');
            }

            // Remove sensitive fields from update
            const allowedUpdates = [
                'username', 'email', 'firstName', 'lastName', 'role',
                'preferences'
            ];

            // Filter update data to only allowed fields
            const filteredUpdates = {};
            for (const [key, value] of Object.entries(updateData)) {
                if (allowedUpdates.includes(key) && value !== undefined) {
                    filteredUpdates[key] = value;
                }
            }

            // Prevent updating email/username to existing values (optional but good)
            // We'll rely on unique index duplication error for simplicity

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: filteredUpdates, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).select('-password -__v');

            if (!user) {
                throw new NotFoundError('User not found');
            }
            return user;
        } catch (error) {
            // Handle duplicate key error
            if (error.code === 11000) {
                throw new ConflictError('User with this email or username already exists');
            }
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            throw new Error('Failed to update user');
        }
    }

    /**
     * Delete user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Result message
     */
    static async deleteUser(userId) {
        try {
            // Validate ObjectId format
            if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new ValidationError('Invalid user ID format');
            }

            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            return { message: 'User deleted successfully' };
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            throw new Error('Failed to delete user');
        }
    }

    /**
     * Get user history for a user - returns array of user documents (matching getUserById shape)
     * @param {string} userId - User ID
     * @param {Object} options - { startDate, endDate, interval, aggregation }
     * @returns {Promise<Array>} Array of user documents (with password and __v removed)
     */
    async getUserHistory(userId, options = {}) {
        const startDate = options.startDate ? new Date(options.startDate) : undefined;
        const endDate = options.endDate ? new Date(options.endDate) : new Date();
        let start = startDate;
        let end = endDate;
        if (!start) {
            start = new Date(end);
        }
        if (start.getTime() > end.getTime()) {
            const temp = start;
            start = end;
            end = temp;
        }
        // We only support raw interval in Phase 3A
        const query = {
            userId,
            timestamp: {
                $gte: start,
                $lte: end
            }
        };
        // Sort by timestamp ascending
        return await UserSnapshot.find(query).sort({ timestamp: 1 }).select('-__v');
    }
}

module.exports = new UserService();