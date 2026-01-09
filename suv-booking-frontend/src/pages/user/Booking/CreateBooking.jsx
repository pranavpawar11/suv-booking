import React, { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMapPin, 
  FiCalendar, 
  FiUsers, 
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiTruck,
  FiDollarSign,
  FiFileText
} from 'react-icons/fi';
import bookingService from '../../../api/services/bookingService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State hooks MUST be first
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Confirm
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    pickupTime: '',
    notes: ''
  });

  // Get data from BrowseCars page
  const { car, searchData, routeInfo, fare } = location.state || {};

  // Navigation is a side-effect → useEffect
  useEffect(() => {
    if (!car || !searchData || !routeInfo) {
      navigate('/browse-cars', { replace: true });
    }
  }, [car, searchData, routeInfo, navigate]);

  // Safe early return AFTER hooks
  if (!car || !searchData || !routeInfo) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBooking = async () => {
    if (!bookingData.pickupTime) {
      toast.error('Please select pickup time');
      return;
    }

    try {
      setLoading(true);

      // Combine date and time
      const scheduledPickupTime = new Date(`${searchData.date}T${bookingData.pickupTime}`).toISOString();

      // Create booking
      const bookingPayload = {
        carId: car._id,
        pickupAddress: searchData.pickup.address,
        dropAddress: searchData.drop.address,
        scheduledPickupTime,
        passengers: parseInt(searchData.passengers),
        notes: bookingData.notes
      };

      const bookingResponse = await bookingService.createBooking(bookingPayload);
      
      if (bookingResponse.success) {
        const booking = bookingResponse.data.booking;
        toast.success('Booking created successfully!');

        // Navigate to payment page instead of opening Razorpay directly
        navigate('/payment', {
          state: {
            booking,
            paymentType: 'advance'
          }
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Review Details', icon: FiFileText },
    { number: 2, title: 'Confirm Booking', icon: FiCheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Cars</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">Review your booking details and proceed to payment</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  } transition-colors duration-300`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <p className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  } transition-colors duration-300`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Review Details */}
            {currentStep === 1 && (
              <>
                {/* Journey Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-2 text-blue-600" />
                    Journey Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm text-gray-500">Pickup Location</p>
                        <p className="text-lg font-semibold text-gray-900">{searchData.pickup.address}</p>
                      </div>
                    </div>
                    <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-8"></div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm text-gray-500">Drop Location</p>
                        <p className="text-lg font-semibold text-gray-900">{searchData.drop.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Distance</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {routeInfo.route.distance.toFixed(1)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ~{routeInfo.route.duration} mins
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(searchData.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Passengers</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {searchData.passengers}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Car */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiTruck className="mr-2 text-blue-600" />
                    Selected Vehicle
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {car.primaryImage ? (
                        <img src={car.primaryImage} alt={car.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiTruck className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">{car.name}</h4>
                      <p className="text-sm text-gray-600">{car.brand} {car.model}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FiUsers className="w-4 h-4 mr-1" />
                          {car.seatingCapacity} Seats
                        </span>
                        <span>•</span>
                        <span>{car.vehicleType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Time *
                      </label>
                      <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          name="pickupTime"
                          value={bookingData.pickupTime}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={bookingData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special requests or instructions..."
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!bookingData.pickupTime) {
                      toast.error('Please select pickup time');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 group"
                >
                  <span>Continue to Confirm</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* Step 2: Confirm */}
            {currentStep === 2 && (
              <>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiCheckCircle className="mr-2 text-green-600" />
                    Confirm Your Booking
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-green-800">
                      Please review all details carefully before proceeding to payment.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Route</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {searchData.pickup.address?.split(',')[0] || 'Pickup'} → {searchData.drop.address?.split(',')[0] || 'Drop'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Date & Time</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(searchData.date).toLocaleDateString('en-IN')} • {bookingData.pickupTime}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-semibold text-gray-900">{car.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Passengers</span>
                      <span className="font-semibold text-gray-900">{searchData.passengers}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Distance</span>
                      <span className="font-semibold text-gray-900">
                        {routeInfo.route.distance.toFixed(1)} km
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader size="sm" color="white" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <FiArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Fare Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fare Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-semibold text-gray-900">₹{fare.baseAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance ({routeInfo.route.distance.toFixed(1)} km × ₹{car.ratePerKm})</span>
                  <span className="font-semibold text-gray-900">₹{fare.distanceAmount.toFixed(0)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Fare</span>
                  <span className="text-xl font-bold text-gray-900">₹{fare.totalAmount.toFixed(0)}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-600 mb-2">Pay Now (25% Advance)</p>
                <p className="text-2xl font-bold text-blue-600">₹{fare.advanceAmount.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Remaining ₹{(fare.totalAmount - fare.advanceAmount).toFixed(0)} after trip completion
                </p>
              </div>

              <div className="border-t pt-4">
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Verified driver assigned</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time GPS tracking</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
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

export default CreateBooking;