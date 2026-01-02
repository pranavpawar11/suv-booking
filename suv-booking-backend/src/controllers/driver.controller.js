const Driver = require('../models/Driver.model');
const Car = require('../models/Car.model');
const Booking = require('../models/Booking.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { PAGINATION, DRIVER_STATUS } = require('../config/constants');

// @desc    Get all drivers
// @route   GET /api/v1/drivers
// @access  Private/Admin
exports.getAllDrivers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const { status, isActive, search, hasAssignedCar } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (hasAssignedCar === 'true') query.assignedCar = { $ne: null };
  if (hasAssignedCar === 'false') query.assignedCar = null;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const drivers = await Driver.find(query)
    .populate('assignedCar', 'name model registrationNumber')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Driver.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      drivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Drivers fetched successfully')
  );
});

// @desc    Get available drivers
// @route   GET /api/v1/drivers/available
// @access  Private/Admin
exports.getAvailableDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find({
    status: DRIVER_STATUS.AVAILABLE,
    isActive: true,
    assignedCar: { $ne: null }
  })
    .populate('assignedCar', 'name model registrationNumber')
    .sort({ totalTrips: 1 }); // Prioritize drivers with fewer trips

  res.status(200).json(
    new ApiResponse(200, { drivers }, 'Available drivers fetched successfully')
  );
});

// @desc    Get single driver
// @route   GET /api/v1/drivers/:id
// @access  Private/Admin
exports.getDriverById = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id)
    .populate('assignedCar', 'name model registrationNumber images');

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Get driver statistics
  const bookingStats = await Booking.aggregate([
    { $match: { driver: driver._id } },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        completedTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalEarnings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.finalAmount', 0] }
        }
      }
    }
  ]);

  const stats = bookingStats[0] || {
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0
  };

  res.status(200).json(
    new ApiResponse(200, { driver, stats }, 'Driver details fetched successfully')
  );
});

// @desc    Create new driver
// @route   POST /api/v1/drivers
// @access  Private/Admin
exports.createDriver = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    licenseNumber,
    licenseExpiry,
    aadharNumber,
    address,
    profileImage,
    documents
  } = req.body;

  // Check if driver with same phone or license exists
  const existingDriver = await Driver.findOne({
    $or: [{ phone }, { licenseNumber }]
  });

  if (existingDriver) {
    if (existingDriver.phone === phone) {
      throw ApiError.conflict('Driver with this phone number already exists');
    }
    if (existingDriver.licenseNumber === licenseNumber) {
      throw ApiError.conflict('Driver with this license number already exists');
    }
  }

  // Create driver
  const driver = await Driver.create({
    name,
    phone,
    email,
    licenseNumber,
    licenseExpiry,
    aadharNumber,
    address,
    profileImage,
    documents
  });

  res.status(201).json(
    new ApiResponse(201, { driver }, 'Driver created successfully')
  );
});

// @desc    Update driver
// @route   PUT /api/v1/drivers/:id
// @access  Private/Admin
exports.updateDriver = asyncHandler(async (req, res) => {
  let driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Update driver
  driver = await Driver.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('assignedCar');

  res.status(200).json(
    new ApiResponse(200, { driver }, 'Driver updated successfully')
  );
});

// @desc    Delete driver
// @route   DELETE /api/v1/drivers/:id
// @access  Private/Admin
exports.deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Remove car assignment
  if (driver.assignedCar) {
    await Car.findByIdAndUpdate(driver.assignedCar, { driver: null });
  }

  // Soft delete
  driver.isActive = false;
  driver.status = DRIVER_STATUS.OFFLINE;
  await driver.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Driver deleted successfully')
  );
});

// @desc    Assign car to driver
// @route   PUT /api/v1/drivers/:id/assign-car
// @access  Private/Admin
exports.assignCarToDriver = asyncHandler(async (req, res) => {
  const { carId } = req.body;

  if (!carId) {
    throw ApiError.badRequest('Car ID is required');
  }

  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  const car = await Car.findById(carId);
  if (!car) {
    throw ApiError.notFound('Car not found');
  }

  // Check if car is already assigned to another driver
  if (car.driver && car.driver.toString() !== driver._id.toString()) {
    throw ApiError.conflict('Car is already assigned to another driver');
  }

  // Remove previous car assignment from driver
  if (driver.assignedCar && driver.assignedCar.toString() !== carId) {
    await Car.findByIdAndUpdate(driver.assignedCar, { driver: null });
  }

  // Assign car to driver
  driver.assignedCar = carId;
  await driver.save();

  // Assign driver to car
  car.driver = driver._id;
  await car.save();

  const updatedDriver = await Driver.findById(driver._id)
    .populate('assignedCar', 'name model registrationNumber');

  res.status(200).json(
    new ApiResponse(200, { driver: updatedDriver }, 'Car assigned to driver successfully')
  );
});

// @desc    Update driver status
// @route   PATCH /api/v1/drivers/:id/status
// @access  Private/Admin
exports.updateDriverStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !Object.values(DRIVER_STATUS).includes(status)) {
    throw ApiError.badRequest('Valid status is required');
  }

  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  res.status(200).json(
    new ApiResponse(200, { driver }, 'Driver status updated successfully')
  );
});

// @desc    Update driver location
// @route   PATCH /api/v1/drivers/:id/location
// @access  Private/Driver (implement driver auth if needed)
exports.updateDriverLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }

  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  await driver.updateLocation(lat, lng);

  res.status(200).json(
    new ApiResponse(200, { driver }, 'Driver location updated successfully')
  );
});

// @desc    Find nearby drivers
// @route   GET /api/v1/drivers/nearby
// @access  Public
exports.getNearbyDrivers = asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }

  const drivers = await Driver.findNearby(
    parseFloat(lng),
    parseFloat(lat),
    radius ? parseInt(radius) : undefined
  ).populate('assignedCar', 'name model primaryImage vehicleType');

  res.status(200).json(
    new ApiResponse(200, { drivers }, 'Nearby drivers fetched successfully')
  );
});