import express from 'express';
import { getMessages, sendMessage, markMessagesAsRead, getTotalUnreadCount } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, getTotalUnreadCount);
router.get('/:inquiryId', protect, getMessages);
router.post('/:inquiryId', protect, sendMessage);
router.put('/:inquiryId/read', protect, markMessagesAsRead);

export default router;
