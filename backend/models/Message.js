import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-delete messages after 7 days (604800 seconds)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model('Message', messageSchema);
