import express from 'express';
import { generateAadharOtp, verifyAadharOtp } from '../controllers/aadharController.js';

const router = express.Router();

// Generate Aadhaar OTP
router.post('/generate-otp', generateAadharOtp);

// Verify Aadhaar OTP
router.post('/verify-otp', verifyAadharOtp);

export default router;
