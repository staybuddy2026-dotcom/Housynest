import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import CustomDropdown from './CustomDropdown';

const PgServices = ({ onNext, onPrev }) => {
  const { watch, setValue } = useFormContext();

  const services = watch('services') || [];
  const extraServices = watch('extraServices') || [];

  const handleUpdate = (field, value) => setValue(field, value, { shouldValidate: true });

  const toggleService = (opt) => {
    const updated = services.includes(opt) ? services.filter(s => s !== opt) : [...services, opt];
    handleUpdate('services', updated);
  };

  const [customVal, setCustomVal] = useState('');
  const handleAddCustom = (e) => {
    e?.preventDefault();
    if (customVal.trim() && !extraServices.includes(customVal.trim())) {
      handleUpdate('extraServices', [...extraServices, customVal.trim()]);
      setCustomVal('');
    }
  };

  const handleRemoveExtra = (item) => {
    handleUpdate('extraServices', extraServices.filter(i => i !== item));
  };

  const handleRemoveService = (item) => {
    handleUpdate('services', services.filter(i => i !== item));
  };

  const allSelected = [...services, ...extraServices];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      {/* Header section with back button */}
      <div className="mb-6 flex items-start gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-1 w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Icon icon="lucide:arrow-left" className="w-4.5 h-4.5" strokeWidth="2.5" />
          </button>
        )}
        
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-[#EAF5F2] flex items-center justify-center text-brand-teal shadow-sm">
            <Icon icon="lucide:sparkles" className="w-6 h-6" strokeWidth="2.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#062F26] mb-1">Property Services</h2>
            <p className="text-sm text-slate-500 font-medium">Select all services offered at your property</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-8">

        {/* 3-Column Grid for Default Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {['RO Water', 'Security', 'CCTV', 'Fire Safety', 'Washing Area', 'Housekeeping', 'Breakfast', 'Lunch', 'Dinner', 'Laundry', 'Warden', 'Room Cleaning'].map(opt => (
            <label key={opt} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${services.includes(opt) ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-slate-50 hover:shadow-sm'
              }`}>
              <span className={`text-sm font-semibold ${services.includes(opt) ? 'text-[#062F26]' : 'text-slate-600'}`}>{opt}</span>
              <input
                type="checkbox"
                checked={services.includes(opt)}
                onChange={() => toggleService(opt)}
                className="w-4 h-4 text-brand-teal rounded border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer"
              />
            </label>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Add Custom Services</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Add Custom Service Box */}
        <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/50">
          <h3 className="text-sm font-bold text-[#062F26] mb-3">Custom Service</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Icon icon="lucide:plus" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                placeholder="e.g. Laundry service, Medical assistance..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300"
              />
            </div>
            <button 
              type="button" 
              onClick={handleAddCustom} 
              className="w-full sm:w-auto px-6 py-3 bg-[#062F26] text-white text-sm font-bold rounded-lg hover:bg-brand-teal transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20"
            >
              Add
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Icon icon="lucide:lightbulb" className="w-3.5 h-3.5 text-brand-teal" />
            Add any service not listed above and click Add
          </p>
        </div>

        {/* Selected Services Preview Box */}
        <div className="bg-[#F8F9FA] rounded-xl p-6 border border-slate-100 min-h-[140px] flex items-center justify-center transition-all duration-300">
          {allSelected.length === 0 ? (
            <div className="text-center flex flex-col items-center opacity-70">
              <Icon icon="lucide:sparkles" className="w-6 h-6 text-brand-teal mb-2" />
              <h4 className="text-sm font-bold text-slate-600 mb-1">No Services Selected</h4>
              <p className="text-xs text-slate-400 font-medium">Select services to showcase what you offer</p>
            </div>
          ) : (
            <div className="w-full flex flex-wrap gap-2.5 items-start justify-start content-start min-h-[92px]">
              {services.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-brand-teal/30 hover:shadow-md group">
                  <span className="text-brand-teal"><Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" /></span>
                  {item}
                  <button type="button" onClick={() => handleRemoveService(item)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Icon icon="lucide:x" width="14" />
                  </button>
                </div>
              ))}
              {extraServices.map((item, idx) => (
                <div key={`extra-${idx}`} className="flex items-center gap-2 bg-[#EAF5F2] border border-brand-teal/20 px-3.5 py-2 rounded-full text-xs font-bold text-[#062F26] shadow-sm transition-all hover:border-brand-teal hover:shadow-md group">
                  <span className="text-brand-teal"><Icon icon="lucide:star" className="w-3.5 h-3.5" /></span>
                  {item}
                  <button type="button" onClick={() => handleRemoveExtra(item)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Icon icon="lucide:x" width="14" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Food Details</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Food Options */}
        <div className="flex flex-col gap-2 p-1 sm:p-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-500 hover:shadow-md hover:border-brand-teal/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EAF5F2] flex items-center justify-center text-brand-teal shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Icon icon="lucide:utensils-crossed" className="w-5.5 h-5.5" strokeWidth="2.5" />
              </div>
              <div>
                <label className="text-[15px] font-bold text-[#062F26]">Is Food Provided?</label>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">Include meal plans for your tenants</p>
              </div>
            </div>
            
            <div className="flex items-center bg-slate-100/80 p-1.5 rounded-xl shrink-0 border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleUpdate('foodProvided', true)}
                className={`px-7 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${watch('foodProvided') === true ? 'bg-white text-brand-teal shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {watch('foodProvided') === true && <Icon icon="lucide:check" className="w-4 h-4 animate-in zoom-in" />}
                Yes
              </button>
              <button
                type="button"
                onClick={() => { handleUpdate('foodProvided', false); handleUpdate('foodCharges', ''); handleUpdate('meals', []); handleUpdate('vegNonVeg', 'Both'); }}
                className={`px-7 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${watch('foodProvided') === false ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {watch('foodProvided') === false && <Icon icon="lucide:x" className="w-4 h-4 animate-in zoom-in" />}
                No
              </button>
            </div>
          </div>

          <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${watch('foodProvided') ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-5 mx-2 mb-2 bg-[#FAFAFA] rounded-xl border border-slate-100/80">
                
                <div className="flex flex-col gap-1.5 relative group">
                  <label className="text-[13px] font-bold text-[#062F26]">Food Charges</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-bold group-focus-within:text-brand-teal transition-colors duration-300">₹</span>
                    <input type="text" value={watch('foodCharges') || ''} onChange={e => handleUpdate('foodCharges', e.target.value)} placeholder="Included in Rent" className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all duration-300 shadow-sm" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 relative group">
                  <CustomDropdown
                    label="Veg / Non-Veg"
                    options={['Both', 'Veg Only', 'Non-Veg Only']}
                    value={watch('vegNonVeg') || 'Both'}
                    onChange={(val) => handleUpdate('vegNonVeg', val)}
                  />
                </div>
                
                <div className="flex flex-col gap-2.5 md:col-span-2 pt-2 border-t border-slate-200/60 mt-1">
                  <label className="text-[13px] font-bold text-[#062F26]">Meals Included</label>
                  <div className="flex flex-wrap items-center gap-3.5">
                    {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
                      const currentMeals = watch('meals') || [];
                      const isSelected = currentMeals.includes(meal);
                      return (
                        <button
                          key={meal}
                          type="button"
                          onClick={() => {
                            const updated = isSelected ? currentMeals.filter(m => m !== meal) : [...currentMeals, meal];
                            handleUpdate('meals', updated);
                          }}
                          className={`px-5 py-2.5 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-300 border-2 flex items-center gap-2 ${isSelected ? 'bg-[#EAF5F2] border-brand-teal text-brand-teal shadow-[0_4px_15px_rgba(10,168,125,0.15)] -translate-y-0.5 scale-[1.02]' : 'bg-white border-slate-200 text-slate-500 hover:border-brand-teal/40 hover:bg-slate-50 hover:text-slate-700 shadow-sm'}`}
                        >
                          {isSelected && <Icon icon="lucide:check-circle-2" className="w-4 h-4 animate-in zoom-in duration-300" />}
                          {meal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-8 pt-6 border-t border-slate-100">
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

export default PgServices;
