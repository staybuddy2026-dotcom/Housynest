import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createBooking,
  getOwnerBookings,
  getTenantBookings,
  updateBookingStatus,
  processPayment,
  payBalance,
  getOwnerRentCollection
} from '../controllers/bookingController.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);

router.route('/owner')
  .get(protect, getOwnerBookings);

router.route('/owner/rent-collection')
  .get(protect, getOwnerRentCollection);

router.route('/tenant')
  .get(protect, getTenantBookings);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

router.route('/:id/pay')
  .put(protect, processPayment);

router.route('/:id/pay-balance')
  .put(protect, payBalance);

export default router;
