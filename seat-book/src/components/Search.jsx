// Search.jsx

import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CitySearch from './CitySearch';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment'; // or date-fns

const Search = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [journeyDate, setJourneyDate] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!from || !to || !journeyDate) {
      alert('Please enter both "From" and "To" cities and select a journey date.');
      return;
    }

    try {
      const formattedDate = moment(journeyDate).format('YYYY-MM-DD');
      const response = await axios.get(
        `http://localhost:4000/search?from=${from}&to=${to}&date=${formattedDate}`
      );

      if (Array.isArray(response.data)) {
        navigate('/businfo', { state: { routes: response.data } });
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Search error', error);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto space-y-4">
        <CitySearch
          value={from}
          onChange={(selectedCity) => setFrom(selectedCity)}
          placeholder="From"
          excludedCities={[to]}
        />
        <CitySearch
          value={to}
          onChange={(selectedCity) => setTo(selectedCity)}
          placeholder="To"
          excludedCities={[from]}
        />
        <DatePicker
          selected={journeyDate}
          onChange={(date) => setJourneyDate(date)}
          dateFormat="dd MMM yyyy"
          placeholderText="Select Journey Date"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          minDate={new Date()}
          shouldCloseOnSelect
          isClearable
          customInput={<CustomDatePickerInput />}
        />
        <button
          onClick={handleSearch}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </div>
  );
};

const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    readOnly
    placeholder="Select Journey Date"
    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
  />
));

export default Search;
