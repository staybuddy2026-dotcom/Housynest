import express from 'express';
import { createInquiry, getOwnerInquiries, getTenantInquiries, markInquiryAsRead, updateInquiryStatus } from '../controllers/inquiryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInquiry);
router.get('/owner', protect, getOwnerInquiries);
router.get('/tenant', protect, getTenantInquiries);
router.put('/:id/read', protect, markInquiryAsRead);
router.put('/:id/status', protect, updateInquiryStatus);

export default router;
