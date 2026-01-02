import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTruck, FiMapPin, FiCalendar, FiPhone, FiMail, FiCreditCard } from 'react-icons/fi';
import driverService from '../../../api/services/driverService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      const response = await driverService.getDriverById(id);
      setDriver(response.data.driver);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching driver details:', error);
      toast.error('Failed to load driver details');
      navigate('/admin/drivers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-blue-100 text-blue-800',
      offline: 'bg-gray-100 text-gray-800',
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

  if (!driver) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Driver not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/drivers')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Drivers
        </button>
        <button
          onClick={() => navigate(`/admin/drivers/edit/${id}`)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiEdit className="mr-2" />
          Edit Driver
        </button>
      </div>

      {/* Driver Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-start -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {driver.profileImage ? (
                <img
                  src={driver.profileImage}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-600">
                  {driver.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-6 mt-16">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{driver.name}</h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    driver.status
                  )}`}
                >
                  {driver.status}
                </span>
                {driver.isVerified && (
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">Driver ID: {driver._id}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Trips</p>
              <p className="text-2xl font-bold text-blue-900">{stats?.totalTrips || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats?.completedTrips || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Rating</p>
              <p className="text-2xl font-bold text-purple-900">
                ⭐ {driver.rating?.average?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-orange-900">
                ₹{stats?.totalEarnings?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiPhone className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{driver.phone}</p>
              </div>
            </div>
            {driver.email && (
              <div className="flex items-center">
                <FiMail className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{driver.email}</p>
                </div>
              </div>
            )}
            {driver.address && (
              <div className="flex items-start">
                <FiMapPin className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {driver.address.street && `${driver.address.street}, `}
                    {driver.address.city && `${driver.address.city}, `}
                    {driver.address.state}
                    {driver.address.pincode && ` - ${driver.address.pincode}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* License Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">License Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiCreditCard className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="font-medium text-gray-900">{driver.licenseNumber}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiCalendar className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">License Expiry</p>
                <p className="font-medium text-gray-900">
                  {driver.licenseExpiry
                    ? format(new Date(driver.licenseExpiry), 'dd MMM yyyy')
                    : 'N/A'}
                </p>
              </div>
            </div>
            {driver.aadharNumber && (
              <div className="flex items-center">
                <FiCreditCard className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Aadhar Number</p>
                  <p className="font-medium text-gray-900">
                    {driver.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Car */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiTruck className="mr-2" />
            Assigned Car
          </h2>
          {driver.assignedCar ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {driver.assignedCar.name}
                  </h3>
                  <p className="text-gray-600">{driver.assignedCar.model}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {driver.assignedCar.registrationNumber}
                  </p>
                </div>
                {driver.assignedCar.images?.[0] && (
                  <img
                    src={driver.assignedCar.images[0]}
                    alt={driver.assignedCar.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiTruck className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-600">No car assigned</p>
              <button
                onClick={() => navigate(`/admin/drivers/edit/${id}`)}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Assign a Car
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Joining Date</span>
              <span className="font-medium text-gray-900">
                {driver.joiningDate
                  ? format(new Date(driver.joiningDate), 'dd MMM yyyy')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Status</span>
              <span className={`font-medium ${driver.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {driver.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Location Update</span>
              <span className="font-medium text-gray-900">
                {driver.lastLocationUpdate
                  ? format(new Date(driver.lastLocationUpdate), 'dd MMM yyyy, hh:mm a')
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;