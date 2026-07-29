import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext, Controller } from 'react-hook-form';

const InputField = ({ label, required, subtitle, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">{subtitle}</p>}
    <input
      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
      {...props}
    />
    {error && <span className="text-red-500 text-[10px] sm:text-xs mt-1">{error}</span>}
  </div>
);

const SelectField = ({ label, required, subtitle, error, options, value, onChange, placeholder = `Select ${label}` }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5" ref={dropdownRef}>
      <label className="text-xs sm:text-sm font-bold text-[#062F26]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">{subtitle}</p>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : (isOpen ? 'border-brand-teal ring-2 ring-brand-teal/20' : 'border-slate-200')} rounded-lg text-sm sm:text-sm font-medium focus:outline-none transition-all duration-200 focus:shadow-sm hover:border-slate-300 flex justify-between items-center`}
        >
          <span className={!value ? 'text-slate-400 font-normal' : 'text-[#062F26]'}>
            {value || placeholder}
          </span>
          <Icon 
            icon="lucide:chevron-down" 
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <div 
          className={`absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
        >
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map((opt, idx) => (
              <li 
                key={idx}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-sm cursor-pointer transition-colors hover:bg-slate-50 ${value === opt ? 'text-brand-teal font-bold bg-[#EAF5F2]' : 'text-[#062F26]'}`}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error && <span className="text-red-500 text-[10px] sm:text-xs mt-1">{error}</span>}
    </div>
  );
};

const RadioGroup = ({ label, name, options, value, onChange, error }) => (
  <div className="flex flex-col gap-2 sm:gap-3">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">{label}</label>
    <div className="flex flex-col gap-2 sm:gap-2.5">
      {options.map((opt, idx) => (
        <label
          key={idx}
          className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${value === opt ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-slate-50'
            }`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={onChange}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer"
          />
          <span className={`text-sm sm:text-sm font-semibold ${value === opt ? 'text-[#062F26]' : 'text-slate-600'}`}>
            {opt}
          </span>
        </label>
      ))}
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

