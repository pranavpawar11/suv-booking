import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import axios from '../../../api/axios.config';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${id}`);
      setUser(response.data.user);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
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

  if (!user) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Users
        </button>
        <button
          onClick={() => navigate(`/admin/users/edit/${id}`)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiEdit className="mr-2" />
          Edit User
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-start -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-6 mt-16">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <FiCheckCircle className="mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <FiXCircle className="mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
              <p className="text-gray-600 mt-1">User ID: {user._id}</p>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalBookings || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completedBookings || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.cancelledBookings || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{stats.totalSpent?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiMail className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiPhone className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
            {user.address && (user.address.street || user.address.city) && (
              <div className="flex items-start">
                <FiMapPin className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {user.address.street && `${user.address.street}, `}
                    {user.address.city && `${user.address.city}, `}
                    {user.address.state}
                    {user.address.pincode && ` - ${user.address.pincode}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(user.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'dd MMM yyyy, hh:mm a')
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(user.updatedAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Summary</h2>
        {stats && (stats.totalBookings > 0) ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FiTrendingUp className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Booking Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{stats.totalBookings > 0 ? Math.round(stats.totalSpent / stats.totalBookings).toLocaleString() : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <FiCheckCircle className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.totalBookings > 0
                      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FiDollarSign className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lifetime Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{stats.totalSpent?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No booking activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;