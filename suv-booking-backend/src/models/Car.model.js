const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
    maxlength: [100, 'Car name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    min: [2000, 'Year must be 2000 or later'],
    max: [new Date().getFullYear() + 1, 'Invalid year']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/, 'Invalid vehicle registration format']
  },
  images: [{
    type: String
  }],
  primaryImage: {
    type: String,
    required: [true, 'Primary image is required']
  },
  vehicleType: {
    type: String,
    enum: {
      values: ['SUV', 'Sedan', 'Luxury', 'MUV'],
      message: '{VALUE} is not supported'
    },
    default: 'SUV'
  },
  ratePerKm: {
    type: Number,
    required: [true, 'Rate per km is required'],
    min: [0, 'Rate cannot be negative'],
    default: 15
  },
  baseRate: {
    type: Number,
    default: 0,
    min: [0, 'Base rate cannot be negative']
  },
  seatingCapacity: {
    type: Number,
    required: [true, 'Seating capacity is required'],
    min: [1, 'Seating capacity must be at least 1'],
    max: [10, 'Seating capacity cannot exceed 10'],
    default: 7
  },
  features: {
    ac: {
      type: Boolean,
      default: true
    },
    musicSystem: {
      type: Boolean,
      default: true
    },
    gps: {
      type: Boolean,
      default: true
    },
    pushBackSeats: {
      type: Boolean,
      default: false
    }
  },
  luggageCapacity: {
    type: Number, // in liters or bags
    default: 3,
    min: [0, 'Luggage capacity cannot be negative']
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    default: 'Diesel'
  },
  color: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'booked', 'maintenance', 'inactive'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  puc: {
    certificateNumber: String,
    expiryDate: Date
  },
  fitness: {
    certificateNumber: String,
    expiryDate: Date
  },
  mileage: {
    type: Number, // in km/l
    default: 12
  },
  totalKmDriven: {
    type: Number,
    default: 0
  },
  lastServiceDate: {
    type: Date
  },
  nextServiceDue: {
    type: Date
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
carSchema.index({ status: 1, isActive: 1 });
carSchema.index({ vehicleType: 1 });
carSchema.index({ driver: 1 });
// carSchema.index({ registrationNumber: 1 });
carSchema.index({ ratePerKm: 1 });

// Virtual for display name
carSchema.virtual('displayName').get(function() {
  return `${this.brand} ${this.model} (${this.registrationNumber})`;
});

// Method to check availability
carSchema.methods.isAvailable = function() {
  return this.status === 'available' && this.isActive && this.driver;
};

// Method to calculate estimated fare
carSchema.methods.calculateFare = function(distanceKm) {
  return (this.baseRate || 0) + (distanceKm * this.ratePerKm);
};

// Static method to find available cars
carSchema.statics.findAvailable = function() {
  return this.find({
    status: 'available',
    isActive: true,
    driver: { $ne: null }
  }).populate('driver', 'name phone rating');
};

module.exports = mongoose.model('Car', carSchema);