import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Lenis from 'lenis';

const CustomDropdown = ({ label, required, subtitle, options, value, onChange, error, placeholder = "Select", icon, buttonClassName = "", containerClassName = "flex flex-col gap-1 sm:gap-1.5" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div className={`${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs sm:text-sm font-bold text-[#062F26]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 sm:px-4 py-2.5 cursor-pointer bg-white border ${error ? 'border-red-500' : (isOpen ? 'border-brand-teal ring-2 ring-brand-teal/20' : 'border-slate-200')} rounded-lg text-sm sm:text-sm font-medium focus:outline-none transition-all duration-200 focus:shadow-sm hover:border-slate-300 flex justify-between items-center text-left ${buttonClassName}`}
        >
          <div className="flex items-center gap-2">
            {icon && <Icon icon={icon} className="w-4 h-4 text-slate-400" />}
            <span className={value ? 'text-slate-800' : 'text-slate-400'}>{value || placeholder}</span>
          </div>
          <Icon icon="lucide:chevron-down" className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div
          className={`absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden transition-all duration-300 origin-top ease-in-out ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
        >
          <div className="max-h-60 overflow-y-auto py-1" ref={wrapperRef} data-lenis-prevent>
            <div ref={contentRef}>
              {options.map((opt, i) => {
                const optValue = opt?.value || opt;
                const optLabel = opt?.label || opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${(value === optValue) ? 'bg-[#EAF5F2] text-brand-teal font-bold' : 'text-slate-600'}`}
                  >
                    {optLabel}
                  </button>
                );
              })}
            </div>
          </div>
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
