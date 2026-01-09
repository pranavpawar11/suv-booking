import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';

const LocationInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter location", 
  className = "",
  error = ""
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      // Using Nominatim (free OpenStreetMap geocoding)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'in' // Restrict to India
        },
        headers: {
          'User-Agent': 'SUV-Booking-App' // Required by Nominatim
        }
      });

      const results = response.data.map(item => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        address: item.address
      }));

      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce API calls
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Pass the full address to parent
    onChange({
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({ address: '', lat: null, lng: null });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 text-black border-2 rounded-xl focus:outline-none transition-colors ${
            error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 focus:border-blue-500'
          } ${className}`}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center">
          <span className="mr-1">⚠️</span> {error}
        </p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start">
                <FiMapPin className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && !loading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <div className="text-center text-gray-500">
            <FiSearch className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No locations found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        </div>
      )}

      {/* Hint for short queries */}
      {query.length > 0 && query.length < 3 && (
        <p className="text-xs text-gray-500 mt-1">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
};

export default LocationInput;