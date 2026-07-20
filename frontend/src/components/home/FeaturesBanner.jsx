import { Icon } from '@iconify/react';

const features = [
  {
    icon: 'lucide:shield-check',
    title: 'Verified Listings',
    desc: 'Every property is verified by our team'
  },
  {
    icon: 'lucide:scissors',
    title: 'Zero Brokerage',
    desc: 'Book directly with owners'
  },
  {
    icon: 'lucide:calendar-check',
    title: 'Instant Booking',
    desc: 'Quick booking & instant confirmation'
  },
  {
    icon: 'lucide:headset',
    title: '24/7 Support',
    desc: "We're here to help you anytime"
  },
  {
    icon: 'lucide:lock-keyhole',
    title: 'Secure Payments',
    desc: 'Safe & secure payment options'
  }
];

const FeaturesBanner = () => {
  return (
    <section className="max-w-340 3xl:max-w-420 mx-auto w-full pb-6 px-4 sm:px-6 xl:px-0">
      <div className="bg-[#04473a] rounded-xl lg:rounded-b-md lg:rounded-t-2xl py-5 sm:py-6 px-5 sm:px-6 md:px-8 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-[-50px] right-[-100px] w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 hover:bg-brand-yellow/20"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Grid on small screens, flex row on large screens */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row gap-6 lg:gap-6 justify-start lg:justify-between">
          {features.map((feature, idx) => (
            <div key={idx} className="group flex items-start gap-3 w-full lg:w-auto cursor-pointer">
              {/* Icon Container with Double Circle Effect */}
              <div className="shrink-0 w-[46px] h-[46px] rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand-yellow transition-all duration-300 relative overflow-hidden">
                {/* Inner circle */}
                <div className="w-[34px] h-[34px] rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-[#04473a] group-hover:bg-transparent transition-all duration-300 z-10">
                  <Icon icon={feature.icon} width="18" className="transform group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              {/* Text Container */}
              <div className="flex flex-col">
                <h4 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-brand-yellow transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-white/70 text-xs leading-[1.3] max-w-full lg:max-w-[140px] xl:max-w-[150px]">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
