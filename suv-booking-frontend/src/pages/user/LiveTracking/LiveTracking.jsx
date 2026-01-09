import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPhone,
  FiNavigation,
  FiClock,
  FiAlertCircle,
  FiActivity,
  FiMapPin,
} from "react-icons/fi";
import bookingService from "../../../api/services/bookingService";
import Loader from "../../../components/common/Loader";
import toast from "react-hot-toast";
import io from "socket.io-client";

// Leaflet CSS must be imported
// Add this to your index.html: <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

const LiveTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [id]);

  useEffect(() => {
    if (!booking || !mapRef.current || !window.L) return;
    if (mapInstanceRef.current) return;

    initializeMap();
  }, [booking]);

  useEffect(() => {
    if (driverLocation && mapInstanceRef.current && window.L) {
      updateDriverMarker();
    }
  }, [driverLocation]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      if (response.success) {
        const bookingData = response.data.booking;
        setBooking(bookingData);

        if (bookingData.driver?.currentLocation?.coordinates) {
          setDriverLocation({
            lat: bookingData.driver.currentLocation.coordinates[1],
            lng: bookingData.driver.currentLocation.coordinates[0],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to fetch booking details");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      {
        auth: {
          token: localStorage.getItem("token"),
        },
      }
    );

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("joinBooking", id);
    });

    newSocket.on("driverLocationUpdate", (data) => {
      console.log("Driver location update:", data);
      if (data.bookingId === id) {
        setDriverLocation({
          lat: data.location.coordinates[1],
          lng: data.location.coordinates[0],
        });
      }
    });

    newSocket.on("bookingStatusUpdate", (data) => {
      if (data.bookingId === id) {
        toast.success(`Booking status updated: ${data.status}`);
        fetchBookingDetails();
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);
  };

  const initializeMap = () => {
    if (!window.L) {
      console.error("Leaflet not loaded");
      return;
    }

    const map = window.L.map(mapRef.current).setView(
      [booking.pickup.lat, booking.pickup.lng],
      13
    );

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const pickupIcon = window.L.divIcon({
      html: '<div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    pickupMarkerRef.current = window.L.marker(
      [booking.pickup.lat, booking.pickup.lng],
      { icon: pickupIcon }
    )
      .addTo(map)
      .bindPopup(`<b>Pickup</b><br>${booking.pickup.address}`);

    const dropIcon = window.L.divIcon({
      html: '<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    dropMarkerRef.current = window.L.marker(
      [booking.drop.lat, booking.drop.lng],
      { icon: dropIcon }
    )
      .addTo(map)
      .bindPopup(`<b>Drop</b><br>${booking.drop.address}`);

    if (booking.route?.coordinates && booking.route.coordinates.length > 0) {
      const routeCoords = booking.route.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);
      routeLayerRef.current = window.L.polyline(routeCoords, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.7,
      }).addTo(map);

      const bounds = window.L.latLngBounds([
        [booking.pickup.lat, booking.pickup.lng],
        [booking.drop.lat, booking.drop.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    if (driverLocation) {
      updateDriverMarker();
    }
  };

  const updateDriverMarker = () => {
    if (
      !mapInstanceRef.current ||
      !mapInstanceRef.current._mapPane ||
      !window.L ||
      !driverLocation
    )
      return;

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([
        driverLocation.lat,
        driverLocation.lng,
      ]);
    } else {
      const driverIcon = window.L.divIcon({
        html: `<div style="background:#2563eb;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;box-shadow:0 4px 12px rgba(37,99,235,0.4);border:3px solid white;">🚗</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      driverMarkerRef.current = window.L.marker(
        [driverLocation.lat, driverLocation.lng],
        { icon: driverIcon }
      ).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.panTo([driverLocation.lat, driverLocation.lng], {
      animate: false,
    });
  };

  const centerOnDriver = () => {
    if (driverLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [driverLocation.lat, driverLocation.lng],
        15,
        {
          animate: true,
          duration: 1,
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading tracking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Booking not found
          </h3>
          <button
            onClick={() => navigate("/my-bookings")}
            className="text-blue-600 hover:underline text-sm sm:text-base font-medium"
          >
            Go back to bookings
          </button>
        </div>
      </div>
    );
  }

  if (!["started", "driver_assigned", "confirmed"].includes(booking.status)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center max-w-md mx-auto">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Tracking Not Available
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Live tracking is only available for trips that have started
          </p>
          <button
            onClick={() => navigate(`/booking-details/${id}`)}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            View Booking Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 z-50">
      {/* Header - Fixed and always visible */}
      <div className="bg-white shadow-md px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between z-50 flex-shrink-0">
        <button
          onClick={() => navigate(`/booking-details/${id}`)}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors touch-manipulation active:scale-95 transition-transform min-w-0"
          aria-label="Go back"
        >
          <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Back</span>
        </button>
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 flex items-center mx-2">
          <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-600 flex-shrink-0" />
          <span className="hidden xs:inline">Live Tracking</span>
          <span className="xs:hidden">Tracking</span>
        </h1>
        <div className="w-16 sm:w-20"></div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapRef} className="w-full h-full"></div>

        {/* Center on Driver Button */}
        {driverLocation && (
          <button
            onClick={centerOnDriver}
            className="absolute bottom-[200px] xs:bottom-[220px] sm:bottom-[240px] right-3 sm:right-4 bg-white p-3 sm:p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all z-[1000] active:scale-95 touch-manipulation"
            aria-label="Center on driver location"
          >
            <FiNavigation className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </button>
        )}

        {/* Driver Info Card - Mobile optimized */}
        {booking.driver && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[1000] transition-all duration-300 max-h-[50vh] overflow-y-auto">
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="p-4 sm:p-5 md:p-6">
              {/* Driver Info */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-lg xs:text-xl sm:text-2xl font-bold">
                    {booking.driver.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 truncate">
                    {booking.driver.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {booking.car.name}
                  </p>
                  <p className="text-[10px] xs:text-xs text-gray-500 truncate">
                    {booking.car.registrationNumber || "Registration Number"}
                  </p>
                </div>
                <a
                  href={`tel:${booking.driver.phone}`}
                  className="bg-green-500 p-2.5 xs:p-3 sm:p-3.5 rounded-full hover:bg-green-600 transition-colors flex-shrink-0 active:scale-95 touch-manipulation shadow-md"
                  aria-label="Call driver"
                >
                  <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </a>
              </div>

              {/* Status */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center text-gray-600">
                    <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {booking.status === "started"
                        ? "Trip in progress"
                        : "Driver on the way"}
                    </span>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5 sm:mr-2"></div>
                    <span className="text-green-600 font-medium">Live</span>
                  </div>
                </div>

                {/* Distance Info */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center mb-1">
                      <FiMapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 mr-1" />
                      <p className="text-[10px] xs:text-xs text-blue-700 font-medium">
                        Distance
                      </p>
                    </div>
                    <p className="text-base xs:text-lg sm:text-xl font-bold text-gray-900">
                      {booking.distanceKm.toFixed(1)} km
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center mb-1">
                      <FiClock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 mr-1" />
                      <p className="text-[10px] xs:text-xs text-purple-700 font-medium">
                        Est. Time
                      </p>
                    </div>
                    <p className="text-base xs:text-lg sm:text-xl font-bold text-gray-900">
                      ~{booking.estimatedDurationMinutes}m
                    </p>
                  </div>
                </div>

                {/* Trip Details - Expandable */}
                {isCardExpanded && (
                  <div className="mt-3 sm:mt-4 space-y-3 animate-fadeIn">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] xs:text-xs text-gray-500 font-medium mb-0.5">
                            Pickup Location
                          </p>
                          <p className="text-xs sm:text-sm text-gray-900 leading-snug">
                            {booking.pickup.address}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] xs:text-xs text-gray-500 font-medium mb-0.5">
                            Drop-off Location
                          </p>
                          <p className="text-xs sm:text-sm text-gray-900 leading-snug">
                            {booking.drop.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Toggle button */}
                <button
                  onClick={() => setIsCardExpanded(!isCardExpanded)}
                  className="w-full mt-3 sm:mt-4 py-2 text-xs sm:text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  {isCardExpanded ? "Hide trip details" : "Show trip details"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Driver Location Alert */}
        {!driverLocation && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 z-[1000] shadow-lg">
            <div className="flex items-start">
              <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-yellow-900">
                  Waiting for driver location
                </p>
                <p className="text-[10px] xs:text-xs text-yellow-800 mt-1">
                  Driver's location will appear shortly
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTracking;