import axiosInstance from '../axios.config';

const driverService = {
  // Get all drivers
  getAllDrivers: async (params = {}) => {
    const response = await axiosInstance.get('/drivers', { params });
    return response;
  },

  // Get available drivers
  getAvailableDrivers: async () => {
    const response = await axiosInstance.get('/drivers/available');
    return response;
  },

  // Get single driver
  getDriverById: async (id) => {
    const response = await axiosInstance.get(`/drivers/${id}`);
    return response;
  },

  // Create driver
  createDriver: async (driverData) => {
    const response = await axiosInstance.post('/drivers', driverData);
    return response;
  },

  // Update driver
  updateDriver: async (id, driverData) => {
    const response = await axiosInstance.put(`/drivers/${id}`, driverData);
    return response;
  },

  // Delete driver
  deleteDriver: async (id) => {
    const response = await axiosInstance.delete(`/drivers/${id}`);
    return response;
  },

  // Assign car to driver
  assignCar: async (driverId, carId) => {
    const response = await axiosInstance.put(`/drivers/${driverId}/assign-car`, { carId });
    return response;
  },

  // Update driver status
  updateDriverStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/drivers/${id}/status`, { status });
    return response;
  },
};

export default driverService;