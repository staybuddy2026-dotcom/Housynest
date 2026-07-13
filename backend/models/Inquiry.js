import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
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
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  moveInDate: {
    type: Date,
  },
  occupants: {
    type: String,
  },
  gender: {
    type: String,
  },
  contactMethod: {
    type: String,
  },
  subject: {
    type: String,
  },
  agreedToShareDetails: {
    type: Boolean,
    required: true,
    default: false
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Discussion', 'Closed'],
    default: 'New'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);
