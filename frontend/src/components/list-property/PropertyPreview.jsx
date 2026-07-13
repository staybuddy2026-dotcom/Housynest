import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import heroImg from '../../assets/hero_img.jpg';

const PropertyPreview = () => {
  const { watch } = useFormContext();
  const formData = watch();

  const isPg = formData.propertyType === 'PG';

  // Dynamic fields based on propertyType
  const title = isPg
    ? (formData.pgName || 'PG Name')
    : (formData.bhk ? `${formData.bhk} ${formData.propertyCategory || 'Property'}` : 'Property Title');

  const location = formData.locality
    ? `${formData.locality}${formData.city ? `, ${formData.city}` : ''}`
    : 'Location';

  const rent = isPg
    ? (formData.rooms?.[0]?.rentPerBed || '0')
    : (formData.monthlyRent || '0');

  const deposit = isPg
    ? (formData.rooms?.[0]?.depositPerBed || '0')
    : (formData.securityAmount || '0');

  const preferred = isPg
    ? (formData.preferredGender || 'Any')
    : (formData.preferredTenants?.[0] || 'Any');

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-white rounded-xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 sticky top-24">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Property Preview</h3>

        {/* Preview Card */}
        <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-brand-teal/20 transition-all duration-300">
          {/* Image */}
          <div className="relative h-[200px] overflow-hidden bg-slate-200">
            <img
              src={heroImg}
              alt="Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5 z-10">
              <span className="bg-[#062F26] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm group-hover:-translate-y-0.5 transition-transform duration-300">
                {formData.propertyType || 'PG'}
              </span>
              {isPg && formData.rooms?.[0]?.sharingType && (
                <span className="bg-[#0aa87d] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm group-hover:-translate-y-0.5 transition-transform duration-300 delay-75">
                  {formData.rooms[0].sharingType.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-4 bg-white">
            <h4 className="text-lg font-bold text-[#062F26] mb-1 line-clamp-1">
              {title}
            </h4>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-4 group-hover:text-brand-teal transition-colors duration-300">
              <Icon icon="lucide:map-pin" className="w-3 h-3" />
              <span className="line-clamp-1">
                {location}
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Starting From</p>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold text-[#062F26] leading-none">₹{rent}</span>
                    <span className="text-[10px] font-semibold text-slate-400 mb-0.5">/ mo</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3">
                <div className="flex items-start gap-2">
                  <Icon icon="lucide:users" className="w-4 h-4 text-brand-teal mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred</span>
                    <span className="text-xs font-bold text-[#062F26]">{preferred}</span>
                  </div>
                </div>

                {isPg ? (
                  <div className="flex items-start gap-2">
                    <Icon icon="lucide:utensils" className="w-4 h-4 text-brand-teal mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Food</span>
                      <span className="text-xs font-bold text-[#062F26]">{formData.vegNonVeg || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Icon icon="lucide:sofa" className="w-4 h-4 text-brand-teal mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Furnishing</span>
                      <span className="text-xs font-bold text-[#062F26]">{formData.furnishing || 'N/A'}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Icon icon="lucide:calendar" className="w-4 h-4 text-brand-teal mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                    <span className="text-xs font-bold text-[#062F26]">
                      {!isPg && formData.availableFromType === 'Selected Date' ? (formData.availableDate || 'N/A') : 'Immediately'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Icon icon="lucide:shield-check" className="w-4 h-4 text-brand-teal mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Deposit</span>
                    <span className="text-xs font-bold text-[#062F26]">₹{deposit}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Box */}
        <div className="mt-6 bg-[#F4F9F8] rounded-xl p-4 border border-brand-teal/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-[#EAF5F2] cursor-default">
          <p className="text-sm font-bold text-[#062F26] mb-3">Complete all steps to publish your property</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <div className="h-full bg-brand-teal w-[35%] rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-shimmer -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-teal">In Progress...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPreview;
