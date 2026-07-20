import { Icon } from '@iconify/react';
import heroImg from '../../assets/hero_img.jpg';
import hero1 from '../../assets/hero1.png';
import hero2 from '../../assets/hero2.png';
import hero3 from '../../assets/hero3.png';

const heroCards = [
  { id: 1, image: hero1, title: 'Luxury PG', locationArea: 'Koramangala,', locationCity: 'Bangalore', rating: '4.8' },
  { id: 2, image: hero2, title: 'Modern Home', locationArea: 'HSR Layout,', locationCity: 'Bangalore', rating: '4.9' },
  { id: 3, image: hero3, title: 'Co-living Space', locationArea: 'Indiranagar,', locationCity: 'Bangalore', rating: '4.7' },
];

const featureCards = [
  { id: 1, icon: 'mdi:shield-check-outline', title: 'Safe & Secure', subtitle: 'Environment' },
  { id: 2, icon: 'mdi:room-service-outline', title: 'Nutritious', subtitle: 'Meals' },
  { id: 3, icon: 'lucide:wifi', title: 'High Speed', subtitle: 'Wi-Fi' },
  { id: 4, icon: 'mdi:broom', title: 'Daily', subtitle: 'Housekeeping' },
];

const HeroSection = () => {
  return (
    <div className="relative bg-white pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
      {/* Full Bleed Right Image with Fade */}
      <div className="absolute top-0 right-0 w-[60%] sm:w-[60%] h-full z-0 pointer-events-none lg:pointer-events-auto">
        <img
          src={heroImg}
          alt="Hero Background"
          className="w-full h-full object-cover object-left lg:object-center opacity-60 lg:opacity-100"
        />
        {/* Gradient fade to blend into the white background on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:hidden"></div>
        <div className="absolute inset-y-0 left-0 w-[150px] sm:w-[250px] lg:w-[400px] bg-gradient-to-r from-white via-white/90 to-transparent"></div>

        {/* Highlighted 3 Cards */}
        <div className="hidden lg:flex absolute left-[4%] top-1/3 -translate-y-1/2 flex-col gap-5 z-20 pointer-events-auto">
          {heroCards.map((card) => (
            <div key={card.id} className="bg-white rounded-md p-2.5 shadow-2xl border border-gray-200 flex items-center gap-4 w-[260px]">
              <img src={card.image} alt={card.title} className="w-[120px] h-[85px] rounded-md object-cover" />
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 text-sm mb-0.5">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-snug mb-1.5">{card.locationArea}<br />{card.locationCity}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{card.rating}</span>
                  <Icon icon="lucide:star" className="text-brand-yellow w-3 h-3 fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlighted 4 Feature Cards (Right Side) */}
        <div className="hidden lg:flex absolute right-[4%] top-1/2 -translate-y-1/2 flex-col gap-4 z-20 pointer-events-auto">
          {featureCards.map((card) => (
            <div key={card.id} className="bg-[#fcfbf9] rounded-lg px-3 py-3.5 shadow-xl border border-white/60 flex items-center gap-2 w-[160px]">
              <div className="flex items-center justify-center text-[#18453b]">
                <Icon icon={card.icon} width="23" height="23" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{card.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-tight">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-340 3xl:max-w-420 mx-auto px-4 sm:px-6 xl:px-0">
        <div className="w-full">
          {/* Left Content */}
          <div className="space-y-5 sm:space-y-4 z-10 relative">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-gray-200 shadow-sm text-slate-900 text-xs sm:text-xs font-semibold tracking-wider">
              <Icon icon="lucide:shield-check" className="text-brand-teal w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="truncate max-w-[200px] sm:max-w-none">India's Most Trusted PG & Home Rental</span>
            </div>

            {/* Heading */}
            <h1 className="text-[34px] leading-[1.15] sm:text-4xl lg:text-5xl font-serif font-semibold tracking-wide text-[#0f2130] sm:leading-[1.2]">
              Find Your Perfect <br className="hidden sm:block" />
              <span className="text-brand-teal">PG & Home</span> <br className="hidden sm:block" />
              in <span className="relative inline-block">Minutes.
                <svg className="absolute w-full h-3 sm:h-4 -bottom-1.5 sm:-bottom-2 left-0 text-brand-yellow scale-y-[-1] overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M2 2 Q 50 10 98 2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="transparent" vectorEffect="non-scaling-stroke" />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-500 max-w-md font-medium mt-4 sm:mt-6">
              Verified properties, zero brokerage, instant booking and trusted landlords across India.
            </p>

            {/* Features Row */}
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-brand-teal bg-teal-50 shadow-sm">
                  <Icon icon="lucide:shield-check" width="21" height="21" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">100% Verified</span>
                  <span className="text-xs text-slate-500 leading-tight font-medium">Safety First</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-gray-100 flex items-center justify-center text-brand-teal shadow-sm">
                  <Icon icon="lucide:badge-percent" width="21" height="21" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">Zero Brokerage</span>
                  <span className="text-xs text-slate-500 leading-tight font-medium">No Hidden Charges</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-brand-teal bg-teal-50 shadow-sm">
                  <Icon icon="lucide:headset" width="21" height="21" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">24/7 Support</span>
                  <span className="text-xs text-slate-500 leading-tight font-medium">Always Together</span>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 pt-4 sm:pt-6">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" className="w-10.5 h-10.5 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" alt="User 1" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-10.5 h-10.5 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" alt="User 2" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-10.5 h-10.5 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" alt="User 3" />
                <img src="https://i.pravatar.cc/100?img=4" className="w-10.5 h-10.5 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" alt="User 4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-brand-yellow">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
                  <span className="text-slate-800 font-semibold ml-1 text-sm">4.9/5</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Trusted by 1 Million+ Happy Residents</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
