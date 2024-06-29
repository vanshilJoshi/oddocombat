// BusInfo.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BusInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { routes } = location.state || { routes: [] };

  const handleViewSeats = (routeId, selectedRoute) => {
    navigate(`/seat/${routeId}`, { state: { selectedRoute } });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Available Buses</h1>
      <div className="max-w-md mx-auto space-y-4">
        {routes.length > 0 ? (
          routes.map((route) => (
            <div key={route._id} className="p-4 mb-4 border rounded-lg shadow">
              <p className="font-bold">From: <span className="font-normal">{route.from}</span></p>
              <p className="font-bold">To: <span className="font-normal">{route.to}</span></p>
              <p className="font-bold">Departure: <span className="font-normal">{new Date(route.departureTime).toLocaleString()}</span></p>
              <p className="font-bold">Arrival: <span className="font-normal">{new Date(route.arrivalTime).toLocaleString()}</span></p>
              <p className="font-bold">Bus Details: <span className="font-normal">{route.busDetails.busName} ({route.busDetails.acNonAc})</span></p>
              <p className="font-bold">Seats Available: <span className="font-normal">{route.busDetails.seatsAvailable}</span></p>
              <p className="font-bold">Ticket Price: <span className="font-normal">₹{route.busDetails.ticketPrice}</span></p>
              <p className="font-bold">Rating: <span className="font-normal">{route.busDetails.rating}</span></p>
              <button
                onClick={() => handleViewSeats(route._id, route)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg inline-block mt-2 hover:bg-blue-600"
              >
                View Seats
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No buses found.</p>
        )}
      </div>
    </div>
  );
};

export default BusInfo;
