// EmotionalState Routes
const express = require('express');
const router = express.Router();
const emotionalStateController = require('../controllers/emotionalStateController');
const {
    emotionalStateSchema
} = require('../validation/emotionalState.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get emotional state snapshot for the authenticated user
router.get('/', emotionalStateController.getEmotionalStateSnapshot);

// Create a new emotional state entry for the authenticated user
router.post('/', validate(emotionalStateSchema), emotionalStateController.createEmotionalState);

// Get emotional state history for the authenticated user
router.get('/history', emotionalStateController.getEmotionalStateHistory);

module.exports = router;