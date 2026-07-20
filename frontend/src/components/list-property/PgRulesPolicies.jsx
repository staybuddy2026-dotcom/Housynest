import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

const ButtonGroup = ({ label, options, selected, onChange, error }) => (
  <div>
    <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3 block">{label}</label>
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${selected === opt ? 'bg-[#EAF5F2] border-brand-teal/50 text-[#062F26] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
            }`}
        >
          {selected === opt && <Icon icon="lucide:check" width="14" className="text-brand-teal" strokeWidth="3" />}
          {opt}
        </button>
      ))}
    </div>
    {error && <span className="text-red-500 text-[10px] sm:text-xs mt-1">{error}</span>}
  </div>
);

const CheckboxGroup = ({ label, options, selected, onChange }) => (
  <div>
    {label && <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3 block">{label}</label>}
    <div className="flex flex-col gap-2 sm:gap-3">
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
        placeholder="Add custom rule..."
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

const PgRulesPolicies = ({ onNext, onPrev }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const preferredGender = watch('preferredGender');
  const tenantPreference = watch('tenantPreference');
  const pgRules = watch('pgRules') || [];
  const extraRules = watch('extraRules') || [];

  const handleUpdate = (field, value) => setValue(field, value, { shouldValidate: true });

  const handleAddRule = (item) => {
    if (!extraRules.includes(item)) {
      handleUpdate('extraRules', [...extraRules, item]);
    }
  };
  const handleRemoveRule = (item) => {
    handleUpdate('extraRules', extraRules.filter(i => i !== item));
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
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Rules & Policies</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Set the rules and preferences for your PG</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">

        <ButtonGroup
          label="Preferred Gender"
          options={['Male', 'Female', 'Both']}
          selected={preferredGender}
          onChange={(val) => handleUpdate('preferredGender', val)}
          error={errors.preferredGender?.message}
        />

        <ButtonGroup
          label="Tenant Preferences"
          options={['Professionals', 'Students', 'Both']}
          selected={tenantPreference}
          onChange={(val) => handleUpdate('tenantPreference', val)}
          error={errors.tenantPreference?.message}
        />

        <div>
          <CheckboxGroup
            label="PG Rules (Select applicable rules)"
            options={['Guardian not allowed', 'Non-veg Food not allowed', 'Opposite Gender not allowed', 'Alcohol not allowed', 'Smoking not allowed']}
            selected={pgRules}
            onChange={(val) => handleUpdate('pgRules', val)}
          />
          <AddExtraForm onAdd={handleAddRule} />
          <CustomTags items={extraRules} onRemove={handleRemoveRule} />
        </div>

        <div className="flex gap-3 sm:gap-6">
          <InputField
            label="Notice period"
            required
            {...register('noticePeriod')}
            error={errors.noticePeriod?.message}
            placeholder="e.g. 15 Days, 1 Month"
          />
          <InputField
            label="Gate Closing time"
            type="time"
            required
            {...register('gateClosingTime')}
            error={errors.gateClosingTime?.message}
          />
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

export default PgRulesPolicies;
