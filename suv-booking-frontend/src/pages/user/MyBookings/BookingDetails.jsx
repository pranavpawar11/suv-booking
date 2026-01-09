import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiMapPin, 
  FiTruck,
  FiUser,
  FiPhone,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiX,
  FiCalendar,
  FiAlertCircle,
  FiNavigation,
  FiUsers,
  FiActivity
} from 'react-icons/fi';

import bookingService from '../../../api/services/bookingService';
import paymentService from '../../../api/services/paymentService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchBookingDetails();
    fetchPayments();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      if (response.success) {
        setBooking(response.data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to fetch booking details');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getBookingPayments(id);
      if (response.success) {
        setPayments(response.data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handlePayRemaining = () => {
    // Navigate to payment page
    navigate('/payment', {
      state: {
        booking,
        paymentType: 'remaining'
      }
    });
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await bookingService.cancelBooking(booking._id, 'Cancelled by user');
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookingDetails();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      advance_paid: 'blue',
      driver_assigned: 'purple',
      confirmed: 'green',
      started: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      advance_paid: 'Advance Paid',
      driver_assigned: 'Driver Assigned',
      confirmed: 'Confirmed',
      started: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Booking not found</h3>
          <button
            onClick={() => navigate('/my-bookings')}
            className="text-blue-600 hover:underline text-sm sm:text-base font-medium"
          >
            Go back to bookings
          </button>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(booking.status);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors active:scale-95"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="font-medium text-sm sm:text-base">Back to Bookings</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{booking.bookingId}</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap
                ${statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${statusColor === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                ${statusColor === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                ${statusColor === 'green' ? 'bg-green-100 text-green-800' : ''}
                ${statusColor === 'red' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Journey Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                Journey Details
              </h3>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Pickup Location</p>
                      <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 break-words">{booking.pickup.address}</p>
                    </div>
                  </div>
                  <div className="ml-1.5 sm:ml-2 border-l-2 border-dashed border-gray-300 h-6 sm:h-8"></div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Drop Location</p>
                      <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 break-words">{booking.drop.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 border border-blue-100">
                  <div className="flex items-center mb-1">
                    <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 mr-1" />
                    <p className="text-[10px] xs:text-xs text-blue-700 font-medium">Pickup Date</p>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    {new Date(booking.scheduledPickupTime).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </p>
                  <p className="text-[10px] xs:text-xs text-gray-600 mt-0.5">
                    {new Date(booking.scheduledPickupTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2.5 sm:p-3 border border-purple-100">
                  <div className="flex items-center mb-1">
                    <FiNavigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 mr-1" />
                    <p className="text-[10px] xs:text-xs text-purple-700 font-medium">Distance</p>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    {booking.distanceKm.toFixed(1)} km
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 border border-green-100">
                  <div className="flex items-center mb-1">
                    <FiUsers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 mr-1" />
                    <p className="text-[10px] xs:text-xs text-green-700 font-medium">Passengers</p>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    {booking.passengers}
                  </p>
                </div>
              </div>

              {booking.notes?.userNotes && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">Special Instructions</p>
                  <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.notes.userNotes}</p>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                  <FiTruck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                Vehicle Details
              </h3>
              <div className="flex items-center space-x-3 sm:space-x-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                  {booking.car.primaryImage ? (
                    <img 
                      src={booking.car.primaryImage} 
                      alt={booking.car.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiTruck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{booking.car.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.car.model}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-2 text-xs sm:text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{booking.car.vehicleType}</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{booking.car.seatingCapacity} Seats</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Details */}
            {booking.driver ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  Driver Details
                </h3>
                <div className="flex items-center space-x-3 sm:space-x-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-lg sm:text-xl font-bold">
                      {booking.driver.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{booking.driver.name}</h4>
                    <a 
                      href={`tel:${booking.driver.phone}`}
                      className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center mt-1 font-medium"
                    >
                      <FiPhone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {booking.driver.phone}
                    </a>
                    {booking.driver.rating && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        ⭐ 4.8 rating
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                <div className="flex items-start">
                  <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-yellow-900 mb-1">
                      Driver Not Yet Assigned
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                      A verified driver will be assigned closer to your pickup time. You'll receive driver details via SMS and email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Timeline */}
            {(booking.actualPickupTime || booking.actualDropTime) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                    <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  Trip Timeline
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {booking.actualPickupTime && (
                    <div className="flex items-center bg-green-50 rounded-lg p-3 border border-green-200">
                      <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">Trip Started</p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.actualPickupTime).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.actualDropTime && (
                    <div className="flex items-center bg-green-50 rounded-lg p-3 border border-green-200">
                      <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">Trip Completed</p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.actualDropTime).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    ₹
                  </div>
                  Payment History
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {payments.map(payment => (
                    <div key={payment._id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize truncate">
                          {payment.type} Payment
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-base sm:text-lg font-bold text-gray-900">₹{payment.amount.toFixed(0)}</p>
                        <span className={`text-xs font-semibold flex items-center justify-end ${
                          payment.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {payment.status === 'paid' && <FiCheckCircle className="w-3 h-3 mr-1" />}
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 lg:sticky lg:top-20">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    ₹
                  </div>
                Payment Summary
              </h3>
              
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-semibold text-gray-900">
                    ₹{booking.pricing.baseAmount?.toFixed(0) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Distance Charge</span>
                  <span className="font-semibold text-gray-900">
                    ₹{booking.pricing.distanceAmount?.toFixed(0) || 0}
                  </span>
                </div>
                {booking.pricing.extraCharges > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Extra Charges</span>
                    <span className="font-semibold text-gray-900">
                      ₹{booking.pricing.extraCharges.toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="border-t-2 pt-2 sm:pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Total Fare</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    ₹{(booking.pricing.finalAmount || booking.pricing.totalAmount).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Advance Paid</span>
                  <span className={`font-semibold flex items-center ${booking.paymentStatus.advancePaid ? 'text-green-600' : 'text-orange-600'}`}>
                    ₹{booking.pricing.advanceAmount.toFixed(0)}
                    {booking.paymentStatus.advancePaid && <FiCheckCircle className="w-3.5 h-3.5 ml-1" />}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className={`font-semibold flex items-center ${booking.paymentStatus.remainingPaid ? 'text-green-600' : 'text-orange-600'}`}>
                    ₹{((booking.pricing.finalAmount || booking.pricing.totalAmount) - booking.pricing.advanceAmount).toFixed(0)}
                    {booking.paymentStatus.remainingPaid && <FiCheckCircle className="w-3.5 h-3.5 ml-1" />}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                {/* Pay Remaining Button */}
                {booking.status === 'completed' && !booking.paymentStatus.remainingPaid && (
                  <button
                    onClick={handlePayRemaining}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                  >
                    ₹
                    <span>Pay Remaining Amount</span>
                  </button>
                )}

                {/* Track Live Button */}
                {['started', 'driver_assigned', 'confirmed'].includes(booking.status) && (
                  <button
                    onClick={() => navigate(`/track-live/${booking._id}`)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                  >
                    <FiActivity className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Track Live</span>
                  </button>
                )}

                {/* Cancel Booking Button */}
                {['pending', 'advance_paid'].includes(booking.status) && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full border-2 border-red-600 text-red-600 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;