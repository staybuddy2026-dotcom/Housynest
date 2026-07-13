import { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import mobileIcon from '../../assets/mobileicon.png';

const testimonials = [
  {
    id: 1,
    name: 'Arjun Mehta',
    role: 'PG Resident, Bangalore',
    quote: 'HousyNest helped me find an amazing PG within my budget. The process was so smooth and support team is very responsive.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Priya Iyer',
    role: 'Home Resident, Pune',
    quote: 'Found a beautiful home through HousyNest. Zero brokerage and the owners are verified. Highly recommended!',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Rohan Sharma',
    role: 'Tenant, Mumbai',
    quote: 'Best platform for finding rental homes. The verified listings feature saved me a lot of time and effort.',
    image: 'https://randomuser.me/api/portraits/men/86.jpg'
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'PG Resident, Delhi',
    quote: 'Love the app interface! It made booking a PG so transparent. No hidden charges and direct owner contact.',
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; // approximate width of card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const scrollAmount = 320;

        // If we are at or near the end, scroll back to 0
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          scrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Calculate active index based on scroll position
      const newIndex = Math.round((scrollLeft / (scrollWidth - clientWidth)) * (testimonials.length - 1));
      setActiveIndex(Math.min(Math.max(newIndex, 0), testimonials.length - 1));
    }
  };

  const scrollToDot = (index) => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const scrollPos = (index / (testimonials.length - 1)) * (scrollWidth - clientWidth);
      scrollRef.current.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="max-w-[1360px] mx-auto w-full py-12 px-4 sm:px-6 xl:px-0">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">

        {/* Left Content (Testimonials) */}
        <div className="w-full lg:w-[50%] xl:w-[55%] flex flex-col relative">

          {/* Header */}
          <div className="flex items-start gap-4 mb-8 pl-2">
            <Icon icon="ri:double-quotes-l" className="text-slate-200 text-5xl shrink-0 -mt-1" />
            <div className="flex flex-col">
              <h2 className="text-[28px] sm:text-3xl md:text-4xl font-serif font-bold text-[#04473a] leading-tight">
                What Our Residents Say
              </h2>
              <div className="relative mt-3 w-28 flex items-center self-end mr-8 md:mr-12">
                <div className="w-full h-[3px] bg-[#04473a] rounded-full"></div>
                <div className="absolute left-0 w-[60%] h-[3px] bg-[#04473a] rounded-full"></div>
                <div className="absolute left-[50%] w-2.5 h-2.5 rounded-full ring-[3px] ring-[#04473a] bg-brand-yellow shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Slider Container */}
          <div className="relative flex items-center w-full">


            {/* Cards Wrapper */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-5 py-5 px-4 sm:px-12 -mx-4 sm:mx-auto snap-x snap-mandatory w-[calc(100%+32px)] sm:w-full scroll-smooth"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)'
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="snap-center shrink-0 w-[280px] sm:w-[320px] md:w-[calc(60%-10px)] bg-white rounded-[20px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex gap-3 sm:gap-4 transition-transform hover:-translate-y-1 duration-300"
                >
                  {/* Avatar */}
                  <div className="shrink-0 pt-1">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shadow-sm"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col">
                    {/* Stars */}
                    <div className="flex text-amber-400 mb-2.5 gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} icon="ri:star-fill" className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-slate-600 text-sm md:text-sm leading-relaxed mb-5">
                      {testimonial.quote}
                    </p>

                    {/* User Info */}
                    <div className="mt-auto">
                      <h4 className="font-bold text-[#04473a] text-sm md:text-sm">{testimonial.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-500 text-xs md:text-xs">{testimonial.role}</span>
                        <Icon icon="lucide:check-circle" className="text-green-600 w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>


          </div>

          {/* Pagination & Funky Arrow */}
          <div className="mt-4 sm:mt-2 flex items-center justify-center sm:justify-between px-4 sm:px-12">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToDot(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${activeIndex === idx ? 'w-6 h-1.5 bg-[#04473a]' : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Curly Arrow pointing to phone */}
            <div className="hidden lg:block relative -mr-12 xl:-mr-28 -mt-14 z-10 transition-transform duration-500 hover:scale-105">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-[#04473a] opacity-60 drop-shadow-md scale-x-[-1] -rotate-24">
                {/* Dashed loop path */}
                <path d="M 15,95 C 40,110 75,105 70,65 C 65,35 30,40 35,70 C 40,100 70,95 90,70 C 100,55 105,40 109,28" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
                {/* Solid swept-back arrowhead */}
                <polygon points="113,16 99,29 109,28 116,33" fill="currentColor" />
              </svg>
            </div>
          </div>

        </div>

        {/* Right Content (Phones Image) */}
        <div className="w-full lg:w-[50%] xl:w-[45%] flex justify-center lg:justify-end relative mt-2 lg:mt-0 px-4 sm:px-0">
          {/* Subtle background glow for image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-teal-50/80 rounded-full blur-3xl -z-10"></div>

          <img
            src={mobileIcon}
            alt="HousyNest Mobile App"
            className="w-full max-w-[450px] md:max-w-[550px] lg:max-w-[600px] xl:max-w-[650px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-transform duration-500"
          />
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
