import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiTruck } from 'react-icons/fi';
import driverService from '../../../api/services/driverService';
import carService from '../../../api/services/carService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const EditDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    aadharNumber: '',
    profileImage: '',
    status: 'offline',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  });
  const [selectedCar, setSelectedCar] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDriverData();
    fetchCars();
  }, [id]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const response = await driverService.getDriverById(id);
      const driver = response.data.driver;

      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        licenseNumber: driver.licenseNumber || '',
        licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
        aadharNumber: driver.aadharNumber || '',
        profileImage: driver.profileImage || '',
        status: driver.status || 'offline',
        address: {
          street: driver.address?.street || '',
          city: driver.address?.city || '',
          state: driver.address?.state || '',
          pincode: driver.address?.pincode || '',
        },
      });

      setSelectedCar(driver.assignedCar?._id || '');
    } catch (error) {
      console.error('Error fetching driver:', error);
      toast.error('Failed to load driver details');
      navigate('/admin/drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await carService.getAllCars();
      setCars(response.data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCarAssignment = async () => {
    if (!selectedCar) {
      toast.error('Please select a car');
      return;
    }

    try {
      await driverService.assignCar(id, selectedCar);
      toast.success('Car assigned successfully!');
      fetchDriverData();
    } catch (error) {
      console.error('Error assigning car:', error);
      toast.error(error.response?.data?.message || 'Failed to assign car');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.licenseExpiry) {
      newErrors.licenseExpiry = 'License expiry date is required';
    }

    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar must be 12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);

      const cleanedData = {
        ...formData,
        email: formData.email || undefined,
        aadharNumber: formData.aadharNumber || undefined,
        profileImage: formData.profileImage || undefined,
      };

      await driverService.updateDriver(id, cleanedData);
      toast.success('Driver updated successfully!');
      navigate('/admin/drivers');
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error(error.response?.data?.message || 'Failed to update driver');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/drivers')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Drivers
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Driver</h1>
        <p className="text-gray-600 mt-1">Update driver information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (View Only)
              </label>
              <input
                type="tel"
                value={formData.phone}
                disabled
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhar Number (Optional)
              </label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                maxLength="12"
                className={`w-full px-4 py-2 border ${
                  errors.aadharNumber ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
              />
              {errors.aadharNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              {formData.profileImage && (
                <img
                  src={formData.profileImage}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">License Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driving License Number (View Only)
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                disabled
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg cursor-not-allowed uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry Date *
              </label>
              <input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border ${
                  errors.licenseExpiry ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
              />
              {errors.licenseExpiry && (
                <p className="mt-1 text-sm text-red-600">{errors.licenseExpiry}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Car Assignment */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiTruck className="mr-2" />
            Car Assignment
          </h2>
          <div className="flex gap-4">
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Select a car</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.name} - {car.registrationNumber} ({car.status})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCarAssignment}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Assign Car
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/drivers')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader size="sm" />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Update Driver
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDriver;