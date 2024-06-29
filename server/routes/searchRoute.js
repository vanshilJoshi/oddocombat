import express from 'express';
import { searchRoutes, getCities, getSeats } from '../controllers/routeController.js';

const router = express.Router();

router.route('/search').get(async (req, res, next) => {
  try {
    await searchRoutes(req, res);
  } catch (error) {
    next(error); // Passes the error to the next error handler middleware
  }
});

router.route('/cities').get(async (req, res, next) => {
  try {
    await getCities(req, res);
  } catch (error) {
    next(error); // Passes the error to the next error handler middleware
  }
});

// router.route('/seats/:routeId').get(async (req, res, next) => {
//   try {
//     await getSeats(req, res);
//   } catch (error) {
//     next(error); // Passes the error to the next error handler middleware
//   }
// });

// router.get('/seats/:routeId', getSeats);
router.route('/seats/:routeId').get(getSeats);

export default router;
