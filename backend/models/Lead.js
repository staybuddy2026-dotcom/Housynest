import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    ownerName: {
      type: String,
      default: '',
    },
    pgName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Interested', 'Not Interested', 'Listed'],
      default: 'Interested',
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
