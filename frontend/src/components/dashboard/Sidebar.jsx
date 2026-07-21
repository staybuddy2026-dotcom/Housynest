import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';
import { io } from 'socket.io-client';

const Sidebar = ({ onClose, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [counts, setCounts] = useState({
    unreadMessages: 0,
    newRequests: 0,
    newLawyerRequests: 0,
    newOwnerContracts: 0,
    newTenantContracts: 0,
    newVisits: 0
  });
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { /* ignore */ }
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
        } catch { /* ignore */ }
      };
      fetchCounts();
    });

    return () => socket.disconnect();
  }, [user]);

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: 'lucide:home', path: '/owner/dashboard' },
    { name: 'My Listings', icon: 'lucide:building-2', path: '/owner/listings' },
    { name: 'Visits', icon: 'lucide:calendar-days', path: '/owner/visits', badge: counts.newVisits > 0 ? counts.newVisits : null },
    { name: 'Inquiries', icon: 'lucide:message-circle-question', path: '/owner/inquiries', badge: counts.newRequests > 0 ? counts.newRequests : null },
    { name: 'Messages', icon: 'lucide:message-square', path: '/owner/messages', badge: counts.unreadMessages > 0 ? counts.unreadMessages : null },
    { name: 'Lawyer Requests', icon: 'lucide:users', path: '/owner/lawyer-requests', badge: counts.newLawyerRequests > 0 ? counts.newLawyerRequests : null },
    { name: 'Contracts', icon: 'lucide:file-text', path: '/owner/contracts', badge: counts.newOwnerContracts > 0 ? counts.newOwnerContracts : null },
    { name: 'Bookings', icon: 'lucide:book-open-check', path: '/owner/bookings' },
    { name: 'Payments', icon: 'lucide:wallet', path: '/owner/payments' },
    { name: 'Reports', icon: 'lucide:bar-chart-3', path: '/owner/reports' },
  ];

  if (isMobile) {
    return (
      <div className="bg-white border-t border-slate-200 h-18.75 flex items-center justify-around px-2 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] rounded-t-2xl">
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
    <div className="h-full bg-white border-r border-slate-100 flex flex-col w-full">
      {/* Logo */}
      <div className="h-16.25 px-6 flex items-center shrink-0 border-b border-slate-100">
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
                ? 'bg-[#062F26] border-l-4 border-[#25D366] text-white rounded-md shadow-md'
                : 'border-l-4 border-transparent text-slate-500 hover:text-[#062F26] hover:bg-slate-50/50 rounded-md'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon
                    icon={item.icon}
                    className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#062F26]'}`}
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
      <div className="p-4 shrink-0 mt-auto border-t border-slate-100 relative" ref={profileRef}>
        {/* Floating Options Menu */}
        <div
          className={`absolute bottom-[80px] left-4 right-4 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 origin-bottom transition-all duration-300 ${
            isProfileOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 translate-y-4 invisible scale-95'
          }`}
        >
          <Link to="/owner/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-[#F8F9FA] hover:text-[#062F26] transition-colors w-full group">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
               <Icon icon="lucide:user" className="w-4 h-4 text-slate-500 group-hover:text-[#062F26]" />
            </div>
            My Profile
          </Link>
          
          <div className="h-px bg-slate-100 my-1 mx-2"></div>
          
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left group">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
               <Icon icon="lucide:log-out" className="w-4 h-4 text-red-500" />
            </div>
            Sign Out
          </button>
        </div>

        {/* Profile Trigger */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all duration-300 border ${
            isProfileOpen 
              ? 'bg-slate-50 border-slate-200 shadow-inner' 
              : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#062F26] text-white flex shrink-0 items-center justify-center font-bold text-[15px] overflow-hidden shadow-sm">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'O'
              )}
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.fullName || 'Owner Name'}</span>
              <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">{user?.email || 'owner@email.com'}</span>
            </div>
          </div>
          <div className={`w-7 h-7 rounded-full flex shrink-0 items-center justify-center transition-colors ${isProfileOpen ? 'bg-slate-200' : 'bg-slate-100'}`}>
            <Icon
              icon="lucide:chevron-up"
              className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
