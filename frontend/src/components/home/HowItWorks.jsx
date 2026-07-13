import { Icon } from '@iconify/react';
import { Fragment } from 'react';

const steps = [
  {
    id: 1,
    title: 'Search',
    desc: 'Find PGs or homes in your preferred location',
    icon: 'lucide:search'
  },
  {
    id: 2,
    title: 'Compare',
    desc: 'Compare amenities, price & reviews',
    icon: 'lucide:clipboard-list'
  },
  {
    id: 3,
    title: 'Connect',
    desc: 'Connect with owner or visit the place',
    icon: 'lucide:message-square-text'
  },
  {
    id: 4,
    title: 'Move In',
    desc: 'Move in and start your new journey',
    icon: 'lucide:key'
  }
];

const HowItWorks = () => {
  return (
    <section className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 xl:px-0">
      <div className="bg-white rounded-xl border-2 border-gray-200/60 p-5 sm:p-8 md:px-12 md:py-8 relative overflow-hidden">

        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Title Area */}
        <div className="flex flex-col items-center justify-center mb-12 relative z-10">
          <div className="relative inline-block text-center flex flex-col items-center">
            <div className="relative inline-block">
              {/* Funky Arrow Left */}
              <svg
                className="absolute -left-14 -top-1 w-10 h-10 text-[#167A70] animate-pulse scale-x-[-1] hidden md:block"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M9 10l-5 5 5 5" />
                <path d="M4 15h11a5 5 0 0 0 5-5v-2" />
              </svg>

              <h2 className="text-[22px] sm:text-3xl md:text-4xl font-serif font-bold text-[#04473a]">
                How HousyNest Works?
              </h2>

              {/* Funky Arrow Right */}
              <svg
                className="absolute -right-14 -top-1 w-10 h-10 text-[#167A70] animate-pulse hidden md:block"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M9 10l-5 5 5 5" />
                <path d="M4 15h11a5 5 0 0 0 5-5v-2" />
              </svg>
            </div>

            {/* Architectural Border / Underline */}
            <div className="relative mt-4 w-28 flex items-center mx-auto">
              <div className="w-full h-[3px] bg-[#04473a] rounded-full"></div>
              <div className="absolute left-[50%] -translate-x-1/2 w-2.5 h-2.5 rounded-full ring-[3px] ring-[#04473a] bg-brand-yellow shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Steps Container */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-6 lg:gap-2 xl:gap-4 justify-start lg:justify-between items-start lg:items-center pb-2 lg:pb-6">
          {steps.map((step, index) => (
            <Fragment key={step.id}>
              {/* Step Item */}
              <div className="group flex items-center text-left gap-3 xl:gap-4 w-full lg:w-auto lg:flex-1 cursor-pointer">

                {/* Icon Circle */}
                <div className="relative shrink-0 w-[52px] h-[52px] xl:w-16 xl:h-16 rounded-full bg-[#04473a] flex items-center justify-center text-white shadow-lg transition-all duration-500 ease-out transform group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-brand-yellow group-hover:text-[#04473a] group-hover:shadow-[0_10px_20px_rgba(253,186,33,0.3)]">
                  {/* Ping effect on hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-brand-yellow/50 scale-100 opacity-0 group-hover:animate-ping"></div>
                  <Icon icon={step.icon} width="24" className="relative z-10 xl:w-7 xl:h-7" />
                </div>

                {/* Content */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#04473a] font-bold text-[17px] xl:text-lg leading-none group-hover:text-brand-yellow transition-colors duration-300">
                      {step.id}
                    </span>
                    <h3 className="text-[#04473a] font-bold text-[15px] xl:text-base leading-none group-hover:text-brand-yellow transition-colors duration-300">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-xs xl:text-sm lg:max-w-[150px] xl:max-w-[170px] leading-snug group-hover:text-slate-700 transition-colors duration-300">
                    {step.desc}
                  </p>
                </div>

              </div>

              {/* Connecting Dashed Arrow (Desktop Only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex shrink-0 w-8 xl:w-16 items-center justify-center -translate-y-1">
                  <svg
                    viewBox="0 0 100 40"
                    fill="none"
                    className="w-full overflow-visible text-brand-yellow drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                  >
                    <path d="M0,25 Q50,5 100,25" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" fill="none" />
                    <g transform="translate(100, 25) rotate(22)">
                      <polyline points="-10,-8 0,0 -10,8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>
              )}
            </Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
