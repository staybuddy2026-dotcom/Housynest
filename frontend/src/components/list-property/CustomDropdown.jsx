import { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import Lenis from 'lenis';

const CustomDropdown = ({ label, required, subtitle, options, value, onChange, error, placeholder = "Select", icon, buttonClassName = "", containerClassName = "flex flex-col gap-1 sm:gap-1.5", variant = "light", onToggle, dropdownId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onToggle && isOpen) onToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (!isOpen) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  const selectedLabel = useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    const selected = options?.find(opt => {
      const optVal = opt?.value !== undefined ? opt.value : opt;
      return optVal === value;
    });
    return selected ? (selected?.label !== undefined ? selected.label : selected) : value;
  }, [value, options]);

  const isDark = variant === 'dark-inline';

  return (
    <div className={`${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-[#a1b8b2]' : 'font-bold text-[#062F26]'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        <button
          type="button"
          onClick={() => {
            const nextState = !isOpen;
            setIsOpen(nextState);
            if (onToggle) onToggle(nextState);
          }}
          className={`w-full cursor-pointer flex justify-between items-center text-left transition-colors duration-200 focus:outline-none ${
            isDark 
              ? `bg-transparent border-b pb-1.5 pt-0 px-0 rounded-none ${isOpen ? 'border-brand-yellow' : 'border-[#13463a] group-hover:border-brand-yellow'}`
              : `bg-white border rounded-lg px-3 sm:px-4 py-2.5 ${error ? 'border-red-500' : (isOpen ? 'border-brand-teal ring-2 ring-brand-teal/20' : 'border-slate-200')} hover:border-slate-300 focus:shadow-sm`
          } ${buttonClassName}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {icon && <Icon icon={icon} className={`w-4 h-4 shrink-0 ${isDark ? (value ? 'text-brand-yellow' : 'text-brand-yellow') : 'text-slate-400'}`} />}
            <span className={`truncate text-sm sm:text-sm font-semibold ${
              isDark 
                ? (value ? 'text-white' : 'text-[#a1b8b2]') 
                : (value ? 'text-slate-800' : 'text-slate-400')
            }`}>{selectedLabel || placeholder}</span>
          </div>
          <Icon icon="lucide:chevron-down" className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-[#a1b8b2] group-hover:text-white' : 'text-slate-400'}`} />
        </button>

        <div
          className={`absolute z-50 w-full mt-2 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 origin-top ease-in-out ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'} ${
            isDark ? 'bg-[#0B3D32] border border-[#13463a] shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2' : 'bg-white border border-slate-100'
          }`}
        >
          <div className="max-h-60 overflow-y-auto py-1" ref={wrapperRef} data-lenis-prevent>
            <div ref={contentRef}>
              {options.map((opt, i) => {
                const isObject = typeof opt === 'object' && opt !== null;
                const optValue = isObject ? (opt.value !== undefined ? opt.value : opt) : opt;
                const optLabel = isObject ? (opt.label !== undefined ? opt.label : 'Unknown') : opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                      if (onToggle) onToggle(false);
                    }}
                    className={`w-full text-left text-sm font-medium transition-colors ${
                      isDark 
                        ? `px-4 py-3 rounded-xl hover:bg-[#13463a] hover:text-white ${(value === optValue) ? 'bg-[#13463a] text-brand-yellow' : 'text-[#a1b8b2]'}`
                        : `px-4 py-2.5 hover:bg-slate-50 ${(value === optValue) ? 'bg-[#EAF5F2] text-brand-teal font-bold' : 'text-slate-600'}`
                    }`}
                  >
                    {optLabel}
                  </button>
                );
              })}
            </div>
          </div>
          {dropdownId && <div id={`${dropdownId}-bottom`} className="h-1 w-full shrink-0" />}
        </div>
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
          <Icon icon="lucide:lightbulb" className="w-3 h-3 text-[#E2884A]" /> {subtitle}
        </p>
      )}
      {error && <span className="text-red-500 text-[10px] sm:text-xs">{error}</span>}
    </div>
  );
};

export default CustomDropdown;
