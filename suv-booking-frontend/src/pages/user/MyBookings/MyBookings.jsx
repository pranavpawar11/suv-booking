import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock,
  FiDollarSign,
  FiEye,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiNavigation,
  FiUsers
} from 'react-icons/fi';
import { FaCar} from 'react-icons/fa';
import bookingService from '../../../api/services/bookingService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [activeTab, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings();
      if (response.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    switch (activeTab) {
      case 'upcoming':
        filtered = bookings.filter(b => 
          ['pending', 'advance_paid', 'driver_assigned', 'confirmed', 'started'].includes(b.status)
        );
        break;
      case 'completed':
        filtered = bookings.filter(b => b.status === 'completed');
        break;
      case 'cancelled':
        filtered = bookings.filter(b => b.status === 'cancelled');
        break;
      default:
        filtered = bookings;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.scheduledPickupTime) - new Date(a.scheduledPickupTime));
    
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await bookingService.cancelBooking(bookingId, 'Cancelled by user');
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: FiClock, text: 'Pending' },
      advance_paid: { color: 'blue', icon: FiDollarSign, text: 'Advance Paid' },
      driver_assigned: { color: 'purple', icon: FaCar, text: 'Driver Assigned' },
      confirmed: { color: 'green', icon: FiCheckCircle, text: 'Confirmed' },
      started: { color: 'blue', icon: FiRefreshCw, text: 'In Progress' },
      completed: { color: 'green', icon: FiCheckCircle, text: 'Completed' },
      cancelled: { color: 'red', icon: FiX, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] xs:text-xs font-semibold
        ${config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${config.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
        ${config.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
        ${config.color === 'green' ? 'bg-green-100 text-green-800' : ''}
        ${config.color === 'red' ? 'bg-red-100 text-red-800' : ''}
      `}>
        <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{config.text}</span>
      </span>
    );
  };

  const tabs = [
    { id: 'all', label: 'All', count: bookings.length },
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => 
      ['pending', 'advance_paid', 'driver_assigned', 'confirmed', 'started'].includes(b.status)
    ).length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Bookings</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage all your SUV bookings</p>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                  }
                `}
              >
                <span className="block sm:inline">{tab.label}</span>
                <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs inline-block
                  ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
                `}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {activeTab === 'all' 
                ? "You haven't made any bookings yet" 
                : `No ${activeTab} bookings`
              }
            </p>
            <button
              onClick={() => navigate('/browse-cars')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 text-sm sm:text-base"
            >
              Book Your First Ride
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredBookings.map(booking => (
              <div
                key={booking._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4 sm:p-5 lg:p-6">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="mb-3 sm:mb-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                          {booking.bookingId}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/booking-details/${booking._id}`)}
                        className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors active:scale-95 flex-1 sm:flex-initial text-xs sm:text-sm font-medium"
                      >
                        <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>View Details</span>
                      </button>
                      {['pending', 'advance_paid'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-red-600 text-red-600 rounded-lg sm:rounded-xl hover:bg-red-50 transition-colors active:scale-95 flex-1 sm:flex-initial text-xs sm:text-sm font-medium"
                        >
                          <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {/* Journey Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                        <FiMapPin className="mr-1.5 sm:mr-2 text-blue-600 w-4 h-4" />
                        Journey Details
                      </h4>
                      
                      {/* Route Visualization */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Pickup Location</p>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                                {booking.pickup.address}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-4 sm:h-6"></div>
                          
                          <div className="flex items-start">
                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Drop Location</p>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                                {booking.drop.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trip Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 mr-1" />
                            <p className="text-[10px] xs:text-xs text-blue-700 font-medium">Pickup Date</p>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-gray-900">
                            {new Date(booking.scheduledPickupTime).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                          <p className="text-[10px] xs:text-xs text-gray-600 mt-0.5">
                            {new Date(booking.scheduledPickupTime).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <FiNavigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 mr-1" />
                            <p className="text-[10px] xs:text-xs text-purple-700 font-medium">Distance</p>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-gray-900">
                            {booking.distanceKm.toFixed(1)} km
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <FiUsers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 mr-1" />
                            <p className="text-[10px] xs:text-xs text-green-700 font-medium">Passengers</p>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-gray-900">
                            {booking.passengers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle & Payment Section */}
                    <div className="space-y-3 sm:space-y-4">
                      {/* Vehicle Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                            <FaCar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] xs:text-xs text-gray-600 mb-0.5">Vehicle</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {booking.car.name}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] xs:text-xs text-gray-600 ml-10 sm:ml-[52px]">
                          {booking.car.vehicleType}
                        </p>
                      </div>

                      {/* Payment Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <p className="text-[10px] xs:text-xs text-gray-600">Total Amount</p>
                          </div>
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                            ₹{booking.pricing.totalAmount.toFixed(0)}
                          </p>
                        </div>
                        
                        <div className="space-y-2 ml-10 sm:ml-[52px]">
                          <div className="flex items-center justify-between text-[10px] xs:text-xs">
                            <span className="text-gray-600">Advance:</span>
                            <span className={`font-semibold ${booking.paymentStatus.advancePaid ? 'text-green-600' : 'text-orange-600'}`}>
                              ₹{booking.pricing.advanceAmount.toFixed(0)}
                              {booking.paymentStatus.advancePaid && (
                                <FiCheckCircle className="inline ml-1 w-3 h-3" />
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] xs:text-xs">
                            <span className="text-gray-600">Remaining:</span>
                            <span className={`font-semibold ${booking.paymentStatus.remainingPaid ? 'text-green-600' : 'text-orange-600'}`}>
                              ₹{booking.pricing.remainingAmount.toFixed(0)}
                              {booking.paymentStatus.remainingPaid && (
                                <FiCheckCircle className="inline ml-1 w-3 h-3" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;