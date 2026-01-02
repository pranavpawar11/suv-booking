const express = require('express');
const { body } = require('express-validator');
const geoController = require('../controllers/geo.controller');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

// Validation rules
const geocodeValidation = [
  body('address').trim().notEmpty().withMessage('Address is required')
];

const reverseGeocodeValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
];

const routeValidation = [
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('dropAddress').trim().notEmpty().withMessage('Drop address is required')
];

const distanceValidation = [
  body('lat1').isFloat({ min: -90, max: 90 }).withMessage('Valid lat1 is required'),
  body('lng1').isFloat({ min: -180, max: 180 }).withMessage('Valid lng1 is required'),
  body('lat2').isFloat({ min: -90, max: 90 }).withMessage('Valid lat2 is required'),
  body('lng2').isFloat({ min: -180, max: 180 }).withMessage('Valid lng2 is required')
];

// Public routes
router.post('/geocode', geocodeValidation, validate, geoController.geocodeAddress);
router.post('/reverse-geocode', reverseGeocodeValidation, validate, geoController.reverseGeocode);
router.post('/route', routeValidation, validate, geoController.calculateRouteWithFare);
router.post('/fare-estimation', routeValidation, validate, geoController.getFareEstimation);
router.post('/distance', distanceValidation, validate, geoController.calculateDistance);

module.exports = router;