import { Icon } from '@iconify/react';
import home1 from '../../assets/home1.png';
import home2 from '../../assets/home2.png';

const PropertyOwnerCTA = () => {
  return (
    <section className="max-w-[1360px] mx-auto w-full py-10 px-4 sm:px-6 xl:px-0">
      <div className="bg-[#fafafa] sm:bg-white p-6 sm:p-8 border-2 border-gray-200/60 rounded-xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-6">

        <div className='relative flex flex-col md:flex-row items-center w-full lg:w-auto justify-center gap-8 md:gap-6 min-h-[350px] md:min-h-0'>
          {/* Left Image (Living Room) - Background watermark on mobile */}
          <div className="absolute md:relative bottom-18 right-0 md:bottom-auto md:right-auto w-[85%] sm:w-[70%] md:w-[50%] flex justify-end md:justify-center order-2 md:order-1 opacity-20 md:opacity-100 pointer-events-none md:pointer-events-auto z-0">
            <img
              src={home1}
              alt="Living Room"
              className="w-full h-auto object-contain object-bottom md:object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="relative w-full md:w-[50%] flex flex-col justify-center items-start text-left z-10 order-1 md:order-2">
            <p className="text-sm md:text-base font-semibold text-[#8b9d95] mb-2">
              Are you a <span className="text-[#04473a]">property owner?</span>
            </p>
            <h2 className="text-[28px] sm:text-3xl md:text-[34px] font-serif font-bold text-[#04473a] leading-[1.2] sm:leading-[1.15] mb-6 tracking-tight">
              Earn More With <br className="hidden lg:block" /> Your Property
            </h2>

            <div className="flex flex-col gap-2.5 mb-5">
              {[
                'List your property for free',
                'Reach genuine tenants',
                'Easy property management',
                'Secure & on-time payments'
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-start gap-3">
                  <div className="bg-[#e6f0eb] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:check" width="14" strokeWidth="3.5" className="text-[#1a6654]" />
                  </div>
                  <span className="text-slate-700 font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>

            <button className="group relative overflow-hidden mt-1 bg-[#04473a] text-white cursor-pointer px-6 py-3 md:py-2.5 rounded-md text-sm font-medium flex items-center justify-center w-full sm:w-fit hover:bg-[#03362c] transition-colors shadow-lg shadow-[#04473a]/20">
              <Icon
                icon="lucide:arrow-right"
                width="16"
                className="absolute left-4 -translate-x-[150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out"
              />
              <span className="transform group-hover:translate-x-5 transition-transform duration-500 ease-out">
                Start Hosting Now
              </span>
              <Icon
                icon="lucide:arrow-right"
                width="16"
                className="ml-2 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out"
              />
            </button>
          </div>
        </div>

        {/* Right Dashboard Image */}
        <div className="w-full flex justify-center lg:justify-end items-center z-10 mt-0">
          <img
            src={home2}
            alt="Owner Dashboard"
            className="w-full sm:w-[90%] h-auto object-contain rounded-xl shadow"
          />
        </div>

      </div>
    </section>
  );
};

export default PropertyOwnerCTA;
