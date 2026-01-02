import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
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
  FiCheckCircle
} from 'react-icons/fi';
import Loader from '../../../components/common/Loader';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Quick booking state
  const [quickBooking, setQuickBooking] = useState({
    pickup: '',
    drop: '',
    date: '',
  });

  const features = [
    {
      icon: FiTruck,
      title: 'Wide Range of SUVs',
      description: 'Choose from luxury to budget-friendly options',
      color: 'blue'
    },
    {
      icon: FiShield,
      title: 'Verified Drivers',
      description: 'All drivers are background checked',
      color: 'green'
    },
    {
      icon: FiClock,
      title: 'Real-time Tracking',
      description: 'Track your ride in real-time',
      color: 'purple'
    },
    {
      icon: FiCheckCircle,
      title: 'Secure Payments',
      description: 'Safe and encrypted transactions',
      color: 'orange'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: FiUsers },
    { label: 'SUVs Available', value: '500+', icon: FiTruck },
    { label: 'Average Rating', value: '4.8', icon: FiStar },
    { label: 'Cities Covered', value: '50+', icon: FiMapPin }
  ];

  const popularRoutes = [
    { from: 'Mumbai', to: 'Pune', price: '₹2,500', duration: '3 hrs' },
    { from: 'Delhi', to: 'Agra', price: '₹3,000', duration: '4 hrs' },
    { from: 'Bangalore', to: 'Mysore', price: '₹2,200', duration: '2.5 hrs' },
    { from: 'Chennai', to: 'Pondicherry', price: '₹1,800', duration: '2 hrs' }
  ];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickBooking.pickup && quickBooking.drop) {
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* Welcome Text */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Book your premium SUV ride in just a few clicks
            </p>
          </div>

          {/* Quick Booking Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiSearch className="mr-3 text-blue-600" />
                Quick Booking
              </h3>

              <form onSubmit={handleQuickSearch} className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={quickBooking.pickup}
                      onChange={(e) => setQuickBooking({ ...quickBooking, pickup: e.target.value })}
                      placeholder="Enter pickup location"
                      className="w-full pl-10 pr-4 py-3 border-2 text-black border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Drop Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Drop Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={quickBooking.drop}
                      onChange={(e) => setQuickBooking({ ...quickBooking, drop: e.target.value })}
                      placeholder="Enter drop location"
                      className="w-full pl-10 pr-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={quickBooking.date}
                      onChange={(e) => setQuickBooking({ ...quickBooking, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Search Button - Full Width on Mobile */}
                <div className="sm:col-span-3 mt-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <FiSearch className="w-5 h-5" />
                    <span>Search Available SUVs</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>

              {/* Or Browse All */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/browse-cars')}
                  className="text-blue-600 hover:text-purple-600 font-medium text-sm transition-colors"
                >
                  or browse all available SUVs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience premium SUV booking with unmatched service quality
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Popular Routes
            </h2>
            <p className="text-lg text-gray-600">
              Check out our most booked destinations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/browse-cars', { 
                  state: { pickup: route.from, drop: route.to } 
                })}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900 mb-1">{route.from}</p>
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <div className="w-8 border-t-2 border-dashed"></div>
                      <FiArrowRight className="mx-1" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{route.to}</p>
                  </div>
                  <FiMapPin className="w-10 h-10 text-blue-600 group-hover:text-purple-600 transition-colors" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Starting from</p>
                    <p className="text-xl font-bold text-blue-600">{route.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{route.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Book Your SUV?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust us for their travel needs
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/browse-cars')}
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse All SUVs
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all shadow-lg"
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