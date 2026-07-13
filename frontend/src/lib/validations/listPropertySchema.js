import { z } from 'zod';

const numericString = z.string().regex(/^\d+$/, "Must be a valid positive number");

const pgSchema = z.object({
  propertyType: z.literal('PG'),
  postingAs: z.enum(['Owner', 'Property Manager', 'Agent']),
  city: z.string().min(1, 'City is required'),
  pgPresentIn: z.string().min(1, 'Required'),
  operationalSince: z.string().regex(/^\d{4}$/, "Must be a valid 4-digit year").min(1, 'Required'),
  pgName: z.string().min(3, 'Name must be at least 3 characters'),
  
  address: z.string().min(5, "Address must be at least 5 characters"),
  locality: z.string().min(2, "Locality is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  landmark: z.string().min(2, "Landmark is required"),
  mapLink: z.string().regex(/^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com)\/.*$/, "Must be a valid Google Maps link").optional().or(z.literal('')),
  nearbyPlaces: z.array(
    z.object({
      place: z.string().min(1, "Required"),
      distance: z.string().min(1, "Required")
    })
  ).optional(),

  rooms: z.array(
    z.object({
      sharingType: z.string(),
      totalBeds: numericString.min(1, "Required"),
      availableBeds: numericString.min(1, "Required"),
      rentPerBed: numericString.min(1, "Required"),
      depositPerBed: numericString.min(1, "Required"),
      facilities: z.array(z.string()).optional(),
      extraFacilities: z.array(z.string()).optional()
    })
  ).min(1, "At least one room is required"),

  services: z.array(z.string()).optional(),
  extraServices: z.array(z.string()).optional(),
  foodProvided: z.boolean().optional(),
  meals: z.array(z.string()).optional(),
  vegNonVeg: z.string().optional(),
  foodCharges: z.string().optional(),
  commonAmenities: z.array(z.string()).optional(),
  extraCommonAmenities: z.array(z.string()).optional(),
  parking: z.array(z.string()).optional(),

  preferredGender: z.string().min(1, "Required"),
  tenantPreference: z.string().min(1, "Required"),
  pgRules: z.array(z.string()).optional(),
  extraRules: z.array(z.string()).optional(),
  noticePeriod: z.string().min(1, "Notice Period is required"),
  gateClosingTime: z.string().min(1, "Required"),

  uspCategory: z.string().optional(),
  uspText: z.string().optional(),
  usps: z.array(z.string()).optional(),
  customUsps: z.array(z.string()).optional(),
  description: z.string().optional(),

  virtualTour: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  photos: z.any().optional(),
  verificationDocs: z.any().optional(),
});

const tenantSchema = z.object({
  propertyType: z.literal('Tenant'),
  postingAs: z.enum(['Owner', 'Property Manager', 'Agent']),
  city: z.string().min(1, 'City is required'),
  propertyCategory: z.string().min(1, 'Required'),
  societyName: z.string().min(1, "Society / Project Name is required"),
  
  address: z.string().min(5, "Address must be at least 5 characters"),
  locality: z.string().min(2, "Locality is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  landmark: z.string().min(2, "Landmark is required"),
  mapLink: z.string().regex(/^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com)\/.*$/, "Must be a valid Google Maps link").optional().or(z.literal('')),
  nearbyPlaces: z.array(z.any()).optional(),

  bhkType: z.string().min(1, "Required"),
  bathrooms: z.string().optional(),
  balconies: z.string().optional(),
  furnishingStatus: z.string().optional(),
  builtUpArea: numericString.optional().or(z.literal('')),
  carpetArea: numericString.optional().or(z.literal('')),
  totalFloors: z.string().optional(),
  propertyOnFloor: z.string().optional(),
  ageOfProperty: z.string().optional(),

  monthlyRent: numericString.min(1, "Required"),
  maxPeople: numericString.optional().or(z.literal('')),
  securityAmount: numericString.optional().or(z.literal('')),
  maintenanceCharges: numericString.optional().or(z.literal('')),
  maintenancePeriod: z.string().optional(),
  availableFromType: z.string().min(1, "Required"),
  availableDate: z.string().optional(),
  additionalRooms: z.array(z.string()).optional(),
  overlooking: z.array(z.string()).optional(),
  facing: z.string().optional(),
  societyAmenities: z.array(z.string()).optional(),
  preferredTenants: z.array(z.string()).optional(),
  localityDescription: z.string().optional(),

  uspCategory: z.string().optional(),
  uspText: z.string().optional(),
  usps: z.array(z.string()).optional(),
  customUsps: z.array(z.string()).optional(),
  description: z.string().optional(),

  virtualTour: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  photos: z.any().optional(),
  verificationDocs: z.any().optional(),
});

export const listPropertySchema = z.discriminatedUnion("propertyType", [
  pgSchema,
  tenantSchema
]);
