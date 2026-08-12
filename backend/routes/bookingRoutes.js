import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  createBooking,
  getOwnerBookings,
  getTenantBookings,
  updateBookingStatus,
  processPayment,
  payBalance,
  getOwnerRentCollection,
  getAdminBookings,
  confirmMoveIn,
  requestMoveOut,
  rejectMoveOut,
  processCheckout,
  emailAgreement
} from '../controllers/bookingController.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);

router.route('/owner')
  .get(protect, getOwnerBookings);

router.route('/admin/all')
  .get(protect, admin, getAdminBookings);

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

router.route('/:id/confirm-move-in')
  .put(protect, confirmMoveIn);

router.route('/:id/request-move-out')
  .post(protect, requestMoveOut);

router.route('/:id/reject-move-out')
  .post(protect, rejectMoveOut);

router.route('/:id/process-checkout')
  .post(protect, processCheckout);

router.route('/:id/email-agreement')
  .post(protect, emailAgreement);

export default router;
