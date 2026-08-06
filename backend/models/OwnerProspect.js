import mongoose from 'mongoose';

const ownerProspectSchema = new mongoose.Schema(
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

const OwnerProspect = mongoose.model('OwnerProspect', ownerProspectSchema);

export default OwnerProspect;
