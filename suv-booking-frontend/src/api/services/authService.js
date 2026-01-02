import axiosInstance from '../axios.config';

const authService = {
  // Login
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response;
  },

  // Register
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/auth/me', data);
    return response;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axiosInstance.put('/auth/change-password', data);
    return response;
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;