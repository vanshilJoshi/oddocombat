import mongoose from 'mongoose';
import { City } from '../models/searchBox.js';
import { config } from "dotenv";

config({ path: "../config/config.env" });

const cities = [
  { name: 'Ahmedabad' },{ name: 'Surat' },{ name: 'Vadodara' },{ name: 'Rajkot' }, 
  { name: 'Bhavnagar' }, { name: 'Jamnagar' }, { name: 'Gandhinagar' }, { name: 'Junagadh' }, 
  { name: 'Anand' },{ name: 'Nadiad' },{ name: 'Morbi' },{ name: 'Surendranagar' },{ name: 'Bharuch' },
  { name: 'Navsari' },{ name: 'Mehsana' }, { name: 'Patan' }, { name: 'Godhra' }, { name: 'Veraval' },
  { name: 'Porbandar' }, { name: 'Botad' }, { name: 'Dahod' }, { name: 'Palanpur' }, { name: 'Visnagar' },
];


const seedCities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Delete existing cities
    await City.deleteMany();

    // Insert new cities
    await City.insertMany(cities);
    console.log('Cities added successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding cities:', error);
  }
};

seedCities();
