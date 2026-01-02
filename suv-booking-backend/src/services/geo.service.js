const axios = require('axios');
const { MAP_SERVICES } = require('../config/constants');

class GeoService {
  // Geocode address to coordinates using Nominatim
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${MAP_SERVICES.NOMINATIM_URL}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'SUV-Booking-App/1.0' // Required by Nominatim
        }
      });

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        address: {
          city: result.address?.city || result.address?.town || result.address?.village,
          state: result.address?.state,
          country: result.address?.country,
          postcode: result.address?.postcode
        }
      };
    } catch (error) {
      console.error('Geocoding error:', error.message);
      throw new Error('Failed to geocode address');
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${MAP_SERVICES.NOMINATIM_URL}/reverse`, {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'SUV-Booking-App/1.0'
        }
      });

      if (!response.data) {
        return null;
      }

      return {
        displayName: response.data.display_name,
        address: response.data.address
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  // Calculate route using OSRM
  async calculateRoute(pickupLat, pickupLng, dropLat, dropLng) {
    try {
      const response = await axios.get(
        `${MAP_SERVICES.OSRM_URL}/route/v1/driving/${pickupLng},${pickupLat};${dropLng},${dropLat}`,
        {
          params: {
            overview: 'full',
            geometries: 'geojson',
            steps: 'true'
          }
        }
      );

      if (!response.data || !response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      
      return {
        distance: (route.distance / 1000).toFixed(2), // Convert to km
        duration: Math.round(route.duration / 60), // Convert to minutes
        geometry: route.geometry, // GeoJSON LineString
        coordinates: route.geometry.coordinates,
        legs: route.legs
      };
    } catch (error) {
      console.error('Route calculation error:', error.message);
      throw new Error('Failed to calculate route');
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(2));
  }

  // Convert degrees to radians
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get complete route information
  async getCompleteRouteInfo(pickupAddress, dropAddress) {
    try {
      // Geocode pickup address
      const pickupCoords = await this.geocodeAddress(pickupAddress);
      if (!pickupCoords) {
        throw new Error('Invalid pickup address');
      }

      // Geocode drop address
      const dropCoords = await this.geocodeAddress(dropAddress);
      if (!dropCoords) {
        throw new Error('Invalid drop address');
      }

      // Calculate route
      const route = await this.calculateRoute(
        pickupCoords.lat,
        pickupCoords.lng,
        dropCoords.lat,
        dropCoords.lng
      );

      return {
        pickup: {
          address: pickupCoords.displayName,
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
          details: pickupCoords.address
        },
        drop: {
          address: dropCoords.displayName,
          lat: dropCoords.lat,
          lng: dropCoords.lng,
          details: dropCoords.address
        },
        route: {
          distance: parseFloat(route.distance),
          duration: route.duration,
          geometry: route.geometry,
          coordinates: route.coordinates
        }
      };
    } catch (error) {
      console.error('Complete route info error:', error.message);
      throw error;
    }
  }

  // Find nearby drivers (helper for location-based queries)
  async findNearbyDrivers(lat, lng, radiusKm = 10) {
    const Driver = require('../models/Driver.model');
    
    const radiusInMeters = radiusKm * 1000;
    
    const drivers = await Driver.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      },
      status: 'available',
      isActive: true
    }).limit(10);

    return drivers;
  }
}

module.exports = new GeoService();