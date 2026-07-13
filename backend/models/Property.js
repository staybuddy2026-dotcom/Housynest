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

  // PG Rooms
  rooms: [{
    sharingType: String,
    totalBeds: String,
    availableBeds: String,
    rentPerBed: String,
    depositPerBed: String,
    facilities: [String],
    extraFacilities: [String]
  }],

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
  gateClosingTime: String,

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
  inquiries: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Property', propertySchema);
