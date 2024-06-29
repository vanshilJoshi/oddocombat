import mongoose from 'mongoose';
import { Route, Seat } from '../models/searchBox.js'; // Adjust the path accordingly
import { config } from 'dotenv';
import { faker } from '@faker-js/faker';
import fs from 'fs';

config({ path: '../config/config.env' });

const cities = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh',
  'Anand', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch', 'Navsari', 'Mehsana', 'Patan', 'Godhra',
  'Veraval', 'Porbandar', 'Botad', 'Dahod', 'Palanpur', 'Visnagar'
];

const generateRandomTime = () => {
  const hours = faker.number.int({ min: 6, max: 22 });
  const minutes = faker.helpers.arrayElement(['00', '15', '30', '45']);
  return `${hours}:${minutes}`;
};

const generateBusDetails = () => ({
  busName: faker.company.buzzPhrase(),
  acNonAc: faker.helpers.arrayElement(['AC', 'NON-AC']),
  sleeperSeater: faker.helpers.arrayElement(['Sleeper', 'Seater', 'Both']),
  ticketPrice: faker.number.int({ min: 100, max: 500 }),
  rating: faker.number.float({ min: 1, max: 5 }).toFixed(1),
  seatsAvailable: faker.number.int({ min: 20, max: 50 })
});

const generateSeats = (totalSeats) => {
  return Array.from({ length: totalSeats }, (_, i) => ({
    seatNumber: i + 1,
    available: true
  }));
};

const updateRoutesAndSaveToFile = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const today = new Date();

    const routes = [];

    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const from = cities[i];
        const to = cities[j];

        // Find the existing outbound route based on from, to, and departureTime
        const existingOutboundRoute = await Route.findOne({ from, to, departureTime: { $gte: today } });

        if (existingOutboundRoute) {
          // Update existing outbound route details
          const outboundBusDetails = generateBusDetails();
          const outboundSeats = generateSeats(outboundBusDetails.seatsAvailable); // Generate seats for outbound route

          // Update existing outbound route with new busDetails and availableSeats
          existingOutboundRoute.busDetails = {
            ...outboundBusDetails,
            availableSeats: outboundSeats.map(seat => new Seat(seat))
          };

          await existingOutboundRoute.save();
          console.log(`Updated route from ${from} to ${to}`);

          routes.push(existingOutboundRoute); // Push updated outbound route to routes array

          // Find the existing return route based on to, from, and departureTime
          const existingReturnRoute = await Route.findOne({ from: to, to: from, departureTime: { $gte: today } });

          if (existingReturnRoute) {
            // Update existing return route details
            const returnBusDetails = generateBusDetails();
            const returnSeats = generateSeats(returnBusDetails.seatsAvailable); // Generate seats for return route

            // Update existing return route with new busDetails and availableSeats
            existingReturnRoute.busDetails = {
              ...returnBusDetails,
              availableSeats: returnSeats.map(seat => new Seat(seat))
            };

            await existingReturnRoute.save();
            // console.log(`Updated return route from ${to} to ${from}`);

            routes.push(existingReturnRoute); // Push updated return route to routes array
          } else {
            console.log(`Return route from ${to} to ${from} not found to update.`);
          }
        } else {
          console.log(`Route from ${from} to ${to} not found to update.`);
        }
      }
    }

    console.log('Routes updated successfully.');

    // Save routes to JSON file
    const jsonRoutes = JSON.stringify(routes, null, 2);
    fs.writeFileSync('./updatedRoutes.json', jsonRoutes);
    console.log('Updated routes data saved to updatedRoutes.json.');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating routes:', error);
    mongoose.connection.close();
  }
};

updateRoutesAndSaveToFile();
