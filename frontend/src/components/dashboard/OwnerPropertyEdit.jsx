import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listPropertySchema } from '../../lib/validations/listPropertySchema';
import toast from 'react-hot-toast';

import StepperSidebar from '../list-property/StepperSidebar';
import PropertyPreview from '../list-property/PropertyPreview';

// Step Components
import PgBasicDetails from '../list-property/PgBasicDetails';
import PgPropertyDetails from '../list-property/PgPropertyDetails';
import PgRoomOptions from '../list-property/PgRoomOptions';
import PgBooking from '../list-property/PgBooking';
import PgAmenities from '../list-property/PgAmenities';
import PgServices from '../list-property/PgServices';
import PgRulesPolicies from '../list-property/PgRulesPolicies';
import PgPhotos from '../list-property/PgPhotos';
import TenantPropertyDetails from '../list-property/TenantPropertyDetails';
import TenantPricingPreferences from '../list-property/TenantPricingPreferences';
import TenantAdditionalDetails from '../list-property/TenantAdditionalDetails';
import TenantAmenities from '../list-property/TenantAmenities';
import OwnerContractStep from '../list-property/OwnerContractStep';

const OwnerPropertyEdit = ({ propertyId, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  const methods = useForm({
    resolver: zodResolver(listPropertySchema),
    mode: 'onChange'
  });

  const { isDirty } = methods.formState;
  const propertyType = methods.watch('propertyType');

  // Prevent page refresh or navigation if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (response.ok) {
          const data = await response.json();
          setOriginalData(data);

          // Map backend data back to form values
          const formValues = {
            propertyType: data.propertyType || 'PG',
            propertyCategory: data.propertyCategory || '',
            societyName: data.societyName || '',
            postingAs: data.postingAs || 'Owner',
            city: data.city || '',
            pgPresentIn: data.pgPresentIn || '',
            operationalSince: data.operationalSince || '',
            pgName: data.pgName || '',
            address: data.address || '',
            locality: data.locality || '',
            state: data.state || '',
            pincode: data.pincode || '',
            landmark: data.landmark || '',
            mapLink: data.mapLink || '',
            nearbyPlaces: (data.nearbyPlaces && data.nearbyPlaces.length > 0) ? data.nearbyPlaces : [{ place: '', distance: '' }],
            buildingName: data.buildingName || '',
            totalFloorsCount: data.totalFloorsCount ? String(data.totalFloorsCount) : '',
            floors: data.floors || [],
            pgPricing: data.pgPricing || {},
            paymentModel: data.paymentModel || '',
            rentalPeriod: data.rentalPeriod || '',
            bookingType: data.bookingType || '',
            services: data.services || [],
            extraServices: data.extraServices || [],
            foodProvided: data.foodProvided || false,
            meals: data.meals || [],
            vegNonVeg: data.vegNonVeg || 'Veg',
            foodCharges: data.foodCharges || '',
            commonAmenities: data.commonAmenities || [],
            extraCommonAmenities: data.extraCommonAmenities || [],
            parking: data.parking || [],
            parkingAvailable: data.parking && data.parking.length > 0,
            preferredGender: data.preferredGender || 'Male',
            tenantPreference: data.tenantPreference || 'Professionals',
            pgRules: data.pgRules || [],
            extraRules: data.extraRules || [],
            noticePeriod: data.noticePeriod || '',
            uspCategory: data.uspCategory || '',
            uspText: data.uspText || '',
            usps: data.usps || [],
            customUsps: data.customUsps || [],
            description: data.description || '',
            virtualTour: data.virtualTour || '',

            numberOfVillas: data.numberOfVillas || '',
            bhkType: data.bhkType || '',
            bathrooms: data.bathrooms || '',
            balconies: data.balconies || '',
            furnishingStatus: data.furnishingStatus || '',
            builtUpArea: data.builtUpArea || '',
            carpetArea: data.carpetArea || '',
            totalFloors: data.totalFloors || '',
            propertyOnFloor: data.propertyOnFloor || '',
            ageOfProperty: data.ageOfProperty || '',
            monthlyRent: data.monthlyRent || '',
            maxPeople: data.maxPeople || '',
            securityAmount: data.securityAmount || '',
            maintenanceCharges: data.maintenanceCharges || '',
            maintenancePeriod: data.maintenancePeriod || '',
            availableFromType: data.availableFromType || 'Immediately',
            availableDate: data.availableDate || '',
            additionalRooms: data.additionalRooms || [],
            overlooking: data.overlooking || [],
            facing: data.facing || '',
            societyAmenities: data.societyAmenities || [],
            preferredTenants: data.preferredTenants || [],
            localityDescription: data.localityDescription || '',

            existingImages: data.images || [],
            existingDocs: data.verificationDocs || [],
            ownerContract: data.ownerContract || null,
            bankDetails: {
              accountHolderName: data.bankDetails?.accountHolderName || 'N/A',
              accountNumber: data.bankDetails?.accountNumber || 'N/A',
              ifscCode: data.bankDetails?.ifscCode || 'N/A',
              bankName: data.bankDetails?.bankName || 'N/A'
            },
            photos: [],
            verificationDocs: [],
            removeImages: [],
            removeDocs: []
          };

          methods.reset(formValues);
        } else {
          toast.error('Failed to fetch property details');
          onClose();
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Error loading property details');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, methods, onClose]);

  // Scroll to top when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const formContainer = document.getElementById('edit-form-container');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeStep]);

  const handleNext = async () => {
    let fieldsToValidate = [];
    const pType = methods.getValues('propertyType');

    if (activeStep === 1) {
      fieldsToValidate = ['propertyType', 'postingAs', ...(pType === 'PG' ? ['pgPresentIn', 'operationalSince', 'pgName', 'preferredGender', 'tenantPreference', 'city'] : ['propertyCategory', 'societyName', 'city'])];
    } else if (activeStep === 2) {
      if (pType === 'PG') fieldsToValidate = ['address', 'locality', 'state', 'pincode', 'landmark', 'mapLink'];
      else fieldsToValidate = ['address', 'locality', 'state', 'pincode', 'landmark', 'mapLink', 'bhkType', 'bathrooms', 'balconies', 'furnishingStatus', 'builtUpArea', 'carpetArea', 'totalFloors', 'propertyOnFloor', 'ageOfProperty'];
    } else if (activeStep === 3) {
      if (pType === 'PG') fieldsToValidate = ['totalFloorsCount', 'floors', 'pgPricing'];
      else fieldsToValidate = ['monthlyRent', 'maxPeople', 'securityAmount', 'maintenanceCharges', 'maintenancePeriod', 'availableFromType', 'availableDate'];
    } else if (activeStep === 4) {
      if (pType === 'PG') fieldsToValidate = ['paymentModel', 'rentalPeriod', 'noticePeriod', 'bookingType'];
      else fieldsToValidate = ['additionalRooms', 'overlooking', 'facing', 'nearbyPlaces'];
    } else if (activeStep === 5) {
      if (pType === 'PG') fieldsToValidate = ['commonAmenities', 'extraCommonAmenities', 'parking'];
      else fieldsToValidate = ['societyAmenities'];
    } else if (activeStep === 6) {
      if (pType === 'PG') fieldsToValidate = ['services', 'extraServices', 'foodProvided', 'meals', 'vegNonVeg', 'foodCharges'];
      else fieldsToValidate = ['virtualTour'];
    } else if (activeStep === 7) {
      if (pType === 'PG') fieldsToValidate = ['pgRules', 'extraRules', 'nearbyPlaces'];
    } else if (activeStep === 8) {
      if (pType === 'PG') fieldsToValidate = ['virtualTour'];
    }

    const isStepValid = await methods.trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep(prev => Math.min(prev + 1, pType === 'Tenant' ? 7 : 9));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login first to edit a property');
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();

      Object.keys(data).forEach(key => {
        if (key === 'photos' || key === 'verificationDocs' || key === 'ownerContract' || key === 'existingImages' || key === 'existingDocs' || key === 'removeImages' || key === 'removeDocs') return;

        if (data[key] === '') return;

        if (Array.isArray(data[key]) || typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Handle new photos
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach(photo => {
          if (photo.file) {
            formData.append('images', photo.file);
          }
        });
      }

      // Handle new docs
      if (data.verificationDocs && data.verificationDocs.length > 0) {
        data.verificationDocs.forEach(doc => {
          if (doc.file) {
            formData.append('documents', doc.file);
          }
        });
      }

      // Handle owner contract PDF
      if (data.ownerContract && data.ownerContract.file) {
        formData.append('ownerContract', data.ownerContract.file);
      }

      // Append remove requests
      if (data.removeImages && data.removeImages.length > 0) {
        formData.append('removeImages', JSON.stringify(data.removeImages));
      }
      if (data.removeDocs && data.removeDocs.length > 0) {
        formData.append('removeDocs', JSON.stringify(data.removeDocs));
      }

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Property updated successfully!');
        onClose(true); // pass true to indicate it was updated, so we can refresh the list
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update property: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error('An error occurred while updating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors) => {
    console.error("Form Validation Errors:", errors);
    toast.error('Please fix the highlighted errors');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1: return <PgBasicDetails onNext={handleNext} isEditMode={true} />;
      case 2: return propertyType === 'Tenant' ? <TenantPropertyDetails onNext={handleNext} onPrev={handlePrev} /> : <PgPropertyDetails onNext={handleNext} onPrev={handlePrev} />;
      case 3: return propertyType === 'Tenant' ? <TenantPricingPreferences onNext={handleNext} onPrev={handlePrev} /> : <PgRoomOptions onNext={handleNext} onPrev={handlePrev} />;
      case 4: return propertyType === 'Tenant' ? <TenantAdditionalDetails onNext={handleNext} onPrev={handlePrev} /> : <PgBooking onNext={handleNext} onPrev={handlePrev} />;
      case 5: return propertyType === 'Tenant' ? <TenantAmenities onNext={handleNext} onPrev={handlePrev} /> : <PgAmenities onNext={handleNext} onPrev={handlePrev} />;
      case 6: return propertyType === 'Tenant' ? <PgPhotos onNext={handleNext} onPrev={handlePrev} isEditMode={true} /> : <PgServices onNext={handleNext} onPrev={handlePrev} />;
      case 7: return propertyType === 'Tenant' ? <OwnerContractStep onNext={methods.handleSubmit(onSubmit, onError)} onPrev={handlePrev} isSubmitting={isSubmitting} /> : <PgRulesPolicies onNext={handleNext} onPrev={handlePrev} />;
      case 8: return propertyType === 'Tenant' ? null : <PgPhotos onNext={handleNext} onPrev={handlePrev} isEditMode={true} />;
      case 9: return propertyType === 'Tenant' ? null : <OwnerContractStep onNext={methods.handleSubmit(onSubmit, onError)} onPrev={handlePrev} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="edit-form-container">
      {/* Header */}
      <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-slate-50/90">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26]">Edit Property</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Update the details for this listing</p>
        </div>
        <button
          onClick={() => {
            if (isDirty) {
              if (window.confirm('You have unsaved changes. Are you sure you want to discard them and leave?')) {
                onClose();
              }
            } else {
              onClose();
            }
          }}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
        >
          <Icon icon="lucide:x" className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 sm:p-6">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 sm:gap-6 items-center">

            {/* Top Stepper */}
            <div className="w-full max-w-7xl">
              <StepperSidebar activeStep={activeStep} propertyType={propertyType} layout="horizontal" />
            </div>

            {/* Form Content */}
            <div className="w-full max-w-7xl">
              {renderStepContent()}
            </div>

          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default OwnerPropertyEdit;
