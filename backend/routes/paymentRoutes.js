import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createRazorpayOrder, verifyRazorpayPayment, createVisitPassOrder, verifyVisitPassPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

router.post('/visit-pass/order', protect, createVisitPassOrder);
router.post('/visit-pass/verify', protect, verifyVisitPassPayment);

export default router;
