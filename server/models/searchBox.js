import mongoose from "mongoose";

// Seat schema
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  available: { type: Boolean, default: true }
});



// routeSchema schema
const routeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  busDetails: {
    busName: { type: String, required: true },
    acNonAc: { type: String, enum: ['AC', 'NON-AC'], required: true },
    sleeperSeater: { type: String, enum: ['Sleeper', 'Seater', 'Both'], required: true },
    ticketPrice: { type: Number, required: true },
    rating: { type: Number, required: true },
    seatsAvailable: { type: Number, required: true },
    availableSeats: [seatSchema]
   }
  });
  
  
  
  
  const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    movieTitle: { type: String, required: true },
    totalPayment: { type: Number, required: true },
    slot: { // Storing slot details directly
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true }
    },
    // seats: [seatSchema],  // Array of seat documents
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
  });
  
  
  const citySchema = new mongoose.Schema({
    name: { type: String, required: true }
  });
  
  // Model definitions
  const Route = mongoose.model('Route', routeSchema);
  const Booking = mongoose.model('Booking', bookingSchema);
  const Seat = mongoose.model('Seat', seatSchema);
  const City = mongoose.model('City', citySchema);
  

// Named exports
export { Route, Booking, City, Seat };
