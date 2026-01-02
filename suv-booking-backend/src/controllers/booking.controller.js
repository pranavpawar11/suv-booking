const Booking = require('../models/Booking.model');
const Car = require('../models/Car.model');
const Driver = require('../models/Driver.model');
const geoService = require('../services/geo.service');
const paymentService = require('../services/payment.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { BOOKING_STATUS, CAR_STATUS, DRIVER_STATUS, PAGINATION } = require('../config/constants');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
  const {
    carId,
    pickupAddress,
    dropAddress,
    scheduledPickupTime,
    passengers,
    notes
  } = req.body;

  // Validate car
  const car = await Car.findById(carId);
  if (!car) {
    throw ApiError.notFound('Car not found');
  }

  if (!car.isAvailable()) {
    throw ApiError.badRequest('Car is not available for booking');
  }

  // Get route information
  const routeInfo = await geoService.getCompleteRouteInfo(pickupAddress, dropAddress);

  // Calculate pricing
  const pricing = paymentService.calculateFare(
    routeInfo.route.distance,
    car.ratePerKm,
    car.baseRate
  );

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    car: carId,
    pickup: {
      address: routeInfo.pickup.address,
      lat: routeInfo.pickup.lat,
      lng: routeInfo.pickup.lng
    },
    drop: {
      address: routeInfo.drop.address,
      lat: routeInfo.drop.lat,
      lng: routeInfo.drop.lng
    },
    scheduledPickupTime: new Date(scheduledPickupTime),
    passengers,
    distanceKm: routeInfo.route.distance,
    estimatedDurationMinutes: routeInfo.route.duration,
    pricing: {
      baseAmount: pricing.baseAmount,
      distanceAmount: pricing.distanceAmount,
      totalAmount: pricing.totalAmount,
      advanceAmount: pricing.advanceAmount,
      remainingAmount: pricing.remainingAmount
    },
    route: {
      type: 'LineString',
      coordinates: routeInfo.route.coordinates,
      distance: routeInfo.route.distance,
      duration: routeInfo.route.duration
    },
    notes: {
      userNotes: notes
    }
  });

  // Populate booking details
  const populatedBooking = await Booking.findById(booking._id)
    .populate('car', 'name model primaryImage vehicleType ratePerKm')
    .populate('user', 'name email phone');

  res.status(201).json(
    new ApiResponse(201, { booking: populatedBooking }, 'Booking created successfully')
  );
});

// @desc    Get all bookings (Admin)
// @route   GET /api/v1/bookings
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const { status, startDate, endDate, search } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (startDate && endDate) {
    query.scheduledPickupTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (search) {
    query.bookingId = { $regex: search, $options: 'i' };
  }

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('car', 'name model registrationNumber')
    .populate('driver', 'name phone')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Booking.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Bookings fetched successfully')
  );
});

// @desc    Get user bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const bookings = await Booking.findUserBookings(req.user._id, status);

  res.status(200).json(
    new ApiResponse(200, { bookings }, 'User bookings fetched successfully')
  );
});

// @desc    Get booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('car', 'name model primaryImage vehicleType features seatingCapacity')
    .populate('driver', 'name phone profileImage rating currentLocation');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check authorization (user can only see their own bookings)
  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to view this booking');
  }

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Booking details fetched successfully')
  );
});

// @desc    Assign driver to booking (Admin)
// @route   PUT /api/v1/bookings/:id/assign-driver
// @access  Private/Admin
exports.assignDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (!booking.paymentStatus.advancePaid) {
    throw ApiError.badRequest('Advance payment not completed');
  }

  if (booking.status !== BOOKING_STATUS.ADVANCE_PAID) {
    throw ApiError.badRequest('Booking is not in valid status for driver assignment');
  }

  // Validate driver
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  if (driver.status !== DRIVER_STATUS.AVAILABLE) {
    throw ApiError.badRequest('Driver is not available');
  }

  // Assign driver
  booking.driver = driverId;
  booking.status = BOOKING_STATUS.DRIVER_ASSIGNED;
  await booking.save();

  // Update driver and car status
  await Driver.findByIdAndUpdate(driverId, { status: DRIVER_STATUS.BUSY });
  await Car.findByIdAndUpdate(booking.car, { status: CAR_STATUS.BOOKED });

  const updatedBooking = await Booking.findById(booking._id)
    .populate('driver', 'name phone profileImage')
    .populate('car', 'name model')
    .populate('user', 'name phone');

  res.status(200).json(
    new ApiResponse(200, { booking: updatedBooking }, 'Driver assigned successfully')
  );
});

