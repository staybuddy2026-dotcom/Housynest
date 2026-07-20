import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';

const GlassFeatures = () => (
  <div className="bg-white/60 backdrop-blur-xl rounded-lg p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white max-w-[320px] space-y-3">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
        <Icon icon="lucide:check-circle-2" className="text-brand-teal w-5 h-5" />
      </div>
      <div className="pt-0.5">
        <h4 className="text-sm font-bold text-slate-900 mb-0.5">Verified Properties</h4>
        <p className="text-xs font-medium text-slate-500 leading-tight">100% trusted listings across India.</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
        <Icon icon="lucide:shield-check" className="text-brand-teal w-5 h-5" />
      </div>
      <div className="pt-0.5">
        <h4 className="text-sm font-bold text-slate-900 mb-0.5">Smart & Secure</h4>
        <p className="text-xs font-medium text-slate-500 leading-tight">Your data is safe with us.</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
        <Icon icon="lucide:users" className="text-brand-teal w-4.5 h-4.5" />
      </div>
      <div className="pt-0.5">
        <h4 className="text-sm font-bold text-slate-900 mb-0.5">Connect & Grow</h4>
        <p className="text-xs font-medium text-slate-500 leading-tight">Seamless connections for everyone.</p>
      </div>
    </div>
  </div>
);

const AuthSidebar = ({ isFlipped, mounted, toggleFlip }) => {
  return (
    <div className="w-full lg:h-full py-10 lg:py-6 lg:pl-16 flex flex-col justify-between relative">

      <div className={`transform transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="HousyNest Logo" className="h-10 lg:h-14 mb-8 lg:mb-10" />
        </Link>

        <div className="relative max-w-95 min-h-85 lg:h-75">
          {/* Login Headline */}
          <div className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${isFlipped ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
            <h1 className="text-3xl lg:text-[36px] font-serif font-bold text-slate-900 leading-[1.15] mb-3">
              Welcome Back to <br />
              <span className="text-brand-teal">HousyNest</span>
            </h1>
            <p className="text-slate-600 text-base font-medium leading-relaxed mb-8">
              Log in to access your dashboard, manage your properties, and connect with the community.
            </p>
            <GlassFeatures />
          </div>

          {/* Signup Headline */}
          <div className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${!isFlipped ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
            <h1 className="text-3xl lg:text-[36px] font-serif font-bold text-slate-900 leading-[1.15] mb-3">
              Join HousyNest <br />
              and <span className="text-brand-teal">Get Started</span>
            </h1>
            <p className="text-slate-600 text-base font-medium leading-relaxed mb-8">
              Create your account to explore verified properties, connect easily, and manage everything in one place.
            </p>
            <GlassFeatures />
          </div>
        </div>
      </div>

      {/* Bottom CTAs Container */}
      <div className={`mt-8 lg:mt-auto relative h-35 sm:h-25 lg:h-20 max-w-105 transform transition-all duration-1000 delay-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

        {/* Login CTA (Shows when on Login page, prompts to Signup) */}
        <div className={`absolute inset-0 bg-[#062F26] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-white/5 transition-all duration-700 ease-in-out ${isFlipped ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Icon icon="lucide:user-plus" className="text-brand-yellow w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-sm mb-0.5">Don't have an account?</h4>
              <p className="text-white/60 text-xs sm:text-xs">Sign up to start your journey.</p>
            </div>
          </div>
          <button onClick={toggleFlip} className="group relative overflow-hidden whitespace-nowrap w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-md border border-white/20 text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center">
            <Icon icon="lucide:arrow-right" className="absolute left-3.5 translate-x-[-150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out w-4 h-4" />
            <span className="transform group-hover:translate-x-5 transition-transform duration-500 ease-out">Sign Up Now</span>
            <Icon icon="lucide:arrow-right" className="ml-1.5 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out w-4 h-4" />
          </button>
        </div>

        {/* Signup CTA (Shows when on Signup page, prompts to Login) */}
        <div className={`absolute inset-0 bg-[#062F26] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-white/5 transition-all duration-700 ease-in-out ${!isFlipped ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Icon icon="lucide:clipboard-list" className="text-brand-yellow w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-sm mb-0.5">Already have an account?</h4>
              <p className="text-white/60 text-xs sm:text-xs">Login to continue your journey.</p>
            </div>
          </div>
          <button onClick={toggleFlip} className="group relative overflow-hidden whitespace-nowrap w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-md border border-white/20 text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center">
            <Icon icon="lucide:arrow-right" className="absolute left-3.5 translate-x-[-150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out w-4 h-4" />
            <span className="transform group-hover:translate-x-5 transition-transform duration-500 ease-out">Login Now</span>
            <Icon icon="lucide:arrow-right" className="ml-1.5 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default AuthSidebar;
