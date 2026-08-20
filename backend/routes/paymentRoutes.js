import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;
