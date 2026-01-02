import axiosInstance from '../axios.config';

const paymentService = {
  // Get all payments (Admin)
  getAllPayments: async (params = {}) => {
    const response = await axiosInstance.get('/payments', { params });
    return response;
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response;
  },

  // Get booking payments
  getBookingPayments: async (bookingId) => {
    const response = await axiosInstance.get(`/payments/booking/${bookingId}`);
    return response;
  },

  // Get user payments
  getUserPayments: async (params = {}) => {
    const response = await axiosInstance.get('/payments/my-payments', { params });
    return response;
  },

  // Create advance payment
  createAdvancePayment: async (bookingId) => {
    const response = await axiosInstance.post('/payments/create-advance', { bookingId });
    return response;
  },

  // Create remaining payment
  createRemainingPayment: async (bookingId) => {
    const response = await axiosInstance.post('/payments/create-remaining', { bookingId });
    return response;
  },

  // Verify payment
  verifyPayment: async (data) => {
    const response = await axiosInstance.post('/payments/verify', data);
    return response;
  },

  // Get payment statistics (Admin)
  getPaymentStats: async (params = {}) => {
    const response = await axiosInstance.get('/payments/stats/revenue', { params });
    return response;
  },

  // Initiate refund (Admin)
  initiateRefund: async (paymentId, amount, reason) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/refund`, {
      amount,
      reason,
    });
    return response;
  },
};

export default paymentService;