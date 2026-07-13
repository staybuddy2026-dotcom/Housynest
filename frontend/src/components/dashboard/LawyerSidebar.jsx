import { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';

const LawyerSidebar = ({ onClose, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', icon: 'lucide:home', path: '/lawyer/dashboard' },
    { name: 'Owners', icon: 'lucide:users', path: '/lawyer/owners' },
    { name: 'Contracts', icon: 'lucide:file-text', path: '/lawyer/contracts' },
    { name: 'Profile', icon: 'lucide:user', path: '/lawyer/profile' },
  ];

  if (isMobile) {
    return (
      <div className="bg-white border-t border-slate-200 h-[75px] flex items-center justify-around px-2 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] rounded-t-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `relative flex flex-col items-center justify-center w-[20%] h-full transition-all duration-300 ${isActive ? 'text-[#062F26]' : 'text-slate-400'
              }`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#25D366] rounded-b-full shadow-[0_2px_4px_rgba(37,211,102,0.5)]" />
                )}
                <Icon
                  icon={item.icon}
                  className={`w-5 h-5 mb-1.5 transition-all duration-300 ${isActive ? 'text-[#062F26] transform -translate-y-0.5' : ''}`}
                />
                <span className={`text-[9px] font-bold text-center leading-none ${isActive ? 'text-[#062F26]' : ''} truncate w-full px-0.5`}>
                  {item.name === 'Verification Requests' ? 'Verify' : item.name.split(' ')[0]}
                </span>
                {item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-slate-100 flex flex-col w-full font-serif">
      {/* Logo */}
      <div className="h-[65px] px-6 flex items-center shrink-0 border-b border-slate-100 mb-2">
        <Link to="/" onClick={onClose}>
          <img src={logo} alt="Housynest" className="h-12 object-contain" />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto pt-2 flex flex-col gap-1 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center justify-between px-4 py-3 transition-all duration-300 group mx-4 ${isActive
                ? 'bg-[#062F26] border-l-[4px] border-[#25D366] text-white rounded-md shadow-md'
                : 'border-l-[4px] border-transparent text-slate-500 hover:text-[#062F26] hover:bg-slate-50/50 rounded-md'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon
                    icon={item.icon}
                    className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#062F26]'}`}
                  />
                  <span className="text-sm font-bold tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 shrink-0 flex flex-col gap-4 mt-auto border-t border-slate-100 pt-4">
        {/* Profile Card & Options */}
        <div className="relative flex flex-col justify-end">
          {/* Collapsible Options (Opening Upwards) */}
          <div
            className={`flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden ${isProfileOpen ? 'max-h-[100px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'
              }`}
          >
            <Link to="/lawyer/profile" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#062F26] rounded-lg transition-colors w-full">
              <Icon icon="lucide:settings" className="w-4 h-4" /> Account Settings
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
              <Icon icon="lucide:log-out" className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Profile Trigger */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 p-2 rounded-xl transition-colors border w-full text-left ${isProfileOpen ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#EAF5F2] flex items-center justify-center text-[#062F26] font-bold text-sm shrink-0 border border-brand-teal/20 uppercase">
              {user.fullName ? user.fullName.charAt(0) : 'L'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate capitalize">{user.fullName || 'Lawyer User'}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{user.email || 'lawyer@example.com'}</p>
            </div>
            <Icon
              icon="lucide:chevron-up"
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerSidebar;
