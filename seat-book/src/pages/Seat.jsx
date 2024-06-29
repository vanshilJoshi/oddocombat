import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

function Seat() {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatsData, setSeatsData] = useState([]);
    const [hoveredSeat, setHoveredSeat] = useState(null);
    const { routeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedRoute } = location.state || {};

    useEffect(() => {
        const fetchSeatsData = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/seats/${routeId}`);
                const seats = response.data;
                setSeatsData(seats);
            } catch (error) {
                console.error('Error fetching seats:', error);
            }
        };

        fetchSeatsData();
    }, [routeId]);

    const handleSeatClick = (seatId) => {
        setSelectedSeats(prevSelectedSeats => {
            if (prevSelectedSeats.includes(seatId)) {
                return prevSelectedSeats.filter(seat => seat !== seatId);
            } else {
                return [...prevSelectedSeats, seatId];
            }
        });
    };

    const handleCart = () => {
        const selectedSeatDetails = selectedSeats.map(seatId => {
            return seatsData.find(seat => seat._id === seatId);
        });
        navigate('/cart', { state: { selectedSeats: selectedSeatDetails, selectedRoute } });
    };

    const handleSeatHover = (seatId) => {
        setHoveredSeat(seatId); // Set the currently hovered seat ID
    };

    const handleSeatLeave = () => {
        setHoveredSeat(null); // Reset the currently hovered seat ID
    };

    const renderSeats = () => {
        if (seatsData.length === 0) {
            return <p>Loading...</p>;
        }

        const seatRows = [];

        // Group seats into rows of four for demonstration
        for (let i = 0; i < seatsData.length; i += 4) {
            const rowSeats = seatsData.slice(i, i + 4);

            seatRows.push(
                <div key={i} className="flex items-center justify-center mb-4">
                    {/* Single seat on the left */}
                    <div className="mr-6 font-semibold text-lg text-gray-500">
                        <button
                            key={rowSeats[0]._id}
                            className={`seat ${rowSeats[0].available ? 'bg-gray-300 hover:bg-green-400' : 'bg-gray-200 cursor-not-allowed'} ${selectedSeats.includes(rowSeats[0]._id) ? 'bg-green-600' : ''} ${hoveredSeat === rowSeats[0]._id ? 'bg-green-400' : ''} w-10 h-10 p-2 rounded-md flex items-center justify-center text-xs text-green-800`}
                            disabled={!rowSeats[0].available}
                            onClick={() => handleSeatClick(rowSeats[0]._id)}
                            onMouseEnter={() => handleSeatHover(rowSeats[0]._id)}
                            onMouseLeave={handleSeatLeave}
                        >
                            {rowSeats[0].seatNumber}
                        </button>
                    </div>

                    {/* Pair of three seats on the right */}
                    <div className="flex flex-wrap">
                        {rowSeats.slice(1).map(seat => (
                            <button
                                key={seat._id}
                                className={`seat ${seat.available ? 'bg-gray-300 hover:bg-green-400' : 'bg-gray-200 cursor-not-allowed'} ${selectedSeats.includes(seat._id) ? 'bg-green-600' : ''} ${hoveredSeat === seat._id ? 'bg-green-400' : ''} w-10 h-10 p-3 mx-3 rounded-md flex items-center justify-center text-xs text-green-800`}
                                disabled={!seat.available}
                                onClick={() => handleSeatClick(seat._id)}
                                onMouseEnter={() => handleSeatHover(seat._id)}
                                onMouseLeave={handleSeatLeave}
                            >
                                {seat.seatNumber}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return seatRows;
    };

    const totalPayment = selectedSeats.length * 150; // Assuming ₹150 per seat

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                {selectedRoute ? `${selectedRoute.from} to ${selectedRoute.to}` : 'Route Details Loading...'}
            </h1>

            <div className="flex justify-center">
                <div className="flex flex-col space-y-3">
                    {renderSeats()}
                </div>
            </div>

            {selectedSeats.length > 0 && (
                <div className="flex justify-center mt-6">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={handleCart}
                    >
                        Proceed to Payment - ₹{totalPayment}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Seat;
