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
    rentAmount: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    extraCharges: { type: Number, default: 0 },
    housynestFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: String,
    paymentMethod: String,
    paidAt: Date
  },

  // Move-in & Escrow Payout
  tenantConfirmedMoveIn: {
    type: Boolean,
    default: false
  },
  moveInConfirmedAt: Date,
  payoutStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid'],
    default: 'Pending'
  },

  // Move-out / Checkout tracking
  moveOutRequest: {
    isRequested: { type: Boolean, default: false },
    requestedAt: Date,
    intendedMoveOutDate: Date,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
    rejectionReason: String,
    deductions: { type: Number, default: 0 },
    reason: String
  },

  // E-Sign and E-Stamp Tracking (Aadhaar Flow)
  tenantConsentStatus: {
    type: String,
    enum: ['Pending', 'Consented'],
    default: 'Pending'
  },
  ownerConsentStatus: {
    type: String,
    enum: ['Pending', 'Consented'],
    default: 'Pending'
  },
  eStampStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  eStampId: String,
  eSignStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  finalDocumentUrl: String

}, { timestamps: true });

bookingSchema.pre('save', function() {
  if (!this.bookingId) {
    this.bookingId = 'BKG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
});

bookingSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.propertyId && doc.roomDetails && doc.roomDetails.roomName && doc.roomDetails.bedName) {
    try {
      const Property = mongoose.model('Property');
      const property = await Property.findById(doc.propertyId);
      if (!property || property.propertyType !== 'PG') return;

      const activeBookings = await mongoose.model('Booking').find({
        propertyId: doc.propertyId,
        'roomDetails.roomName': doc.roomDetails.roomName,
        'roomDetails.bedName': doc.roomDetails.bedName,
        status: { $in: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });

      let bedStatus = 'Vacant';
      const hasOccupied = activeBookings.some(b => ['Confirmed', 'Active'].includes(b.status));
      const hasReserved = activeBookings.some(b => ['Pending Request', 'Pending Payment', 'Reserved'].includes(b.status));

      if (hasOccupied) {
        bedStatus = 'Occupied';
      } else if (hasReserved) {
        bedStatus = 'Reserved';
      }

      let bedFound = false;
      for (const floor of property.floors) {
        if (bedFound) break;
        const room = floor.rooms.find(r => r.roomName === doc.roomDetails.roomName);
        if (room) {
          const bed = room.beds.find(b => b.bedName === doc.roomDetails.bedName);
          if (bed) {
            if (bed.status !== 'Maintenance') {
              bed.status = bedStatus;
            }
            bedFound = true;
          }
        }
      }

      if (bedFound) {
        await property.save();
      }
    } catch (err) {
      console.error('Error updating bed status after booking deletion:', err);
    }
  }
});

export default mongoose.model('Booking', bookingSchema);
