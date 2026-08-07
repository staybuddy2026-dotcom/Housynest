import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    sparse: true
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
  status: {
    type: String,
    enum: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Pending Request'
  },
  propertyType: {
    type: String,
    enum: ['PG', 'Tenant'],
  },
  
  // Booking timing details
  moveInDate: {
    type: Date,
    required: true
  },
  expectedMoveOutDate: {
    type: Date,
  },

  // Personal Info (from the booking form)
  personalInfo: {
    firstName: String,
    lastName: String,
    dob: Date,
    gender: String,
    mobileNumber: String,
    whatsappNumber: String,
    email: String,
    institutionName: String
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },

  // Selected Room/Bed (For PGs)
  roomDetails: {
    floorName: String,
    roomName: String,
    bedName: String,
    sharingType: String
  },

  // Payment details (Initial payment for booking)
  paymentDetails: {
    amount: Number,
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: String,
    paymentMethod: String,
    paidAt: Date
  }
}, { timestamps: true });

bookingSchema.pre('save', function() {
  if (!this.bookingId) {
    this.bookingId = 'BKG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
});

export default mongoose.model('Booking', bookingSchema);
