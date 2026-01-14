import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiMapPin, FiClock, FiUser,  FiRefreshCw } from 'react-icons/fi';
import { FaCar} from 'react-icons/fa';
import bookingService from '../../../api/services/bookingService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ActiveBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActiveBookings();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActiveBookings(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      
      const response = await bookingService.getActiveBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching active bookings:', error);
      if (!silent) toast.error('Failed to load active bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchActiveBookings();
    toast.success('Refreshed!');
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      advance_paid: {
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Advance Paid',
        icon: '💳',
      },
      driver_assigned: {
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        label: 'Driver Assigned',
        icon: '👤',
      },
      confirmed: {
        color: 'bg-purple-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        label: 'Confirmed',
        icon: '✓',
      },
      started: {
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'In Progress',
        icon: '🚗',
      },
    };
    return statusConfig[status] || statusConfig.advance_paid;
  };

  const calculateElapsedTime = (startTime) => {
    if (!startTime) return null;
    const elapsed = Math.floor((new Date() - new Date(startTime)) / 60000);
    if (elapsed < 60) return `${elapsed} mins`;
    const hours = Math.floor(elapsed / 60);
    const mins = elapsed % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Bookings</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of ongoing trips</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-primary-100 text-sm">Total Active</p>
            <p className="text-4xl font-bold mt-1">{bookings.length}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">In Progress</p>
            <p className="text-4xl font-bold mt-1">
              {bookings.filter((b) => b.status === 'started').length}
            </p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Awaiting Driver</p>
            <p className="text-4xl font-bold mt-1">
              {bookings.filter((b) => b.status === 'advance_paid').length}
            </p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Ready to Start</p>
            <p className="text-4xl font-bold mt-1">
              {bookings.filter((b) => b.status === 'driver_assigned' || b.status === 'confirmed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Active Bookings Grid */}
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const elapsedTime = booking.actualPickupTime
              ? calculateElapsedTime(booking.actualPickupTime)
              : null;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Header with Status */}
                <div className={`${statusInfo.bgColor} p-4 border-b border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{statusInfo.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{booking.bookingId}</h3>
                        <p className={`text-sm ${statusInfo.textColor} font-medium`}>
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>
                    {elapsedTime && (
                      <div className="flex items-center bg-white rounded-lg px-3 py-1.5">
                        <FiClock className="text-gray-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">
                          {elapsedTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <FiUser className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-900">{booking.user?.name}</p>
                      <p className="text-xs text-gray-500">{booking.user?.phone}</p>
                    </div>
                  </div>

                  {/* Car & Driver */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <FaCar className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Car</p>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.car?.name}
                        </p>
                      </div>
                    </div>
                    {booking.driver ? (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <FiUser className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Driver</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.driver?.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <span className="text-xs font-medium">No driver assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Route */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                          <FiMapPin className="text-green-600 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600">Pickup</p>
                          <p className="text-sm text-gray-900 truncate">
                            {booking.pickup?.address}
                          </p>
                        </div>
                      </div>

                      <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4"></div>

                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                          <FiMapPin className="text-red-600 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600">Drop</p>
                          <p className="text-sm text-gray-900 truncate">
                            {booking.drop?.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-600">
                        Distance: <span className="font-semibold text-gray-900">{booking.distanceKm} km</span>
                      </span>
                      <span className="text-xs text-gray-600">
                        Amount: <span className="font-semibold text-gray-900">₹{booking.pricing?.totalAmount}</span>
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Time */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Scheduled Pickup</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(booking.scheduledPickupTime), 'dd MMM, hh:mm a')}
                        </p>
                      </div>
                      {booking.actualPickupTime && (
                        <div>
                          <p className="text-xs text-gray-600">Started At</p>
                          <p className="text-sm font-medium text-green-600">
                            {format(new Date(booking.actualPickupTime), 'hh:mm a')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <FiEye className="mr-2" />
                    View Details & Manage
                  </button>
                </div>

                {/* Progress Indicator */}
                {booking.status === 'started' && (
                  <div className="bg-green-50 p-3 border-t border-green-100">
                    <div className="flex items-center justify-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium">Trip in Progress</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Bookings</h3>
          <p className="text-gray-600">All trips are completed or no bookings are in progress</p>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500">
        <p>Auto-refreshes every 30 seconds • Last updated: {format(new Date(), 'hh:mm:ss a')}</p>
      </div>
    </div>
  );
};

export default ActiveBookings;