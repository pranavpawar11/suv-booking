const crypto = require('crypto');
const { razorpayInstance } = require('../config/razorpay');
const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const { PAYMENT_CONFIG, PAYMENT_STATUS, PAYMENT_TYPES } = require('../config/constants');

class PaymentService {
  // Create Razorpay order
  async createOrder(amount, currency = PAYMENT_CONFIG.CURRENCY, receipt, notes = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        receipt: receipt,
        notes: notes
      };

      const order = await razorpayInstance.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Verify Razorpay payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  // Create payment record for advance payment
  async createAdvancePayment(bookingId, userId, amount) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Create Razorpay order
      const order = await this.createOrder(
        amount,
        PAYMENT_CONFIG.CURRENCY,
        `advance_${bookingId}`,
        {
          bookingId: booking.bookingId,
          type: PAYMENT_TYPES.ADVANCE
        }
      );

      // Create payment record
      const payment = await Payment.create({
        booking: bookingId,
        user: userId,
        amount: amount,
        type: PAYMENT_TYPES.ADVANCE,
        method: 'razorpay',
        status: PAYMENT_STATUS.CREATED,
        razorpay: {
          orderId: order.id
        }
      });

      return {
        payment,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        }
      };
    } catch (error) {
      console.error('Advance payment creation error:', error);
      throw error;
    }
  }

  // Create payment record for remaining payment
  async createRemainingPayment(bookingId, userId, amount) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (!booking.paymentStatus.advancePaid) {
        throw new Error('Advance payment not completed');
      }

      if (booking.status !== 'completed') {
        throw new Error('Trip not completed yet');
      }

      // Create Razorpay order
      const order = await this.createOrder(
        amount,
        PAYMENT_CONFIG.CURRENCY,
        `remaining_${bookingId}`,
        {
          bookingId: booking.bookingId,
          type: PAYMENT_TYPES.REMAINING
        }
      );

      // Create payment record
      const payment = await Payment.create({
        booking: bookingId,
        user: userId,
        amount: amount,
        type: PAYMENT_TYPES.REMAINING,
        method: 'razorpay',
        status: PAYMENT_STATUS.CREATED,
        razorpay: {
          orderId: order.id
        }
      });

      return {
        payment,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        }
      };
    } catch (error) {
      console.error('Remaining payment creation error:', error);
      throw error;
    }
  }

  // Verify and complete payment
  async verifyAndCompletePayment(paymentId, razorpayPaymentId, razorpaySignature) {
    try {
      const payment = await Payment.findById(paymentId).populate('booking');
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify signature
      const isValid = this.verifyPaymentSignature(
        payment.razorpay.orderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        await payment.markAsFailed({ description: 'Invalid signature' });
        throw new Error('Payment verification failed');
      }

      // Mark payment as successful
      await payment.markAsPaid({
        paymentId: razorpayPaymentId,
        signature: razorpaySignature
      });

      // Update booking based on payment type
      const booking = payment.booking;
      
      if (payment.type === PAYMENT_TYPES.ADVANCE) {
        booking.paymentStatus.advancePaid = true;
        booking.paymentStatus.advancePaidAt = new Date();
        booking.status = 'advance_paid';
      } else if (payment.type === PAYMENT_TYPES.REMAINING) {
        booking.paymentStatus.remainingPaid = true;
        booking.paymentStatus.remainingPaidAt = new Date();
      }

      await booking.save();

      return {
        payment,
        booking
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Calculate advance amount
  calculateAdvanceAmount(totalAmount, percentage = PAYMENT_CONFIG.ADVANCE_PERCENTAGE) {
    return Math.round((totalAmount * percentage) / 100);
  }

  // Calculate fare based on distance
  calculateFare(distanceKm, ratePerKm = PAYMENT_CONFIG.RATE_PER_KM, baseAmount = 0) {
    const distanceAmount = distanceKm * ratePerKm;
    const totalAmount = baseAmount + distanceAmount;
    
    return {
      baseAmount: Math.round(baseAmount),
      distanceAmount: Math.round(distanceAmount),
      totalAmount: Math.round(totalAmount),
      advanceAmount: this.calculateAdvanceAmount(Math.round(totalAmount)),
      remainingAmount: Math.round(totalAmount) - this.calculateAdvanceAmount(Math.round(totalAmount))
    };
  }

  // Initiate refund
  async initiateRefund(paymentId, amount, reason) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== PAYMENT_STATUS.PAID) {
        throw new Error('Payment not completed');
      }

      // Create refund via Razorpay
      const refund = await razorpayInstance.payments.refund(
        payment.razorpay.paymentId,
        {
          amount: Math.round(amount * 100), // Amount in paise
          notes: {
            reason: reason
          }
        }
      );

      // Update payment record
      await payment.processRefund(amount, reason);

      return {
        payment,
        refund
      };
    } catch (error) {
      console.error('Refund error:', error);
      throw error;
    }
  }

  // Get payment details from Razorpay
  async getPaymentDetails(razorpayPaymentId) {
    try {
      const payment = await razorpayInstance.payments.fetch(razorpayPaymentId);
      return payment;
    } catch (error) {
      console.error('Fetch payment error:', error);
      throw error;
    }
  }

  // Get order details from Razorpay
  async getOrderDetails(razorpayOrderId) {
    try {
      const order = await razorpayInstance.orders.fetch(razorpayOrderId);
      return order;
    } catch (error) {
      console.error('Fetch order error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();