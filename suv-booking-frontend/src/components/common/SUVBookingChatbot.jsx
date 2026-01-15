import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiUsers, FiChevronRight, FiNavigation, FiClock, FiCalendar, FiDollarSign, FiPhone, FiMapPin, FiInfo, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { FaCar, FaRobot } from 'react-icons/fa';
import LocationInput from '../common/LocationInput';

const SUVBookingChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationState, setConversationState] = useState({
    stage: 'greeting',
    intent: null, // 'booking' or 'estimate'
    pickup: { address: '', lat: null, lng: null },
    drop: { address: '', lat: null, lng: null },
    date: '',
    passengers: 1,
    selectedCar: null,
    availableCars: [],
    routeInfo: null
  });
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "👋 Hello! I'm your AI booking assistant.\n\n" +
        "I can help you with:\n" +
        "🚗 Book an SUV for your trip\n" +
        "💰 Get instant fare estimates\n" +
        "🚙 Browse available vehicles\n" +
        "📋 Check your bookings\n" +
        "📞 Contact support\n\n" +
        "What would you like to do today?",
        [
          { text: '🚗 Book SUV', action: 'start_booking' },
          { text: '💰 Fare Estimate', action: 'fare_estimate' },
          { text: '🚙 Browse Cars', action: 'browse_cars' },
          { text: '📋 My Bookings', action: 'view_bookings' }
        ]
      );
    }
  }, [isOpen]);

  const addBotMessage = (text, quickReplies = null, specialType = null) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      quickReplies,
      specialType
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const addCarCard = (car, fare, isEstimate = false) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'car_card',
      car,
      fare,
      isEstimate,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const addRouteCard = (routeInfo) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'route_card',
      routeInfo,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const addFareSummary = (summaryData) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'fare_summary',
      ...summaryData,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAvailableCars = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/cars/available', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      return data.success ? data.data.cars : [];
    } catch (error) {
      console.error('Error fetching cars:', error);
      return [];
    }
  };

  // Use backend route calculation which includes fare estimation per car
  const calculateRouteWithFares = async (pickupAddr, dropAddr) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/geo/fare-estimation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          pickupAddress: pickupAddr,
          dropAddress: dropAddr
        })
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    }
  };

  const handleQuickReply = async (action, text) => {
    if (text) addUserMessage(text);
    setIsTyping(true);
    await delay(600);
    setIsTyping(false);

    switch (action) {
      case 'start_booking':
        setConversationState(prev => ({ ...prev, stage: 'collecting_pickup', intent: 'booking' }));
        addBotMessage(
          "Great! Let's book an SUV for you. 🚗\n\n📍 Where should we pick you up?",
          null,
          'pickup_input'
        );
        break;
      
      case 'fare_estimate':
        setConversationState(prev => ({ ...prev, stage: 'collecting_pickup', intent: 'estimate' }));
        addBotMessage(
          "I'll help you get a fare estimate! 💰\n\n📍 What's your pickup location?",
          null,
          'pickup_input'
        );
        break;
      
      case 'browse_cars':
        navigate('/browse-cars');
        setIsOpen(false);
        break;
      
      case 'view_bookings':
        navigate('/my-bookings');
        setIsOpen(false);
        break;
      
      case 'contact_support':
        setIsTyping(true);
        await delay(600);
        setIsTyping(false);
        addBotMessage(
          "📞 Need help? Our support team is here!\n\n" +
          "📱 Phone: +91 98765 43210\n" +
          "📧 Email: support@suvbooking.com\n" +
          "🕐 Available: 24/7\n\n" +
          "What else can I help you with?",
          [
            { text: '🚗 Book SUV', action: 'start_booking' },
            { text: '💰 Get Estimate', action: 'fare_estimate' },
            { text: '🚙 Browse Cars', action: 'browse_cars' },
            { text: '📋 My Bookings', action: 'view_bookings' }
          ]
        );
        break;
      
      case 'view_all_cars':
        navigate('/browse-cars', {
          state: {
            pickup: conversationState.pickup,
            drop: conversationState.drop,
            date: conversationState.date,
            passengers: conversationState.passengers
          }
        });
        setIsOpen(false);
        break;
      
      case 'show_cars_again':
        await showAvailableCars();
        break;
      
      case 'start_fresh':
        setConversationState({
          stage: 'greeting',
          intent: null,
          pickup: { address: '', lat: null, lng: null },
          drop: { address: '', lat: null, lng: null },
          date: '',
          passengers: 1,
          selectedCar: null,
          availableCars: [],
          routeInfo: null
        });
        setMessages([]);
        setIsTyping(true);
        await delay(500);
        setIsTyping(false);
        addBotMessage(
          "Let's start fresh! 🔄\n\nWhat would you like to do?",
          [
            { text: '🚗 Book SUV', action: 'start_booking' },
            { text: '💰 Fare Estimate', action: 'fare_estimate' },
            { text: '🚙 Browse Cars', action: 'browse_cars' },
            { text: '📋 My Bookings', action: 'view_bookings' }
          ]
        );
        break;
      
      default:
        break;
    }
  };

  const handlePickupSelected = async (location) => {
    addUserMessage(location.address.split(',').slice(0, 2).join(','));
    setConversationState(prev => ({
      ...prev,
      pickup: location,
      stage: 'collecting_drop'
    }));
    setIsTyping(true);
    await delay(800);
    setIsTyping(false);
    addBotMessage(
      `✅ Pickup: ${location.address.split(',')[0]}\n\n📍 Where would you like to go?`,
      null,
      'drop_input'
    );
  };

  const handleDropSelected = async (location) => {
    addUserMessage(location.address.split(',').slice(0, 2).join(','));
    
    // Update state first
    setConversationState(prev => ({
      ...prev,
      drop: location,
      stage: conversationState.intent === 'estimate' ? 'showing_estimate' : 'collecting_date'
    }));
    
    setIsTyping(true);
    await delay(800);
    setIsTyping(false);

    if (conversationState.intent === 'estimate') {
      addBotMessage("Calculating fare estimates for available vehicles... 🔍");
      // Pass location directly instead of using state
      await showFareEstimate(location);
    } else {
      addBotMessage(
        `✅ Drop: ${location.address.split(',')[0]}\n\n📅 When would you like to travel?`,
        null,
        'date_input'
      );
    }
  };

  const handleDateSelected = async (dateValue) => {
    const dateObj = new Date(dateValue);
    addUserMessage(dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
    setConversationState(prev => ({
      ...prev,
      date: dateValue,
      stage: 'collecting_passengers'
    }));
    setIsTyping(true);
    await delay(800);
    setIsTyping(false);
    addBotMessage(
      `✅ Date set!\n\n👥 How many passengers will be traveling?`,
      null,
      'passenger_input'
    );
  };

  const handlePassengersSelected = async (passengerCount) => {
    addUserMessage(`${passengerCount} passenger${passengerCount > 1 ? 's' : ''}`);
    setConversationState(prev => ({
      ...prev,
      passengers: parseInt(passengerCount),
      stage: 'showing_cars'
    }));
    setIsTyping(true);
    await delay(1000);
    setIsTyping(false);
    addBotMessage("Perfect! Finding available SUVs with fare details... 🔍");
    await showAvailableCars();
  };

  const showFareEstimate = async (dropLocation = null) => {
    // Use passed location or fall back to state
    const pickup = conversationState.pickup;
    const drop = dropLocation || conversationState.drop;
    
    setIsTyping(true);
    await delay(1500);
    
    // Use fare-estimation endpoint which calculates fares for all cars
    const fareData = await calculateRouteWithFares(pickup.address, drop.address);
    
    if (fareData && fareData.fareEstimations && fareData.fareEstimations.length > 0) {
      setConversationState(prev => ({ 
        ...prev, 
        drop: drop, // Update drop location in state
        routeInfo: {
          pickup: fareData.pickup,
          drop: fareData.drop,
          route: fareData.route
        }
      }));
      setIsTyping(false);
      
      addRouteCard({
        pickup: fareData.pickup,
        drop: fareData.drop,
        route: fareData.route
      });
      
      // Show fare summary
      const allFares = fareData.fareEstimations.map(item => item.pricing.totalAmount);
      const minFare = Math.min(...allFares);
      const maxFare = Math.max(...allFares);
      const avgFare = allFares.reduce((a, b) => a + b, 0) / allFares.length;
      
      addFareSummary({
        minFare,
        maxFare,
        avgFare,
        count: fareData.fareEstimations.length
      });
      
      addBotMessage("💡 Here are fare estimates for available vehicles:");
      
      // Show only first 2 cars for estimate
      fareData.fareEstimations.slice(0, 5).forEach(item => {
        addCarCard(item.car, item.pricing, true);
      });
      
      addBotMessage(
        `Showing 5 of ${fareData.fareEstimations.length} available vehicles.`,
        [
          { text: '🚗 Book Now', action: 'start_booking' },
          { text: `🔍 View All ${fareData.fareEstimations.length} Cars`, action: 'view_all_cars' },
          { text: '🔄 New Estimate', action: 'start_fresh' }
        ]
      );
    } else {
      setIsTyping(false);
      addBotMessage(
        "Couldn't calculate fare estimates. Please try again.",
        [
          { text: '🔄 Retry', action: 'fare_estimate' },
          { text: '🚙 Browse Cars', action: 'browse_cars' }
        ]
      );
    }
  };

  const showAvailableCars = async () => {
    const { passengers, pickup, drop } = conversationState;
    
    setIsTyping(true);
    await delay(1500);
    
    // Use fare-estimation endpoint for accurate fares
    const fareData = await calculateRouteWithFares(pickup.address, drop.address);
    
    if (fareData && fareData.fareEstimations && fareData.fareEstimations.length > 0) {
      setConversationState(prev => ({ 
        ...prev, 
        routeInfo: {
          pickup: fareData.pickup,
          drop: fareData.drop,
          route: fareData.route
        }
      }));
      
      // Filter by passenger capacity
      const suitableCars = fareData.fareEstimations.filter(
        item => item.car.seatingCapacity >= passengers
      );
      
      if (suitableCars.length > 0) {
        setConversationState(prev => ({ ...prev, availableCars: suitableCars }));
        setIsTyping(false);
        
        addRouteCard({
          pickup: fareData.pickup,
          drop: fareData.drop,
          route: fareData.route
        });
        
        addBotMessage(`🎉 Found ${suitableCars.length} SUV${suitableCars.length > 1 ? 's' : ''} matching your needs!`);
        
        // Show only first 3 cars
        suitableCars.slice(0, 3).forEach(item => {
          addCarCard(item.car, item.pricing, false);
        });
        
        if (suitableCars.length > 3) {
          addBotMessage(
            `Showing 3 of ${suitableCars.length} available vehicles.`,
            [{ text: `🔍 View All ${suitableCars.length} Cars`, action: 'view_all_cars' }]
          );
        } else {
          addBotMessage("Tap on any vehicle to book! 👆");
        }
      } else {
        setIsTyping(false);
        addBotMessage(
          `Sorry, no vehicles found with ${passengers}+ seats.`,
          [
            { text: '👥 Try Fewer Passengers', action: 'start_fresh' },
            { text: '🚙 Browse All Cars', action: 'browse_cars' }
          ]
        );
      }
    } else {
      setIsTyping(false);
      addBotMessage(
        "Oops! Couldn't fetch vehicles right now.",
        [
          { text: '🔄 Retry', action: 'start_booking' },
          { text: '🚙 Browse Manually', action: 'browse_cars' }
        ]
      );
    }
  };

  const handleCarSelection = async (car, fare, isEstimate) => {
    if (isEstimate) {
      addUserMessage(`I want to book ${car.name}`);
      setIsTyping(true);
      await delay(1000);
      setIsTyping(false);
      addBotMessage(
        `Great choice! To book ${car.name}, I'll need a few more details.\n\n📅 When would you like to travel?`,
        null,
        'date_input'
      );
      setConversationState(prev => ({ ...prev, selectedCar: car, intent: 'booking', stage: 'collecting_date' }));
    } else {
      addUserMessage(`I'll book ${car.name}`);
      setConversationState(prev => ({ ...prev, selectedCar: car }));
      setIsTyping(true);
      await delay(1000);
      setIsTyping(false);
      addBotMessage(
        `Excellent choice! 🎉\n\n` +
        `🚗 Vehicle: ${car.name}\n` +
        `💺 Seats: ${car.seatingCapacity}\n` +
        `📏 Distance: ${fare.distance} km\n\n` +
        `💰 Fare Breakdown:\n` +
        `• Base: ₹${fare.baseAmount.toFixed(0)}\n` +
        `• Distance: ₹${fare.distanceAmount.toFixed(0)}\n` +
        `• Total: ₹${fare.totalAmount.toFixed(0)}\n` +
        `• Advance (25%): ₹${fare.advanceAmount.toFixed(0)}\n\n` +
        `Ready to proceed?`,
        [
          { text: '✅ Yes, Book Now', action: 'confirm_booking', car, fare },
          { text: '🔙 Choose Another', action: 'show_cars_again' },
          { text: '❌ Cancel', action: 'start_fresh' }
        ]
      );
    }
  };

  const handleBookingConfirmation = async (car, fare) => {
    const { pickup, drop, date, passengers, routeInfo } = conversationState;
    setIsTyping(true);
    await delay(800);
    setIsTyping(false);
    addBotMessage("Perfect! Redirecting you to complete your booking... ✨");
    await delay(1000);
    navigate('/create-booking', {
      state: {
        car,
        searchData: { pickup, drop, date, passengers },
        routeInfo,
        fare
      }
    });
    setIsOpen(false);
  };

  const CarCard = ({ car, fare, isEstimate }) => (
    <div 
      onClick={() => handleCarSelection(car, fare, isEstimate)} 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-gray-100 hover:border-blue-500 p-4 my-2 transform hover:scale-[1.02]"
    >
      <div className="flex gap-3">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          {car.primaryImage ? (
            <img src={car.primaryImage} alt={car.name} className="w-full h-full object-cover" />
          ) : (
            <FaCar className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-bold text-sm truncate flex-1">{car.name}</h4>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-semibold ml-2">
              {car.vehicleType}
            </span>
          </div>
          <p className="text-xs text-gray-600 truncate">{car.model}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center">
              <FiUsers className="w-3 h-3 mr-1" />
              {car.seatingCapacity}
            </span>
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center">
              <FiDollarSign className="w-3 h-3 mr-1" />
              ₹{car.ratePerKm}/km
            </span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Total Fare</p>
                <p className="text-lg font-bold text-green-600">₹{Math.round(fare.totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 mb-0.5">Advance</p>
                <p className="text-sm font-bold text-blue-600">₹{Math.round(fare.advanceAmount)}</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:shadow-lg transition-all flex items-center justify-center">
            {isEstimate ? 'Book This Car' : 'Select Vehicle'}
            <FiChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );

  const RouteCard = ({ routeInfo }) => (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-xl p-4 my-2 shadow-md">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
          <FiNavigation className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">Route Information</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center mb-1">
            <FiMapPin className="w-3 h-3 text-blue-600 mr-1" />
            <p className="text-[10px] text-gray-500 font-medium">Distance</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{routeInfo.route.distance.toFixed(1)} km</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center mb-1">
            <FiClock className="w-3 h-3 text-purple-600 mr-1" />
            <p className="text-[10px] text-gray-500 font-medium">Duration</p>
          </div>
          <p className="text-lg font-bold text-gray-900">~{routeInfo.route.duration} min</p>
        </div>
      </div>
    </div>
  );

  const FareSummary = ({ minFare, maxFare, avgFare, count }) => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 my-2 shadow-md">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
          <FiTrendingUp className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">Fare Range ({count} vehicles)</h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <p className="text-[9px] text-gray-500 font-medium mb-0.5">Minimum</p>
          <p className="text-sm font-bold text-green-600">₹{Math.round(minFare)}</p>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <p className="text-[9px] text-gray-500 font-medium mb-0.5">Average</p>
          <p className="text-sm font-bold text-blue-600">₹{Math.round(avgFare)}</p>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <p className="text-[9px] text-gray-500 font-medium mb-0.5">Maximum</p>
          <p className="text-sm font-bold text-orange-600">₹{Math.round(maxFare)}</p>
        </div>
      </div>
      <div className="mt-2 bg-white/50 rounded-lg p-2">
        <p className="text-[10px] text-gray-600 flex items-center">
          <FiInfo className="w-3 h-3 mr-1" />
          Prices vary by vehicle type and features
        </p>
      </div>
    </div>
  );

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="fixed bottom-20 lg:bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all z-50 group animate-bounce"
        >
          <FaRobot className="w-8 h-8 mx-auto group-hover:rotate-12 transition-transform drop-shadow-lg" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-[9px] font-bold animate-pulse flex items-center justify-center shadow-lg">
            AI
          </span>
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            Chat with AI
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[calc(100vh-2rem)] sm:h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                <FaRobot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Booking Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-xs text-blue-100">Online • Ready to help</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-9 h-9 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center group"
            >
              <FiX className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.type === 'car_card' ? (
                  <div className="flex justify-start">
                    <div className="max-w-[95%]">
                      <CarCard car={msg.car} fare={msg.fare} isEstimate={msg.isEstimate} />
                    </div>
                  </div>
                ) : msg.type === 'route_card' ? (
                  <div className="flex justify-start">
                    <div className="max-w-[95%]">
                      <RouteCard routeInfo={msg.routeInfo} />
                    </div>
                  </div>
                ) : msg.type === 'fare_summary' ? (
                  <div className="flex justify-start">
                    <div className="max-w-[95%]">
                      <FareSummary 
                        minFare={msg.minFare} 
                        maxFare={msg.maxFare} 
                        avgFare={msg.avgFare}
                        count={msg.count}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
                
                {msg.specialType === 'pickup_input' && (
                  <div className="mt-2 animate-fadeIn">
                    <LocationInput 
                      value="" 
                      onChange={handlePickupSelected} 
                      placeholder="Search pickup location..." 
                    />
                  </div>
                )}
                {msg.specialType === 'drop_input' && (
                  <div className="mt-2 animate-fadeIn">
                    <LocationInput 
                      value="" 
                      onChange={handleDropSelected} 
                      placeholder="Search drop location..." 
                    />
                  </div>
                )}
                {msg.specialType === 'date_input' && (
                  <div className="mt-2 bg-white rounded-xl p-4 shadow-md border-2 border-blue-200 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCalendar className="text-blue-600 w-5 h-5" />
                      <span className="text-sm font-semibold text-gray-700">Select Date</span>
                    </div>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleDateSelected(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-medium transition-all"
                    />
                  </div>
                )}
                {msg.specialType === 'passenger_input' && (
                  <div className="mt-2 bg-white rounded-xl p-4 shadow-md border-2 border-purple-200 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-3">
                      <FiUsers className="text-purple-600 w-5 h-5" />
                      <span className="text-sm font-semibold text-gray-700">Select Passengers</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          onClick={() => handlePassengersSelected(num)}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-600 hover:to-pink-600 hover:text-white text-purple-700 font-bold py-3 rounded-xl transition-all transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md text-sm border border-purple-200"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-2 animate-fadeIn">
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (reply.action === 'confirm_booking') {
                            addUserMessage(reply.text);
                            handleBookingConfirmation(reply.car, reply.fare);
                          } else {
                            handleQuickReply(reply.action, reply.text);
                          }
                        }}
                        className="bg-white border-2 border-blue-500 text-blue-600 px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t-2 border-gray-100 p-3 flex-shrink-0">
            <div className="flex items-center justify-center gap-3 text-xs mb-2">
              <button
                onClick={() => handleQuickReply('contact_support')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-lg transition-all font-medium"
              >
                <FiPhone className="w-3.5 h-3.5" />
                <span>Support</span>
              </button>
              <button
                onClick={() => handleQuickReply('start_fresh')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-600 rounded-lg transition-all font-medium"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Powered by AI • Always here to help 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SUVBookingChatbot;