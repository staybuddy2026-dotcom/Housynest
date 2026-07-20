import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

const InputField = ({ label, required, subtitle, prefix, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">{subtitle}</p>}
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm sm:text-base">
          {prefix}
        </span>
      )}
      <input
        className={`w-full ${prefix ? 'pl-7 sm:pl-8' : 'px-3 sm:px-4'} py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
        {...props}
      />
    </div>
    {error && <span className="text-red-500 text-[10px] sm:text-xs">{error}</span>}
  </div>
);

const CheckboxGrid = ({ label, options, selected, onChange, onAddCustom }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState('');

  return (
    <fieldset className="border border-slate-200 rounded-xl p-4 sm:p-5 pt-3 mt-2 hover:border-slate-300 transition-colors">
      <legend className="text-xs sm:text-sm font-bold text-[#062F26] px-2 ml-2">
        {label}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 mt-1">
        {options.map(opt => (
          <label key={opt} className={`flex items-center justify-between p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${selected.includes(opt) ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-slate-50 hover:shadow-sm'
            }`}>
            <span className={`text-xs sm:text-sm font-semibold ${selected.includes(opt) ? 'text-[#062F26]' : 'text-slate-700'}`}>{opt}</span>
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => {
                const updated = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
                onChange(updated);
              }}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal rounded border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer"
            />
          </label>
        ))}

        {isAdding && (
          <div className="flex gap-2 relative sm:col-span-2 md:col-span-1">
            <input
              autoFocus
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Type new option..."
              className="w-full pl-3 pr-16 py-2.5 sm:py-3 bg-white border border-brand-teal rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newOption.trim()) {
                    onAddCustom(newOption.trim());
                    setNewOption('');
                    setIsAdding(false);
                  }
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewOption('');
                }
              }}
              onBlur={() => {
                setIsAdding(false);
                setNewOption('');
              }}
            />
            {newOption.trim() && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-teal text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#062F26] shadow-sm transition-all duration-200"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent onBlur conflict
                  onAddCustom(newOption.trim());
                  setNewOption('');
                  setIsAdding(false);
                }}
              >
                Add
              </button>
            )}
          </div>
        )}
      </div>
      {onAddCustom && !isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand-teal hover:text-[#062F26] transition-colors"
        >
          <Icon icon="lucide:plus-circle" width="16" /> Add
        </button>
      )}
    </fieldset>
  );
};

const TenantPricingPreferences = ({ onNext, onPrev }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const [customRooms, setCustomRooms] = useState([]);
  const [customOverlooking, setCustomOverlooking] = useState([]);
  const [customAmenities, setCustomAmenities] = useState([]);

  const handleAddCustom = (setter, currentList, value) => {
    if (value && value.trim() && !currentList.includes(value.trim())) {
      setter([...currentList, value.trim()]);
    }
  };

  const availableFromType = watch('availableFromType');
  const additionalRooms = watch('additionalRooms') || [];
  const overlooking = watch('overlooking') || [];
  const societyAmenities = watch('societyAmenities') || [];
  const preferredTenants = watch('preferredTenants') || [];

  const facingOptions = ['East', 'North', 'North-East', 'North-West', 'South', 'South-East', 'South-West', 'West'];
  const defaultAdditionalRooms = ['Pooja Room', 'Servant Room', 'Store', 'Study'];
  const defaultOverlooking = ['Garden/Park', 'Main Road', 'Pool'];
  const defaultSocietyAmenities = [
    'Maintenance Staff', 'Water Supply', 'Power Back Up', 'Private Terrace/Garden', 'RO Water System',
    'Rain Water Harvesting', 'Reserved Parking', 'Security', 'Service/Goods Lift', 'Swimming Pool',
    'Vaastu Compliant', 'Waste Disposal', 'Air Conditioned', 'Banquet Hall', 'Bar/Lounge',
    'Cafeteria/Food Court', 'Club House', 'Conference Room', 'DTH Television Facility', 'Gymnasium',
    'Intercom Facility', 'Internet/Wi-Fi Connectivity', 'Jogging and Strolling Track', 'Laundry Service', 'Lift'
  ];
  const defaultPreferredTenants = ['Couple/Family', 'Vegetarians', 'With Company lease', 'Without Pets'];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth="2.5" />
          </button>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Pricing & Preferences</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Rent, amenities & preferences</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">

        {/* Price you Expect */}
        <fieldset className="border border-slate-200 rounded-xl p-4 sm:p-5 pt-3 hover:border-slate-300 transition-colors">
          <legend className="text-xs sm:text-sm font-bold text-[#062F26] px-2 ml-2">
            Price you Expect
          </legend>
          <div className="flex flex-col gap-3 sm:gap-4 mt-1">
            <InputField label="Monthly Rent" required prefix="₹" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('monthlyRent')} error={errors.monthlyRent?.message} placeholder="Enter Monthly Rent" />
            <InputField label="Max People" subtitle="Maximum number of people allowed in this property" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('maxPeople')} error={errors.maxPeople?.message} placeholder="e.g. 4" />
            <InputField label="Security Amount (Optional)" prefix="₹" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('securityAmount')} error={errors.securityAmount?.message} placeholder="Enter Security Amount" />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
              <div className="flex-1 w-full sm:w-auto">
                <InputField label="Maintenance Charges (Optional)" prefix="₹" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('maintenanceCharges')} error={errors.maintenanceCharges?.message} placeholder="Enter Maintenance" />
              </div>
              <div className="flex-1 relative w-full sm:w-auto">
                <select
                  {...register('maintenancePeriod')}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 appearance-none"
                >
                  <option value="" disabled>Select</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                  <option value="One-time">One-time</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Status Of your Property */}
        <fieldset className="border border-slate-200 rounded-xl p-4 sm:p-5 pt-3 hover:border-slate-300 transition-colors">
          <legend className="text-xs sm:text-sm font-bold text-[#062F26] px-2 ml-2">
            Status Of your Property
          </legend>
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-1 block">Available From</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className={`flex-1 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-sm font-bold flex flex-row sm:flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${availableFromType === 'Selected Date' ? 'bg-[#EAF5F2] border-brand-teal/50 text-[#062F26] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                }`}>
                <input type="radio" value="Selected Date" {...register('availableFromType')} className="hidden" />
                Selected Date
              </label>
              <label className={`flex-1 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-sm font-bold flex flex-row sm:flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${availableFromType === 'Immediately' ? 'bg-[#EAF5F2] border-brand-teal/50 text-[#062F26] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                }`}>
                <input type="radio" value="Immediately" {...register('availableFromType')} className="hidden" />
                Immediately
              </label>
            </div>
            {errors.availableFromType && <span className="text-red-500 text-[10px] sm:text-xs">{errors.availableFromType.message}</span>}

            {availableFromType === 'Selected Date' && (
              <div className="mt-2 sm:mt-3">
                <input type="date" {...register('availableDate')} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal" />
              </div>
            )}
          </div>
        </fieldset>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm sm:text-sm font-bold text-[#062F26] mb-3 sm:mb-4 border-b pb-2">Additional Details</h3>

          <div className="flex flex-col gap-5 sm:gap-6">
            <CheckboxGrid
              label="Additional Rooms"
              options={[...defaultAdditionalRooms, ...customRooms]}
              selected={additionalRooms}
              onChange={val => handleUpdate('additionalRooms', val)}
              onAddCustom={(val) => handleAddCustom(setCustomRooms, customRooms, val)}
            />

            <CheckboxGrid
              label="Overlooking"
              options={[...defaultOverlooking, ...customOverlooking]}
              selected={overlooking}
              onChange={val => handleUpdate('overlooking', val)}
              onAddCustom={(val) => handleAddCustom(setCustomOverlooking, customOverlooking, val)}
            />

            <div className="flex flex-col gap-1 sm:gap-1.5 mt-2">
              <label className="text-xs sm:text-sm font-bold text-[#062F26]">Facing</label>
              <div className="relative">
                <select
                  {...register('facing')}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 appearance-none"
                >
                  <option value="" disabled>Select Facing</option>
                  {facingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <CheckboxGrid
              label="Society Amenities"
              options={[...defaultSocietyAmenities, ...customAmenities]}
              selected={societyAmenities}
              onChange={val => handleUpdate('societyAmenities', val)}
              onAddCustom={(val) => handleAddCustom(setCustomAmenities, customAmenities, val)}
            />
            <CheckboxGrid label="Tenants you Prefer" options={defaultPreferredTenants} selected={preferredTenants} onChange={val => handleUpdate('preferredTenants', val)} />
          </div>
        </div>

        {/* Locality Description */}
        <fieldset className="border border-slate-200 rounded-xl p-4 sm:p-5 pt-3 hover:border-slate-300 transition-colors">
          <legend className="text-xs sm:text-sm font-bold text-[#062F26] px-2 ml-2">
            Locality Description
          </legend>
          <div className="flex flex-col gap-1 sm:gap-1.5 mt-1">
            <textarea
              {...register('localityDescription')}
              placeholder="Tell us what you like & dislike about this locality."
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${errors.localityDescription ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400 min-h-30 resize-y`}
            ></textarea>
            {errors.localityDescription && <span className="text-red-500 text-[10px] sm:text-xs">{errors.localityDescription.message}</span>}
          </div>
        </fieldset>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 sm:py-3.5 rounded-xl bg-brand-teal text-white font-bold text-sm sm:text-[15px] hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 text-center"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default TenantPricingPreferences;
