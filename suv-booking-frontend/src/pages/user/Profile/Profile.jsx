import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiLock,
  FiEdit2,
  FiSave,
  FiX,
  FiCalendar,
  FiShield,
  FiCheckCircle
} from 'react-icons/fi';
import authService from '../../../api/services/authService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!profileData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(profileData.phone)) {
      newErrors.phone = 'Enter valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfile()) return;

    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setLoading(true);
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setChangingPassword(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setErrors({});
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 text-center h-fit">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <span className="text-white text-2xl sm:text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate px-2">{user?.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 truncate px-2">{user?.email}</p>
            
            <div className="space-y-2 text-xs sm:text-sm bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-center text-gray-600">
                <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span>
                  Joined {new Date(user?.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {user?.lastLogin && (
                <div className="flex items-center justify-center text-gray-600">
                  <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    Last: {new Date(user.lastLogin).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="hidden xs:inline">Personal Information</span>
                  <span className="xs:hidden">Profile Info</span>
                </h3>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-1.5 sm:space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm active:scale-95 transition-transform"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm active:scale-95"
                    >
                      <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Cancel</span>
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm active:scale-95"
                    >
                      {loading ? (
                        <Loader size="sm" color="white" />
                      ) : (
                        <FiSave className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-colors text-sm sm:text-base ${
                        editMode 
                          ? 'border-gray-200 focus:border-blue-500 bg-white' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } ${errors.name ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl bg-gray-50 cursor-not-allowed text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-[10px] xs:text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      maxLength="10"
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-colors text-sm sm:text-base ${
                        editMode 
                          ? 'border-gray-200 focus:border-blue-500 bg-white' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } ${errors.phone ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Address (Optional)
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      rows="3"
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                        editMode 
                          ? 'border-gray-200 focus:border-blue-500 bg-white' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                    <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <span className="hidden xs:inline">Security</span>
                  <span className="xs:hidden">Password</span>
                </h3>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="flex items-center space-x-1.5 sm:space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm active:scale-95 transition-transform"
                  >
                    <FiLock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {changingPassword ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base ${
                          errors.currentPassword ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base ${
                          errors.newPassword ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setErrors({});
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                    >
                      {loading ? (
                        <>
                          <Loader size="sm" color="white" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-700 flex items-start">
                    <FiShield className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Keep your account secure by using a strong password</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;