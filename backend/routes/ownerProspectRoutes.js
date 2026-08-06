import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { createOwnerProspect, getOwnerProspects, updateOwnerProspectStatus } from '../controllers/OwnerProspectController.js';

const router = express.Router();

router.post('/', protect, admin, createOwnerProspect);
router.get('/', protect, admin, getOwnerProspects);
router.patch('/:id/status', protect, admin, updateOwnerProspectStatus);

export default router;
