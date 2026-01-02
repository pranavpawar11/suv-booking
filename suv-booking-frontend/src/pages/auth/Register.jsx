import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must not exceed 50 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return 'Enter valid 10-digit phone starting with 6-9';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Prepare data (exclude confirmPassword)
    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ general: result.error });
    }
  };

  const features = [
    'Wide range of SUVs',
    'Verified drivers',
    'Real-time tracking',
    'Secure payments'
  ];

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
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="max-w-md mx-auto">
          {/* Welcome Section - Mobile Optimized */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl mb-4 shadow-lg">
              <FiUser className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Join us for seamless SUV booking experience
            </p>
          </div>

          {/* Features Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center space-x-2 hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* General Error */}
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className={`relative ${focusedField === 'name' ? 'scale-[1.01]' : ''} transition-transform duration-200`}>
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiUser className={`w-5 h-5 transition-colors ${
                        focusedField === 'name' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={handleBlur}
                      placeholder="Enter your full name"
                      className={`w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.name
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'name'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
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
                      onBlur={handleBlur}
                      placeholder="your.email@example.com"
                      className={`w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.email
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'email'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className={`relative ${focusedField === 'phone' ? 'scale-[1.01]' : ''} transition-transform duration-200`}>
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiPhone className={`w-5 h-5 transition-colors ${
                        focusedField === 'phone' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={handleBlur}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      className={`w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.phone
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'phone'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password Field */}
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
                      onBlur={handleBlur}
                      placeholder="Create a strong password"
                      className={`w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.password
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'password'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
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
                    <p className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className={`relative ${focusedField === 'confirmPassword' ? 'scale-[1.01]' : ''} transition-transform duration-200`}>
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiLock className={`w-5 h-5 transition-colors ${
                        focusedField === 'confirmPassword' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={handleBlur}
                      placeholder="Re-enter your password"
                      className={`w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        errors.confirmPassword
                          ? 'border-red-300 bg-red-50'
                          : focusedField === 'confirmPassword'
                          ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                >
                  {loading ? (
                    <>
                      <Loader size="sm" color="white" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-purple-600 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-500 px-4">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;