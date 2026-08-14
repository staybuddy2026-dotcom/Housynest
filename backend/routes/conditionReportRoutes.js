import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getConditionReportsByBooking, createConditionReport, updateConditionReport } from '../controllers/conditionReportController.js';

const router = express.Router();

router.get('/booking/:bookingId', protect, getConditionReportsByBooking);
router.post('/', protect, authorize('owner'), createConditionReport);
router.put('/:id', protect, authorize('owner'), updateConditionReport);

export default router;
