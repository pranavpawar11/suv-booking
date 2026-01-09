import axiosInstance from '../axios.config';

const geoService = {
  // Geocode address to coordinates
  geocodeAddress: async (address) => {
    const response = await axiosInstance.post('/geo/geocode', { address });
    return response;
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (lat, lng) => {
    const response = await axiosInstance.post('/geo/reverse-geocode', { lat, lng });
    return response;
  },

  // Calculate route with fare estimation
  calculateRoute: async (pickupAddress, dropAddress, carId = null) => {
    const response = await axiosInstance.post('/geo/route', {
      pickupAddress,
      dropAddress,
      carId
    });
    return response;
  },

  // Get fare estimation for multiple cars
  getFareEstimation: async (pickupAddress, dropAddress) => {
    const response = await axiosInstance.post('/geo/fare-estimation', {
      pickupAddress,
      dropAddress
    });
    return response;
  },

  // Calculate distance between two points
  calculateDistance: async (lat1, lng1, lat2, lng2) => {
    const response = await axiosInstance.post('/geo/distance', {
      lat1,
      lng1,
      lat2,
      lng2
    });
    return response;
  },
};

export default geoService;