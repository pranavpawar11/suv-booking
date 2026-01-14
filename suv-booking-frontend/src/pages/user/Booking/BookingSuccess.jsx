import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign,
  FiHome,
  FiFileText
} from 'react-icons/fi';
import { FaCar} from 'react-icons/fa';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, payment } = location.state || {};

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-bounce">
            <FiCheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your SUV has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Booking ID</p>
                <p className="text-xl font-bold">{booking.bookingId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Status</p>
                <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-blue-600" />
              Journey Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="ml-4 flex-1">
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="text-base font-semibold text-gray-900">{booking.pickup.address}</p>
                </div>
              </div>
              <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6"></div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                <div className="ml-4 flex-1">
                  <p className="text-xs text-gray-500">Drop</p>
                  <p className="text-base font-semibold text-gray-900">{booking.drop.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Pickup Date & Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(booking.scheduledPickupTime).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Distance</p>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.distanceKm.toFixed(1)} km
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FaCar className="mr-2 text-blue-600" />
              Vehicle Details
            </h3>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                {booking.car.primaryImage ? (
                  <img 
                    src={booking.car.primaryImage} 
                    alt={booking.car.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <FaCar className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">{booking.car.name}</h4>
                <p className="text-sm text-gray-600">{booking.car.model}</p>
                <p className="text-xs text-gray-500 mt-1">{booking.car.vehicleType}</p>
              </div>
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Driver will be assigned closer to your pickup time. You'll receive driver details via SMS and email.
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-blue-600" />
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Fare</span>
                <span className="font-semibold text-gray-900">
                  ₹{booking.pricing.totalAmount.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Advance Paid (25%)</span>
                <span className="font-semibold text-green-600">
                  ₹{booking.pricing.advanceAmount.toFixed(0)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Remaining Amount</span>
                <span className="text-lg font-bold text-orange-600">
                  ₹{booking.pricing.remainingAmount.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💳 Remaining amount to be paid after trip completion
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
          <ol className="space-y-3">
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Driver Assignment</p>
                <p className="text-sm text-gray-600">A verified driver will be assigned to your booking</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Receive Details</p>
                <p className="text-sm text-gray-600">You'll get driver and vehicle details via SMS/Email</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Track in Real-time</p>
                <p className="text-sm text-gray-600">Track your driver's location on pickup day</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Enjoy Your Ride</p>
                <p className="text-sm text-gray-600">Relax and enjoy a comfortable journey</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
          >
            <FiFileText className="w-5 h-5" />
            <span>View My Bookings</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <FiHome className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="tel:+919876543210" className="text-blue-600 font-semibold hover:underline">
              +91 98765 43210
            </a>
            {' '}or{' '}
            <a href="mailto:support@suvbooking.com" className="text-blue-600 font-semibold hover:underline">
              support@suvbooking.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;