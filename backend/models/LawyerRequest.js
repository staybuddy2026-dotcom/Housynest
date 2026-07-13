import mongoose from 'mongoose';

const lawyerRequestSchema = new mongoose.Schema(
  {
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const LawyerRequest = mongoose.model('LawyerRequest', lawyerRequestSchema);
export default LawyerRequest;
