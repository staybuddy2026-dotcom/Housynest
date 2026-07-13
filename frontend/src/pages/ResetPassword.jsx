import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import loginImg from '../assets/loginimg.png';
import logo from '../assets/logo.png';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords don't match"
});

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="h-screen w-full relative flex font-sans overflow-hidden bg-slate-50">

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginImg}
          alt="Background"
          className="w-full h-full object-cover object-center lg:object-left"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1360px] pl-10 mx-auto flex flex-col lg:flex-row h-full">

        {/* Left Content Area */}
        <div className="w-full h-full py-6 pl-16 flex flex-col justify-between">

          <div className={`transform transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Logo */}
            <Link to="/">
              <img src={logo} alt="HousyNest Logo" className="h-14" />
            </Link>

            {/* Headline */}
            <div className="max-w-[380px] mt-10">
              <h1 className="text-3xl lg:text-[36px] font-serif font-bold text-slate-900 leading-[1.15] mb-3">
                Create New <br />
                <span className="text-brand-teal">Password</span>
              </h1>
              <p className="text-slate-600 text-base font-medium leading-relaxed mb-8">
                Your new password must be different from previous used passwords to ensure security.
              </p>

              {/* Features Card - Glassmorphism */}
              <div className="bg-white/60 backdrop-blur-xl rounded-lg p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white max-w-[320px] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon icon="lucide:shield-check" className="text-brand-teal w-5 h-5" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">Secure Password</h4>
                    <p className="text-xs font-medium text-slate-500 leading-tight">Use 8+ characters with a mix of letters and numbers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon icon="lucide:lock" className="text-brand-teal w-4.5 h-4.5" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">Safe & Encrypted</h4>
                    <p className="text-xs font-medium text-slate-500 leading-tight">Your data is fully protected.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Login CTA */}
          <div className={`mt-auto bg-[#062F26] rounded-lg p-4 flex items-center justify-between gap-4 shadow-xl max-w-[420px] border border-white/5 relative z-10 transform transition-all duration-1000 delay-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                <Icon icon="lucide:arrow-left" className="text-brand-yellow w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-0.5">Changed your mind?</h4>
                <p className="text-white/60 text-xs">Head back to the login page.</p>
              </div>
            </div>
            <Link to="/login" className="group relative overflow-hidden whitespace-nowrap px-5 py-2 rounded-md border border-white/20 text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center">
              <Icon
                icon="lucide:arrow-right"
                className="absolute left-3.5 -translate-x-[150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out w-4 h-4"
              />
              <span className="transform group-hover:translate-x-5 transition-transform duration-500 ease-out">
                Back to Login
              </span>
              <Icon
                icon="lucide:arrow-right"
                className="ml-1.5 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out w-4 h-4"
              />
            </Link>
          </div>

        </div>

        {/* Right Form Area */}
        <div className="w-full h-full p-4 lg:p-6 flex items-center justify-center relative z-10">

          <div className={`w-full max-w-[540px] bg-white rounded-xl p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-2 border-[#062F26]/20 flex flex-col justify-center h-auto min-h-[480px] origin-top-right transform transition-all duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0 -rotate-12'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <Icon icon="lucide:unlock" className="text-brand-teal w-7 h-7" />
              </div>
              <h2 className="text-[28px] tracking-[-0.01em] font-serif font-bold text-[#062F26] mb-2">Set New Password</h2>
              <p className="text-sm text-slate-500 font-medium">Please enter your new password below.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

              {/* Password */}
              <div>
                <div className="relative flex items-center group">
                  <Icon icon="lucide:lock" className={`absolute left-3.5 w-4 h-4 z-10 transition-all duration-300 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder=" "
                    {...register('password')}
                    className={`peer w-full bg-slate-50 border rounded-md py-3 pr-10 text-sm outline-none transition-all duration-300 text-slate-700 font-medium pl-9 shadow-sm ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 hover:bg-white hover:border-slate-300 focus:bg-white focus:shadow-md'}`}
                  />
                  <label htmlFor="newPassword" className={`absolute left-8 px-1 transition-all duration-300 pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.password ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-[#062F26] hover:scale-110 transition-all duration-300 z-10"
                  >
                    <Icon icon={showPassword ? 'lucide:eye' : 'lucide:eye-off'} className="w-4 h-4" />
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative flex items-center group">
                  <Icon icon="lucide:lock" className={`absolute left-3.5 w-4 h-4 z-10 transition-all duration-300 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder=" "
                    {...register('confirmPassword')}
                    className={`peer w-full bg-slate-50 border rounded-md py-3 pr-10 text-sm outline-none transition-all duration-300 text-slate-700 font-medium pl-9 shadow-sm ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 hover:bg-white hover:border-slate-300 focus:bg-white focus:shadow-md'}`}
                  />
                  <label htmlFor="confirmPassword" className={`absolute left-8 px-1 transition-all duration-300 pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.confirmPassword ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-[#062F26] hover:scale-110 transition-all duration-300 z-10"
                  >
                    <Icon icon={showConfirmPassword ? 'lucide:eye' : 'lucide:eye-off'} className="w-4 h-4" />
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-3 rounded-md shadow-[0_4px_15px_rgba(6,47,38,0.15)] hover:shadow-[0_8px_25px_rgba(6,47,38,0.25)] transition-all duration-300 transform flex items-center justify-center text-sm cursor-pointer mt-6"
              >
                Reset Password
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
