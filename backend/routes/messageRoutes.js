import express from 'express';
import { getMessages, sendMessage, markMessagesAsRead, getTotalUnreadCount } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, getTotalUnreadCount);
router.get('/:leadId', protect, getMessages);
router.post('/:leadId', protect, sendMessage);
router.put('/:leadId/read', protect, markMessagesAsRead);

export default router;
