const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { RATE_LIMIT } = require('./config/constants');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const isDev = process.env.NODE_ENV === 'development';


const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 1000 : 300, // relaxed in dev
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 20, // strict in prod
  message: 'Too many login attempts. Please try again later.',
});

// Sensitive routes
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/payments', authLimiter);

// General browsing APIs
app.use('/api/', generalLimiter);


// // Rate limiting
// const limiter = rateLimit({
//   windowMs: RATE_LIMIT.WINDOW_MS,
//   max: RATE_LIMIT.MAX_REQUESTS,
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/', limiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/cars', require('./routes/car.routes'));
app.use('/api/v1/drivers', require('./routes/driver.routes'));
app.use('/api/v1/bookings', require('./routes/booking.routes'));
app.use('/api/v1/payments', require('./routes/payment.routes'));
app.use('/api/v1/geo', require('./routes/geo.routes'));

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SUV Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      cars: '/api/v1/cars',
      drivers: '/api/v1/drivers',
      bookings: '/api/v1/bookings',
      payments: '/api/v1/payments',
      geo: '/api/v1/geo'
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
// app.use(errorHandler);

module.exports = app;