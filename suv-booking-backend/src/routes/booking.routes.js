const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

// Validation
const bookingValidation = [
  body('carId').notEmpty().withMessage('Car ID is required'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('dropAddress').trim().notEmpty().withMessage('Drop address is required'),
  body('scheduledPickupTime').isISO8601().withMessage('Valid pickup time is required'),
  body('passengers').isInt({ min: 1, max: 10 }).withMessage('Passengers must be between 1 and 10')
];

// Auth required
router.use(protect);

// User routes
router.post('/', bookingValidation, validate, bookingController.createBooking);
router.get('/my-bookings', bookingController.getUserBookings);

// Admin routes (static)
router.get('/active', isAdmin, bookingController.getActiveBookings);
router.get('/', isAdmin, bookingController.getAllBookings);

// Dynamic routes (keep last)
router.get('/:id', bookingController.getBookingById);
router.put('/:id/cancel', bookingController.cancelBooking);
router.put('/:id/assign-driver', isAdmin, bookingController.assignDriver);
router.put('/:id/start', isAdmin, bookingController.startTrip);
router.put('/:id/end', isAdmin, bookingController.endTrip);
router.post('/:id/gps-log', bookingController.addGPSLog);

module.exports = router;
