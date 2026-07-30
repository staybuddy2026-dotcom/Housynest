import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import CustomDropdown from './CustomDropdown';

const InputField = ({ label, required, error, ...props }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
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

const TenantAdditionalDetails = ({ onNext, onPrev }) => {
  const { register, watch, setValue, formState: { errors }, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nearbyPlaces"
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ place: '', distance: '' });
    }
  }, [fields.length, append]);

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const [customRooms, setCustomRooms] = useState([]);
  const [customOverlooking, setCustomOverlooking] = useState([]);

  const handleAddCustom = (setter, currentList, value) => {
    if (value && value.trim() && !currentList.includes(value.trim())) {
      setter([...currentList, value.trim()]);
    }
  };

  const additionalRooms = watch('additionalRooms') || [];
  const overlooking = watch('overlooking') || [];

  const facingOptions = ['East', 'North', 'North-East', 'North-West', 'South', 'South-East', 'South-West', 'West'];
  const defaultAdditionalRooms = ['Pooja Room', 'Servant Room', 'Store', 'Study'];
  const defaultOverlooking = ['Garden/Park', 'Main Road', 'Pool'];

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
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Additional Details</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Rooms, facing & overlooking</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">
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
          <CustomDropdown
            label="Facing"
            options={facingOptions}
            value={watch('facing')}
            onChange={val => handleUpdate('facing', val)}
            error={errors.facing?.message}
            placeholder="Select Facing"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Nearby Places</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="relative flex gap-4 items-start p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl transition-all hover:border-brand-teal/30 hover:shadow-sm">
              <div className="absolute -left-2.5 -top-2.5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm z-10">
                {index + 1}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Place Name"
                  placeholder="e.g. Metro Station, Hospital"
                  {...register(`nearbyPlaces.${index}.place`)}
                  error={errors.nearbyPlaces?.[index]?.place?.message}
                />
                <InputField
                  label="Distance"
                  placeholder="e.g. 500m, 2.5km"
                  {...register(`nearbyPlaces.${index}.distance`)}
                  error={errors.nearbyPlaces?.[index]?.distance?.message}
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-6 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Remove this place"
                >
                  <Icon icon="lucide:trash-2" width="20" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ place: '', distance: '' })}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-brand-teal font-bold text-sm hover:border-brand-teal hover:bg-[#EAF5F2] transition-all flex items-center justify-center gap-2"
          >
            <Icon icon="lucide:plus" width="18" /> Add Nearby Place
          </button>
        </div>

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

export default TenantAdditionalDetails;
