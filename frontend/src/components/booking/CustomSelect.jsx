import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

// Custom Animated Dropdown Component
const CustomSelect = ({ value, onChange, options, placeholder = 'Select Option', label, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.label === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer bg-white ${
          isOpen
            ? 'border-[#0AA87D] ring-3 ring-[#0AA87D]/10 shadow-xs'
            : 'border-slate-300 hover:border-[#0AA87D]/50'
        }`}
      >
        <span className={`text-sm font-semibold ${selectedOption ? 'text-[#062F26]' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
          icon="lucide:chevron-down"
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0AA87D]' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn py-1">
          {options.map((option) => {
            const isSelected = value === option.value || value === option.label;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#EAF5F2] text-[#062F26] font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#062F26]'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Icon icon="lucide:check" className="w-4 h-4 text-[#0AA87D]" strokeWidth="3" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
