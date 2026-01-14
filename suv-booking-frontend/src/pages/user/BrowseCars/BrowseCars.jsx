import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiX,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiNavigation,
  FiClock,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { FaCar} from 'react-icons/fa';
import carService from '../../../api/services/carService';
import LocationInput from '../../../components/common/LocationInput';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const BrowseCars = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get pre-filled data from navigation state (from home page)
  const prefillData = location.state || {};

  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);

  // Search and booking info
  const [searchData, setSearchData] = useState({
    pickup: prefillData.pickup || { address: '', lat: null, lng: null },
    drop: prefillData.drop || { address: '', lat: null, lng: null },
    date: prefillData.date || '',
    passengers: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    vehicleType: 'all',
    minSeating: 0,
    maxRate: 1000,
    sortBy: 'price' // price, rating, seating
  });

  // Route calculation
  const [routeInfo, setRouteInfo] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Fetch available cars
  useEffect(() => {
    fetchCars();
  }, []);

  // Apply filters when cars or filters change
  useEffect(() => {
    applyFilters();
  }, [cars, filters]);

  // Calculate route if pickup and drop are provided
  useEffect(() => {
    if (searchData.pickup.address && searchData.drop.address && 
        searchData.pickup.lat && searchData.drop.lat) {
      calculateRoute();
    }
  }, [searchData.pickup, searchData.drop]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carService.getAvailableCars();
      setCars(response.data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    try {
      setCalculatingRoute(true);
      const response = await fetch('http://localhost:5000/api/v1/geo/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          pickupAddress: searchData.pickup.address,
          dropAddress: searchData.drop.address
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setRouteInfo(data.data);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Failed to calculate route');
    } finally {
      setCalculatingRoute(false);
    }
  };

const applyFilters = () => {
    let filtered = [...cars];

    // CRITICAL: Filter by passenger count first - cars must have enough seats
    filtered = filtered.filter(car => car.seatingCapacity >= searchData.passengers);

    // Filter by vehicle type
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter(car => car.vehicleType === filters.vehicleType);
    }

    // Filter by seating capacity
    if (filters.minSeating > 0) {
      filtered = filtered.filter(car => car.seatingCapacity >= filters.minSeating);
    }

    // Filter by rate
    filtered = filtered.filter(car => car.ratePerKm <= filters.maxRate);

    // Sort
    if (filters.sortBy === 'price') {
      filtered.sort((a, b) => a.ratePerKm - b.ratePerKm);
    } else if (filters.sortBy === 'seating') {
      filtered.sort((a, b) => b.seatingCapacity - a.seatingCapacity);
    }

    setFilteredCars(filtered);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const calculateFare = (car) => {
    if (!routeInfo) return null;
    
    const distance = routeInfo.route.distance;
    const baseAmount = car.baseRate || 0;
    const distanceAmount = distance * car.ratePerKm;
    const totalAmount = baseAmount + distanceAmount;
    const advanceAmount = totalAmount * 0.25; // 25% advance

    return {
      distance,
      baseAmount,
      distanceAmount,
      totalAmount,
      advanceAmount
    };
  };

  const handleBookNow = (car) => {
    if (!searchData.pickup.address || !searchData.drop.address || !searchData.date) {
      toast.error('Please enter pickup location, drop location, and date');
      return;
    }

    if (!searchData.pickup.lat || !searchData.drop.lat) {
      toast.error('Please select valid locations from suggestions');
      return;
    }

    navigate('/create-booking', {
      state: {
        car,
        searchData,
        routeInfo,
        fare: calculateFare(car)
      }
    });
  };

  const handleViewDetails = (car) => {
    navigate(`/cars/${car._id}`, {
      state: {
        searchData,
        routeInfo,
        fare: calculateFare(car),
      },
    });
  };

  const vehicleTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Luxury', label: 'Luxury' },
    { value: 'MUV', label: 'MUV' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading available cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Header - Sticky */}
      <div className="bg-white shadow-md sticky top-14 sm:top-16 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Compact View - Always Visible */}
          <div className="py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Search Summary */}
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="flex-1 flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-colors text-left group"
              >
                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {searchData.pickup.address && searchData.drop.address ? (
                    <div className="text-xs sm:text-sm">
                      <span className="font-semibold text-gray-900 truncate block">
                        {searchData.pickup.address.split(',')[0]} → {searchData.drop.address.split(',')[0]}
                      </span>
                      {routeInfo && (
                        <span className="text-gray-500 text-[10px] xs:text-xs">
                          {routeInfo.route.distance.toFixed(1)} km • {searchData.date ? new Date(searchData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Select date'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      Search pickup & drop location...
                    </span>
                  )}
                </div>
                {showSearchBar ? (
                  <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 flex-shrink-0" />
                )}
              </button>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all active:scale-95 whitespace-nowrap ${
                  showFilters 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showFilters ? <FiX className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiFilter className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="text-xs sm:text-sm hidden xs:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Expanded Search Bar */}
          {showSearchBar && (
            <div className="border-t border-gray-200 py-3 sm:py-4 animate-slideInUp">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {/* Pickup Location */}
                <div className="relative">
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4 pointer-events-none z-10" />
                    <LocationInput
                      value={searchData.pickup.address}
                      onChange={(location) => setSearchData(prev => ({ ...prev, pickup: location }))}
                      placeholder="Enter pickup location"
                      className="text-xs sm:text-sm pl-10"
                    />
                  </div>
                </div>

                {/* Drop Location */}
                <div className="relative">
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Drop Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 pointer-events-none z-10" />
                    <LocationInput
                      value={searchData.drop.address}
                      onChange={(location) => setSearchData(prev => ({ ...prev, drop: location }))}
                      placeholder="Enter drop location"
                      className="text-xs sm:text-sm pl-10"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="relative">
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="date"
                      name="date"
                      value={searchData.date}
                      onChange={handleSearchChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-xs sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div className="relative">
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Passengers
                  </label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                      name="passengers"
                      value={searchData.passengers}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-3 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-xs sm:text-sm appearance-none transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              {calculatingRoute && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center text-xs sm:text-sm text-blue-700">
                  <Loader size="sm" />
                  <span className="ml-2 font-medium">Calculating route...</span>
                </div>
              )}
              {routeInfo && (
                <div className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                        <FiNavigation className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] xs:text-xs text-gray-500">Distance</p>
                        <p className="font-bold text-gray-900">{routeInfo.route.distance.toFixed(1)} km</p>
                      </div>
                    </div>
                    <div className="hidden xs:block w-px h-8 bg-gray-300"></div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                        <FiClock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] xs:text-xs text-gray-500">Duration</p>
                        <p className="font-bold text-gray-900">~{routeInfo.route.duration} min</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 bg-gray-50 py-3 sm:py-4 animate-slideInUp">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1 flex items-center">
                    <FaCar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={filters.vehicleType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-xs sm:text-sm transition-colors"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Min Seating */}
                <div>
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1 flex items-center">
                    <FiUsers className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    Minimum Seats
                  </label>
                  <select
                    name="minSeating"
                    value={filters.minSeating}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-xs sm:text-sm transition-colors"
                  >
                    <option value="0">Any</option>
                    {[4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}+ Seats</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-[10px] xs:text-xs font-semibold text-gray-600 mb-1.5 ml-1 flex items-center">
                    <FiFilter className="w-3.5 h-3.5 mr-1 text-green-600" />
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-xs sm:text-sm transition-colors"
                  >
                    <option value="price">Price (Low to High)</option>
                    <option value="seating">Seating Capacity</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Available SUVs
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {filteredCars.length} vehicle{filteredCars.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Cars List */}
        {filteredCars.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No cars available</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={() => {
                setFilters({
                  vehicleType: 'all',
                  minSeating: 0,
                  maxRate: 1000,
                  sortBy: 'price'
                });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-95 text-sm sm:text-base"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredCars.map(car => {
              const fare = calculateFare(car);
              
              return (
                <div
                  key={car._id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Car Image */}
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {car.primaryImage ? (
                      <img
                        src={car.primaryImage}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaCar className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white px-2.5 sm:px-3 py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-semibold text-blue-600 shadow-md">
                      {car.vehicleType}
                    </div>
                    {car.verified && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white px-2 sm:px-2.5 py-1 rounded-full text-[10px] xs:text-xs font-semibold flex items-center shadow-md">
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Car Info */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 truncate">
                      {car.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 truncate">
                      {car.brand} {car.model} • {car.year}
                    </p>

                    {/* Features */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center bg-blue-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg flex-1">
                        <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{car.seatingCapacity} Seats</span>
                      </div>
                      <div className="flex items-center bg-purple-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg flex-1">
                        <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-purple-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">₹{car.ratePerKm}/km</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    {fare && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-green-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] xs:text-xs text-gray-600 mb-0.5">Estimated Fare</p>
                            <p className="text-xl sm:text-2xl font-bold text-green-600">
                              ₹{fare.totalAmount.toFixed(0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] xs:text-xs text-gray-600 mb-0.5">Advance (25%)</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900">
                              ₹{fare.advanceAmount.toFixed(0)}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] xs:text-xs text-gray-600 flex items-center">
                          <FiNavigation className="w-3 h-3 mr-1" />
                          For {fare.distance.toFixed(1)} km journey
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleViewDetails(car)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95 text-xs sm:text-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleBookNow(car)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 text-xs sm:text-sm flex items-center justify-center"
                      >
                        Book Now
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCars;