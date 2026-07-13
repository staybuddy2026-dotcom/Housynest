import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import loginImg from '../assets/loginimg.png';
import logo from '../assets/logo.png';
import AuthSidebar from '../components/auth/AuthSidebar';
import AuthLoginForm from '../components/auth/AuthLoginForm';
import AuthSignupForm from '../components/auth/AuthSignupForm';
import AuthOtpForm from '../components/auth/AuthOtpForm';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const [flipCount, setFlipCount] = useState(location.pathname === '/signup' ? 1 : 0);
  const [faces, setFaces] = useState({
    even: location.pathname === '/signup' ? null : 'login',
    odd: location.pathname === '/signup' ? 'signup' : null,
  });
  const [registrationData, setRegistrationData] = useState(null);

  const evenFace = faces.even || 'login';
  const oddFace = faces.odd || 'signup';
  const isEvenActive = flipCount % 2 === 0;

  // For sidebar and mobile CTA
  const currentFace = isEvenActive ? evenFace : oddFace;
  const isSignupOrOtp = currentFace === 'signup' || currentFace === 'otp';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Sync with URL if user uses browser back/forward
    if (location.pathname === '/signup' && currentFace !== 'signup') {
      toggleFlip(null, 'signup');
    } else if (location.pathname === '/login' && currentFace !== 'login') {
      toggleFlip(null, 'login');
    }
  }, [location.pathname]);

  const toggleFlip = (e, targetFace = null) => {
    e?.preventDefault();
    const nextFaceName = targetFace || (currentFace === 'login' ? 'signup' : 'login');
    if (currentFace === nextFaceName) return;

    const nextCount = flipCount + 1;
    const nextIsEven = nextCount % 2 === 0;

    setFaces(prev => ({
      ...prev,
      [nextIsEven ? 'even' : 'odd']: nextFaceName
    }));
    setFlipCount(nextCount);
    navigate(`/${nextFaceName}`, { replace: true });
  };

  const handleOtpSent = (data) => {
    setRegistrationData(data);
    const nextCount = flipCount + 1;
    const nextIsEven = nextCount % 2 === 0;
    setFaces(prev => ({
      ...prev,
      [nextIsEven ? 'even' : 'odd']: 'otp'
    }));
    setFlipCount(nextCount);
  };

  const handleOtpSuccess = (user) => {
    if (user?.role === 'lawyer') {
      navigate('/', { replace: true });
      return;
    }
    const nextCount = flipCount + 1;
    const nextIsEven = nextCount % 2 === 0;
    setFaces(prev => ({
      ...prev,
      [nextIsEven ? 'even' : 'odd']: 'login'
    }));
    setFlipCount(nextCount);
    navigate('/login', { replace: true });
  };

  const handleOtpCancel = () => {
    setFlipCount(prev => prev - 1);
  };

  return (
    <div className="min-h-[100dvh] lg:h-screen w-full relative flex font-sans overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-slate-50">

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <img
          src={loginImg}
          alt="Background"
          className="w-full h-full object-cover object-center lg:object-left"
        />
      </div>
      {/* Mobile background (fixed so it doesn't break scrolling) */}
      <div className="fixed inset-0 z-0 lg:hidden">
        <img
          src={loginImg}
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1360px] px-4 sm:px-6 lg:px-0 lg:pl-10 mx-auto flex flex-col lg:flex-row min-h-screen lg:h-full">

        {/* Mobile Header (Back) */}
        <div className="w-full pt-5 lg:hidden flex items-center justify-start">
          <Link to="/" className="flex items-center gap-1.5 text-slate-600 font-semibold text-sm hover:text-brand-teal transition-colors bg-white/60 px-2 rounded-sm">
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Left Content Area (Animated Text & CTA) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-5/12">
          <AuthSidebar isFlipped={isSignupOrOtp} mounted={mounted} toggleFlip={toggleFlip} />
        </div>

        {/* Right Form Area (3D Flip Container) */}
        <div className="w-full lg:flex-1 lg:h-full py-6 lg:py-0 p-0 lg:p-6 flex flex-col items-center justify-center relative z-10 [perspective:1500px]">

          <div className={`relative w-full max-w-[540px] transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] [transform-style:preserve-3d] ${mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} style={{ transform: `rotateY(${flipCount * -180}deg)` }}>

            {/* Even Face */}
            <div className={`w-full bg-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-2 border-[#062F26]/20 flex flex-col justify-center min-h-[440px] lg:min-h-[480px] [backface-visibility:hidden] transition-all duration-500 ${!isEvenActive ? 'absolute inset-0 pointer-events-none opacity-0' : 'relative opacity-100'}`} style={{ transform: 'rotateY(0deg)' }}>
              <div className="flex justify-center mb-3 lg:hidden">
                <Link to="/">
                  <img src={logo} alt="HousyNest Logo" className="h-12 sm:h-12" />
                </Link>
              </div>
              {evenFace === 'login' && <AuthLoginForm />}
              {evenFace === 'signup' && <AuthSignupForm onOtpSent={handleOtpSent} />}
              {evenFace === 'otp' && <AuthOtpForm registrationData={registrationData} onSuccess={handleOtpSuccess} onCancel={handleOtpCancel} />}
            </div>

            {/* Odd Face */}
            <div className={`w-full bg-white rounded-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-2 border-[#062F26]/20 flex flex-col justify-center min-h-[440px] lg:min-h-[480px] [backface-visibility:hidden] transition-all duration-500 ${isEvenActive ? 'absolute inset-0 pointer-events-none opacity-0' : 'relative opacity-100'}`} style={{ transform: 'rotateY(180deg)' }}>
              <div className="flex justify-center mb-3 lg:hidden">
                <Link to="/">
                  <img src={logo} alt="HousyNest Logo" className="h-12 sm:h-12" />
                </Link>
              </div>
              {oddFace === 'login' && <AuthLoginForm />}
              {oddFace === 'signup' && <AuthSignupForm onOtpSent={handleOtpSent} />}
              {oddFace === 'otp' && <AuthOtpForm registrationData={registrationData} onSuccess={handleOtpSuccess} onCancel={handleOtpCancel} />}
            </div>

          </div>

          {/* Mobile CTA (Bottom Link) */}
          <div className="w-full mt-5 mb-8 lg:hidden flex justify-center">
            {isSignupOrOtp ? (
              <p className="text-slate-600 bg-white/70 px-2 py-1 rounded-md text-slate-600 font-medium text-sm sm:text-sm">Already have an account? <button onClick={(e) => toggleFlip(e, 'login')} className="text-brand-teal font-bold hover:underline ml-1">Login here</button></p>
            ) : (
              <p className="text-slate-600 bg-white/70 px-2 py-1 rounded-md text-slate-600 font-medium text-sm sm:text-sm">Don't have an account? <button onClick={(e) => toggleFlip(e, 'signup')} className="text-brand-teal font-bold hover:underline ml-1">Sign up here</button></p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
