import { z } from 'zod';

const numericString = z.coerce.string().regex(/^\d*$/, "Must be a valid positive number");

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(1, 'Account Holder Name is required'),
  accountNumber: z.string().min(1, 'Account Number is required'),
  ifscCode: z.string().min(1, 'IFSC Code is required'),
  bankName: z.string().min(1, 'Bank Name is required'),
});

const pgSchema = z.object({
  propertyType: z.literal('PG'),
  postingAs: z.enum(['Owner', 'Property Manager', 'Agent']),
  city: z.string().min(1, 'City is required'),
  pgPresentIn: z.string().min(1, 'Required'),
  operationalSince: z.coerce.string().regex(/^\d{4}$/, "Must be a valid 4-digit year").min(1, 'Required'),
  pgName: z.string().min(3, 'Name must be at least 3 characters'),
  
  address: z.string().min(5, "Address must be at least 5 characters"),
  locality: z.string().min(2, "Locality is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.coerce.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  landmark: z.string().min(2, "Landmark is required"),
  mapLink: z.string().min(1, "Google Maps Link is required").regex(/^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com)\/.*$/, "Must be a valid Google Maps link"),
  nearbyPlaces: z.array(
    z.object({
      place: z.string().optional().or(z.literal('')),
      distance: z.string().optional().or(z.literal(''))
    })
  ).optional(),

  totalFloorsCount: numericString.optional(),
  floors: z.array(
    z.object({
      floorName: z.string().min(1, "Floor name is required"),
      rooms: z.array(
        z.object({
          roomName: z.string().min(1, "Room name is required"),
          sharingType: z.string(),
          isAC: z.boolean().optional(),
          facilities: z.array(z.string()).optional(),
          extraFacilities: z.array(z.string()).optional(),
          beds: z.array(
            z.object({
              bedName: z.string().min(1, "Bed name is required"),
              status: z.enum(['Vacant', 'Occupied', 'Reserved'])
            })
          ).optional()
        })
      ).optional()
    })
  ).optional(),

  pgPricing: z.object({
    Single_AC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Single_NonAC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Double_AC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Double_NonAC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Triple_AC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Triple_NonAC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Four_AC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Four_NonAC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Other_AC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
    Other_NonAC: z.object({ rentPerBed: z.string().min(1, 'Required'), depositPerBed: z.string().min(1, 'Required') }).optional(),
  }).optional(),

  paymentModel: z.string().min(1, "Payment Model is required"),
  rentalPeriod: z.string().min(1, "Rental Period (Months) is required"),

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

  uspCategory: z.string().optional(),
  uspText: z.string().optional(),
  usps: z.array(z.string()).optional(),
  customUsps: z.array(z.string()).optional(),
  description: z.string().optional(),

  virtualTour: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  photos: z.any().optional(),
  existingImages: z.any().optional(),
  removeImages: z.any().optional(),
  existingDocs: z.any().optional(),
  removeDocs: z.any().optional(),
  verificationDocs: z.array(z.any()).optional(),
  ownerContract: z.any().optional(),
  bankDetails: bankDetailsSchema,
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
  pincode: z.coerce.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  landmark: z.string().min(2, "Landmark is required"),
  mapLink: z.string().min(1, "Google Maps Link is required").regex(/^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com)\/.*$/, "Must be a valid Google Maps link"),
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
  existingImages: z.any().optional(),
  removeImages: z.any().optional(),
  existingDocs: z.any().optional(),
  removeDocs: z.any().optional(),
  verificationDocs: z.array(z.any()).optional(),
  ownerContract: z.any().optional(),
  bankDetails: bankDetailsSchema,
});

export const listPropertySchema = z.discriminatedUnion("propertyType", [
  pgSchema,
  tenantSchema
]).superRefine((data, ctx) => {
  const hasNewDocs = Array.isArray(data.verificationDocs) && data.verificationDocs.length > 0;
  const hasExistingDocs = Array.isArray(data.existingDocs) && data.existingDocs.length > 0;
  
  if (!hasNewDocs && !hasExistingDocs) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one verification document is required",
      path: ["verificationDocs"],
    });
  }

  const numNewPhotos = Array.isArray(data.photos) ? data.photos.length : 0;
  const numExistingPhotos = Array.isArray(data.existingImages) ? data.existingImages.length : 0;
  const numRemovedPhotos = Array.isArray(data.removeImages) ? data.removeImages.length : 0;
  const totalPhotos = numNewPhotos + (numExistingPhotos - numRemovedPhotos);

  if (totalPhotos < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least 2 property images are required",
      path: ["photos"],
    });
  }
});
