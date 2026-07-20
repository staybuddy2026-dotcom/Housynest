import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import loginImg from '../../assets/loginimg.png';
import logo from '../../assets/logo.png';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('admin@housynest.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [fadeWelcome, setFadeWelcome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        setShowWelcome(true);
        setTimeout(() => setFadeWelcome(true), 10); // Trigger fade in

        setTimeout(() => {
          setFadeWelcome(false); // Trigger fade out
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500); // Wait for transition before navigating
        }, 2000);
      } else {
        alert(data.message || 'Invalid credentials or not an admin');
        setIsLoading(false);
      }
    } catch {
      alert('Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative flex font-sans overflow-hidden bg-slate-50">

      {/* Welcome Overlay */}
      {showWelcome && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#062F26] transition-opacity duration-500 ease-in-out ${fadeWelcome ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`flex flex-col items-center transform transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${fadeWelcome ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}`}>
            <Icon icon="lucide:shield-check" className="w-20 h-20 text-[#0aa87d] mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 text-center tracking-tight">
              Welcome to the <br />
              <span className="text-[#0aa87d]">Admin Dashboard</span>
            </h2>
            <p className="text-slate-300 text-lg font-medium animate-pulse mt-2">Redirecting to Housynest Control...</p>
          </div>
        </div>
      )}

      {/* Background Image Container - Matching Auth.jsx perfectly */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginImg}
          alt="Background"
          className="w-full h-full object-cover object-center lg:object-left"
        />
      </div>

      <div className="relative z-10 w-full max-w-340 3xl:max-w-420 pl-26 mx-auto flex flex-col lg:flex-row h-full">

        {/* LEFT SIDE - Info Panel - Matching AuthSidebar sizing */}
        <div className="w-full lg:w-1/2 h-full py-6  flex flex-col justify-between relative z-10 lg:flex">

          <div className={`transform transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Logo */}
            <Link to="/">
              <img src={logo} alt="HousyNest Logo" className="h-14 mb-10" />
            </Link>

            <div className="relative max-w-105">
              <h1 className="text-3xl lg:text-[36px] font-serif font-bold text-slate-900 leading-[1.15] mb-3">
                Administrator <br />
                <span className="text-[#0aa87d]">Portal</span>
              </h1>
              <p className="text-slate-600 text-base font-medium leading-relaxed mb-8">
                Securely access the Housynest platform to manage listings, users, and oversee operations with ease.
              </p>

              {/* Feature List matching GlassFeatures */}
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 shadow-sm flex items-start gap-4">
                  <div className="bg-[#EAF5F2] p-2 rounded-full text-[#062F26] shrink-0 mt-0.5">
                    <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-0.5">Real-time Overview</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">Monitor key metrics, recent activities, and platform performance instantly.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 shadow-sm flex items-start gap-4">
                  <div className="bg-[#EAF5F2] p-2 rounded-full text-[#062F26] shrink-0 mt-0.5">
                    <Icon icon="lucide:shield-check" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-0.5">Secure Management</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">Enterprise-grade security to keep platform data and users safe.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form Area - Matching Auth.jsx perfectly */}
        <div className="w-full lg:w-1/2 h-full p-4 lg:p-6 flex items-center justify-center relative z-10 perspective-[1500px]">

          <div className={`relative w-full max-w-135 transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>

            <div className="w-full bg-white rounded-xl p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-2 border-[#062F26]/20 flex flex-col justify-center min-h-120">

              {/* Form Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-[#062F26] mb-2 tracking-tight">Admin Login</h2>
                <p className="text-sm text-slate-500 font-medium">Enter your credentials to continue</p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <div className="relative">
                    <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all placeholder:text-slate-400 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-700 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all placeholder:text-slate-400 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0aa87d] transition-colors focus:outline-none"
                    >
                      <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="hidden" defaultChecked />
                    <div className="w-4 h-4 rounded border border-[#062F26] bg-[#062F26] flex items-center justify-center transition-colors">
                      <Icon icon="lucide:check" className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
                  </label>
                  <Link to="#" className="text-sm font-bold text-[#062F26] hover:text-[#0aa87d] transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-[#062F26] hover:bg-[#04201a] text-white py-3.5 px-5 rounded-xl font-bold text-sm transition-colors shadow-md mt-4 disabled:opacity-70"
                >
                  {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
                </button>
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
