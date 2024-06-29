import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CitySearch = ({ value, onChange, placeholder, excludedCities }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    fetchSuggestions(value);
  }, [value]);

  const fetchSuggestions = async (query) => {
    if (query) {
      try {
        const response = await axios.get(`http://localhost:4000/cities?q=${query}`);
        let filteredSuggestions = response.data.filter(city => !excludedCities.includes(city.name));
        
        // Exclude the selected city if it's already selected
        if (selectedCity && selectedCity.name.toLowerCase().includes(query.toLowerCase())) {
          filteredSuggestions = filteredSuggestions.filter(city => city.name !== selectedCity.name);
        }
        
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    onChange(query);
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedCity(suggestion);
    onChange(suggestion.name);
    setSuggestions([]);
  };

  const handleInputBlur = () => {
    if (suggestions.length > 0 && !selectedCity) {
      // If no city is selected and suggestions exist, auto-select the first suggestion
      setSelectedCity(suggestions[0]);
      onChange(suggestions[0].name);
    }
    setInputFocused(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      // If Enter key is pressed, handle auto-correction to the first suggestion
      if (suggestions.length > 0 && !selectedCity) {
        setSelectedCity(suggestions[0]);
        onChange(suggestions[0].name);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        onFocus={() => setInputFocused(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
      />
      {inputFocused && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full border border-gray-300 rounded-lg bg-white z-10 max-h-40 overflow-y-auto shadow-lg">
          {suggestions.map((city) => (
            <div
              key={city._id}
              onClick={() => handleSuggestionClick(city)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {city.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
