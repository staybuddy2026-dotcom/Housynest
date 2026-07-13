import { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

const pgSteps = [
  { id: 1, title: 'Basic Details', subtitle: 'Property type, location & pricing' },
  { id: 2, title: 'Property Details', subtitle: 'Rooms, size, furnishing & more' },
  { id: 3, title: 'Room Options', subtitle: 'Add single, double, triple sharing' },
  { id: 4, title: 'Amenities & Services', subtitle: 'Facilities, food, parking & more' },
  { id: 5, title: 'Rules & Policies', subtitle: 'PG rules and policies' },
  { id: 6, title: 'Photos & Videos', subtitle: 'Add photos, floor plan & video' },
  { id: 7, title: 'Verify Property', subtitle: 'Upload verification documents' }
];

const tenantSteps = [
  { id: 1, title: 'Basic Details', subtitle: 'Property type, location & pricing' },
  { id: 2, title: 'Property Details', subtitle: 'Address, society, specs' },
  { id: 3, title: 'Pricing & Preferences', subtitle: 'Rent, amenities & preferences' },
  { id: 4, title: 'Photos & Videos', subtitle: 'Add photos, floor plan & video' },
  { id: 5, title: 'Verify Property', subtitle: 'Upload verification documents' }
];

const StepperSidebar = ({ activeStep, propertyType = 'PG' }) => {
  const steps = propertyType === 'Tenant' ? tenantSteps : pgSteps;
  const containerRef = useRef(null);
  const activeStepRef = useRef(null);

  useEffect(() => {
    if (activeStepRef.current && containerRef.current && window.innerWidth < 1024) {
      const container = containerRef.current;
      const element = activeStepRef.current;
      const scrollLeft = element.offsetLeft - (container.offsetWidth / 2) + (element.offsetWidth / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeStep]);

  return (
    <div className="w-full flex flex-col lg:flex-col gap-4 lg:gap-6">
      <div className="bg-[#F8FBFA] rounded-xl lg:rounded-xl p-4 lg:pb-8 border border-slate-100">
        <h2 className="hidden lg:block text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 ml-2">List Property</h2>

        <div ref={containerRef} className="overflow-x-auto lg:overflow-visible pt-2 pb-4 lg:pt-0 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth">
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-6 relative w-max lg:w-auto snap-x">
            {/* Vertical Track Line (Desktop) */}
            <div className="hidden lg:block absolute left-4 top-2 bottom-6 w-0.5 bg-slate-200 z-0"></div>
            {/* Horizontal Track Line (Mobile) */}
            <div className="block lg:hidden absolute top-4 left-[60px] right-[60px] h-0.5 bg-slate-200 z-0"></div>

            {steps.map((step) => {
              const isActive = step.id === activeStep;
              const isCompleted = step.id < activeStep;

              return (
                <div ref={isActive ? activeStepRef : null} key={step.id} className="relative z-10 flex flex-col lg:flex-row gap-2 lg:gap-4 group cursor-pointer shrink-0 snap-start w-[120px] lg:w-auto items-center lg:items-start text-center lg:text-left">
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-300
                      ${isActive
                        ? 'bg-[#062F26] text-white shadow-[0_0_0_4px_#EAF5F2] scale-110'
                        : isCompleted
                          ? 'bg-brand-teal text-white hover:scale-105'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:scale-105'
                      }`}
                  >
                    {isCompleted ? <Icon icon="lucide:check" className="w-4 h-4" /> : step.id}
                  </div>

                  {/* Step Text */}
                  <div className={`flex flex-col pt-0.5 lg:pt-0.5 ${isActive ? '' : 'opacity-60 group-hover:opacity-100 transition-opacity'}`}>
                    <h3 className={`text-xs lg:text-base font-bold ${isActive ? 'text-[#062F26]' : 'text-slate-700'}`}>
                      {step.title}
                    </h3>
                    <p className="hidden lg:block text-xs font-medium text-slate-500 mt-0.5 leading-snug">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Need Help Card */}
      <div className="hidden lg:flex bg-white rounded-[20px] p-6 border border-slate-100 flex-col items-center text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#EAF5F2] flex items-center justify-center text-brand-teal mb-3">
          <Icon icon="lucide:headphones" className="w-6 h-6 stroke-[2]" />
        </div>
        <h4 className="text-[15px] font-bold text-[#062F26] mb-1">Need Help?</h4>
        <p className="text-xs font-medium text-slate-500 mb-4 px-2">Our team is here to help you</p>
        <button className="w-full py-2.5 rounded-lg border border-brand-teal text-brand-teal font-bold text-sm hover:bg-[#EAF5F2] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default StepperSidebar;
