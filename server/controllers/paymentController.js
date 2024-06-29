import crypto from 'crypto';
import { instance } from "../server.js";
import { Payment } from "../models/paymentModel.js";
import { Route, Booking } from "../models/searchBox.js"; // Assuming these are your models

export const checkout = async (req, res) => {
    try {
        const { totalPayment } = req.body;
        console.log('Checkout Request Body:', req.body);
        if (!totalPayment || typeof totalPayment !== 'number' || isNaN(totalPayment)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid totalPayment provided'
            });
        }

        const options = {
            amount: Number(totalPayment * 100),
            currency: "INR",
        };

        const order = await instance.orders.create(options);
        console.log('Order created:', order);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const paymentVerification = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingDetails } = req.body;
    console.log('Payment Verification Request Body:', req.body);

    const verifySignature = (data, razorpaySignature, secret) => {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${data.order_id}|${data.payment_id}`);
        const generatedSignature = hmac.digest('hex');
        return generatedSignature === razorpaySignature;
    };

    try {
        // Verify the payment signature
        const isValid = verifySignature({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id
        }, razorpay_signature, process.env.RAZORPAY_API_SECRET);

        if (!isValid) {
            console.error('Invalid payment signature');
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Extract booking details
        const { userId, selectedRoute, selectedDate, selectedSeats, totalPayment } = bookingDetails;
        console.log('Extracted Booking Details:', bookingDetails);

        // Ensure selectedDate is a valid date object
        const date = new Date(selectedDate);
        if (isNaN(date.getTime())) {
            console.error('Invalid date format');
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Retrieve route details based on selectedRoute
        const route = await Route.findById(selectedRoute);
        if (!route) {
            console.error('Route not found');
            return res.status(404).json({ message: 'Route not found' });
        }
        const { from, to } = route;

        // Update the availability of the selected seats for the selected date
        const updateResult = await Route.updateOne(
            {
                _id: selectedRoute,
                'availableSeats.date': date,
            },
            {
                $set: {
                    'availableSeats.$.seats': selectedSeats.map(seat => ({
                        ...seat,
                        available: false
                    }))
                }
            },
            {
                arrayFilters: [{ 'seat.date': date }]
            }
        );

        console.log('Update Result:', updateResult);

        if (updateResult.nModified === 0) {
            console.error('No seats were updated');
            return res.status(404).json({ message: 'No seats were updated. Check if the provided details are correct.' });
        }

        // Save the booking details
        const booking = new Booking({
            userId,
            route: selectedRoute,
            date,
            from,
            to,
            seats: selectedSeats.map(seat => ({ ...seat, available: false })),
            totalPayment,
            paymentStatus: 'paid'
        });

        await booking.save();

        console.log('Booking saved successfully');
        res.status(200).json({
            message: 'Payment verified successfully',
            redirectURL: `/paymentsuccess?reference=${razorpay_payment_id}`
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error updating seats or saving booking', error });
    }
};

export const getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const bookings = await Booking.find({ userId });
        console.log('Bookings fetched for userId:', userId, 'Bookings:', bookings);

        if (!bookings || bookings.length === 0) {
            console.error('No bookings found for this user');
            return res.status(404).json({ message: 'No bookings found for this user.' });
        }

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};
