import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiShield,
  FiCheckCircle,
  FiArrowLeft,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiTruck,
  FiNavigation,
  FiPhone
} from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import paymentService from '../../../api/services/paymentService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, paymentType } = location.state || {}; // paymentType: 'advance' or 'remaining'

  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    if (!booking) {
      toast.error('Invalid payment request');
      navigate('/my-bookings');
    }
  }, [booking, navigate]);

  const getPaymentAmount = () => {
    if (paymentType === 'advance') {
      return booking.pricing.advanceAmount;
    } else {
      const totalAmount = booking.pricing.finalAmount || booking.pricing.totalAmount;
      return totalAmount - booking.pricing.advanceAmount;
    }
  };

  const getPaymentTitle = () => {
    return paymentType === 'advance' ? 'Advance Payment (25%)' : 'Remaining Payment (75%)';
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setPaymentInitiated(true);

      // Create payment based on type
      let paymentResponse;
      if (paymentType === 'advance') {
        paymentResponse = await paymentService.createAdvancePayment(booking._id);
      } else {
        paymentResponse = await paymentService.createRemainingPayment(booking._id);
      }

      if (paymentResponse.success) {
        const { payment, razorpayOrder, razorpayKeyId } = paymentResponse.data;

        // Initialize Razorpay
        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'SUV Booking',
          description: `${getPaymentTitle()} for booking ${booking.bookingId}`,
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              setLoading(true);
              // Verify payment
              const verifyResponse = await paymentService.verifyPayment({
                paymentId: payment._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyResponse.success) {
                toast.success('Payment successful!');
                
                // Navigate based on payment type
                if (paymentType === 'advance') {
                  navigate('/booking-success', { 
                    state: { 
                      booking: verifyResponse.data.booking,
                      payment: verifyResponse.data.payment
                    } 
                  });
                } else {
                  navigate('/payment-success', {
                    state: {
                      booking: verifyResponse.data.booking,
                      payment: verifyResponse.data.payment,
                      paymentType: 'remaining'
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
              navigate('/my-bookings');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: booking.user?.name,
            email: booking.user?.email,
            contact: booking.user?.phone
          },
          theme: {
            color: '#2563eb'
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled');
              setLoading(false);
              setPaymentInitiated(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
          toast.error('Payment failed. Please try again.');
          setLoading(false);
          setPaymentInitiated(false);
        });
        
        rzp.open();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
      setPaymentInitiated(false);
    }
  };

  if (!booking) {
    return null;
  }

  const paymentAmount = getPaymentAmount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors disabled:opacity-50 active:scale-95"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Complete Payment</h1>
          <p className="text-sm sm:text-base text-gray-600">Secure payment powered by Razorpay</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <FiTruck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                Booking Summary
              </h3>
              
              <div className="space-y-2 sm:space-y-3 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Booking ID</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{booking.bookingId}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Route</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 text-right ml-2 truncate">
                    {booking.pickup.address.split(',')[0]} → {booking.drop.address.split(',')[0]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Distance</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{booking.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Vehicle</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate ml-2">{booking.car.name}</span>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 text-white">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <p className="text-xs sm:text-sm text-blue-100 mb-1 sm:mb-2">{getPaymentTitle()}</p>
                  <div className="flex items-baseline">
                    <BiRupee className="w-6 h-6 sm:w-8 sm:h-8 mr-1" />
                    <h2 className="text-3xl sm:text-4xl font-bold">{paymentAmount.toFixed(0)}</h2>
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <BiRupee className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>

              {paymentType === 'advance' && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-xs sm:text-sm text-blue-100 mb-1">Remaining amount after trip</p>
                  <div className="flex items-baseline">
                    <BiRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                    <p className="text-lg sm:text-xl font-bold">
                      {(booking.pricing.totalAmount - booking.pricing.advanceAmount).toFixed(0)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                  <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                Secure Payment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-3">
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">256-bit Encryption</p>
                    <p className="text-[10px] xs:text-xs text-gray-600">Your payment is secure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-3">
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">PCI DSS Compliant</p>
                    <p className="text-[10px] xs:text-xs text-gray-600">Industry standard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-3">
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">100% Refundable</p>
                    <p className="text-[10px] xs:text-xs text-gray-600">As per policy</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-3">
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Instant Confirmation</p>
                    <p className="text-[10px] xs:text-xs text-gray-600">Details via SMS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Accepted Payment Methods</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <FiCreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Credit Card</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <FiCreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Debit Card</span>
                </div>
                <div className="px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">UPI</span>
                </div>
                <div className="px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Net Banking</span>
                </div>
                <div className="px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Wallets</span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading || paymentInitiated}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size="sm" color="white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiLock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="flex items-center">
                    Pay <BiRupee className="w-4 h-4 sm:w-5 sm:h-5 mx-0.5" />{paymentAmount.toFixed(0)} Securely
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] xs:text-xs text-gray-500">
              By proceeding, you agree to our terms and conditions
            </p>
          </div>

          {/* Sidebar - Fare Breakdown */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 lg:sticky lg:top-20">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <BiRupee className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-1" />
                Fare Breakdown
              </h3>
              
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-semibold text-gray-900 flex items-center">
                    <BiRupee className="w-3.5 h-3.5" />
                    {(booking.pricing.baseAmount || 0).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Distance ({booking.distanceKm.toFixed(1)} km)</span>
                  <span className="font-semibold text-gray-900 flex items-center">
                    <BiRupee className="w-3.5 h-3.5" />
                    {(booking.pricing.distanceAmount || 0).toFixed(0)}
                  </span>
                </div>
                {booking.pricing.extraCharges > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Extra Charges</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <BiRupee className="w-3.5 h-3.5" />
                      {booking.pricing.extraCharges.toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="border-t-2 pt-2 sm:pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Total Fare</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                    <BiRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                    {((booking.pricing.finalAmount || booking.pricing.totalAmount)).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    {paymentType === 'advance' ? 'Paying Now (25%)' : 'Paying Now (75%)'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-blue-600 flex items-center">
                    <BiRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                    {paymentAmount.toFixed(0)}
                  </span>
                </div>
                {paymentType === 'advance' && (
                  <p className="text-[10px] xs:text-xs text-gray-600 flex items-start">
                    <span className="mr-1">•</span>
                    <span>Remaining <BiRupee className="inline w-3 h-3" />{(booking.pricing.totalAmount - booking.pricing.advanceAmount).toFixed(0)} due after trip</span>
                  </p>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Need Help?</p>
                  <p className="text-xs text-blue-800 mb-2">
                    24/7 support available
                  </p>
                  <a 
                    href="tel:+919876543210"
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;