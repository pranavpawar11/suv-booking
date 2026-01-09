import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiHome,
  FiFileText,
  FiCalendar,
  FiMapPin,
  FiDownload,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, payment, paymentType } = location.state || {};

  if (!booking || !payment) {
    navigate('/my-bookings');
    return null;
  }

  const isAdvancePayment = paymentType === 'advance';
  const isRemainingPayment = paymentType === 'remaining';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Success Animation */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-500 rounded-full mb-4 sm:mb-6 animate-bounce shadow-2xl">
            <FiCheckCircle className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            {isRemainingPayment 
              ? 'Your payment has been completed. Thank you for riding with us!'
              : 'Your booking is confirmed and payment received'
            }
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 py-4 sm:py-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-green-100 mb-1">Payment ID</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold truncate">{payment._id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-green-100 mb-1">Amount Paid</p>
                <div className="flex items-baseline justify-end">
                  <BiRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                  <p className="text-xl sm:text-2xl font-bold">{payment.amount.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] xs:text-xs text-gray-500 mb-1">Payment Type</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">
                  {payment.type} Payment
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] xs:text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">
                  {payment.method || 'Online'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] xs:text-xs text-gray-500 mb-1">Transaction Date</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-[10px] xs:text-xs text-gray-600">
                  {new Date(payment.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] xs:text-xs text-gray-500 mb-1">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Booking Details</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start bg-blue-50 rounded-lg p-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <FiFileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Booking ID</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{booking.bookingId}</p>
                </div>
              </div>

              <div className="flex items-start bg-green-50 rounded-lg p-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <FiMapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Route</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                    {booking.pickup.address.split(',')[0]} → {booking.drop.address.split(',')[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-purple-50 rounded-lg p-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <FiCalendar className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Pickup Date & Time</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {new Date(booking.scheduledPickupTime).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 sm:p-5 lg:p-6">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Total Booking Amount</span>
                <span className="font-semibold text-gray-900 flex items-center">
                  <BiRupee className="w-3.5 h-3.5" />
                  {((booking.pricing.finalAmount || booking.pricing.totalAmount)).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">
                  {isAdvancePayment ? 'Advance Paid (25%)' : 'Already Paid'}
                </span>
                <span className="font-semibold text-green-600 flex items-center">
                  <BiRupee className="w-3.5 h-3.5" />
                  {booking.pricing.advanceAmount.toFixed(0)}
                </span>
              </div>
              {isRemainingPayment && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Remaining Paid (75%)</span>
                  <span className="font-semibold text-green-600 flex items-center">
                    <BiRupee className="w-3.5 h-3.5" />
                    {payment.amount.toFixed(0)}
                  </span>
                </div>
              )}
              <div className="border-t-2 pt-2 flex justify-between">
                <span className="font-bold text-gray-900 text-sm sm:text-base">Total Paid</span>
                <span className="text-base sm:text-lg font-bold text-green-600 flex items-center">
                  <BiRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isRemainingPayment 
                    ? ((booking.pricing.finalAmount || booking.pricing.totalAmount)).toFixed(0)
                    : booking.pricing.advanceAmount.toFixed(0)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        {isAdvancePayment && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">What's Next?</h3>
            <ol className="space-y-3 sm:space-y-4">
              <li className="flex items-start">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm mr-3 flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Driver Assignment</p>
                  <p className="text-xs sm:text-sm text-gray-600">A verified driver will be assigned soon</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm mr-3 flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Receive Details</p>
                  <p className="text-xs sm:text-sm text-gray-600">Get driver info via SMS and email</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm mr-3 flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Enjoy Your Ride</p>
                  <p className="text-xs sm:text-sm text-gray-600">Track your driver in real-time</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm mr-3 flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Complete Payment</p>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center flex-wrap">
                    Pay remaining <BiRupee className="w-3 h-3 mx-0.5" />
                    {(booking.pricing.totalAmount - booking.pricing.advanceAmount).toFixed(0)} after trip
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {isRemainingPayment && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
            <div className="flex items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-lg font-bold text-green-900 mb-2">
                  Payment Complete!
                </p>
                <p className="text-xs sm:text-sm text-green-800">
                  Your booking is now fully paid. Thank you for choosing our service. We hope you had a great experience!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => navigate(`/booking-details/${booking._id}`)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
          >
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>View Booking Details</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
          >
            <FiHome className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Receipt Download */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            A payment receipt has been sent to your email
          </p>
          <button className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
            <FiDownload className="w-4 h-4 mr-1.5" />
            Download Receipt
          </button>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 text-center">
          <p className="text-xs sm:text-sm text-gray-700 mb-3">
            Need help? Our support team is here for you
          </p>
          <div className="flex flex-col xs:flex-row items-center justify-center gap-2 sm:gap-4">
            <a 
              href="tel:+919876543210" 
              className="inline-flex items-center text-xs sm:text-sm text-blue-600 font-semibold hover:underline"
            >
              <FiPhone className="w-4 h-4 mr-1.5" />
              +91 98765 43210
            </a>
            <span className="hidden xs:inline text-gray-400">•</span>
            <a 
              href="mailto:support@example.com"
              className="inline-flex items-center text-xs sm:text-sm text-blue-600 font-semibold hover:underline"
            >
              <FiMail className="w-4 h-4 mr-1.5" />
              support@example.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;