import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { addExpense, getExpenses, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/', protect, authorize('owner'), addExpense);
router.get('/property/:propertyId', protect, authorize('owner'), getExpenses);
router.delete('/:id', protect, authorize('owner'), deleteExpense);

export default router;
