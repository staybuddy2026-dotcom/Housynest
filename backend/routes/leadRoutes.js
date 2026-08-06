import express from 'express';
import { createLead, getOwnerLeads, getTenantLeads, markLeadAsRead, updateLeadStatus } from '../controllers/leadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createLead);
router.get('/owner', protect, getOwnerLeads);
router.get('/tenant', protect, getTenantLeads);
router.put('/:id/read', protect, markLeadAsRead);
router.put('/:id/status', protect, updateLeadStatus);

export default router;
