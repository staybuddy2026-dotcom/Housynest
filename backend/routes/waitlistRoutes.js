import express from 'express';
import { subscribeToWaitlist, getTenantWaitlists, cancelWaitlist } from '../controllers/waitlistController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', protect, subscribeToWaitlist);
router.get('/my-alerts', protect, getTenantWaitlists);
router.delete('/:id', protect, cancelWaitlist);

export default router;