// @desc    Start trip
// @route   PUT /api/v1/bookings/:id/start
// @access  Private/Admin
exports.startTrip = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.status !== BOOKING_STATUS.DRIVER_ASSIGNED && booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw ApiError.badRequest('Booking is not ready to start');
  }

  if (!booking.driver) {
    throw ApiError.badRequest('No driver assigned to this booking');
  }

  await booking.startTrip();

  const updatedBooking = await Booking.findById(booking._id)
    .populate('driver', 'name phone')
    .populate('car', 'name model')
    .populate('user', 'name phone');

  res.status(200).json(
    new ApiResponse(200, { booking: updatedBooking }, 'Trip started successfully')
  );
});

// @desc    End trip
// @route   PUT /api/v1/bookings/:id/end
// @access  Private/Admin
exports.endTrip = asyncHandler(async (req, res) => {
  const { extraCharges } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.status !== BOOKING_STATUS.STARTED) {
    throw ApiError.badRequest('Trip is not in progress');
  }

  await booking.completeTrip(extraCharges || 0);

  // Update driver and car status
  await Driver.findByIdAndUpdate(booking.driver, { 
    status: DRIVER_STATUS.AVAILABLE,
    $inc: { totalTrips: 1 }
  });
  await Car.findByIdAndUpdate(booking.car, { 
    status: CAR_STATUS.AVAILABLE,
    $inc: { totalBookings: 1 }
  });

  const updatedBooking = await Booking.findById(booking._id)
    .populate('driver', 'name phone')
    .populate('car', 'name model')
    .populate('user', 'name phone');

  res.status(200).json(
    new ApiResponse(200, { booking: updatedBooking }, 'Trip completed successfully')
  );
});

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to cancel this booking');
  }

  if ([BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED].includes(booking.status)) {
    throw ApiError.badRequest('Cannot cancel this booking');
  }

  // Cancel booking
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellation = {
    cancelledBy: req.user.role === 'admin' ? 'admin' : 'user',
    cancelledAt: new Date(),
    reason: reason || 'No reason provided'
  };
  await booking.save();

  // Free up resources
  if (booking.driver) {
    await Driver.findByIdAndUpdate(booking.driver, { status: DRIVER_STATUS.AVAILABLE });
  }
  if (booking.car) {
    await Car.findByIdAndUpdate(booking.car, { status: CAR_STATUS.AVAILABLE });
  }

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Booking cancelled successfully')
  );
});

// @desc    Add GPS log to booking
// @route   POST /api/v1/bookings/:id/gps-log
// @access  Private
exports.addGPSLog = asyncHandler(async (req, res) => {
  const { lat, lng, speed, accuracy } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.status !== BOOKING_STATUS.STARTED) {
    throw ApiError.badRequest('Trip is not in progress');
  }

  booking.gpsLogs.push({
    lat,
    lng,
    timestamp: new Date(),
    speed,
    accuracy
  });

  await booking.save();

  res.status(200).json(
    new ApiResponse(200, null, 'GPS log added successfully')
  );
});

// @desc    Get active bookings
// @route   GET /api/v1/bookings/active
// @access  Private/Admin
exports.getActiveBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findActiveBookings();

  res.status(200).json(
    new ApiResponse(200, { bookings }, 'Active bookings fetched successfully')
  );
});