import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

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
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal border-slate-300 focus:ring-brand-teal accent-[#0B4F48] cursor-pointer"
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

const PgBasicDetails = ({ onNext }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const propertyType = watch('propertyType');
  const postingAs = watch('postingAs');
  const propertyCategory = watch('propertyCategory');
  const pgPresentIn = watch('pgPresentIn');

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

        {/* Posting As */}
        <RadioGroup
          label={propertyType === 'PG' ? "You are posting this PG as" : "You are posting this Property as"}
          name="postingAs"
          options={['Owner', 'Property Manager', 'Agent']}
          value={postingAs}
          onChange={(e) => setValue('postingAs', e.target.value, { shouldValidate: true })}
          error={errors.postingAs?.message}
        />

        {/* Property Category (Tenant Only) */}
        {propertyType === 'Tenant' && (
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-bold text-[#062F26]">Property Category</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {['Villa', 'Flat', 'House', 'Penthouse'].map(cat => (
                <label
                  key={cat}
                  className={`flex items-center justify-center gap-2 p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${propertyCategory === cat ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="propertyCategory"
                    value={cat}
                    checked={propertyCategory === cat}
                    onChange={(e) => setValue('propertyCategory', e.target.value, { shouldValidate: true })}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal border-slate-300 focus:ring-brand-teal accent-[#0B4F48] cursor-pointer"
                  />
                  <span className={`text-xs sm:text-sm font-semibold ${propertyCategory === cat ? 'text-[#062F26]' : 'text-slate-600'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
            {errors.propertyCategory && <span className="text-red-500 text-[10px] sm:text-xs">{errors.propertyCategory.message}</span>}
          </div>
        )}

        {/* Society Name (Tenant Only) */}
        {propertyType === 'Tenant' && (
          <InputField
            label="Society / Project Name"
            subtitle="Name of the society or building"
            required
            {...register('societyName')}
            error={errors.societyName?.message}
            placeholder="e.g. Godrej Garden City"
          />
        )}

        {/* City */}
        <InputField
          label={propertyType === 'PG' ? "City where your PG is located?" : "City where your Property is located?"}
          subtitle="Make sure you enter the correct address for a Verification"
          required
          {...register('city')}
          error={errors.city?.message}
          placeholder="e.g. Ahmedabad, Bangalore"
        />

        {/* PG Specific Fields */}
        {propertyType === 'PG' && (
          <>
            {/* PG Present In */}
            <RadioGroup
              label="PG Present In"
              name="pgPresentIn"
              options={['An Independent Building', 'An Independent Flats', 'Present In A Society']}
              value={pgPresentIn}
              onChange={(e) => setValue('pgPresentIn', e.target.value, { shouldValidate: true })}
              error={errors.pgPresentIn?.message}
            />

            {/* PG Operational Since */}
            <InputField
              label="PG Operational Since"
              required
              onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
              {...register('operationalSince')}
              error={errors.operationalSince?.message}
              placeholder="Enter PG Operational Since (e.g. 2018)"
            />

            {/* PG Name */}
            <InputField
              label="PG Name"
              required
              {...register('pgName')}
              error={errors.pgName?.message}
              placeholder="Enter Your PG Name"
            />
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
