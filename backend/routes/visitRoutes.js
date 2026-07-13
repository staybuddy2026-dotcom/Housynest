import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  scheduleVisit, 
  getOwnerVisits, 
  getTenantVisits, 
  updateVisitStatus 
} from '../controllers/visitController.js';

const router = express.Router();

router.post('/', protect, scheduleVisit);
router.get('/owner', protect, getOwnerVisits);
router.get('/tenant', protect, getTenantVisits);
router.patch('/:id/status', protect, updateVisitStatus);

export default router;
