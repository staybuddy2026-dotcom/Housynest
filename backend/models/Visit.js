import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Storing as YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // morning, afternoon, evening
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Rescheduled', 'Completed'],
      default: 'Pending',
    },
    suggestedTime: {
      type: String, // populated if owner suggests new time
    }
  },
  { timestamps: true }
);

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
