import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listPropertySchema } from '../lib/validations/listPropertySchema';
import toast from 'react-hot-toast';

import StepperSidebar from '../components/list-property/StepperSidebar';
import PropertyPreview from '../components/list-property/PropertyPreview';
import aboutmain from '../assets/aboutmain.png';

// Step Components
import PgBasicDetails from '../components/list-property/PgBasicDetails';
import PgPropertyDetails from '../components/list-property/PgPropertyDetails';
import PgRoomOptions from '../components/list-property/PgRoomOptions';
import PgAmenities from '../components/list-property/PgAmenities';
import PgRulesPolicies from '../components/list-property/PgRulesPolicies';
import PgPhotos from '../components/list-property/PgPhotos';
import PgVerifyProperty from '../components/list-property/PgVerifyProperty';
import TenantPropertyDetails from '../components/list-property/TenantPropertyDetails';
import TenantPricingPreferences from '../components/list-property/TenantPricingPreferences';

const ListProperty = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm({
    resolver: zodResolver(listPropertySchema),
    mode: 'onChange',
    defaultValues: {
      propertyType: 'PG', // 'PG' or 'Tenant'
      propertyCategory: 'Villa',
      societyName: '',
      postingAs: 'Owner',
      city: '',
      pgPresentIn: 'An Independent Building',
      operationalSince: '',
      pgName: '',
      address: '',
      locality: '',
      state: '',
      pincode: '',
      landmark: '',
      mapLink: '',
      nearbyPlaces: [],
      rooms: [
        {
          sharingType: 'Single',
          totalBeds: '',
          availableBeds: '',
          rentPerBed: '',
          depositPerBed: '',
          facilities: [],
          extraFacilities: []
        }
      ],
      services: [],
      extraServices: [],
      foodProvided: false,
      meals: [],
      vegNonVeg: 'Veg',
      foodCharges: '',
      commonAmenities: [],
      extraCommonAmenities: [],
      parking: [],
      preferredGender: 'Male',
      tenantPreference: 'Professionals',
      pgRules: [],
      extraRules: [],
      noticePeriod: '',
      gateClosingTime: '',
      uspCategory: '',
      uspText: '',
      description: '',
      virtualTour: '',

      bhkType: '',
      bathrooms: '',
      balconies: '',
      furnishingStatus: '',
      builtUpArea: '',
      carpetArea: '',
      totalFloors: '',
      propertyOnFloor: '',
      ageOfProperty: '',
      monthlyRent: '',
      maxPeople: '',
      securityAmount: '',
      maintenanceCharges: '',
      maintenancePeriod: '',
      availableFromType: 'Immediately',
      availableDate: '',
      additionalRooms: [],
      overlooking: [],
      facing: '',
      societyAmenities: [],
      preferredTenants: [],
      localityDescription: '',
    }
  });

  const propertyType = methods.watch('propertyType');

  // Scroll to top when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const formContainer = document.getElementById('form-container');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeStep]);

  // Redirect after successful submission
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  const handleNext = async () => {
    // Determine which fields to validate based on active step and propertyType
    let fieldsToValidate = [];
    const pType = methods.getValues('propertyType');

    if (activeStep === 1) {
      fieldsToValidate = ['propertyType', 'postingAs', 'city', ...(pType === 'PG' ? ['pgPresentIn', 'operationalSince', 'pgName'] : ['propertyCategory', 'societyName'])];
    } else if (activeStep === 2) {
      if (pType === 'PG') fieldsToValidate = ['address', 'locality', 'state', 'pincode', 'landmark', 'mapLink', 'nearbyPlaces'];
      else fieldsToValidate = ['address', 'locality', 'state', 'pincode', 'landmark', 'mapLink', 'nearbyPlaces', 'bhkType', 'bathrooms', 'balconies', 'furnishingStatus', 'builtUpArea', 'carpetArea', 'totalFloors', 'propertyOnFloor', 'ageOfProperty'];
    } else if (activeStep === 3) {
      if (pType === 'PG') fieldsToValidate = ['rooms'];
      else fieldsToValidate = ['monthlyRent', 'maxPeople', 'securityAmount', 'maintenanceCharges', 'maintenancePeriod', 'availableFromType', 'availableDate', 'additionalRooms', 'overlooking', 'facing', 'societyAmenities', 'preferredTenants', 'localityDescription'];
    } else if (activeStep === 4) {
      if (pType === 'PG') fieldsToValidate = ['services', 'extraServices', 'foodProvided', 'meals', 'vegNonVeg', 'foodCharges', 'commonAmenities', 'extraCommonAmenities', 'parking'];
      else fieldsToValidate = ['virtualTour']; // Photos step for Tenant
    } else if (activeStep === 5) {
      if (pType === 'PG') fieldsToValidate = ['preferredGender', 'tenantPreference', 'pgRules', 'extraRules', 'noticePeriod', 'gateClosingTime'];
      else fieldsToValidate = []; // Verify for Tenant
    } else if (activeStep === 6) {
      if (pType === 'PG') fieldsToValidate = ['virtualTour'];
    }

    const isStepValid = await methods.trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep(prev => Math.min(prev + 1, pType === 'Tenant' ? 5 : 7));
    } else {
      setTimeout(() => {
        // Find all inputs with red borders
        const errorInputs = Array.from(document.querySelectorAll('.border-red-500'));
        // Find all red text spans that are NOT just the required asterisk
        const errorSpans = Array.from(document.querySelectorAll('.text-red-500')).filter(el => el.textContent.trim() !== '*');

        const allErrors = [...errorInputs, ...errorSpans];

        // Filter only visible elements
        const visibleErrors = allErrors.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        // Sort by their absolute vertical position in the document
        visibleErrors.sort((a, b) => {
          const aTop = a.getBoundingClientRect().top + window.pageYOffset;
          const bTop = b.getBoundingClientRect().top + window.pageYOffset;
          return aTop - bTop;
        });

        const targetElement = visibleErrors[0];

        if (targetElement) {
          // The scroll container is the Lenis wrapper or the window
          const scrollContainer = document.querySelector('.overflow-y-auto') || window;
          const isWindow = scrollContainer === window;

          const startPosition = isWindow ? window.pageYOffset : scrollContainer.scrollTop;

          // Calculate target position relative to the scroll container's top
          let targetPosition;
          if (isWindow) {
            targetPosition = targetElement.getBoundingClientRect().top + startPosition - 150;
          } else {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = targetElement.getBoundingClientRect();
            targetPosition = elementRect.top - containerRect.top + startPosition - 150;
          }

          const distance = targetPosition - startPosition;
          const duration = 800; // 800ms for slow and smooth scroll
          let start = null;

          window.requestAnimationFrame(function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const ease = progress < duration / 2
              ? 4 * Math.pow(progress / duration, 3)
              : 1 - Math.pow(-2 * (progress / duration) + 2, 3) / 2;

            if (isWindow) {
              window.scrollTo(0, startPosition + distance * ease);
            } else {
              scrollContainer.scrollTop = startPosition + distance * ease;
            }

            if (progress < duration) {
              window.requestAnimationFrame(step);
            } else {
              // Focus if it's an input
              if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'SELECT') {
                targetElement.focus({ preventScroll: true });
              }
            }
          });
        }
      }, 300);
    }
  };

  const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login first to list a property');
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();

      // Append standard fields
      Object.keys(data).forEach(key => {
        if (key === 'photos' || key === 'verificationDocs') return; // Handled separately

        if (Array.isArray(data[key]) || typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Append images
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach(photo => {
          if (photo.file) {
            formData.append('images', photo.file);
          }
        });
      }

      // Append verification documents
      if (data.verificationDocs && data.verificationDocs.length > 0) {
        data.verificationDocs.forEach(doc => {
          if (doc.file) {
            formData.append('documents', doc.file);
          }
        });
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Property listed successfully!');
      } else {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        let errorMsg = errorData.message;
        if (errorData.details) {
          const missingFields = Object.keys(errorData.details).join(', ');
          errorMsg += ` - Missing/Invalid fields: ${missingFields}`;
        }
        toast.error(`Failed to list property: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      toast.error('An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSuccessScreen = () => (
    <div className="bg-white rounded-xl p-8 lg:p-12 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center h-125 justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 rounded-full bg-[#EAF5F2] text-brand-teal flex items-center justify-center mb-6 shadow-inner">
        <Icon icon="lucide:check" width="48" strokeWidth="3" />
      </div>
      <h2 className="text-[28px] lg:text-3xl font-extrabold text-[#062F26] mb-3">Submitted Successfully!</h2>
      <p className="text-slate-600 font-medium mb-8">Your property is under review.</p>

      <div className="bg-[#FFFDF0] border border-[#FBE38E] rounded-xl p-6 text-left max-w-md w-full shadow-sm mb-8 transition-all hover:shadow-md">
        <h4 className="font-bold text-[#806B1A] mb-3 text-[15px]">What happens next?</h4>
        <ul className="text-sm text-[#A68A22] font-semibold flex flex-col gap-3">
          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#D4B22B] shadow-[0_0_8px_#D4B22B]"></span>Our team will review your listing.</li>
          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#D4B22B] shadow-[0_0_8px_#D4B22B]"></span>Once approved, it will be visible on the website.</li>
          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#D4B22B] shadow-[0_0_8px_#D4B22B]"></span>You can track the status in your dashboard.</li>
        </ul>
      </div>

      <div className="flex items-center gap-2.5 text-sm font-bold text-slate-400">
        <Icon icon="lucide:loader-2" className="animate-spin text-brand-teal" width="18" />
        Redirecting to home page...
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 1: return <PgBasicDetails onNext={handleNext} />;
      case 2: return propertyType === 'Tenant' ? <TenantPropertyDetails onNext={handleNext} onPrev={handlePrev} /> : <PgPropertyDetails onNext={handleNext} onPrev={handlePrev} />;
      case 3: return propertyType === 'Tenant' ? <TenantPricingPreferences onNext={handleNext} onPrev={handlePrev} /> : <PgRoomOptions onNext={handleNext} onPrev={handlePrev} />;
      case 4: return propertyType === 'Tenant' ? <PgPhotos onNext={handleNext} onPrev={handlePrev} /> : <PgAmenities onNext={handleNext} onPrev={handlePrev} />;
      case 5: return propertyType === 'Tenant' ? <PgVerifyProperty onNext={methods.handleSubmit(onSubmit)} onPrev={handlePrev} isSubmitting={isSubmitting} /> : <PgRulesPolicies onNext={handleNext} onPrev={handlePrev} />;
      case 6: return propertyType === 'Tenant' ? null : <PgPhotos onNext={handleNext} onPrev={handlePrev} />;
      case 7: return propertyType === 'Tenant' ? null : <PgVerifyProperty onNext={methods.handleSubmit(onSubmit)} onPrev={handlePrev} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
      {/* Hero Section */}
      <div className="relative w-full h-60 lg:h-70">
        <img src={aboutmain} alt="Hero" className="w-full h-full object-cover brightness-[0.85] opacity-90" />
        <div className="absolute inset-0 bg-linear-to-b from-[#F8F9FA]/5 via-[#F8F9FA]/10 to-[#F8F9FA]"></div>
        <div className="absolute inset-0 pt-10 px-4 sm:px-6 lg:px-8 xl:px-20">
          <div className="max-w-340 3xl:max-w-420 mx-auto ml-1 lg:ml-0 xl:ml-3">
            <div className="flex items-center text-xs font-semibold text-brand-teal mb-4">
              <Link to="/" className="hover:underline cursor-pointer">Home</Link>
              <Icon icon="lucide:chevron-right" className="mx-1 w-3 h-3 text-slate-400" />
              <span className="text-slate-600">List Property</span>
            </div>
            <h1 className="text-3xl lg:text-[40px] font-serif font-bold text-[#062F26] leading-tight mb-2">List Your PG / Property</h1>
            <p className="text-slate-600 text-[15px] font-medium">Provide accurate details to get more visibility and faster responses</p>
          </div>
        </div>
      </div>

      <div id="form-container" className="max-w-340 3xl:max-w-420 mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 -mt-6 sm:-mt-10 lg:-mt-16 relative z-10 scroll-mt-24 sm:scroll-mt-28">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col lg:flex-row gap-4 items-start">

            {/* Left Column - Stepper */}
            <div className="w-full lg:w-75 shrink-0 lg:sticky lg:top-25">
              <StepperSidebar activeStep={activeStep} propertyType={propertyType} />
            </div>

            {/* Middle Column - Form Content */}
            <div className="flex-1 w-full min-w-0">
              {isSubmitted ? renderSuccessScreen() : renderStepContent()}
            </div>

            {/* Right Column - Live Preview */}
            <div className="w-full lg:w-[320px] xl:w-90 shrink-0 hidden lg:block">
              <PropertyPreview />
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ListProperty;
