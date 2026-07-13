import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import aboutmain from '../assets/aboutmain.png';
import about1 from '../assets/about1.png';

const benefits = [
  { icon: 'lucide:shield-check', title: 'Verified Listings', desc: 'Every property is verified for your safety.' },
  { icon: 'lucide:badge-percent', title: 'Zero Brokerage', desc: 'Book directly with owners & save more.' },
  { icon: 'lucide:headphones', title: '24/7 Support', desc: 'Our team is always here to help you.' },
  { icon: 'lucide:calendar-check', title: 'Instant Booking', desc: 'Quick booking & instant confirmation.' },
  { icon: 'lucide:lock', title: 'Secure Payments', desc: 'Safe & secure payment options.' },
];

const team = [
  { name: 'Aman Verma', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Priya Nair', role: 'COO', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { name: 'Rahul Sharma', role: 'CTO', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80' },
  { name: 'Neha Kapoor', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
];

const About = () => {
  return (
    <div className="bg-[#F8F9FA] font-sans min-h-screen pb-10 lg:pb-20">

      {/* Hero Section */}
      <div className="relative w-full overflow-hidden bg-[#FAF6F0] lg:h-[350px] pt-2">

        {/* The Image and Gradient Overlay that you liked */}
        <div className="absolute inset-y-0 right-0 w-full z-0">
          <img src={aboutmain} alt="Living Room" className="w-full h-full object-cover object-left opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0] via-[#FAF6F0] lg:via-[#FAF6F0]/80 to-transparent"></div>
        </div>

        <div className="max-w-[1360px] mx-auto h-full relative z-10 flex flex-col justify-center pb-20 px-4 sm:px-6 xl:px-0">
          <div className="max-w-lg">
            <div className="flex items-center text-xs font-semibold text-[#062F26] mb-5 capitalize tracking-wide">
              <Link to="/" className="hover:underline">Home</Link>
              <Icon icon="lucide:chevron-right" className="mx-1.5 w-3 h-3 text-slate-400" />
              <span className="text-slate-500">About Us</span>
            </div>
            <h1 className="text-4xl lg:text-[42px] font-serif font-bold text-[#062F26] leading-[1.1] mb-2">
              About HousyNest
            </h1>
            <h2 className="text-sm lg:text-base font-semibold text-brand-teal tracking-wide mb-2">
              Redefining the way India lives, stays & connects.
            </h2>
            <div className="w-12 h-[1.6px] bg-brand-teal mb-5"></div>
            <p className="text-slate-800 text-sm lg:text-base leading-relaxed font-medium">
              HousyNest is India's most trusted platform for finding verified PGs and rental homes. We make the journey of finding a place simple, safe and seamless.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Benefits Strip */}
      <div className="max-w-[1360px] mx-auto -mt-12 lg:-mt-16 relative z-20 px-4 sm:px-6 xl:px-0">
        <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] p-5 lg:p-7 flex flex-wrap md:flex-nowrap items-start md:items-center justify-between border-2 border-gray-100 gap-y-6 md:gap-y-0">
          {benefits.map((b, i) => (
            <div key={i} className={`flex items-center gap-3 w-full sm:w-[calc(50%-12px)] md:w-auto md:flex-1 ${i !== benefits.length - 1 ? 'md:border-r border-slate-100 md:pr-4' : ''} ${i !== 0 ? 'md:pl-4' : ''}`}>
              <div className="w-13 h-13 rounded-full bg-[#EAF5F2] flex items-center justify-center flex-shrink-0">
                <Icon icon={b.icon} className="w-6 h-6 text-[#062F26]" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-[#062F26] mb-0.5">{b.title}</h4>
                <p className="text-xs text-slate-700 font-normal leading-snug pr-2">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-[1360px] mx-auto py-10 px-4 sm:px-6 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 items-start">

          <div className="w-full lg:w-[52%]">
            <img src={about1} alt="Team meeting" className="w-full h-auto rounded-md object-cover shadow-sm" />
          </div>

          <div className="w-full lg:w-[48%] lg:pl-6">
            <h3 className="text-brand-teal font-bold text-xs tracking-widest uppercase mb-3">Our Story</h3>
            <h2 className="text-3xl lg:text-[34px] font-serif font-bold text-[#062F26] mb-3 max-w-lg leading-snug">
              Building Reliable Connections Since Day One
            </h2>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4 max-w-lg">
              Founded in 2020, HousyNest was born out of a simple idea – to help people find a place they can truly call home. From students to working professionals and families, we've helped 1 million+ happy residents find comfortable and verified places across India.
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div>
                <div className="text-base font-bold text-[#062F26]">Aman Verma</div>
                <div className="text-xs text-slate-500 font-medium">Founder & CEO, HousyNest</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 max-w-xl mt-8 lg:mt-0">
              <div className="grid grid-cols-2">
                {[
                  { icon: 'lucide:home', value: '50,000+', label: 'Properties' },
                  { icon: 'lucide:users', value: '1 Million+', label: 'Happy Residents' },
                  { icon: 'lucide:map-pin', value: '200+', label: 'Cities' },
                  { icon: 'lucide:star', value: '4.9/5', label: 'Average Rating' },
                ].map((stat, index) => (
                  <div key={index} className={`p-3 sm:p-5 lg:p-7 flex flex-col xl:flex-row items-center justify-center text-center xl:text-left gap-2 xl:gap-4 ${index < 2 ? 'border-b border-slate-100' : ''} ${index % 2 === 0 ? 'border-r border-slate-100' : ''}`}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EAF5F2] flex items-center justify-center flex-shrink-0">
                      <Icon icon={stat.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-[#062F26]" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-lg lg:text-xl font-bold text-[#062F26] mb-0.5">{stat.value}</div>
                      <div className="text-[10px] sm:text-xs text-slate-600 font-medium">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet The Team */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 xl:px-0 mt-0">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 items-start">

          <div className="w-full lg:w-[35%] lg:sticky top-24 lg:pt-2 pr-4">
            <h3 className="text-[#062F26] font-bold text-xs tracking-[0.15em] uppercase mb-4">Meet The Team</h3>
            <h2 className="text-3xl lg:text-[34px] font-serif font-bold text-[#062F26] mb-5 leading-[1.2]">
              The People Behind<br />HousyNest
            </h2>
            <p className="text-slate-600 text-sm lg:text-sm font-medium leading-relaxed mb-8 pr-4">
              A passionate team of real estate, technology and customer experience experts working together to make renting simple and reliable for everyone.
            </p>
            <button className="flex items-center gap-2 border border-[#062F26] text-[#062F26] px-5 py-2.5 rounded text-sm font-bold hover:bg-[#062F26] hover:text-white transition-colors group">
              Join Our Team
              <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="w-full lg:w-[45%] grid grid-cols-2 gap-4">
            {team.map((t, idx) => (
              <div key={idx} className="group relative bg-white rounded-lg p-5 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 hover:border-slate-100 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">

                {/* Subtle top background highlight */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-teal-50/50 to-transparent rounded-t-2xl opacity-50 z-0"></div>

                <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mb-4 border-4 border-gray-200 shadow-sm z-10">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>

                <h4 className="relative z-10 font-bold text-[#062F26] text-base lg:text-lg mb-1">{t.name}</h4>
                <p className="relative z-10 text-[10px] text-brand-teal font-bold tracking-widest uppercase mb-4">{t.role}</p>

                <div className="relative z-10 flex justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#062F26] hover:text-white transition-colors cursor-pointer">
                    <Icon icon="lucide:linkedin" className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#062F26] hover:text-white transition-colors cursor-pointer">
                    <Icon icon="lucide:twitter" className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-[25%] flex flex-col justify-center bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50 p-4 lg:py-7">
            {[
              { icon: 'lucide:eye', title: 'Our Vision', desc: "To become India's most loved living & renting platform." },
              { icon: 'lucide:target', title: 'Our Mission', desc: 'To simplify real estate discovery with trust, transparency and technology.' },
            ].map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-full bg-[#EAF5F2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon icon={item.icon} className="w-5 h-5 text-[#062F26]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#062F26] tracking-[0.1em] uppercase mb-2.5">{item.title}</h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed pr-2">{item.desc}</p>
                  </div>
                </div>
                {index === 0 && <div className="h-px bg-slate-100 w-full my-6"></div>}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default About;
