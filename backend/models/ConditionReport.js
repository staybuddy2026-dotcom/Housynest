import mongoose from 'mongoose';

const conditionReportSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Move-In', 'Move-Out'],
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Completed'],
    default: 'Draft'
  },
  items: [{
    name: { type: String, required: true }, // e.g. "Bed", "Mattress", "Walls"
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'], default: 'Good' },
    notes: { type: String },
    photoUrl: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('ConditionReport', conditionReportSchema);
