import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome,
  FiCalendar,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import SUVBookingChatbot from '../components/common/SUVBookingChatbot';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Check if current route is a full-screen route (like live tracking)
  const isFullScreenRoute = location.pathname.includes('/track-live');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownOpen && !e.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/browse-cars', icon: FaCar, label: 'Browse SUVs' },
    { path: '/my-bookings', icon: FiCalendar, label: 'My Bookings' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  // If it's a full-screen route, render without layout
  if (isFullScreenRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex flex-col">
      {/* Top Navigation Bar - Ultra Modern Design with Glassmorphism */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Enhanced with Gradient */}
            <div 
              className="flex items-center space-x-3 cursor-pointer flex-shrink-0 group" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6">
                  <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform">🚗</span>
                </div>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  SUV Booking
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 leading-tight">Premium Rides</p>
              </div>
            </div>

            {/* Desktop Navigation - Modern Pill Design */}
            <div className="hidden lg:flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1.5 gap-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative flex items-center space-x-2.5 px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-lg shadow-blue-200/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl"></div>
                      )}
                      <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-600' : ''}`} />
                      <span className="text-sm relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* User Profile - Desktop Enhanced */}
            <div className="hidden lg:block relative profile-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="flex items-center space-x-3 focus:outline-none hover:bg-gray-100/50 rounded-2xl px-4 py-2.5 transition-all group border-2 border-transparent hover:border-gray-200"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <span className="text-white font-black text-base">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-bold text-gray-900 max-w-[120px] truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 max-w-[120px] truncate">
                    {user?.email}
                  </p>
                </div>
                <FiChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu - Enhanced */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl py-3 z-20 border border-gray-200/50 animate-fadeIn">
                  {/* User Info Header */}
                  <div className="px-5 py-4 bg-gradient-to-br from-blue-50 to-purple-50 mx-3 rounded-2xl mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs font-medium text-gray-600 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="px-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 rounded-xl flex items-center space-x-3 transition-all group"
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/my-bookings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-purple-50 rounded-xl flex items-center space-x-3 transition-all group"
                    >
                      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiCalendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <span>My Bookings</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-200 my-2 mx-3"></div>

                  {/* Logout Button */}
                  <div className="px-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-3 transition-all group"
                    >
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100/80 transition-all active:scale-95 border-2 border-transparent hover:border-gray-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu - Enhanced Design */}
      {mobileMenuOpen && (
        <>
          {/* Overlay with Blur */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fadeIn backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar - Ultra Modern */}
          <div className="fixed top-0 right-0 h-full w-[300px] sm:w-[340px] bg-white/95 backdrop-blur-2xl z-50 shadow-2xl lg:hidden animate-slideInRight">
            <div className="flex flex-col h-full">
              {/* Header - Gradient */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"></div>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl"></div>
                </div>
                <div className="relative flex items-center justify-between p-5">
                  <h2 className="text-xl font-black text-white">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-white/90 hover:bg-white/20 transition-all active:scale-95"
                    aria-label="Close menu"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* User Info - Modern Card */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-md opacity-50"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-white font-black text-2xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items - Enhanced Spacing */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-200/50'
                          : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isActive ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className="text-base">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Logout Button - Enhanced */}
              <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-red-50/30">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-4 px-5 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold border-2 border-red-200 hover:border-red-300 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <FiLogOut className="w-5 h-5" />
                  </div>
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile Only - Ultra Modern Floating Design */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-2">
            <div className="grid grid-cols-4 gap-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative flex flex-col items-center justify-center py-3 rounded-2xl transition-all active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50'
                        : 'hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                      )}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1 transition-all ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg scale-110' 
                          : 'bg-gray-100'
                      }`}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className={`text-[10px] font-bold ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                          : 'text-gray-600'
                      }`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SUVBookingChatbot />

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserLayout;