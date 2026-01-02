// Application Constants
module.exports = {
  // User Roles
  USER_ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin'
  },

  // Driver Status
  DRIVER_STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline'
  },

  // Car Status
  CAR_STATUS: {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    MAINTENANCE: 'maintenance',
    INACTIVE: 'inactive'
  },

  // Booking Status
  BOOKING_STATUS: {
    PENDING: 'pending',
    ADVANCE_PAID: 'advance_paid',
    DRIVER_ASSIGNED: 'driver_assigned',
    CONFIRMED: 'confirmed',
    STARTED: 'started',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
  },

  // Payment Status
  PAYMENT_STATUS: {
    CREATED: 'created',
    PENDING: 'pending',
    AUTHORIZED: 'authorized',
    CAPTURED: 'captured',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Payment Types
  PAYMENT_TYPES: {
    ADVANCE: 'advance',
    REMAINING: 'remaining',
    REFUND: 'refund'
  },

  // Payment Configuration
  PAYMENT_CONFIG: {
    ADVANCE_PERCENTAGE: parseInt(process.env.ADVANCE_PAYMENT_PERCENTAGE) || 25,
    CURRENCY: 'INR',
    RATE_PER_KM: parseFloat(process.env.RATE_PER_KM) || 15
  },

  // JWT Configuration
  JWT_CONFIG: {
    SECRET: process.env.JWT_SECRET,
    EXPIRE: process.env.JWT_EXPIRE || '7d',
    COOKIE_EXPIRE: 7 // days
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Map Services URLs
  MAP_SERVICES: {
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    OSRM_URL: 'http://router.project-osrm.org'
  },

  // Socket Events
  SOCKET_EVENTS: {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    DRIVER_LOCATION: 'driver:location',
    DRIVER_STATUS: 'driver:status',
    BOOKING_UPDATE: 'booking:update',
    JOIN_BOOKING_ROOM: 'join:booking',
    LEAVE_BOOKING_ROOM: 'leave:booking'
  },

  // Distance and Time
  NEARBY_DRIVER_RADIUS: 10000, // 10 km in meters
  GPS_LOG_INTERVAL: 3000, // 3 seconds

  // File Upload (if implementing)
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    BOOKING_NOT_FOUND: 'Booking not found',
    CAR_NOT_AVAILABLE: 'Car is not available',
    DRIVER_NOT_AVAILABLE: 'Driver is not available',
    PAYMENT_FAILED: 'Payment processing failed',
    INVALID_PAYMENT: 'Invalid payment details'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    USER_REGISTERED: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    BOOKING_CREATED: 'Booking created successfully',
    PAYMENT_SUCCESS: 'Payment processed successfully',
    BOOKING_CANCELLED: 'Booking cancelled successfully',
    DRIVER_ASSIGNED: 'Driver assigned successfully',
    TRIP_STARTED: 'Trip started successfully',
    TRIP_COMPLETED: 'Trip completed successfully'
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100 // requests per window
  }
};