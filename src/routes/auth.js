// Auth routes example
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../validation/auth.validation');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validateRegistration = validate(registerSchema, 'body');
const validateLogin = validate(loginSchema, 'body');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes (require authentication)
router.use(authMiddleware);

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);

module.exports = router;