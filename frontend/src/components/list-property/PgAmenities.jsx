import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

const CheckboxGroup = ({ options, selected, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
  </div>
);

const AddExtraForm = ({ onAdd }) => {
  const [val, setVal] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      onAdd(val.trim());
      setVal('');
    }
  };
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-3">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Add extra..."
        className="flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300"
      />
      <button type="button" onClick={handleSubmit} className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-brand-teal text-white text-sm sm:text-sm font-bold rounded-lg hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20">
        Add
      </button>
    </div>
  );
};

const CustomTags = ({ items, onRemove }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
          {item}
          <button type="button" onClick={() => onRemove(item)} className="hover:text-red-500 transition-colors">
            <Icon icon="lucide:x" width="12" />
          </button>
        </div>
      ))}
    </div>
  );
};

const PgAmenities = ({ onNext, onPrev }) => {
  const { register, watch, setValue } = useFormContext();

  const services = watch('services') || [];
  const extraServices = watch('extraServices') || [];
  const foodProvided = watch('foodProvided');
  const meals = watch('meals') || [];
  const vegNonVeg = watch('vegNonVeg');
  const commonAmenities = watch('commonAmenities') || [];
  const extraCommonAmenities = watch('extraCommonAmenities') || [];
  const parkingAvailable = watch('parkingAvailable') || false;
  const parking = watch('parking') || [];

  const handleUpdate = (field, value) => setValue(field, value, { shouldValidate: true });

  const handleAddExtra = (field, currentArr, item) => {
    if (!currentArr.includes(item)) {
      handleUpdate(field, [...currentArr, item]);
    }
  };
  const handleRemoveExtra = (field, currentArr, item) => {
    handleUpdate(field, currentArr.filter(i => i !== item));
  };

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
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Amenities & Services</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Facilities, food, parking & more</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">

        {/* Services Available */}
        <div>
          <h3 className="text-sm font-bold text-[#062F26] mb-3">Services Available</h3>
          <CheckboxGroup
            options={['Laundry', 'Room Cleaning', 'Warden']}
            selected={services}
            onChange={(val) => handleUpdate('services', val)}
          />
          <AddExtraForm onAdd={(val) => handleAddExtra('extraServices', extraServices, val)} />
          <CustomTags items={extraServices} onRemove={(val) => handleRemoveExtra('extraServices', extraServices, val)} />
        </div>

        {/* Food Provided */}
        <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={foodProvided}
              onChange={(e) => handleUpdate('foodProvided', e.target.checked)}
              className="w-5 h-5 text-brand-teal rounded border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer"
            />
            <span className="text-sm font-bold text-[#062F26]">Food Provided</span>
          </label>

          {foodProvided && (
            <div className="flex flex-col gap-4 sm:gap-5 pl-4 sm:pl-8 border-l-2 border-slate-200 mt-2">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">Meals</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => {
                        handleUpdate('meals', meals.includes(meal) ? meals.filter(x => x !== meal) : [...meals, meal]);
                      }}
                      className={`flex-1 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${meals.includes(meal) ? 'bg-[#EAF5F2] border-brand-teal/50 text-[#062F26] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                        }`}
                    >
                      {meals.includes(meal) && <Icon icon="lucide:check" width="12" className="text-brand-teal" strokeWidth="3" />}
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">Veg/Nonveg Food Provided</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {['Veg', 'Veg & Non Veg'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleUpdate('vegNonVeg', opt)}
                      className={`flex-1 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${vegNonVeg === opt ? 'bg-[#EAF5F2] border-brand-teal/50 text-[#062F26] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                        }`}
                    >
                      {vegNonVeg === opt && <Icon icon="lucide:check" width="12" className="text-brand-teal" strokeWidth="3" />}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label className="text-xs font-bold text-slate-600">Food Charges</label>
                <div className="relative">
                  <select
                    {...register('foodCharges')}
                    className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 appearance-none pr-10"
                  >
                    <option value="" disabled>Select Food Charges</option>
                    <option value="Included in rent">Included in rent</option>
                    <option value="Per meal basis">Per meal basis</option>
                    <option value="Monthly extra charges">Monthly extra charges</option>
                    <option value="Pay as you go">Pay as you go</option>
                  </select>
                  <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Common Area Amenities */}
        <div>
          <h3 className="text-sm font-bold text-[#062F26] mb-3">Common Area Amenities</h3>
          <CheckboxGroup
            options={['Fridge', 'Kitchen for Self-cooking', 'RO Water', 'Wi-Fi', 'TV', 'Power Backup', 'CCTV', 'Gymnasium']}
            selected={commonAmenities}
            onChange={(val) => handleUpdate('commonAmenities', val)}
          />
          <AddExtraForm onAdd={(val) => handleAddExtra('extraCommonAmenities', extraCommonAmenities, val)} />
          <CustomTags items={extraCommonAmenities} onRemove={(val) => handleRemoveExtra('extraCommonAmenities', extraCommonAmenities, val)} />
        </div>

        {/* Parking Availability */}
        <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parkingAvailable}
              onChange={(e) => {
                handleUpdate('parkingAvailable', e.target.checked);
                if (!e.target.checked) handleUpdate('parking', []);
              }}
              className="w-5 h-5 text-brand-teal rounded border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer"
            />
            <span className="text-sm font-bold text-[#062F26]">Parking Available</span>
          </label>

          {parkingAvailable && (
            <div className="flex flex-col gap-4 sm:gap-5 pl-4 sm:pl-8 border-l-2 border-slate-200 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">Vehicle Type</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {['2-Wheeler', 'Car Parking'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        handleUpdate('parking', parking.includes(opt) ? parking.filter(x => x !== opt) : [...parking, opt]);
                      }}
                      className={`flex-1 py-2 sm:py-3 rounded-lg border text-sm sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${parking.includes(opt) ? 'bg-[#EAF5F2] border-brand-teal/50 text-[#062F26] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                        }`}
                    >
                      {parking.includes(opt) && <Icon icon="lucide:check" width="14" className="text-brand-teal" strokeWidth="3" />}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 text-center"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default PgAmenities;
