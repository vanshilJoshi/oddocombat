import {Route, City} from '../models/searchBox.js';

export const searchRoutes = async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'Please provide "from", "to", and "date" parameters.' });
  }

  try {
    const searchDate = new Date(date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const routes = await Route.find({
      from: { $regex: `^${from}`, $options: 'i' },
      to: { $regex: `^${to}`, $options: 'i' },
      departureTime: { $gte: searchDate, $lt: nextDay }
    });

    res.json(routes);
  } catch (error) {
    console.error('Search routes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCities = async (req, res) => {
  const query = req.query.q;
  try {
    const cities = await City.find({
       name: { $regex: `^${query}`, $options: 'i' }
  });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSeats = async (req, res) => {
  const { routeId } = req.params;
  try {
    const route = await Route.findById(routeId).populate('busDetails'); // Populate busDetails for nested data
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const seats = route.busDetails.availableSeats; // Access seats from the populated busDetails
    res.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
