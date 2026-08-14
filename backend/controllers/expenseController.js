import Expense from '../models/Expense.js';

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private (Owner)
export const addExpense = async (req, res) => {
  try {
    const { propertyId, category, amount, date, description, receiptUrl } = req.body;

    const expense = new Expense({
      ownerId: req.user.id,
      propertyId,
      category,
      amount,
      date,
      description,
      receiptUrl
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expenses by property
// @route   GET /api/expenses/property/:propertyId
// @access  Private (Owner)
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      ownerId: req.user.id,
      propertyId: req.params.propertyId
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private (Owner)
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
