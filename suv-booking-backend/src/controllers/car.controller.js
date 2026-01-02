const Car = require('../models/Car.model');
const Driver = require('../models/Driver.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { PAGINATION } = require('../config/constants');

// @desc    Get all cars
// @route   GET /api/v1/cars
// @access  Public
exports.getAllCars = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const { status, vehicleType, minSeating, maxRate, available } = req.query;

  // Build query
  const query = { isActive: true };
  if (status) query.status = status;
  if (vehicleType) query.vehicleType = vehicleType;
  if (minSeating) query.seatingCapacity = { $gte: parseInt(minSeating) };
  if (maxRate) query.ratePerKm = { $lte: parseFloat(maxRate) };
  if (available === 'true') {
    query.status = 'available';
    query.driver = { $ne: null };
  }

  // Get cars with pagination
  const cars = await Car.find(query)
    .populate('driver', 'name phone rating status')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Car.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Cars fetched successfully')
  );
});

// @desc    Get available cars for booking
// @route   GET /api/v1/cars/available
// @access  Public
exports.getAvailableCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({
    status: 'available',
    isActive: true,
    driver: { $ne: null }
  })
    .populate('driver', 'name phone rating')
    .sort({ ratePerKm: 1 }); // Sort by rate, cheapest first

  res.status(200).json(
    new ApiResponse(200, { cars }, 'Available cars fetched successfully')
  );
});

// @desc    Get single car
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)
    .populate('driver', 'name phone rating totalTrips');

  if (!car) {
    throw ApiError.notFound('Car not found');
  }

  res.status(200).json(
    new ApiResponse(200, { car }, 'Car details fetched successfully')
  );
});

// @desc    Create new car
// @route   POST /api/v1/cars
// @access  Private/Admin
exports.createCar = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    model,
    year,
    registrationNumber,
    primaryImage,
    images,
    vehicleType,
    ratePerKm,
    baseRate,
    seatingCapacity,
    features,
    luggageCapacity,
    fuelType,
    color,
    description,
    driver,
    insurance,
    puc,
    fitness,
    mileage
  } = req.body;

  // Check if registration number already exists
  const existingCar = await Car.findOne({ registrationNumber });
  if (existingCar) {
    throw ApiError.conflict('Car with this registration number already exists');
  }

  // If driver is provided, check if driver exists and is not assigned to another car
  if (driver) {
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      throw ApiError.notFound('Driver not found');
    }

    const carWithDriver = await Car.findOne({ driver: driver });
    if (carWithDriver) {
      throw ApiError.conflict('Driver is already assigned to another car');
    }
  }

  // Create car
  const car = await Car.create({
    name,
    brand,
    model,
    year,
    registrationNumber,
    primaryImage,
    images,
    vehicleType,
    ratePerKm,
    baseRate,
    seatingCapacity,
    features,
    luggageCapacity,
    fuelType,
    color,
    description,
    driver,
    insurance,
    puc,
    fitness,
    mileage
  });

  // Update driver's assignedCar
  if (driver) {
    await Driver.findByIdAndUpdate(driver, { assignedCar: car._id });
  }

  res.status(201).json(
    new ApiResponse(201, { car }, 'Car created successfully')
  );
});

// @desc    Update car
// @route   PUT /api/v1/cars/:id
// @access  Private/Admin
exports.updateCar = asyncHandler(async (req, res) => {
  let car = await Car.findById(req.params.id);

  if (!car) {
    throw ApiError.notFound('Car not found');
  }

  // If updating driver, validate
  if (req.body.driver && req.body.driver !== car.driver?.toString()) {
    const driverDoc = await Driver.findById(req.body.driver);
    if (!driverDoc) {
      throw ApiError.notFound('Driver not found');
    }

    // Check if new driver is already assigned
    const carWithDriver = await Car.findOne({ 
      driver: req.body.driver,
      _id: { $ne: car._id }
    });
    if (carWithDriver) {
      throw ApiError.conflict('Driver is already assigned to another car');
    }

    // Remove old driver assignment
    if (car.driver) {
      await Driver.findByIdAndUpdate(car.driver, { assignedCar: null });
    }

    // Assign new driver
    await Driver.findByIdAndUpdate(req.body.driver, { assignedCar: car._id });
  }

  // Update car
  car = await Car.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('driver', 'name phone rating');

  res.status(200).json(
    new ApiResponse(200, { car }, 'Car updated successfully')
  );
});

// @desc    Delete car
// @route   DELETE /api/v1/cars/:id
// @access  Private/Admin
exports.deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    throw ApiError.notFound('Car not found');
  }

  // Remove driver assignment
  if (car.driver) {
    await Driver.findByIdAndUpdate(car.driver, { assignedCar: null });
  }

  // Soft delete
  car.isActive = false;
  car.status = 'inactive';
  await car.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Car deleted successfully')
  );
});

// @desc    Update car status
// @route   PATCH /api/v1/cars/:id/status
// @access  Private/Admin
exports.updateCarStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw ApiError.badRequest('Status is required');
  }

  const car = await Car.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!car) {
    throw ApiError.notFound('Car not found');
  }

  res.status(200).json(
    new ApiResponse(200, { car }, 'Car status updated successfully')
  );
});