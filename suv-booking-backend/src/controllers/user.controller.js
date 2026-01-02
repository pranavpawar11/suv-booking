const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { PAGINATION } = require('../config/constants');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const { role, search, isActive } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Get users with pagination
  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select('-password');

  const total = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Users fetched successfully')
  );
});

// @desc    Get single user (Admin only)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Get user statistics
  const bookingStats = await Booking.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalSpent: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.finalAmount', 0] }
        }
      }
    }
  ]);

  const stats = bookingStats[0] || {
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0
  };

  res.status(200).json(
    new ApiResponse(200, { user, stats }, 'User details fetched successfully')
  );
});

// @desc    Update user (Admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, isActive, address } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (address) user.address = address;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, { user }, 'User updated successfully')
  );
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Soft delete - deactivate instead of removing
  user.isActive = false;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully')
  );
});

// @desc    Get user dashboard stats
// @route   GET /api/v1/users/dashboard/stats
// @access  Private
exports.getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get booking statistics
  const bookings = await Booking.find({ user: userId });

  const stats = {
    totalBookings: bookings.length,
    upcomingBookings: bookings.filter(b => 
      ['pending', 'advance_paid', 'driver_assigned', 'confirmed'].includes(b.status)
    ).length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalSpent: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.pricing.finalAmount || b.pricing.totalAmount), 0)
  };

  // Get recent bookings
  const recentBookings = await Booking.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('car', 'name model primaryImage vehicleType')
    .populate('driver', 'name phone rating');

  res.status(200).json(
    new ApiResponse(200, { stats, recentBookings }, 'Dashboard data fetched successfully')
  );
});