import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

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
          <label key={opt} className={`flex items-center justify-between p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${selected.includes(opt) ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-slate-50 hover:shadow-sm'}`}>
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
                  e.preventDefault();
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

const TenantAmenities = ({ onNext, onPrev }) => {
  const { watch, setValue } = useFormContext();

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const [customAmenities, setCustomAmenities] = useState([]);

  const handleAddCustom = (setter, currentList, value) => {
    if (value && value.trim() && !currentList.includes(value.trim())) {
      setter([...currentList, value.trim()]);
    }
  };

  const societyAmenities = watch('societyAmenities') || [];

  const defaultSocietyAmenities = [
    'Maintenance Staff', 'Water Supply', 'Power Back Up', 'Private Terrace/Garden', 'RO Water System',
    'Rain Water Harvesting', 'Reserved Parking', 'Security', 'Service/Goods Lift', 'Swimming Pool',
    'Vaastu Compliant', 'Waste Disposal', 'Air Conditioned', 'Banquet Hall', 'Bar/Lounge',
    'Cafeteria/Food Court', 'Club House', 'Conference Room', 'DTH Television Facility', 'Gymnasium',
    'Intercom Facility', 'Internet/Wi-Fi Connectivity', 'Jogging and Strolling Track', 'Laundry Service', 'Lift'
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">
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
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Property Amenities</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Society and property amenities</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">
        <CheckboxGrid
          label="Society Amenities"
          options={[...defaultSocietyAmenities, ...customAmenities]}
          selected={societyAmenities}
          onChange={val => handleUpdate('societyAmenities', val)}
          onAddCustom={(val) => handleAddCustom(setCustomAmenities, customAmenities, val)}
        />
      </div>

      <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 sm:px-10 py-2.5 sm:py-3 rounded-xl bg-[#062F26] text-white font-bold text-sm hover:bg-brand-teal transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20 flex items-center gap-2"
        >
          Next <Icon icon="lucide:arrow-right" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TenantAmenities;
