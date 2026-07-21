// User routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middleware/validation');
const { createUserSchema, updateUserSchema, userIdSchema } = require('../validation/user.validation');

// Validation middleware
const validateCreateUser = validate(createUserSchema, 'body');
const validateUpdateUser = validate(updateUserSchema, 'body');
const validateUserId = validate(userIdSchema, 'params');

// Get all users (with optional query parameters for pagination/filtering)
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', validateUserId, userController.getUserById);

// Create a new user
router.post('/', validateCreateUser, userController.createUser);

// Update user
router.put('/:id', validateUserId, validateUpdateUser, userController.updateUser);

// Delete user
router.delete('/:id', validateUserId, userController.deleteUser);

module.exports = router;