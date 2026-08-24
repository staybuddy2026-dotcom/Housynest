import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: {
    type: String,
    enum: ['PG', 'Tenant'],
    required: true
  },
  propertyCategory: String,
  societyName: String,
  postingAs: String,
  
  // Basic Address Details
  city: String,
  address: String,
  locality: String,
  state: String,
  pincode: String,
  landmark: String,
  mapLink: String,
  nearbyPlaces: [mongoose.Schema.Types.Mixed],
  
  // PG Specific Basic Details
  pgPresentIn: String,
  operationalSince: String,
  pgName: String,

  // PG Rooms (Hierarchical Structure)
  totalFloorsCount: Number,
  floors: [{
    floorName: String,
    rooms: [{
      roomName: String,
      sharingType: String,
      isAC: { type: Boolean, default: false },
      facilities: [String],
      extraFacilities: [String],
      beds: [{
        bedName: String,
        status: {
          type: String,
          enum: ['Vacant', 'Occupied', 'Reserved'],
          default: 'Vacant'
        }
      }]
    }]
  }],

  // PG Pricing by Sharing Type
  pgPricing: {
    Single_AC: { rentPerBed: String, depositPerBed: String },
    Single_NonAC: { rentPerBed: String, depositPerBed: String },
    Double_AC: { rentPerBed: String, depositPerBed: String },
    Double_NonAC: { rentPerBed: String, depositPerBed: String },
    Triple_AC: { rentPerBed: String, depositPerBed: String },
    Triple_NonAC: { rentPerBed: String, depositPerBed: String },
    Four_AC: { rentPerBed: String, depositPerBed: String },
    Four_NonAC: { rentPerBed: String, depositPerBed: String },
    Other_AC: { rentPerBed: String, depositPerBed: String },
    Other_NonAC: { rentPerBed: String, depositPerBed: String }
  },

  // PG Booking Configuration
  paymentModel: String,
  rentalPeriod: String,


  // PG Amenities
  services: [String],
  extraServices: [String],
  foodProvided: Boolean,
  meals: [String],
  vegNonVeg: String,
  foodCharges: String,
  commonAmenities: [String],
  extraCommonAmenities: [String],
  parking: [String],

  // PG Rules & Policies
  preferredGender: String,
  tenantPreference: String,
  pgRules: [String],
  extraRules: [String],
  noticePeriod: String,

  // Tenant Specific Property Details
  bhkType: String,
  bathrooms: String,
  balconies: String,
  furnishingStatus: String,
  builtUpArea: String,
  carpetArea: String,
  totalFloors: String,
  propertyOnFloor: String,
  ageOfProperty: String,

  // Tenant Pricing & Preferences
  monthlyRent: String,
  maxPeople: String,
  securityAmount: String,
  maintenanceCharges: String,
  maintenancePeriod: String,
  availableFromType: String,
  availableDate: String,
  additionalRooms: [String],
  overlooking: [String],
  facing: String,
  societyAmenities: [String],
  preferredTenants: [String],
  localityDescription: String,
  
  // Common
  uspCategory: String,
  uspText: String,
  usps: [String],
  customUsps: [String],
  description: String,
  virtualTour: String,

  // Images uploaded to Cloudinary
  images: [{
    url: String,
    public_id: String
  }],
  
  // Verification documents
  verificationDocs: [{
    url: String,
    public_id: String
  }],

  // Owner contract customized text
  ownerContract: {
    mode: { type: String, enum: ['customize', 'upload'], default: 'customize' },
    contractTextEn: String,
    contractTextGu: String,
    termsAndConditions: [{
      titleEn: String,
      descriptionEn: String,
      titleGu: String,
      descriptionGu: String
    }]
  },

  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Inactive', 'Active'],
    default: 'Pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  views: {
    type: Number,
    default: 0
  },
  leads: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Cascade delete related data when a property is deleted
propertySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const propertyId = this._id;

    // 1. Delete all leads for this property, and their associated messages
    const leads = await mongoose.model('Lead').find({ propertyId });
    for (const inq of leads) {
      await mongoose.model('Message').deleteMany({ leadId: inq._id });
    }
    await mongoose.model('Lead').deleteMany({ propertyId });

    // 2. Delete all visits for this property
    await mongoose.model('Visit').deleteMany({ property: propertyId });

    // 3. Delete all reviews for this property
    await mongoose.model('Review').deleteMany({ property: propertyId });

    // 4. Delete all reports for this property
    await mongoose.model('Report').deleteMany({ propertyId });

    // 5. Delete waitlist entries for this property
    await mongoose.model('Waitlist').deleteMany({ propertyId });

    // 6. Delete all bookings for this property
    await mongoose.model('Booking').deleteMany({ propertyId });

    // 7. Delete all rent invoices for this property
    await mongoose.model('RentInvoice').deleteMany({ propertyId });

    // 8. Delete all maintenance tickets for this property
    await mongoose.model('MaintenanceTicket').deleteMany({ propertyId });

    // 9. Delete all condition reports for this property
    await mongoose.model('ConditionReport').deleteMany({ propertyId });

    // 10. Remove property from all users' savedProperties and listedProperties
    await mongoose.model('User').updateMany(
      { savedProperties: propertyId },
      { $pull: { savedProperties: propertyId } }
    );
    await mongoose.model('User').updateMany(
      { listedProperties: propertyId },
      { $pull: { listedProperties: propertyId } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Property', propertySchema);
