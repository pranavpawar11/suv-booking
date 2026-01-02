import axiosInstance from '../axios.config';

const bookingService = {
  // Get all bookings (Admin)
  getAllBookings: async (params = {}) => {
    const response = await axiosInstance.get('/bookings', { params });
    return response;
  },

  // Get active bookings
  getActiveBookings: async () => {
    const response = await axiosInstance.get('/bookings/active');
    return response;
  },

  // Get user bookings
  getUserBookings: async (params = {}) => {
    const response = await axiosInstance.get('/bookings/my-bookings', { params });
    return response;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response;
  },

  // Assign driver to booking
  assignDriver: async (bookingId, driverId) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/assign-driver`, { driverId });
    return response;
  },

  // Start trip
  startTrip: async (bookingId) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/start`);
    return response;
  },

  // End trip
  endTrip: async (bookingId, extraCharges = 0) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/end`, { extraCharges });
    return response;
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`, { reason });
    return response;
  },
};

export default bookingService;