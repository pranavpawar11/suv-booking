const express = require('express');
const { body } = require('express-validator');
const carController = require('../controllers/car.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

// Car validation
const carValidation = [
  body('name').trim().notEmpty().withMessage('Car name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required')
    .matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/).withMessage('Invalid registration format'),
  body('primaryImage').notEmpty().withMessage('Primary image is required'),
  body('vehicleType').isIn(['SUV', 'Sedan', 'Luxury', 'MUV']).withMessage('Invalid vehicle type'),
  body('ratePerKm').isFloat({ min: 0 }).withMessage('Valid rate per km is required'),
  body('seatingCapacity').isInt({ min: 1, max: 10 }).withMessage('Seating capacity must be 1-10')
];

// Public routes
router.get('/', carController.getAllCars);
router.get('/available', carController.getAvailableCars);
router.get('/:id', carController.getCarById);

// Admin only routes
router.use(protect, isAdmin);
router.post('/', carValidation, validate, carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);
router.patch('/:id/status', carController.updateCarStatus);

module.exports = router;