import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_OWNER_REVIEW', 'REVISION_REQUIRED', 'OWNER_SIGNED', 'PENDING_TENANT_REVIEW', 'TENANT_SIGNED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    isOwnerRead: {
      type: Boolean,
      default: false,
    },
    isTenantRead: {
      type: Boolean,
      default: false,
    },
    propertyAddress: { type: String },
    tenantName: { type: String },
    tenantEmail: { type: String },
    tenantPhone: { type: String },
    monthlyRent: { type: Number },
    securityDeposit: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    leaseDuration: { type: String },
    noticePeriod: { type: String },
    terms: { type: String },
    policies: { type: String },
    
    // Workflow tracking
    revisionNote: { type: String },
    ownerSignature: { type: String },
    ownerSignedAt: { type: Date },
    tenantSignature: { type: String },
    tenantSignToken: { type: String },
    tenantSignedAt: { type: Date },

    isReadByOwner: { type: Boolean, default: false },
    isReadByTenant: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
