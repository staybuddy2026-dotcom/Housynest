import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';
import { io } from 'socket.io-client';

const TenantSidebar = ({ onClose, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });
  const [counts, setCounts] = useState({ unreadMessages: 0, newRequests: 0, newTenantContracts: 0 });
  const location = useLocation();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/users/tenant/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCounts({
            unreadMessages: data.unreadMessages || 0,
            newRequests: data.newRequests || 0,
            newTenantContracts: data.newTenantContracts || 0
          });
        }
      } catch (err) {
        console.error('Error fetching notification counts', err);
      }
    };
    fetchCounts();

    const handleMessagesRead = () => {
      fetchCounts();
    };

    const handleProfileUpdate = () => {
      try { setUser(JSON.parse(localStorage.getItem('user'))); } catch (e) { }
    };

    const handleNewTenantContract = () => {
      setCounts(prev => ({ ...prev, newTenantContracts: prev.newTenantContracts + 1 }));
    };

    const handleTenantContractsRead = () => {
      setCounts(prev => ({ ...prev, newTenantContracts: 0 }));
    };

    window.addEventListener('messagesRead', handleMessagesRead);
    window.addEventListener('profilePicUpdated', handleProfileUpdate);
    window.addEventListener('newTenantContract', handleNewTenantContract);
    window.addEventListener('tenantContractsRead', handleTenantContractsRead);
    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead);
      window.removeEventListener('profilePicUpdated', handleProfileUpdate);
      window.removeEventListener('newTenantContract', handleNewTenantContract);
      window.removeEventListener('tenantContractsRead', handleTenantContractsRead);
    };
  }, []);

  // Using Socket directly would be ideal, but fetching on custom event handles most cases.
  // Wait, I will add socket.io here if needed, but since it's inside DashboardLayout we can just rely on the `OwnerMessages/TenantMessages` socket for now, or connect it here too.
  // For safety, let's just connect it.
  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000');
    socket.emit('joinUserRoom', user.id || user._id);

    socket.on('newNotification', () => {
      setCounts(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
    });

    socket.on('newTenantContract', () => {
      setCounts(prev => ({ ...prev, newTenantContracts: prev.newTenantContracts + 1 }));
    });

    return () => socket.disconnect();
  }, [user]);



  const navItems = [
    { name: 'Saved Properties', icon: 'lucide:heart', path: '/tenant/dashboard' },
    { name: 'My Visits', icon: 'lucide:calendar-days', path: '/tenant/visits' },
    { name: 'My Requests', icon: 'lucide:message-circle', path: '/tenant/requests', badge: counts.newRequests > 0 ? counts.newRequests : null },
    { name: 'Messages', icon: 'lucide:message-square', path: '/tenant/messages', badge: counts.unreadMessages > 0 ? counts.unreadMessages : null },
    { name: 'Contracts', icon: 'lucide:file-text', path: '/tenant/contracts', badge: counts.newTenantContracts > 0 ? counts.newTenantContracts : null },
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
                  {item.name === 'Saved Properties' ? 'Saved' : item.name === 'My Requests' ? 'Requests' : item.name.split(' ')[0]}
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
      <div className="flex-1 overflow-hidden pt-2 flex flex-col gap-1">
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

        {/* Find your perfect PG CTA */}
        <div className="mt-2 mx-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Base of house */}
              <rect x="25" y="45" width="50" height="40" fill="#EAF5F2" />
              {/* Roof */}
              <polygon points="50,15 15,45 85,45" fill="#062F26" />
              {/* Windows */}
              <rect x="32" y="52" width="10" height="10" fill="#062F26" />
              <rect x="58" y="52" width="10" height="10" fill="#062F26" />
              {/* Door */}
              <rect x="42" y="65" width="16" height="20" fill="#062F26" />
            </svg>
          </div>
          <h4 className="text-[#062F26] font-bold mb-1.5 text-[15px]">Find your perfect PG</h4>
          <p className="text-slate-500 text-xs leading-relaxed mb-4">Save more properties and compare to find the right one.</p>
          <Link to="/properties" className="bg-[#062F26] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-brand-teal transition-colors w-full shadow-sm">
            Explore Properties <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 shrink-0 flex flex-col gap-4 mt-auto">
        {/* Profile Card & Options */}
        <div className="relative pt-2 border-t border-slate-100 flex flex-col justify-end">
          {/* Collapsible Options (Opening Upwards) */}
          <div
            className={`flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden ${isProfileOpen ? 'max-h-[100px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'
              }`}
          >
            <Link to="/tenant/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-[#F8F9FA] hover:text-[#062F26] transition-colors w-full text-left">
              <Icon icon="lucide:user" className="w-[18px] h-[18px] text-slate-400" />
              Profile
            </Link>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left">
              <Icon icon="lucide:power" className="w-[18px] h-[18px] text-red-400" />
              Logout
            </button>
          </div>

          {/* Profile Trigger */}
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="bg-transparent rounded-xl p-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#062F26] text-white flex items-center justify-center font-bold text-[15px] overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#062F26] leading-tight truncate w-24 sm:w-auto">{user?.fullName || 'Tenant Name'}</span>
                <span className="text-xs font-medium text-slate-500 truncate w-32 sm:w-auto">{user?.email || 'tenant@email.com'}</span>
              </div>
            </div>
            <Icon
              icon="lucide:chevron-up"
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSidebar;
