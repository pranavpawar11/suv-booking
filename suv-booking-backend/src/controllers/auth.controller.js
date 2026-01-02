const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw ApiError.conflict('Email already registered');
    }
    if (existingUser.phone === phone) {
      throw ApiError.conflict('Phone number already registered');
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'customer'
  });

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      },
      SUCCESS_MESSAGES.USER_REGISTERED
    )
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw ApiError.badRequest('Please provide email and password');
  }

  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated. Please contact support');
  }

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      },
      SUCCESS_MESSAGES.LOGIN_SUCCESS
    )
  );
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { user }, 'User profile fetched successfully')
  );
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, { user }, 'Profile updated successfully')
  );
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Please provide current and new password');
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully')
  );
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});