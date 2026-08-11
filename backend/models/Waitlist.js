import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  roomId: {
    type: String,
    default: null
  },
  sharingType: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Notified', 'Cancelled'],
    default: 'Active'
  },
  notifiedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

waitlistSchema.index({ tenantId: 1, propertyId: 1, roomId: 1, sharingType: 1 }, { unique: true });

export default mongoose.model('Waitlist', waitlistSchema);
