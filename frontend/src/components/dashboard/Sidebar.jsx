import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';
import { io } from 'socket.io-client';

const Sidebar = ({ onClose, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });
  const [counts, setCounts] = useState({
    unreadMessages: 0,
    newRequests: 0,
    newLawyerRequests: 0,
    newOwnerContracts: 0,
    newTenantContracts: 0,
    newVisits: 0
  });
  const location = useLocation();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch('/api/users/notification-counts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCounts({
            unreadMessages: data.unreadMessages || 0,
            newRequests: data.newRequests || 0,
            newLawyerRequests: data.newLawyerRequests || 0,
            newOwnerContracts: data.newOwnerContracts || 0,
            newTenantContracts: data.newTenantContracts || 0,
            newVisits: data.newVisits || 0
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

    const handleNewLawyerRequest = () => {
      setCounts(prev => ({ ...prev, newLawyerRequests: prev.newLawyerRequests + 1 }));
    };

    const handleLawyerRequestsRead = () => {
      setCounts(prev => ({ ...prev, newLawyerRequests: 0 }));
    };

    const handleNewOwnerContract = () => {
      setCounts(prev => ({ ...prev, newOwnerContracts: prev.newOwnerContracts + 1 }));
    };

    const handleOwnerContractsRead = () => {
      setCounts(prev => ({ ...prev, newOwnerContracts: 0 }));
    };

    const handleNewTenantContract = () => {
      setCounts(prev => ({ ...prev, newTenantContracts: prev.newTenantContracts + 1 }));
    };

    const handleTenantContractsRead = () => {
      setCounts(prev => ({ ...prev, newTenantContracts: 0 }));
    };

    window.addEventListener('messagesRead', handleMessagesRead);
    window.addEventListener('profilePicUpdated', handleProfileUpdate);
    window.addEventListener('globalNewLawyerRequest', handleNewLawyerRequest);
    window.addEventListener('lawyerRequestsRead', handleLawyerRequestsRead);
    window.addEventListener('newOwnerContract', handleNewOwnerContract);
    window.addEventListener('ownerContractsRead', handleOwnerContractsRead);
    window.addEventListener('newTenantContract', handleNewTenantContract);
    window.addEventListener('tenantContractsRead', handleTenantContractsRead);
    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead);
      window.removeEventListener('profilePicUpdated', handleProfileUpdate);
      window.removeEventListener('globalNewLawyerRequest', handleNewLawyerRequest);
      window.removeEventListener('lawyerRequestsRead', handleLawyerRequestsRead);
      window.removeEventListener('newOwnerContract', handleNewOwnerContract);
      window.removeEventListener('ownerContractsRead', handleOwnerContractsRead);
      window.removeEventListener('newTenantContract', handleNewTenantContract);
      window.removeEventListener('tenantContractsRead', handleTenantContractsRead);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000');
    socket.emit('joinUserRoom', user.id || user._id);

    socket.on('newNotification', () => {
      setCounts(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
    });

    socket.on('newInquiry', () => {
      setCounts(prev => ({ ...prev, newRequests: prev.newRequests + 1 }));
    });

    socket.on('visit_update', () => {
      // Re-fetch counts when visit updates (new visit or status change)
      const fetchCounts = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) return;
          const res = await fetch('/api/users/notification-counts', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCounts(prev => ({ ...prev, newVisits: data.newVisits || 0 }));
          }
        } catch (err) { }
      };
      fetchCounts();
    });

    return () => socket.disconnect();
  }, [user]);
  const navItems = [
    { name: 'Dashboard', icon: 'lucide:home', path: '/owner/dashboard' },
    { name: 'My Listings', icon: 'lucide:building-2', path: '/owner/listings' },
    { name: 'Visits', icon: 'lucide:calendar-days', path: '/owner/visits', badge: counts.newVisits > 0 ? counts.newVisits : null },
    { name: 'Inquiries', icon: 'lucide:message-circle-question', path: '/owner/inquiries', badge: counts.newRequests > 0 ? counts.newRequests : null },
    { name: 'Messages', icon: 'lucide:message-square', path: '/owner/messages', badge: counts.unreadMessages > 0 ? counts.unreadMessages : null },
    { name: 'Lawyer Requests', icon: 'lucide:users', path: '/owner/lawyer-requests', badge: counts.newLawyerRequests > 0 ? counts.newLawyerRequests : null },
    { name: 'Contracts', icon: 'lucide:file-text', path: '/owner/contracts', badge: counts.newOwnerContracts > 0 ? counts.newOwnerContracts : null },
  ];

  if (isMobile) {
    return (
      <div className="bg-white border-t border-slate-200 h-[75px] flex items-center justify-around px-2 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] rounded-t-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `relative flex flex-col items-center justify-center w-[16%] h-full transition-all duration-300 ${isActive ? 'text-[#062F26]' : 'text-slate-400'
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
                  {item.name.split(' ')[0]}
                </span>
                {item.badge && (
                  <span className="absolute top-2 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
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
      <div className="h-[65px] px-6 flex items-center shrink-0 border-b border-slate-100">
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
      <div className="p-4 shrink-0 flex flex-col gap-4">

        {/* Profile Card & Options */}
        <div className="relative pt-2 border-t border-slate-100 flex flex-col justify-end">

          {/* Collapsible Options (Opening Upwards) */}
          <div
            className={`flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden ${isProfileOpen ? 'max-h-[100px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'
              }`}
          >
            <Link to="/owner/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-[#F8F9FA] hover:text-[#062F26] transition-colors w-full text-left">
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
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] text-[#062F26] flex items-center justify-center font-bold text-[15px] overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'O'
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#062F26] leading-tight truncate w-24 sm:w-auto">{user?.fullName || 'Owner Name'}</span>
                <span className="text-xs font-medium text-slate-500">View Profile</span>
              </div>
            </div>
            <Icon
              icon="lucide:chevron-up"
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

      </div>
    </div >
  );
};

export default Sidebar;
