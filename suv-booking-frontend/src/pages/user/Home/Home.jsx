import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import LocationInput from '../../../components/common/LocationInput';
import { 
  FiSearch, 
  FiMapPin, 
  FiCalendar, 
  FiTruck, 
  FiShield, 
  FiClock,
  FiUsers,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiAward,
  FiZap
} from 'react-icons/fi';
import Loader from '../../../components/common/Loader';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Quick booking state
  const [quickBooking, setQuickBooking] = useState({
    pickup: { address: '', lat: null, lng: null },
    drop: { address: '', lat: null, lng: null },
    date: '',
  });

  const [errors, setErrors] = useState({});

  const features = [
    {
      icon: FiTruck,
      title: 'Wide Range of SUVs',
      description: 'Choose from luxury to budget-friendly options',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: FiShield,
      title: 'Verified Drivers',
      description: 'All drivers are background checked',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: FiClock,
      title: 'Real-time Tracking',
      description: 'Track your ride in real-time',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: FiCheckCircle,
      title: 'Secure Payments',
      description: 'Safe and encrypted transactions',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: FiUsers, color: 'blue' },
    { label: 'SUVs Available', value: '500+', icon: FiTruck, color: 'purple' },
    { label: 'Average Rating', value: '4.8', icon: FiStar, color: 'yellow' },
    { label: 'Cities Covered', value: '50+', icon: FiMapPin, color: 'green' }
  ];

  const popularRoutes = [
    { 
      from: 'Mumbai', 
      fromFull: 'Mumbai, Maharashtra, India',
      to: 'Pune',
      toFull: 'Pune, Maharashtra, India', 
      price: '2,500', 
      duration: '3 hrs' 
    },
    { 
      from: 'Delhi', 
      fromFull: 'Delhi, India',
      to: 'Agra',
      toFull: 'Agra, Uttar Pradesh, India', 
      price: '3,000', 
      duration: '4 hrs' 
    },
    { 
      from: 'Bangalore', 
      fromFull: 'Bangalore, Karnataka, India',
      to: 'Mysore',
      toFull: 'Mysore, Karnataka, India', 
      price: '2,200', 
      duration: '2.5 hrs' 
    },
    { 
      from: 'Chennai', 
      fromFull: 'Chennai, Tamil Nadu, India',
      to: 'Pondicherry',
      toFull: 'Pondicherry, India', 
      price: '1,800', 
      duration: '2 hrs' 
    }
  ];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    
    // Validate locations
    const newErrors = {};
    if (!quickBooking.pickup.address) {
      newErrors.pickup = 'Please select pickup location';
    }
    if (!quickBooking.drop.address) {
      newErrors.drop = 'Please select drop location';
    }
    if (!quickBooking.date) {
      newErrors.date = 'Please select date';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigate('/browse-cars', { state: quickBooking });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
          {/* Welcome Text */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Book your premium SUV ride in just a few clicks
            </p>
          </div>

          {/* Quick Booking Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                Quick Booking
              </h3>

              <form onSubmit={handleQuickSearch} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 ml-1">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4 pointer-events-none z-10" />
                      <LocationInput
                        value={quickBooking.pickup.address}
                        onChange={(location) => {
                          setQuickBooking(prev => ({ ...prev, pickup: location }));
                          if (errors.pickup) setErrors(prev => ({ ...prev, pickup: '' }));
                        }}
                        placeholder="Enter pickup location"
                        error={errors.pickup}
                        className="pl-10"
                      />
                    </div>
                    {errors.pickup && (
                      <p className="text-[10px] xs:text-xs text-red-600 mt-1 ml-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.pickup}
                      </p>
                    )}
                  </div>

                  {/* Drop Location */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 ml-1">
                      Drop Location
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 pointer-events-none z-10" />
                      <LocationInput
                        value={quickBooking.drop.address}
                        onChange={(location) => {
                          setQuickBooking(prev => ({ ...prev, drop: location }));
                          if (errors.drop) setErrors(prev => ({ ...prev, drop: '' }));
                        }}
                        placeholder="Enter drop location"
                        error={errors.drop}
                        className="pl-10"
                      />
                    </div>
                    {errors.drop && (
                      <p className="text-[10px] xs:text-xs text-red-600 mt-1 ml-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.drop}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 ml-1">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="date"
                        value={quickBooking.date}
                        onChange={(e) => {
                          setQuickBooking(prev => ({ ...prev, date: e.target.value }));
                          if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border-2 text-black rounded-lg sm:rounded-xl focus:outline-none transition-colors text-xs sm:text-sm ${
                          errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-[10px] xs:text-xs text-red-600 mt-1 ml-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2 group"
                >
                  <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Search Available SUVs</span>
                  <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Or Browse All */}
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={() => navigate('/browse-cars')}
                  className="text-blue-600 hover:text-purple-600 font-medium text-xs sm:text-sm transition-colors"
                >
                  or browse all available SUVs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 -mt-6 sm:-mt-8 lg:-mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 lg:p-6 group cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Why Choose Us?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Experience premium SUV booking with unmatched service quality
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Popular Routes
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Check out our most booked destinations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                onClick={() => navigate('/browse-cars', { 
                  state: { 
                    pickup: { address: route.fromFull, lat: null, lng: null }, 
                    drop: { address: route.toFull, lat: null, lng: null },
                    date: ''
                  } 
                })}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">
                        {route.from}
                      </p>
                    </div>
                    <div className="flex items-center ml-4 my-1">
                      <div className="flex-1 border-t-2 border-dashed border-gray-300 mr-2"></div>
                      <FiArrowRight className="text-gray-400 w-4 h-4 flex-shrink-0" />
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">
                        {route.to}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Starting from</p>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600">₹{route.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Duration</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">{route.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-2xl">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">
            Ready to Book Your SUV?
          </h2>
          <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust us for their travel needs
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/browse-cars')}
              className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-100 transition-all shadow-lg active:scale-95"
            >
              Browse All SUVs
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-blue-600 transition-all shadow-lg active:scale-95"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;