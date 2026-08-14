import mongoose from 'mongoose';
import crypto from 'crypto';

const maintenanceTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    sparse: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Carpentry', 'Appliance', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Pending'
  },
  photos: [{
    type: String // URLs of uploaded images
  }],
  resolutionNotes: {
    type: String
  },
  cost: {
    type: Number,
    default: 0
  },
  isReadByTenant: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

maintenanceTicketSchema.pre('save', async function() {
  if (!this.ticketId) {
    this.ticketId = 'TKT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
});

export default mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
