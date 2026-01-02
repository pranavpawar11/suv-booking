const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2}[0-9]{13}$/, 'Please provide a valid Indian driving license number']
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  profileImage: {
    type: String,
    default: null
  },
  aadharNumber: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\d{12}$/, 'Aadhar must be 12 digits']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  lastLocationUpdate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'busy', 'offline'],
      message: '{VALUE} is not a valid status'
    },
    default: 'offline'
  },
  assignedCar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
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
  totalTrips: {
    type: Number,
    default: 0
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    paid: {
      type: Number,
      default: 0
    }
  },
  documents: {
    license: String,
    aadhar: String,
    photo: String
  },
  joiningDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ status: 1 });
driverSchema.index({ assignedCar: 1 });
driverSchema.index({ isActive: 1 });

// Virtual for full name with title
driverSchema.virtual('displayName').get(function() {
  return `Driver ${this.name}`;
});

// Method to update location
driverSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat] // GeoJSON uses [lng, lat]
  };
  this.lastLocationUpdate = new Date();
  return this.save();
};

// Static method to find nearby available drivers
driverSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    status: 'available',
    isActive: true,
    assignedCar: { $ne: null }
  });
};

module.exports = mongoose.model('Driver', driverSchema);