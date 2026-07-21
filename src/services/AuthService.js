// Auth service example
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ValidationError, AuthenticationError, NotFoundError, ConflictError } = require('../utils/errors');

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User object and token
     */
    static async register(userData) {
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
                firstName: userData.firstName,
                lastName: userData.lastName
            });

            // Save user
            await user.save();

            // Generate JWT token
            const token = this.generateToken(user);

            return {
                user: user.getPublicProfile(),
                token
            };
        } catch (error) {
            // Re-throw validation errors as-is, otherwise wrap
            if (error instanceof ValidationError) {
                throw error;
            }
            throw error;
        }
    }

    /**
     * Login user
     * @param {Object} loginData - Login credentials
     * @returns {Promise<Object>} User object and token
     */
    static async login(loginData) {
        try {
            // Find user by email
            const user = await User.findOne({
                email: loginData.email.toLowerCase()
            }).select('+password'); // Include password in query

            if (!user) {
                throw new AuthenticationError('Invalid email or password');
            }

            // Check password
            const isMatch = await user.comparePassword(loginData.password);
            if (!isMatch) {
                throw new AuthenticationError('Invalid email or password');
            }

            // Generate JWT token
            const token = this.generateToken(user);

            return {
                user: user.getPublicProfile(),
                token
            };
        } catch (error) {
            // Re-throw authentication errors as-is
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw error;
        }
    }

    /**
     * Generate JWT token for user
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    static generateToken(user) {
        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new AuthenticationError('Invalid or expired token');
        }
    }

    /**
     * Get user profile by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User public profile
     */
    static async getProfile(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            return user.getPublicProfile();
        } catch (error) {
            if (error.kind === 'ObjectId') {
                throw new ValidationError('Invalid user ID format');
            }
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user
     */
    static async updateProfile(userId, updateData) {
        try {
            // Remove sensitive fields from update
            const allowedUpdates = [
                'firstName', 'lastName', 'bio', 'avatarUrl',
                'institution', 'major', 'graduationYear',
                'preferences.theme', 'preferences.notifications.email',
                'preferences.notifications.push', 'preferences.language'
            ];

            // Filter update data to only allowed fields
            const filteredUpdates = {};
            for (const [key, value] of Object.entries(updateData)) {
                if (allowedUpdates.includes(key) && value !== undefined) {
                    filteredUpdates[key] = value;
                }
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: filteredUpdates, updatedAt: new Date() },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new NotFoundError('User not found');
            }

            return user.getPublicProfile();
        } catch (error) {
            if (error.kind === 'ObjectId') {
                throw new ValidationError('Invalid user ID format');
            }
            throw error;
        }
    }
}

module.exports = AuthService;