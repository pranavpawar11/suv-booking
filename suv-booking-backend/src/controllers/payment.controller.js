const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const paymentService = require('../services/payment.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { PAYMENT_TYPES } = require('../config/constants');

// @desc    Create advance payment order
// @route   POST /api/v1/payments/create-advance
// @access  Private
exports.createAdvancePayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check authorization
  if (booking.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to make payment for this booking');
  }

  if (booking.paymentStatus.advancePaid) {
    throw ApiError.badRequest('Advance payment already completed');
  }

  // Create payment
  const result = await paymentService.createAdvancePayment(
    bookingId,
    req.user._id,
    booking.pricing.advanceAmount
  );

  res.status(201).json(
    new ApiResponse(201, {
      payment: result.payment,
      razorpayOrder: result.order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }, 'Advance payment order created successfully')
  );
});

// @desc    Create remaining payment order
// @route   POST /api/v1/payments/create-remaining
// @access  Private
exports.createRemainingPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check authorization
  if (booking.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to make payment for this booking');
  }

  if (!booking.paymentStatus.advancePaid) {
    throw ApiError.badRequest('Advance payment not completed');
  }

  if (booking.paymentStatus.remainingPaid) {
    throw ApiError.badRequest('Remaining payment already completed');
  }

  if (booking.status !== 'completed') {
    throw ApiError.badRequest('Trip not completed yet');
  }

  // Calculate remaining amount (including any extra charges)
  const remainingAmount = booking.pricing.finalAmount 
    ? booking.pricing.finalAmount - booking.pricing.advanceAmount
    : booking.pricing.remainingAmount;

  // Create payment
  const result = await paymentService.createRemainingPayment(
    bookingId,
    req.user._id,
    remainingAmount
  );

  res.status(201).json(
    new ApiResponse(201, {
      payment: result.payment,
      razorpayOrder: result.order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }, 'Remaining payment order created successfully')
  );
});

// @desc    Verify payment
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!paymentId || !razorpayPaymentId || !razorpaySignature) {
    throw ApiError.badRequest('Missing payment verification details');
  }

  // Verify and complete payment
  const result = await paymentService.verifyAndCompletePayment(
    paymentId,
    razorpayPaymentId,
    razorpaySignature
  );

  res.status(200).json(
    new ApiResponse(200, {
      payment: result.payment,
      booking: result.booking
    }, 'Payment verified successfully')
  );
});

// @desc    Get payment by ID
// @route   GET /api/v1/payments/:id
// @access  Private
exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking', 'bookingId pickup.address drop.address')
    .populate('user', 'name email phone');

  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to view this payment');
  }

  res.status(200).json(
    new ApiResponse(200, { payment }, 'Payment details fetched successfully')
  );
});

// @desc    Get booking payments
// @route   GET /api/v1/payments/booking/:bookingId
// @access  Private
exports.getBookingPayments = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to view these payments');
  }

  const payments = await Payment.findBookingPayments(bookingId);

  res.status(200).json(
    new ApiResponse(200, { payments }, 'Booking payments fetched successfully')
  );
});

// @desc    Get user payments
// @route   GET /api/v1/payments/my-payments
// @access  Private
exports.getUserPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const payments = await Payment.findUserPayments(req.user._id, status);

  res.status(200).json(
    new ApiResponse(200, { payments }, 'User payments fetched successfully')
  );
});

// @desc    Get all payments (Admin)
// @route   GET /api/v1/payments
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { status, type, startDate, endDate } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const payments = await Payment.find(query)
    .populate('booking', 'bookingId pickup.address drop.address')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { payments }, 'Payments fetched successfully')
  );
});

// @desc    Get payment statistics (Admin)
// @route   GET /api/v1/payments/stats/revenue
// @access  Private/Admin
exports.getPaymentStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const revenue = await Payment.calculateRevenue(
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );

  res.status(200).json(
    new ApiResponse(200, { revenue }, 'Revenue statistics fetched successfully')
  );
});

// @desc    Initiate refund (Admin)
// @route   POST /api/v1/payments/:id/refund
// @access  Private/Admin
exports.initiateRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  if (!amount || !reason) {
    throw ApiError.badRequest('Refund amount and reason are required');
  }

  const result = await paymentService.initiateRefund(
    req.params.id,
    parseFloat(amount),
    reason
  );

  res.status(200).json(
    new ApiResponse(200, {
      payment: result.payment,
      refund: result.refund
    }, 'Refund initiated successfully')
  );
});