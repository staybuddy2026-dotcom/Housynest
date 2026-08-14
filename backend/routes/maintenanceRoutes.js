import express from 'express';
import { 
  createTicket, 
  getTenantTickets, 
  getOwnerTickets, 
  updateTicketStatus 
} from '../controllers/maintenanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', protect, upload.array('photos', 5), createTicket);
router.get('/tenant', protect, getTenantTickets);
router.get('/owner', protect, getOwnerTickets);
router.put('/:id', protect, updateTicketStatus);

export default router;
