const ApiError = require('../utils/ApiError');
const { USER_ROLES, ERROR_MESSAGES } = require('../config/constants');

// Restrict access based on user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    next();
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    throw ApiError.forbidden('Admin access required');
  }

  next();
};

// Check if user is customer
exports.isCustomer = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
  }

  if (req.user.role !== USER_ROLES.CUSTOMER) {
    throw ApiError.forbidden('Customer access required');
  }

  next();
};