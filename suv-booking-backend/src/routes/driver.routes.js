const express = require('express');
const { body } = require('express-validator');
const driverController = require('../controllers/driver.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

// Driver validation
const driverValidation = [
  body('name').trim().notEmpty().withMessage('Driver name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required')
    .matches(/^[A-Z]{2}[0-9]{13}$/).withMessage('Invalid license format'),
  body('licenseExpiry').isISO8601().withMessage('Valid license expiry date is required')
];

// Public routes
router.get('/nearby', driverController.getNearbyDrivers);

// Protected routes
router.use(protect, isAdmin);

router.get('/', driverController.getAllDrivers);
router.get('/available', driverController.getAvailableDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverValidation, validate, driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);
router.put('/:id/assign-car', driverController.assignCarToDriver);
router.patch('/:id/status', driverController.updateDriverStatus);
router.patch('/:id/location', driverController.updateDriverLocation);

module.exports = router;