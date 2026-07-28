import React from 'react';

export const InputField = ({ label, required, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 w-full">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
      {...props}
    />
    {error && <span className="text-red-500 text-[10px] sm:text-xs">{error}</span>}
  </div>
);

export const ALL_FACILITIES = ['Bed', 'Cupboard', 'TV', 'Mattress', 'Attached Washroom', 'Table', 'Wi-Fi', 'Air Cooler'];

export const getSharingType = (count) => {
  switch (count) {
    case 1: return 'Single';
    case 2: return 'Double';
    case 3: return 'Triple';
    case 4: return 'Four';
    default: return 'Other';
  }
};
