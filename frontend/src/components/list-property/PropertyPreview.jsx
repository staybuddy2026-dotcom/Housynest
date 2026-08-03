import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import heroImg from '../../assets/hero_img.jpg';

const PropertyPreview = ({ activeStep = 1, totalSteps = 9 }) => {
  const { watch } = useFormContext();
  const formData = watch();

  const isPg = formData.propertyType === 'PG';

  // Dynamic Title
  const title = isPg
    ? (formData.pgName || 'PG / Hostel Name')
    : (formData.bhkType ? `${formData.bhkType} ${formData.propertyCategory || 'Apartment'}` : (formData.societyName || 'Property Title'));

  // Dynamic Location
  const location = formData.locality || formData.city
    ? `${formData.locality || ''}${formData.locality && formData.city ? ', ' : ''}${formData.city || ''}`
    : 'Location not specified';

  // Dynamic Photo
  const previewPhoto = formData.photos?.[0]?.previewUrl || formData.photos?.[0]?.url || heroImg;

  // Dynamic Rent Math
  const getPgStartingRent = () => {
    if (!formData.pgPricing) return formData.monthlyRent || '0';
    const prices = Object.values(formData.pgPricing)
      .map(p => Number(p?.rentPerBed))
      .filter(p => !isNaN(p) && p > 0);
    if (prices.length > 0) return Math.min(...prices).toLocaleString('en-IN');
    return formData.monthlyRent || '0';
  };

  const getPgStartingDeposit = () => {
    if (!formData.pgPricing) return formData.securityAmount || '0';
    const deposits = Object.values(formData.pgPricing)
      .map(p => Number(p?.depositPerBed))
      .filter(p => !isNaN(p) && p > 0);
    if (deposits.length > 0) return Math.min(...deposits).toLocaleString('en-IN');
    return formData.securityAmount || getPgStartingRent();
  };

  const rent = isPg ? getPgStartingRent() : (Number(formData.monthlyRent || 0).toLocaleString('en-IN') || '0');
  const deposit = isPg ? getPgStartingDeposit() : (Number(formData.securityAmount || 0).toLocaleString('en-IN') || '0');

  // Dynamic Preferred Tenant / Gender
  const preferred = isPg
    ? (formData.preferredGender || 'Anyone')
    : (Array.isArray(formData.preferredTenants) && formData.preferredTenants.length > 0 ? formData.preferredTenants.join(', ') : 'Anyone');

  // Booking Type & Notice Period
  const bookingType = formData.bookingType || 'Request-Based';
  const noticePeriod = formData.noticePeriod || '30 Days';

  // Owner Contract Status
  const hasContract = Boolean(
    formData.ownerContract?.isCustomized || 
    formData.ownerContract?.url || 
    formData.ownerContract?.file
  );

  // Dynamic Progress Percentage
  const progressPercent = Math.min(100, Math.max(10, Math.round((activeStep / totalSteps) * 100)));

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-100 sticky top-24">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-xs font-extrabold text-[#062F26] uppercase tracking-wider">Live Card Preview</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5F2] text-brand-teal border border-brand-teal/20">
            Real-Time Sync
          </span>
        </div>

        {/* Preview Card Container */}
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-md relative group bg-white transition-all duration-300">
          
          {/* Card Image Banner */}
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              src={previewPhoto}
              alt="Property Live Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>

            {/* Top Overlay Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              <span className="bg-[#062F26] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                {formData.propertyType || 'PG'}
              </span>

              {isPg && formData.preferredGender && (
                <span className="bg-brand-teal text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                  {formData.preferredGender} PG
                </span>
              )}

              {bookingType && (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg shadow-sm">
                  {bookingType}
                </span>
              )}
            </div>

            {/* Image Counter Badge */}
            {formData.photos && formData.photos.length > 0 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Icon icon="lucide:camera" className="w-3 h-3" />
                <span>{formData.photos.length} Photos</span>
              </div>
            )}
          </div>

          {/* Details Body */}
          <div className="p-4 bg-white space-y-3">
            <div>
              <h4 className="text-base font-extrabold text-[#062F26] line-clamp-1">
                {title}
              </h4>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span>{location}</span>
              </p>
            </div>

            {/* Starting Rent Box */}
            <div className="flex justify-between items-end pb-3 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Starting From</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-[#062F26] leading-none">₹{rent}</span>
                  <span className="text-[10px] font-semibold text-slate-400 mb-0.5">/ month</span>
                </div>
              </div>

              {Number(deposit.replace(/,/g, '')) > 0 && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Deposit</p>
                  <span className="text-xs font-bold text-[#062F26]">₹{deposit}</span>
                </div>
              )}
            </div>

            {/* Key Amenities / Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:users" className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Tenant</span>
                  <span className="text-xs font-bold text-[#062F26] truncate">{preferred}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Notice</span>
                  <span className="text-xs font-bold text-[#062F26] truncate">{noticePeriod}</span>
                </div>
              </div>

              {isPg && (
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:utensils" className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Food</span>
                    <span className="text-xs font-bold text-[#062F26] truncate">{formData.foodProvided ? (formData.vegNonVeg || 'Yes') : 'Self Cooking'}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Icon icon="lucide:file-check" className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Agreement</span>
                  <span className="text-xs font-bold text-[#062F26] truncate">{hasContract ? 'Customized ✓' : 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* Amenities Badges Chips */}
            {Array.isArray(formData.commonAmenities) && formData.commonAmenities.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {formData.commonAmenities.slice(0, 3).map((amenity, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                    {amenity}
                  </span>
                ))}
                {formData.commonAmenities.length > 3 && (
                  <span className="px-2 py-0.5 bg-[#EAF5F2] text-brand-teal rounded text-[10px] font-bold">
                    +{formData.commonAmenities.length - 3} more
                  </span>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-5 bg-[#EAF5F2]/70 rounded-xl p-4 border border-brand-teal/20">
          <div className="flex items-center justify-between text-xs font-bold text-[#062F26] mb-2">
            <span>Form Progress</span>
            <span className="text-brand-teal">{progressPercent}% Completed</span>
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
            <div
              className="h-full bg-brand-teal rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyPreview;
