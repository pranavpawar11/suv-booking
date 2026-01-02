import axiosInstance from '../axios.config';

const carService = {
  // Get all cars
  getAllCars: async (params = {}) => {
    const response = await axiosInstance.get('/cars', { params });
    return response;
  },

  // Get available cars
  getAvailableCars: async () => {
    const response = await axiosInstance.get('/cars/available');
    return response;
  },

  // Get single car
  getCarById: async (id) => {
    const response = await axiosInstance.get(`/cars/${id}`);
    return response;
  },

  // Create car
  createCar: async (carData) => {
    const response = await axiosInstance.post('/cars', carData);
    return response;
  },

  // Update car
  updateCar: async (id, carData) => {
    const response = await axiosInstance.put(`/cars/${id}`, carData);
    return response;
  },

  // Delete car
  deleteCar: async (id) => {
    const response = await axiosInstance.delete(`/cars/${id}`);
    return response;
  },

  // Update car status
  updateCarStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/cars/${id}/status`, { status });
    return response;
  },
};

export default carService;