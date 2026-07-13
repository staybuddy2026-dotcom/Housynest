import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  createReport,
  getReports,
  updateReportStatus,
  getPendingReportCount
} from '../controllers/reportController.js';

const router = express.Router();

// User routes
router.post('/', protect, createReport);

// Admin routes
router.get('/pending-count', protect, admin, getPendingReportCount);
router.get('/', protect, admin, getReports);
router.put('/:id/status', protect, admin, updateReportStatus);

export default router;