const PgBasicDetails = ({ onNext }) => {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext();

  const propertyType = watch('propertyType');
  const postingAs = watch('postingAs');
  const propertyCategory = watch('propertyCategory');
  const pgPresentIn = watch('pgPresentIn');
  const preferredTenants = watch('preferredTenants') || [];
  
  const [customTenants, setCustomTenants] = useState([]);
  
  const defaultPreferredTenants = ['Couple/Family', 'Vegetarians', 'With Company lease', 'Without Pets'];

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };
  
  const handleAddCustomTenant = (value) => {
    if (value && value.trim() && !customTenants.includes(value.trim())) {
      setCustomTenants([...customTenants, value.trim()]);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-4 sm:mb-6">Basic Details</h2>

      <div className="flex flex-col gap-6 lg:gap-8 flex-1">

        {/* I want to list (Property Type) */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <label className="text-xs sm:text-sm font-bold text-[#062F26]">I want to list <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setValue('propertyType', 'PG', { shouldValidate: true })}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-center ${propertyType === 'PG' ? 'border-brand-teal bg-[#EAF5F2] text-brand-teal shadow-sm' : 'border-slate-100 hover:border-brand-teal/30 hover:bg-slate-50'
                }`}
            >
              <Icon icon="lucide:building" className={`w-5 h-5 sm:w-6 sm:h-6 ${propertyType === 'PG' ? 'text-brand-teal' : 'text-slate-400'}`} />
              <span className={`font-bold text-xs sm:text-sm leading-tight ${propertyType === 'PG' ? 'text-[#062F26]' : 'text-slate-600'}`}>PG / Paying Guest</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('propertyType', 'Tenant', { shouldValidate: true })}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-center ${propertyType === 'Tenant' ? 'border-brand-teal bg-[#EAF5F2] text-brand-teal shadow-sm' : 'border-slate-100 hover:border-brand-teal/30 hover:bg-slate-50'
                }`}
            >
              <Icon icon="lucide:home" className={`w-5 h-5 sm:w-6 sm:h-6 ${propertyType === 'Tenant' ? 'text-brand-teal' : 'text-slate-400'}`} />
              <span className={`font-bold text-xs sm:text-sm leading-tight ${propertyType === 'Tenant' ? 'text-[#062F26]' : 'text-slate-600'}`}>Tenant / Rental</span>
            </button>
          </div>
          {errors.propertyType && <span className="text-red-500 text-[10px] sm:text-xs">{errors.propertyType.message}</span>}
        </div>

        {/* Row for Posting As & PG Present In */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
          {/* Posting As */}
          <div className="flex-1 min-w-0">
            <Controller
              name="postingAs"
              control={control}
              rules={{ required: 'Please select how you are posting' }}
              render={({ field }) => (
                <SelectField
                  label={propertyType === 'PG' ? "You are posting this PG as" : "You are posting this Property as"}
                  required
                  options={['Owner', 'Property Manager', 'Agent']}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  error={errors.postingAs?.message}
                />
              )}
            />
          </div>

          {/* PG Present In (PG Only) */}
          {propertyType === 'PG' && (
            <div className="flex-1 min-w-0">
              <Controller
                name="pgPresentIn"
                control={control}
                rules={{ required: 'Please select where your PG is present' }}
                render={({ field }) => (
                  <SelectField
                    label="PG Present In"
                    required
                    options={['An Independent Building', 'An Independent Flats', 'Present In A Society']}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.pgPresentIn?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Property Category (Tenant Only) */}
          {propertyType === 'Tenant' && (
            <div className="flex-1 min-w-0">
              <Controller
                name="propertyCategory"
                control={control}
                rules={{ required: 'Please select a property category' }}
                render={({ field }) => (
                  <SelectField
                    label="Property Category"
                    required
                    options={['Villa', 'Flat', 'House', 'Penthouse']}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.propertyCategory?.message}
                  />
                )}
              />
            </div>
          )}


        </div>



        {/* Row for Society Name & Age of Property (Tenant Only) */}
        {propertyType === 'Tenant' && (
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
            <div className="flex-1 min-w-0">
              <InputField
                label="Society / Project Name"
                required
                {...register('societyName')}
                error={errors.societyName?.message}
                placeholder="e.g. Godrej Garden City"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Controller
                name="ageOfProperty"
                control={control}
                rules={{ required: 'Please select age of property' }}
                render={({ field }) => (
                  <SelectField
                    label="Age of Property"
                    required
                    options={['0-1 Years', '1-5 Years', '5-10 Years', '10+ Years']}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.ageOfProperty?.message}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Tenants you Prefer (Tenant Only) */}
        {propertyType === 'Tenant' && (
          <CheckboxGrid 
            label="Tenants you Prefer" 
            options={[...defaultPreferredTenants, ...customTenants]} 
            selected={preferredTenants} 
            onChange={val => handleUpdate('preferredTenants', val)} 
            onAddCustom={handleAddCustomTenant}
          />
        )}


        {/* Property Description */}
        <div>
          <h3 className="text-sm font-bold text-[#062F26] mb-1">Property Description</h3>
          <p className="text-xs text-slate-500 mb-2 sm:mb-3">Write a brief description of your property</p>
          <textarea
            {...register('description')}
            placeholder="Enter Description"
            rows="4"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 resize-none"
          ></textarea>
        </div>

        {/* PG Specific Fields */}
        {propertyType === 'PG' && (
          <>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
              {/* PG Operational Since */}
              <div className="flex-1 min-w-0">
                <InputField
                  label="PG Operational Since"
                  required
                  onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                  {...register('operationalSince')}
                  error={errors.operationalSince?.message}
                  placeholder="Enter PG Operational Since (e.g. 2018)"
                />
              </div>

              {/* PG Name */}
              <div className="flex-1 min-w-0">
                <InputField
                  label="PG Name"
                  required
                  {...register('pgName')}
                  error={errors.pgName?.message}
                  placeholder="Enter Your PG Name"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
              {/* Preferred Gender */}
              <div className="flex-1 min-w-0">
                <Controller
                  name="preferredGender"
                  control={control}
                  rules={{ required: 'Please select preferred gender' }}
                  render={({ field }) => (
                    <SelectField
                      label="Preferred Gender"
                      required
                      options={['Male', 'Female', 'Both']}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={errors.preferredGender?.message}
                    />
                  )}
                />
              </div>

              {/* Tenant Preferences */}
              <div className="flex-1 min-w-0">
                <Controller
                  name="tenantPreference"
                  control={control}
                  rules={{ required: 'Please select tenant preference' }}
                  render={({ field }) => (
                    <SelectField
                      label="Tenant Preferences"
                      required
                      options={['Professionals', 'Students', 'Both']}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={errors.tenantPreference?.message}
                    />
                  )}
                />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default PgBasicDetails;
