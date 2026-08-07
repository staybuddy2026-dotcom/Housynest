import express from 'express';
import { sendOtp, registerUser, loginUser, logoutUser, refresh, googleLogin, adminRegister } from '../controllers/authController.js';
import { upload } from '../config/cloudinary.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

router.post('/send-otp', authLimiter, sendOtp);
router.post('/register', upload.single('certificate'), registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refresh);
router.post('/google', googleLogin);
router.post('/admin/register', adminRegister);

export default router;
