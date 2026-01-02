const geoService = require('../services/geo.service');
const paymentService = require('../services/payment.service');
const Car = require('../models/Car.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Geocode address to coordinates
// @route   POST /api/v1/geo/geocode
// @access  Public
exports.geocodeAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;

  if (!address) {
    throw ApiError.badRequest('Address is required');
  }

  const result = await geoService.geocodeAddress(address);

  if (!result) {
    throw ApiError.notFound('Address not found');
  }

  res.status(200).json(
    new ApiResponse(200, result, 'Address geocoded successfully')
  );
});

// @desc    Reverse geocode coordinates to address
// @route   POST /api/v1/geo/reverse-geocode
// @access  Public
exports.reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }

  const result = await geoService.reverseGeocode(
    parseFloat(lat),
    parseFloat(lng)
  );

  if (!result) {
    throw ApiError.notFound('Location not found');
  }

  res.status(200).json(
    new ApiResponse(200, result, 'Coordinates reverse geocoded successfully')
  );
});

// @desc    Calculate route with fare estimation
// @route   POST /api/v1/geo/route
// @access  Public
exports.calculateRouteWithFare = asyncHandler(async (req, res) => {
  const { pickupAddress, dropAddress, carId } = req.body;

  if (!pickupAddress || !dropAddress) {
    throw ApiError.badRequest('Pickup and drop addresses are required');
  }

  // Get route information
  const routeInfo = await geoService.getCompleteRouteInfo(pickupAddress, dropAddress);

  // If carId is provided, calculate fare for specific car
  let fareEstimation = null;
  if (carId) {
    const car = await Car.findById(carId);
    if (car) {
      fareEstimation = paymentService.calculateFare(
        routeInfo.route.distance,
        car.ratePerKm,
        car.baseRate
      );
    }
  }

  res.status(200).json(
    new ApiResponse(200, {
      pickup: routeInfo.pickup,
      drop: routeInfo.drop,
      route: routeInfo.route,
      fareEstimation
    }, 'Route calculated successfully')
  );
});

// @desc    Get fare estimation for multiple cars
// @route   POST /api/v1/geo/fare-estimation
// @access  Public
exports.getFareEstimation = asyncHandler(async (req, res) => {
  const { pickupAddress, dropAddress } = req.body;

  if (!pickupAddress || !dropAddress) {
    throw ApiError.badRequest('Pickup and drop addresses are required');
  }

  // Get route information
  const routeInfo = await geoService.getCompleteRouteInfo(pickupAddress, dropAddress);

  // Get available cars
  const cars = await Car.find({
    status: 'available',
    isActive: true,
    driver: { $ne: null }
  }).select('name model vehicleType ratePerKm baseRate primaryImage seatingCapacity features');

  // Calculate fare for each car
  const fareEstimations = cars.map(car => {
    const fare = paymentService.calculateFare(
      routeInfo.route.distance,
      car.ratePerKm,
      car.baseRate
    );

    return {
      car: {
        id: car._id,
        name: car.name,
        model: car.model,
        vehicleType: car.vehicleType,
        primaryImage: car.primaryImage,
        seatingCapacity: car.seatingCapacity,
        features: car.features
      },
      pricing: fare
    };
  });

  res.status(200).json(
    new ApiResponse(200, {
      pickup: routeInfo.pickup,
      drop: routeInfo.drop,
      route: {
        distance: routeInfo.route.distance,
        duration: routeInfo.route.duration
      },
      fareEstimations
    }, 'Fare estimations calculated successfully')
  );
});

// @desc    Calculate distance between two points
// @route   POST /api/v1/geo/distance
// @access  Public
exports.calculateDistance = asyncHandler(async (req, res) => {
  const { lat1, lng1, lat2, lng2 } = req.body;

  if (!lat1 || !lng1 || !lat2 || !lng2) {
    throw ApiError.badRequest('All coordinates are required');
  }

  const distance = geoService.calculateDistance(
    parseFloat(lat1),
    parseFloat(lng1),
    parseFloat(lat2),
    parseFloat(lng2)
  );

  res.status(200).json(
    new ApiResponse(200, { distance }, 'Distance calculated successfully')
  );
});