import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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

  // KYC Docs (from the booking form)
  kycDocs: [{
    docType: String, // e.g., 'Aadhar Card', 'PAN Card'
    docNumber: String,
    url: String,
    public_id: String
  }],

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

export default mongoose.model('Booking', bookingSchema);
