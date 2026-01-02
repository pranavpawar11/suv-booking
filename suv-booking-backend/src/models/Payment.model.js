const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  type: {
    type: String,
    enum: {
      values: ['advance', 'remaining', 'refund'],
      message: '{VALUE} is not a valid payment type'
    },
    required: [true, 'Payment type is required']
  },
  method: {
    type: String,
    enum: ['razorpay', 'cash', 'upi', 'card', 'netbanking', 'wallet'],
    default: 'razorpay'
  },
  status: {
    type: String,
    enum: {
      values: ['created', 'pending', 'authorized', 'captured', 'paid', 'failed', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'created'
  },
  razorpay: {
    orderId: {
      type: String,
      sparse: true
    },
    paymentId: {
      type: String,
      sparse: true
    },
    signature: {
      type: String,
      sparse: true
    }
  },
  transactionDetails: {
    gateway: String,
    transactionId: String,
    bankReference: String,
    cardType: String,
    cardLast4: String,
    upiId: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  },
  attempts: {
    type: Number,
    default: 0
  },
  failureReason: {
    code: String,
    description: String
  },
  paidAt: {
    type: Date,
    default: null
  },
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    processedAt: Date
  }
}, {
  timestamps: true
});

// Generate unique payment ID before saving
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentId) {
    const prefix = 'PAY';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.paymentId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Indexes for performance
// paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ booking: 1, type: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
// paymentSchema.index({ 'razorpay.orderId': 1 });
// paymentSchema.index({ 'razorpay.paymentId': 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for display amount
paymentSchema.virtual('displayAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

// Method to mark payment as successful
paymentSchema.methods.markAsPaid = function(razorpayDetails = {}) {
  this.status = 'paid';
  this.paidAt = new Date();
  
  if (razorpayDetails.paymentId) {
    this.razorpay.paymentId = razorpayDetails.paymentId;
  }
  if (razorpayDetails.signature) {
    this.razorpay.signature = razorpayDetails.signature;
  }
  
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.attempts += 1;
  
  if (reason) {
    this.failureReason = {
      code: reason.code || 'UNKNOWN',
      description: reason.description || 'Payment failed'
    };
  }
  
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason) {
  this.status = 'refunded';
  this.refund = {
    amount: refundAmount,
    reason: reason,
    status: 'processed',
    processedAt: new Date()
  };
  return this.save();
};

// Static method to find booking payments
paymentSchema.statics.findBookingPayments = function(bookingId) {
  return this.find({ booking: bookingId }).sort({ createdAt: 1 });
};

// Static method to find user payments
paymentSchema.statics.findUserPayments = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  return this.find(query)
    .populate('booking', 'bookingId pickup.address drop.address')
    .sort({ createdAt: -1 });
};

// Static method to calculate total revenue
paymentSchema.statics.calculateRevenue = async function(startDate, endDate) {
  const match = {
    status: 'paid',
    type: { $in: ['advance', 'remaining'] }
  };
  
  if (startDate) match.paidAt = { $gte: startDate };
  if (endDate) match.paidAt = { ...match.paidAt, $lte: endDate };
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        advancePayments: {
          $sum: {
            $cond: [{ $eq: ['$type', 'advance'] }, '$amount', 0]
          }
        },
        remainingPayments: {
          $sum: {
            $cond: [{ $eq: ['$type', 'remaining'] }, '$amount', 0]
          }
        }
      }
    }
  ]);
  
  return result[0] || {
    totalRevenue: 0,
    totalTransactions: 0,
    advancePayments: 0,
    remainingPayments: 0
  };
};

module.exports = mongoose.model('Payment', paymentSchema);