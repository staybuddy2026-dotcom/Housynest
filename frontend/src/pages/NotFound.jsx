import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const NotFound = () => {
  return (
    <div className="relative flex flex-col items-center justify-center flex-grow py-20 px-4 text-center overflow-hidden bg-slate-50 min-h-[85vh]">
      {/* Premium Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-[20%] -translate-y-[80%] w-[300px] h-[300px] bg-brand-yellow/15 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        {/* Massive 404 with Gradient and Glass Badge */}
        <div className="relative mb-6 group cursor-default">
          <h1 className="text-[160px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-teal via-[#167A70] to-[#FDBA21] drop-shadow-sm select-none transition-transform duration-500 group-hover:scale-105">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <span className="bg-white/80 backdrop-blur-md text-slate-800 font-bold px-4 py-1 rounded-md shadow-lg border border-white/60 text-sm tracking-widest uppercase inline-block -rotate-6 transform group-hover:rotate-0 transition-transform duration-300">
              Page Not Found
            </span>
          </div>
        </div>

        {/* Helper Text */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Oops! You've lost your way.
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Premium Animated CTA Button */}
        <Link
          to="/"
          className="group relative inline-flex items-center gap-3 px-8 py-3 bg-slate-900 text-white font-bold rounded-md overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(11,79,72,0.3)] hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-teal to-[#167A70] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center gap-2">
            <Icon icon="lucide:arrow-left" width="20" height="20" className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Homepage
          </span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
