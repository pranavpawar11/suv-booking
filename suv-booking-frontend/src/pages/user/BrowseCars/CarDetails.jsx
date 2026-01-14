import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiUsers,
  FiPackage,
  FiShield,
  FiStar,
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiArrowRight,
  FiNavigation,
  FiPhone,
  FiMail,
  FiAward
} from 'react-icons/fi';
import { FaCar} from 'react-icons/fa';
import carService from '../../../api/services/carService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const CarDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const {
    searchData = null,
    routeInfo = null,
    fare = null,
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await carService.getCarById(id);
      if (response.success) {
        setCar(response.data.car);
      }
    } catch (error) {
      console.error('Error fetching car:', error);
      toast.error('Failed to fetch car details');
      navigate('/browse-cars');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!searchData || !routeInfo) {
      navigate('/browse-cars');
      return;
    }

    navigate('/create-booking', {
      state: {
        car,
        searchData,
        routeInfo,
        fare
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  const images = [car.primaryImage, ...(car.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors active:scale-95"
        >
          <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="font-medium text-sm sm:text-base">Back to Cars</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
              {/* Main Image */}
              <div className="relative h-56 xs:h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaCar className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm shadow-lg">
                  {car.vehicleType}
                </div>
                {car.verified && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-green-500 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center shadow-lg">
                    <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-blue-600 scale-105 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${car.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                    {car.name}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                    {car.brand} {car.model} • {car.year}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Reg: {car.registrationNumber}
                  </p>
                </div>
                {car.driver?.rating && (
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg ml-2 flex-shrink-0">
                    <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900 text-sm sm:text-base">4.8</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-blue-200">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{car.seatingCapacity}</p>
                  <p className="text-[10px] xs:text-xs text-gray-600">Seats</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-green-200">
                  <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{car.luggageCapacity || 3}</p>
                  <p className="text-[10px] xs:text-xs text-gray-600">Luggage</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-purple-200">
                  <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{car.ratePerKm}</p>
                  <p className="text-[10px] xs:text-xs text-gray-600">Per KM</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-orange-200">
                  <FaCar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{car.fuelType || 'Diesel'}</p>
                  <p className="text-[10px] xs:text-xs text-gray-600">Fuel Type</p>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                    <FaCar className="w-5 h-5 mr-2 text-blue-600" />
                    About this Vehicle
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{car.description}</p>
                </div>
              )}

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <FiCheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Features & Amenities
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {car.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5 sm:p-3 hover:bg-gray-100 transition-colors"
                      >
                        <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Documents */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <FiShield className="w-5 h-5 mr-2 text-green-600" />
                Vehicle Safety & Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {car.insurance && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                        <FiShield className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Insurance</p>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      Valid till {new Date(car.insurance.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {car.puc && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                        <FiCheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">PUC Certificate</p>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      Valid till {new Date(car.puc.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {car.fitness && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                        <FiAward className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Fitness Certificate</p>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      Valid till {new Date(car.fitness.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Info */}
            {car.driver && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <FiUsers className="w-5 h-5 mr-2 text-blue-600" />
                  Driver Information
                </h3>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-xl sm:text-2xl font-bold">
                      {car.driver.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{car.driver.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {car.driver.totalTrips || 0} trips completed
                    </p>
                    {car.driver.rating && (
                      <div className="flex items-center mt-1">
                        <FiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          4.8 rating
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 lg:sticky lg:top-20">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Booking Details</h3>

              {fare && routeInfo ? (
                <>
                  {/* Journey Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 mb-4 border border-blue-200">
                    <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                        <FiNavigation className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] xs:text-xs text-gray-500">Distance</p>
                        <p className="font-bold text-gray-900">{routeInfo.route.distance.toFixed(1)} km</p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-700">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                        <FiClock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] xs:text-xs text-gray-500">Duration</p>
                        <p className="font-bold text-gray-900">~{routeInfo.route.duration} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Base Fare</span>
                      <span className="font-semibold text-gray-900">₹{fare.baseAmount.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Distance ({routeInfo.route.distance.toFixed(1)} km)</span>
                      <span className="font-semibold text-gray-900">₹{fare.distanceAmount.toFixed(0)}</span>
                    </div>
                    <div className="border-t pt-2 sm:pt-3 flex justify-between">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">Total Fare</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{fare.totalAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-green-200">
                    <p className="text-[10px] xs:text-xs text-gray-600 mb-1">Pay Now (25% Advance)</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">₹{fare.advanceAmount.toFixed(0)}</p>
                    <p className="text-[10px] xs:text-xs text-gray-600 mt-2">
                      Remaining ₹{(fare.totalAmount - fare.advanceAmount).toFixed(0)} after trip
                    </p>
                  </div>

                  <button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Book Now</span>
                    <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                      Please search from Browse Cars page with pickup and drop locations to see pricing.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/browse-cars')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-shadow active:scale-95"
                  >
                    Go to Browse Cars
                  </button>
                </>
              )}

              {/* Benefits */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Why book with us?</p>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Verified & experienced driver</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time GPS tracking</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Flexible cancellation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;