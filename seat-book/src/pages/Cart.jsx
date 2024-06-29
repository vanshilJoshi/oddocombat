import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserAuth } from '../context/UserAuthContext';

const Cart = () => {
    const { user } = useUserAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { routeId, selectedSeats, selectedRoute } = location.state || {};
    const totalPayment = selectedSeats?.length * 150; // Assuming ₹150 per seat

    const handlePayment = async () => {
        if (!user) {
            console.error('User not logged in. Redirecting to login page.');
            navigate('/login');
            return;
        }

        try {
            if (typeof totalPayment !== 'number' || isNaN(totalPayment)) {
                console.error('Invalid totalPayment value:', totalPayment);
                return;
            }

            const payload = {
                userId: user.uid,
                selectedRoute: routeId,
                totalPayment,
                selectedSeats,
                selectedDate: new Date().toISOString(), // Example: use current date as selected date
                // Add more fields as per your specific requirements
            };

            const { data: { key } } = await axios.get('http://localhost:4000/api/getkey');

            const { data: { order } } = await axios.post('http://localhost:4000/api/checkout', payload);

            const options = {
                key,
                amount: order.amount,
                currency: "INR",
                name: "Your Bus Ticketing Service", // Update with your service name
                description: "Booking bus tickets via Razorpay",
                image: "https://example.com/your_logo", // Replace with your logo URL
                order_id: order.id,
                prefill: {
                    name: user.displayName || "User", // Fallback to generic name if user's name is not available
                    email: user.email || "user@example.com", // Fallback email if not available
                    contact: "9000090000" // Example contact number
                },
                notes: {
                    "address": "Bus Booking Office" // Example address
                },
                theme: {
                    "color": "#3399cc" // Customize Razorpay modal theme color
                },
                handler: async (response) => {
                    try {
                        const verificationResponse = await axios.post('http://localhost:4000/api/paymentverification', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingDetails: payload,
                        });

                        const redirectURL = verificationResponse.data.redirectURL;
                        if (redirectURL) {
                            navigate(redirectURL);
                        } else {
                            console.error('Redirection URL not provided in response.');
                        }
                    } catch (error) {
                        console.error('Error during payment verification:', error);
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log("User closed the modal");
                    }
                }
            };

            const razor = new window.Razorpay(options);
            razor.on('payment.failed', (response) => {
                console.error('Payment failed:', response.error);
            });
            razor.open();
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    };

    const displaySeats = selectedSeats.map(seat => `${seat.seatRow}-${seat.seatNumber}`).join(', ');

    return (
        <div className="flex justify-center items-center h-full">
            <div className="cart-container flex justify-center flex-col">
                <h1 className='mb-4'>Booking Cart</h1>
                <h1>{selectedRoute ? `${selectedRoute.from} to ${selectedRoute.to}` : 'Route Details Loading...'}</h1>

                {selectedSeats.length === 0 ? (
                    <p>Your cart is empty. Please select seats to book.</p>
                ) : (
                    <div>
                        <div className="cart-item">
                            <h2>Your Seats: {displaySeats}</h2>
                        </div>
                        <div className="cart-summary">
                            <h3>Total Seats: {selectedSeats.length}</h3>
                            <h3>Total Price: Rs. {totalPayment}</h3>
                        </div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded m-10" onClick={handlePayment}>Proceed to Checkout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
