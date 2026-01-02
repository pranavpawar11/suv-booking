const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

// Payment validation
const createPaymentValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required')
];

const verifyPaymentValidation = [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required')
];

// Protected routes
router.use(protect);

// User routes
router.post('/create-advance', createPaymentValidation, validate, paymentController.createAdvancePayment);
router.post('/create-remaining', createPaymentValidation, validate, paymentController.createRemainingPayment);
router.post('/verify', verifyPaymentValidation, validate, paymentController.verifyPayment);
router.get('/my-payments', paymentController.getUserPayments);
router.get('/booking/:bookingId', paymentController.getBookingPayments);
router.get('/:id', paymentController.getPaymentById);

// Admin routes
router.get('/', isAdmin, paymentController.getAllPayments);
router.get('/stats/revenue', isAdmin, paymentController.getPaymentStats);
router.post('/:id/refund', isAdmin, paymentController.initiateRefund);

module.exports = router;