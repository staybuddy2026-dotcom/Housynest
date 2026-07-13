import express from 'express';
import { getUserProfile, updateUserProfile, toggleSavedProperty, getAllUsers, getNotificationCounts, uploadProfilePic, changePassword, toggleBlockUser, getLawyerRequests, updateLawyerStatus, getLawyerOwners } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/favorites', protect, toggleSavedProperty);
router.get('/notification-counts', protect, getNotificationCounts);
router.post('/upload-profile-pic', protect, upload.single('profilePic'), uploadProfilePic);
router.get('/admin/all', protect, getAllUsers);
router.put('/admin/block-user', protect, toggleBlockUser);
router.get('/admin/lawyer-requests', protect, getLawyerRequests);
router.patch('/admin/lawyer-requests/:id/status', protect, updateLawyerStatus);
router.put('/change-password', protect, changePassword);
router.get('/lawyer/owners', protect, getLawyerOwners);

export default router;
