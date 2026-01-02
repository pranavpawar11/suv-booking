import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import carService from '../../../api/services/carService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const CarsList = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carService.getAllCars();
      setCars(response.data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      await carService.deleteCar(id);
      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      booked: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || car.status === filterStatus;
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
          <h1 className="text-3xl font-bold text-gray-900">Cars Management</h1>
          <p className="text-gray-600 mt-1">Manage your SUV fleet</p>
        </div>
        <button
          onClick={() => navigate('/admin/cars/add')}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiPlus className="mr-2" />
          Add Car
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or registration..."
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
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Cars Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Car Image */}
              <div className="h-48 bg-gray-200 relative">
                {car.primaryImage ? (
                  <img
                    src={car.primaryImage}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">🚗</span>
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    car.status
                  )}`}
                >
                  {car.status}
                </span>
              </div>

              {/* Car Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
                <p className="text-sm text-gray-600">{car.brand} {car.model}</p>
                <p className="text-xs text-gray-500 mt-1">{car.registrationNumber}</p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-semibold text-gray-900 ml-1">₹{car.ratePerKm}/km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Seats:</span>
                    <span className="font-semibold text-gray-900 ml-1">{car.seatingCapacity}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {car.features?.ac && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">AC</span>
                  )}
                  {car.features?.musicSystem && (
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded">Music</span>
                  )}
                  {car.features?.gps && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">GPS</span>
                  )}
                </div>

                {/* Driver Info */}
                {car.driver && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium text-gray-900 ml-1">{car.driver.name}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/cars/edit/${car._id}`)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition"
                  >
                    <FiEdit className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car._id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <FiTrash2 className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first car</p>
          <button
            onClick={() => navigate('/admin/cars/add')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <FiPlus className="mr-2" />
            Add Car
          </button>
        </div>
      )}
    </div>
  );
};

export default CarsList;