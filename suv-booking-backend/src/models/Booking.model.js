const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickup: {
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true
    },
    lat: {
      type: Number,
      required: [true, 'Pickup latitude is required'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'Pickup longitude is required'],
      min: -180,
      max: 180
    },
    landmark: String
  },
  drop: {
    address: {
      type: String,
      required: [true, 'Drop address is required'],
      trim: true
    },
    lat: {
      type: Number,
      required: [true, 'Drop latitude is required'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'Drop longitude is required'],
      min: -180,
      max: 180
    },
    landmark: String
  },
  scheduledPickupTime: {
    type: Date,
    required: [true, 'Scheduled pickup time is required']
  },
  actualPickupTime: {
    type: Date,
    default: null
  },
  actualDropTime: {
    type: Date,
    default: null
  },
  passengers: {
    type: Number,
    required: [true, 'Number of passengers is required'],
    min: [1, 'At least 1 passenger required'],
    max: [10, 'Maximum 10 passengers allowed'],
    default: 1
  },
  distanceKm: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  estimatedDurationMinutes: {
    type: Number,
    default: 0
  },
  actualDurationMinutes: {
    type: Number,
    default: 0
  },
  pricing: {
    baseAmount: {
      type: Number,
      default: 0
    },
    distanceAmount: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    advanceAmount: {
      type: Number,
      required: [true, 'Advance amount is required'],
      min: [0, 'Advance amount cannot be negative']
    },
    remainingAmount: {
      type: Number,
      required: [true, 'Remaining amount is required'],
      min: [0, 'Remaining amount cannot be negative']
    },
    extraCharges: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      default: 0
    }
  },
  paymentStatus: {
    advancePaid: {
      type: Boolean,
      default: false
    },
    advancePaidAt: {
      type: Date,
      default: null
    },
    remainingPaid: {
      type: Boolean,
      default: false
    },
    remainingPaidAt: {
      type: Date,
      default: null
    },
    refunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: {
      values: [
        'pending',           // Just created
        'advance_paid',      // 25% paid
        'driver_assigned',   // Driver assigned by admin
        'confirmed',         // Driver accepted
        'started',           // Trip started
        'completed',         // Trip completed
        'cancelled',         // Cancelled by user/admin
        'failed'             // Payment or other failure
      ],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  route: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: [[Number]], // Array of [lng, lat] pairs
    distance: Number,
    duration: Number
  },
  gpsLogs: [{
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    speed: Number,
    accuracy: Number
  }],
  notes: {
    userNotes: String,
    adminNotes: String,
    driverNotes: String
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'driver', 'system']
    },
    cancelledAt: Date,
    reason: String
  },
  rating: {
    driverRating: {
      type: Number,
      min: 1,
      max: 5
    },
    carRating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    const prefix = 'BKG';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Indexes for performance
// bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ car: 1 });
bookingSchema.index({ status: 1, scheduledPickupTime: 1 });
bookingSchema.index({ 'pickup.lat': 1, 'pickup.lng': 1 });

// Virtual for total duration
bookingSchema.virtual('tripDuration').get(function() {
  if (this.actualPickupTime && this.actualDropTime) {
    return Math.round((this.actualDropTime - this.actualPickupTime) / 60000); // in minutes
  }
  return null;
});

// Method to calculate advance amount
bookingSchema.methods.calculateAdvance = function(percentage = 25) {
  this.pricing.advanceAmount = Math.round((this.pricing.totalAmount * percentage) / 100);
  this.pricing.remainingAmount = this.pricing.totalAmount - this.pricing.advanceAmount;
};

// Method to mark trip as started
bookingSchema.methods.startTrip = function() {
  this.status = 'started';
  this.actualPickupTime = new Date();
  return this.save();
};

// Method to mark trip as completed
bookingSchema.methods.completeTrip = function(extraCharges = 0) {
  this.status = 'completed';
  this.actualDropTime = new Date();
  this.pricing.extraCharges = extraCharges;
  this.pricing.finalAmount = this.pricing.totalAmount + extraCharges;
  this.actualDurationMinutes = Math.round((this.actualDropTime - this.actualPickupTime) / 60000);
  return this.save();
};

// Static method to find user bookings
bookingSchema.statics.findUserBookings = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  return this.find(query)
    .populate('car', 'name model images vehicleType')
    .populate('driver', 'name phone rating')
    .sort({ createdAt: -1 });
};

// Static method to find active bookings
bookingSchema.statics.findActiveBookings = function() {
  return this.find({
    status: { $in: ['driver_assigned', 'confirmed', 'started'] }
  })
    .populate('user', 'name phone')
    .populate('car', 'name registrationNumber')
    .populate('driver', 'name phone currentLocation');
};

module.exports = mongoose.model('Booking', bookingSchema);