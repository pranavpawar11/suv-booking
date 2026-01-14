import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch,  FiEye } from 'react-icons/fi';
import { FaCar} from 'react-icons/fa';
import driverService from '../../../api/services/driverService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const DriversList = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverService.getAllDrivers();
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      await driverService.deleteDriver(id);
      toast.success('Driver deleted successfully');
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await driverService.updateDriverStatus(id, newStatus);
      toast.success('Driver status updated');
      fetchDrivers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
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

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Drivers Management</h1>
          <p className="text-gray-600 mt-1">Manage your driver fleet</p>
        </div>
        <button
          onClick={() => navigate('/admin/drivers/add')}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiPlus className="mr-2" />
          Add Driver
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaCar className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {drivers.filter((d) => d.status === 'available').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Busy</p>
              <p className="text-2xl font-bold text-blue-600">
                {drivers.filter((d) => d.status === 'busy').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-2xl">🚗</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Car</p>
              <p className="text-2xl font-bold text-purple-600">
                {drivers.filter((d) => d.assignedCar).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCar className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Drivers Grid */}
      {filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Driver Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                      {driver.profileImage ? (
                        <img
                          src={driver.profileImage}
                          alt={driver.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-600 font-semibold text-xl">
                          {driver.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      driver.status
                    )}`}
                  >
                    {driver.status}
                  </span>
                </div>
              </div>

              {/* Driver Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium text-gray-900">{driver.licenseNumber}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Trips:</span>
                  <span className="font-medium text-gray-900">{driver.totalTrips || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium text-gray-900">
                    ⭐ {driver.rating?.average?.toFixed(1) || 'N/A'}{' '}
                    {driver.rating?.count ? `(${driver.rating.count})` : ''}
                  </span>
                </div>

                {/* Assigned Car */}
                {driver.assignedCar ? (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <FaCar className="text-blue-600 mr-2" />
                      <div>
                        <p className="text-blue-900 font-medium">
                          {driver.assignedCar.name}
                        </p>
                        <p className="text-blue-600 text-xs">
                          {driver.assignedCar.registrationNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">No car assigned</p>
                  </div>
                )}

                {/* Status Toggle */}
                {driver.isActive && (
                  <div className="pt-3 border-t border-gray-100">
                    <label className="block text-xs text-gray-600 mb-2">Quick Status:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(driver._id, 'available')}
                        className={`flex-1 px-3 py-1.5 text-xs rounded ${
                          driver.status === 'available'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => handleStatusChange(driver._id, 'offline')}
                        className={`flex-1 px-3 py-1.5 text-xs rounded ${
                          driver.status === 'offline'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Offline
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex gap-2">
                <button
                  onClick={() => navigate(`/admin/drivers/${driver._id}`)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiEye className="mr-1" />
                  View
                </button>
                <button
                  onClick={() => navigate(`/admin/drivers/edit/${driver._id}`)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition"
                >
                  <FiEdit className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(driver._id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">👨‍✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first driver</p>
          <button
            onClick={() => navigate('/admin/drivers/add')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <FiPlus className="mr-2" />
            Add Driver
          </button>
        </div>
      )}
    </div>
  );
};

export default DriversList;