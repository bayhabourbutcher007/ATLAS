// Time Routes
const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');
const {
    calendarEventSchema,
    availabilitySlotSchema
} = require('../validation/time.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get time snapshot for the authenticated user
router.get('/', timeController.getTimeSnapshot);

// Update time for the authenticated user
router.put('/', timeController.updateTime);

// Calendar event management routes
router.post('/calendar', validate(calendarEventSchema), timeController.addCalendarEvent);
router.put('/calendar/:eventId', validate(calendarEventSchema), timeController.updateCalendarEvent);
router.delete('/calendar/:eventId', timeController.removeCalendarEvent);

// Availability slot management routes
router.post('/availability', validate(availabilitySlotSchema), timeController.addAvailabilitySlot);
router.put('/availability/:slotId', validate(availabilitySlotSchema), timeController.updateAvailabilitySlot);
router.delete('/availability/:slotId', timeController.removeAvailabilitySlot);

module.exports = router;