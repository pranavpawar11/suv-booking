import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const UserLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'customer') {
        navigate('/');
      } else {
        setErrors({ general: 'Please use admin login for admin access' });
      }
    } else {
      setErrors({ general: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🚗</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">SUV Booking</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Premium ride service</p>
              </div>
            </div>
            <Link
              to="/register"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-2xl">
              <span className="text-3xl sm:text-4xl">🚗</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Sign in to continue your journey
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                    <span className="mr-2">⚠️</span>
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className={`relative ${focusedField === 'email' ? 'scale-[1.01]' : ''} transition-transform duration-200`}>
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiMail className={`w-5 h-5 transition-colors ${
                        focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.email
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'email'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className={`relative ${focusedField === 'password' ? 'scale-[1.01]' : ''} transition-transform duration-200`}>
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiLock className={`w-5 h-5 transition-colors ${
                        focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.password
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'password'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-purple-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                >
                  {loading ? (
                    <>
                      <Loader size="sm" color="white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to SUV Booking?</span>
                </div>
              </div>

              {/* Register Link */}
              <Link
                to="/register"
                className="w-full block text-center border-2 border-blue-600 text-blue-600 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Admin Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Are you an admin?{' '}
              <Link
                to="/admin/login"
                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;