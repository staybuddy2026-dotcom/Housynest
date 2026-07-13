import express from 'express';
import {
  sendRequest,
  getOwnerRequests,
  updateRequestStatus,
  markRequestsAsRead
} from '../controllers/lawyerRequestController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send', protect, sendRequest);
router.get('/owner', protect, getOwnerRequests);
router.put('/mark-read', protect, markRequestsAsRead);
router.put('/:id/status', protect, updateRequestStatus);

export default router;
