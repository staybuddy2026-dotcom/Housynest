import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';
import socket, { joinUserRoom, disconnectSocket } from '../../lib/socket';

const TenantSidebar = ({ onClose, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const profileRef = useRef(null);
  const moreMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [counts, setCounts] = useState({ unreadMessages: 0, newRequests: 0, newTenantContracts: 0, newMaintenanceUpdates: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/users/notification-counts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCounts({
            unreadMessages: data.unreadMessages || 0,
            newRequests: data.newRequests || 0,
            newTenantContracts: data.newTenantContracts || 0,
            newMaintenanceUpdates: data.newMaintenanceUpdates || 0
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

    const handleNewTenantContract = () => {
      setCounts(prev => ({ ...prev, newTenantContracts: prev.newTenantContracts + 1 }));
    };

    const handleTenantContractsRead = () => {
      setCounts(prev => ({ ...prev, newTenantContracts: 0 }));
    };

    const handleMaintenanceTicketsRead = () => {
      setCounts(prev => ({ ...prev, newMaintenanceUpdates: 0 }));
    };

    window.addEventListener('messagesRead', handleMessagesRead);
    window.addEventListener('profilePicUpdated', handleProfileUpdate);
    window.addEventListener('newTenantContract', handleNewTenantContract);
    window.addEventListener('tenantContractsRead', handleTenantContractsRead);
    window.addEventListener('maintenanceTicketsRead', handleMaintenanceTicketsRead);
    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead);
      window.removeEventListener('profilePicUpdated', handleProfileUpdate);
      window.removeEventListener('newTenantContract', handleNewTenantContract);
      window.removeEventListener('tenantContractsRead', handleTenantContractsRead);
      window.removeEventListener('maintenanceTicketsRead', handleMaintenanceTicketsRead);
    };
  }, []);

  // Using Socket directly would be ideal, but fetching on custom event handles most cases.
  // Wait, I will add socket.io here if needed, but since it's inside DashboardLayout we can just rely on the `OwnerMessages/TenantMessages` socket for now, or connect it here too.
  // For safety, let's just connect it.
  useEffect(() => {
    const onNewBookingRequest = () => {
      setCounts(prev => ({ ...prev, newBookingRequests: prev.newBookingRequests + 1 }));
      toast.success('You have a new booking request!', {
        id: 'new-booking-request',
        icon: '🔔',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    };

    const onNewMaintenanceTicket = () => {
      setCounts(prev => ({ ...prev, newMaintenanceTickets: prev.newMaintenanceTickets + 1 }));
      toast.success('New maintenance ticket raised by tenant!', {
        id: 'new-maintenance-ticket',
        icon: '🔧',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    };

    const onMaintenanceTicketUpdated = () => {
      if (user?.role === 'tenant') {
        setCounts(prev => ({ ...prev, newMaintenanceUpdates: prev.newMaintenanceUpdates + 1 }));
        toast.success('Maintenance ticket updated by owner!', {
          id: 'maintenance-ticket-updated',
          icon: '🔧',
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
        });
      }
    };

    socket.on('newNotification', onNewNotification);
    socket.on('newLead', onNewLead);
    socket.on('visit_update', onVisitUpdate);
    socket.on('newBookingRequest', onNewBookingRequest);
    socket.on('newMaintenanceTicket', onNewMaintenanceTicket);
    socket.on('maintenanceTicketUpdated', onMaintenanceTicketUpdated);

    return () => {
      socket.off('newNotification', onNewNotification);
      socket.off('newLead', onNewLead);
      socket.off('visit_update', onVisitUpdate);
      socket.off('newBookingRequest', onNewBookingRequest);
      socket.off('newMaintenanceTicket', onNewMaintenanceTicket);
      socket.off('maintenanceTicketUpdated', onMaintenanceTicketUpdated);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      disconnectSocket();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: 'lucide:layout-dashboard', path: '/tenant/dashboard' },
    { name: 'My Bookings', icon: 'lucide:book-open-check', path: '/tenant/bookings' },
    { name: 'Contracts', icon: 'lucide:file-text', path: '/tenant/contracts', badge: counts.newTenantContracts > 0 ? counts.newTenantContracts : null },
    { name: 'Rent Payments', icon: 'lucide:credit-card', path: '/tenant/rent-payments' },
    { name: 'Maintenance', icon: 'lucide:wrench', path: '/tenant/maintenance', badge: counts.newMaintenanceUpdates > 0 ? counts.newMaintenanceUpdates : null },
    { name: 'Messages', icon: 'lucide:message-square', path: '/tenant/messages', badge: counts.unreadMessages > 0 ? counts.unreadMessages : null },
  ];

  if (isMobile) {
    const visibleItems = navItems.slice(0, 4);
    const moreItems = navItems.slice(4);

    return (
      <>
        {showMoreMenu && (
          <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity" onClick={() => setShowMoreMenu(false)} />
        )}

        <div ref={moreMenuRef} className={`fixed bottom-18.75 right-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 transition-all duration-300 origin-bottom-right ${showMoreMenu ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
          {moreItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setShowMoreMenu(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'bg-[#062F26]/5 text-[#062F26]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {({ isActive }) => (
                <>
                  <Icon icon={item.icon} className={`w-4 h-4 ${isActive ? 'text-[#062F26]' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#062F26] rounded-full text-[10px] font-bold text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="bg-white border-t border-slate-200 h-18.75 flex items-center justify-around px-2 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] rounded-t-2xl z-50 relative">
          {visibleItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `relative flex flex-col items-center justify-center w-1/5 h-full transition-all duration-300 ${isActive ? 'text-[#062F26]' : 'text-slate-400'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#25D366] rounded-b-full shadow-[0_2px_6px_rgba(37,211,102,0.8)]" />
                  )}
                  {isActive && (
                    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#25D366]/30 blur-[6px] rounded-full pointer-events-none" />
                  )}
                  <div className="relative mb-1.5">
                    <Icon
                      icon={item.icon}
                      className={`w-5 h-5 transition-all duration-300 relative z-10 ${isActive ? 'text-[#062F26] transform -translate-y-0.5' : ''}`}
                    />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] flex items-center justify-center px-0.5 bg-[#062F26] rounded-full border-[1.5px] border-white text-[8px] font-bold text-white shadow-sm">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-none ${isActive ? 'text-[#062F26]' : ''} truncate w-full px-0.5`}>
                    {item.name.replace('My ', '').replace(' Properties', '')}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <button
            ref={moreBtnRef}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`relative flex flex-col items-center justify-center w-1/5 h-full transition-all duration-300 ${showMoreMenu ? 'text-[#062F26]' : 'text-slate-400'}`}
          >
            {showMoreMenu && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-300 rounded-b-full" />
            )}
            {showMoreMenu && (
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-300/30 blur-[6px] rounded-full pointer-events-none" />
            )}
            <div className="relative mb-1.5">
              <Icon
                icon="lucide:menu"
                className={`w-5 h-5 transition-all duration-300 relative z-10 ${showMoreMenu ? 'text-[#062F26] transform -translate-y-0.5' : ''}`}
              />
              {moreItems.some(i => i.badge) && !showMoreMenu && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-[1.5px] border-white z-10" />
              )}
            </div>
            <span className={`text-[9px] font-bold text-center leading-none ${showMoreMenu ? 'text-[#062F26]' : ''}`}>
              More
            </span>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="h-full bg-white border-r border-slate-100 flex flex-col w-full">
      <div className="h-16.25 px-6 flex items-center shrink-0 border-b border-slate-100 mb-2">
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
                  <span className={`text-[10px] min-w-[20px] h-[20px] flex items-center justify-center px-1.5 rounded-full font-bold shadow-sm ${isActive ? 'bg-white text-[#062F26]' : 'bg-[#062F26] text-white'
                    }`}>
                    {item.badge > 99 ? '99+' : item.badge}
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
      <div className="p-4 shrink-0 mt-auto border-t border-slate-100 relative" ref={profileRef}>
        {/* Floating Options Menu */}
        <div
          className={`absolute bottom-[80px] left-4 right-4 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 origin-bottom transition-all duration-300 ${isProfileOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 translate-y-4 invisible scale-95'
            }`}
        >
          <Link to="/tenant/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-[#F8F9FA] hover:text-[#062F26] transition-colors w-full group">
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
          className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all duration-300 border ${isProfileOpen
            ? 'bg-slate-50 border-slate-200 shadow-inner'
            : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 hover:shadow-sm'
            }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#062F26] text-white flex shrink-0 items-center justify-center font-bold text-[15px] overflow-hidden shadow-sm">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'
              )}
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.fullName || 'Tenant Name'}</span>
              <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">{user?.email || 'tenant@email.com'}</span>
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

export default TenantSidebar;
