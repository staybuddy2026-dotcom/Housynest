import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  category: {
    type: String,
    enum: ['Repairs', 'Taxes', 'Utility', 'Maintenance', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  receiptUrl: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
