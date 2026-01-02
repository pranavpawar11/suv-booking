import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiTruck,
  FiDollarSign,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import bookingService from '../../../api/services/bookingService';
import driverService from '../../../api/services/driverService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
    fetchAvailableDrivers();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const response = await driverService.getAvailableDrivers();
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }

    try {
      setActionLoading(true);
      await bookingService.assignDriver(id, selectedDriver);
      toast.success('Driver assigned successfully!');
      setShowAssignDriver(false);
      fetchBookingDetails();
      fetchAvailableDrivers();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!window.confirm('Are you sure you want to start this trip?')) return;

    try {
      setActionLoading(true);
      await bookingService.startTrip(id);
      toast.success('Trip started successfully!');
      fetchBookingDetails();
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error(error.response?.data?.message || 'Failed to start trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!window.confirm('Are you sure you want to end this trip?')) return;

    try {
      setActionLoading(true);
      await bookingService.endTrip(id, 0); // No extra charges for now
      toast.success('Trip completed successfully!');
      fetchBookingDetails();
    } catch (error) {
      console.error('Error ending trip:', error);
      toast.error(error.response?.data?.message || 'Failed to end trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setActionLoading(true);
      await bookingService.cancelBooking(id, cancelReason);
      toast.success('Booking cancelled successfully!');
      setShowCancelModal(false);
      fetchBookingDetails();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      advance_paid: 'bg-blue-100 text-blue-800',
      driver_assigned: 'bg-indigo-100 text-indigo-800',
      confirmed: 'bg-purple-100 text-purple-800',
      started: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  if (!booking) return null;

  const canAssignDriver = booking.status === 'advance_paid' && !booking.driver;
  const canStartTrip = booking.status === 'driver_assigned' && booking.driver;
  const canEndTrip = booking.status === 'started';
  const canCancel = ['pending', 'advance_paid', 'driver_assigned'].includes(booking.status);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Bookings
        </button>
        <div className="flex gap-2">
          {canAssignDriver && (
            <button
              onClick={() => setShowAssignDriver(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Assign Driver
            </button>
          )}
          {canStartTrip && (
            <button
              onClick={handleStartTrip}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              Start Trip
            </button>
          )}
          {canEndTrip && (
            <button
              onClick={handleEndTrip}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              End Trip
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Booking Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{booking.bookingId}</h1>
            <p className="text-gray-600 mt-1">
              Created on {format(new Date(booking.createdAt), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-6 flex items-center justify-between">
          {['pending', 'advance_paid', 'driver_assigned', 'started', 'completed'].map(
            (step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['pending', 'advance_paid', 'driver_assigned', 'started', 'completed'].indexOf(
                        booking.status
                      ) >= index
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center">{step.replace('_', ' ')}</span>
                </div>
                {index < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ['pending', 'advance_paid', 'driver_assigned', 'started', 'completed'].indexOf(
                        booking.status
                      ) > index
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-medium text-gray-900">{booking.pickup?.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {booking.pickup?.lat?.toFixed(4)}, Lng: {booking.pickup?.lng?.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-dashed border-gray-300 h-8"></div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">Drop Location</p>
                  <p className="font-medium text-gray-900">{booking.drop?.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {booking.drop?.lat?.toFixed(4)}, Lng: {booking.drop?.lng?.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.distanceKm} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Duration</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.estimatedDurationMinutes} mins
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiUser className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{booking.user?.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiPhone className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{booking.user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiUser className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{booking.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Car & Driver Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Car & Driver Details</h2>
            <div className="space-y-4">
              {/* Car */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FiTruck className="text-blue-600 mr-3 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-600">Car</p>
                    <p className="font-semibold text-blue-900">{booking.car?.name}</p>
                    <p className="text-sm text-blue-700">{booking.car?.registrationNumber}</p>
                  </div>
                </div>
              </div>

              {/* Driver */}
              {booking.driver ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <FiUser className="text-green-600 mr-3 text-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-green-600">Driver</p>
                      <p className="font-semibold text-green-900">{booking.driver?.name}</p>
                      <p className="text-sm text-green-700">{booking.driver?.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-yellow-800">No driver assigned yet</p>
                  {canAssignDriver && (
                    <button
                      onClick={() => setShowAssignDriver(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Assign Driver Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Booking Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled Pickup</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(booking.scheduledPickupTime), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>

              {booking.actualPickupTime && (
                <div className="flex items-center">
                  <FiClock className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Actual Pickup</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(booking.actualPickupTime), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {booking.actualDropTime && (
                <div className="flex items-center">
                  <FiCheckCircle className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Actual Drop</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(booking.actualDropTime), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <FiUser className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="font-medium text-gray-900">{booking.passengers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-medium text-gray-900">
                  ₹{booking.pricing?.baseAmount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance Amount</span>
                <span className="font-medium text-gray-900">
                  ₹{booking.pricing?.distanceAmount || 0}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="font-bold text-gray-900">
                  ₹{booking.pricing?.totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance (25%)</span>
                <span className="font-medium text-gray-900">
                  ₹{booking.pricing?.advanceAmount}
                  {booking.paymentStatus?.advancePaid && (
                    <FiCheckCircle className="inline ml-2 text-green-600" />
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining (75%)</span>
                <span className="font-medium text-gray-900">
                  ₹{booking.pricing?.remainingAmount}
                  {booking.paymentStatus?.remainingPaid && (
                    <FiCheckCircle className="inline ml-2 text-green-600" />
                  )}
                </span>
              </div>

              {booking.pricing?.extraCharges > 0 && (
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Extra Charges</span>
                  <span className="font-medium text-orange-600">
                    ₹{booking.pricing?.extraCharges}
                  </span>
                </div>
              )}

              {booking.pricing?.finalAmount && (
                <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">Final Amount</span>
                  <span className="font-bold text-primary-600">
                    ₹{booking.pricing?.finalAmount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Advance Payment</span>
                {booking.paymentStatus?.advancePaid ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <FiCheckCircle className="mr-1" />
                    Paid
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 font-medium">
                    <FiXCircle className="mr-1" />
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Remaining Payment</span>
                {booking.paymentStatus?.remainingPaid ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <FiCheckCircle className="mr-1" />
                    Paid
                  </span>
                ) : (
                  <span className="flex items-center text-gray-600 font-medium">
                    <FiClock className="mr-1" />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      {showAssignDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Driver</h3>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-4"
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.phone} ({driver.assignedCar?.name || 'No car'})
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignDriver(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign Driver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-4"
              placeholder="Enter cancellation reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;