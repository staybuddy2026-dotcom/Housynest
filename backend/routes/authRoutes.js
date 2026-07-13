import express from 'express';
import { sendOtp, registerUser, loginUser, logoutUser, refresh, googleLogin, adminRegister } from '../controllers/authController.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', upload.single('certificate'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refresh);
router.post('/google', googleLogin);
router.post('/admin/register', adminRegister);

export default router;
