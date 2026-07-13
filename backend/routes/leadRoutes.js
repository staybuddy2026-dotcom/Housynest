import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { createLead, getLeads, updateLeadStatus } from '../controllers/leadController.js';

const router = express.Router();

router.post('/', protect, admin, createLead);
router.get('/', protect, admin, getLeads);
router.patch('/:id/status', protect, admin, updateLeadStatus);

export default router;
