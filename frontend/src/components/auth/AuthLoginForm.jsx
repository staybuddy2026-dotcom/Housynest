import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import RoleSelectionModal from './RoleSelectionModal';
import CompleteProfileModal from './CompleteProfileModal';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const AuthLoginForm = () => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const [tempAuthData, setTempAuthData] = useState(null);
  const selectedRoleRef = useRef('tenant');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tokenResponse.access_token,
            role: selectedRoleRef.current
          })
        });
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.message || 'Google Login failed', { duration: 3000 });
          return;
        }

        if (!result.user.phone) {
          // Phone missing, ask user to complete profile
          setTempAuthData({
            accessToken: result.accessToken,
            user: result.user
          });
          setIsCompleteProfileOpen(true);
        } else {
          // Phone exists, proceed normally
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('user', JSON.stringify(result.user));

          toast.success(result.message || 'Logged in successfully!', { duration: 3000 });
          window.dispatchEvent(new Event('auth-change'));
          
          if (result.user.role === 'owner') {
            navigate('/owner/dashboard');
          } else if (result.user.role === 'tenant') {
            navigate('/tenant/dashboard');
          } else if (result.user.role === 'lawyer') {
            navigate('/lawyer/dashboard');
          } else {
            navigate('/');
          }
        }
      } catch {
        toast.error('An error occurred during Google login', { duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google Sign-In failed');
    }
  });

  const handleGoogleClick = () => {
    setIsRoleModalOpen(true);
  };

  const handleRoleSelect = (role) => {
    selectedRoleRef.current = role;
    googleLogin();
  };

  const handleProfileComplete = (updatedUser) => {
    setIsCompleteProfileOpen(false);

    // Proceed with login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('accessToken', tempAuthData.accessToken);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    window.dispatchEvent(new Event('auth-change'));
    
    if (updatedUser.role === 'owner') {
      navigate('/owner/dashboard');
    } else if (updatedUser.role === 'tenant') {
      navigate('/tenant/dashboard');
    } else if (updatedUser.role === 'lawyer') {
      navigate('/lawyer/dashboard');
    } else {
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Login failed', { duration: 3000 });
        return;
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      toast.success(result.message || 'Logged in successfully!', { duration: 3000 });
      window.dispatchEvent(new Event('auth-change'));
      
      if (result.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (result.user.role === 'tenant') {
        navigate('/tenant/dashboard');
      } else if (result.user.role === 'lawyer') {
        navigate('/lawyer/dashboard');
      } else {
        navigate('/');
      }
    } catch {
      toast.error('An error occurred during login', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-[28px] tracking-[-0.01em] font-serif font-bold text-[#062F26] mb-1.5 lg:mb-2">Log In to Your Account</h2>
        <p className="text-xs lg:text-sm text-slate-500 font-medium">Welcome back! Please enter your details.</p>
      </div>

      <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div>
          <div className="relative flex items-center group">
            <Icon icon="lucide:mail" className={`absolute left-3.5 w-4 h-4 z-10 transition-all duration-300 ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110'}`} />
            <input
              type="email"
              id="loginEmail"
              placeholder=" "
              {...register('email')}
              className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-4 pl-9 text-sm lg:text-sm outline-none transition-all duration-300 text-slate-700 font-medium shadow-sm ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white focus:shadow-md'}`}
            />
            <label htmlFor="loginEmail" className={`absolute left-8 px-1 transition-all duration-300 pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.email ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Email Address</label>
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div>
            <div className="relative flex items-center group">
              <Icon icon="lucide:lock" className={`absolute left-3.5 w-4 h-4 z-10 transition-all duration-300 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110'}`} />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                id="loginPassword"
                placeholder=" "
                {...register('password')}
                className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-10 pl-9 text-sm lg:text-sm outline-none transition-all duration-300 text-slate-700 font-medium shadow-sm ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white focus:shadow-md'}`}
              />
              <label htmlFor="loginPassword" className={`absolute left-8 px-1 transition-all duration-300 pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.password ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Password</label>
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3.5 text-slate-400 hover:text-[#062F26] hover:scale-110 transition-all duration-300 z-10 cursor-pointer">
                <Icon icon={showLoginPassword ? 'lucide:eye' : 'lucide:eye-off'} className="w-4 h-4" />
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded border-slate-300 text-[#062F26] cursor-pointer" />
              <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-xs font-semibold text-[#062F26] hover:underline transition-all">Forgot password?</Link>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-2.5 lg:py-3 rounded-md shadow-[0_4px_15px_rgba(6,47,38,0.15)] transition-all flex items-center justify-center text-sm cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isLoading ? (
            <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
          ) : null}
          {isLoading ? 'Logging In...' : 'Log In'}
        </button>

        <div className="relative py-4 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-slate-200"></div>
          <span className="relative bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">or log in with</span>
        </div>

        <button type="button" onClick={handleGoogleClick} disabled={isLoading} className="w-full flex items-center justify-center cursor-pointer gap-2 py-2.5 lg:py-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
          <Icon icon="logos:google-icon" className="w-4 h-4" />
          <span className="text-sm lg:text-sm font-medium text-slate-600">Continue with Google</span>
        </button>
      </form>

      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRole={handleRoleSelect}
      />

      <CompleteProfileModal
        isOpen={isCompleteProfileOpen}
        user={tempAuthData?.user}
        token={tempAuthData?.accessToken}
        onComplete={handleProfileComplete}
      />
    </>
  );
};

export default AuthLoginForm;
