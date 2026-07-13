import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import logo from '../../assets/logo.png';

const AdminSidebar = ({ isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [pendingPropertyCount, setPendingPropertyCount] = useState(0);
  const [pendingReportCount, setPendingReportCount] = useState(0);
  const [unreadReportCount, setUnreadReportCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    // Initial load
    handleStorageChange();

    // Listen for storage events (e.g. from AdminSettings)
    window.addEventListener('storage', handleStorageChange);

    let lastViewed = parseInt(localStorage.getItem('lastViewedReportCount') || '0', 10);

    if (location.pathname === '/admin/reports') {
      lastViewed = pendingReportCount;
      localStorage.setItem('lastViewedReportCount', pendingReportCount.toString());
      setUnreadReportCount(0);
    } else {
      if (pendingReportCount > lastViewed) {
        setUnreadReportCount(pendingReportCount - lastViewed);
      } else {
        localStorage.setItem('lastViewedReportCount', pendingReportCount.toString());
        setUnreadReportCount(0);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pendingReportCount, location.pathname]);

  const navItems = [
    { name: 'Analytics', path: '/admin/dashboard', icon: 'lucide:bar-chart-2' },
    { name: 'Listings Management', path: '/admin/listings', icon: 'lucide:home' },
    { name: 'User Management', path: '/admin/users', icon: 'lucide:users' },
    { name: 'Property Requests', path: '/admin/property-requests', icon: 'lucide:clipboard-list', badge: pendingPropertyCount > 0 ? pendingPropertyCount : null },
    { name: 'Lawyer Requests', path: '/admin/lawyer-requests', icon: 'lucide:scale' },
    { name: 'WA Outreach', path: '/admin/wa-outreach', icon: 'lucide:message-square' },
    { name: 'Reports', path: '/admin/reports', icon: 'lucide:flag', badge: unreadReportCount > 0 ? unreadReportCount : null },
    { name: 'Settings', path: '/admin/settings', icon: 'lucide:settings' },
  ];

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('/api/properties/admin/pending-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingPropertyCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch pending property count', err);
    }
  };

  const fetchPendingReportCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('/api/reports/pending-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingReportCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch pending report count', err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    fetchPendingReportCount();

    // Establish WebSocket Connection
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    socket.on('property_update', () => {
      fetchPendingCount();
    });

    socket.on('report_update', () => {
      fetchPendingReportCount();
    });

    return () => {
      socket.disconnect();
    };
  }, []);



  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/control/login');
  };

  if (isMobile) {
    const visibleItems = navItems.slice(0, 4);
    const hiddenItems = navItems.slice(4);

    return (
      <div className="relative">
        {/* Overlay for dismissing the menu */}
        {isMoreMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/10"
            onClick={() => setIsMoreMenuOpen(false)}
          />
        )}

        {/* More Menu Popup */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-[85px] right-2 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 min-w-[180px] animate-in fade-in slide-in-from-bottom-4">
            {hiddenItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-[#062F26] font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Icon icon={item.icon} className={`w-[18px] h-[18px] ${isActive ? 'text-[#25D366]' : 'text-slate-400'}`} />
                  <span className="text-sm">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="h-px bg-slate-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 font-bold w-full text-left"
            >
              <Icon icon="lucide:power" className="w-[18px] h-[18px]" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}

        <div className="bg-white border-t border-slate-200 h-[75px] flex items-center justify-around px-2 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] rounded-t-2xl relative z-50">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path || (item.name === 'Analytics' && location.pathname.includes('/admin/dashboard'));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMoreMenuOpen(false)}
                className={`relative flex flex-col items-center justify-center w-[18%] h-full transition-all duration-300 ${isActive ? 'text-[#062F26]' : 'text-slate-400'
                  }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#25D366] rounded-b-full shadow-[0_2px_4px_rgba(37,211,102,0.5)]" />
                )}
                <Icon
                  icon={item.icon}
                  className={`w-5 h-5 mb-1.5 transition-all duration-300 ${isActive ? 'text-[#062F26] transform -translate-y-0.5' : ''}`}
                />
                <span className={`text-[10px] font-bold text-center leading-none ${isActive ? 'text-[#062F26]' : ''}`}>
                  {item.name === 'Listings Management' ? 'Listings' : item.name === 'Property Requests' ? 'Properties' : item.name === 'User Management' ? 'Users' : item.name}
                </span>
                {item.badge && (
                  <span className="absolute top-2 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`relative flex flex-col items-center justify-center w-[18%] h-full transition-all duration-300 ${isMoreMenuOpen ? 'text-[#062F26]' : 'text-slate-400'
              }`}
          >
            <Icon
              icon="lucide:more-horizontal"
              className={`w-6 h-6 mb-1 transition-all duration-300 ${isMoreMenuOpen ? 'text-[#062F26] transform -translate-y-0.5' : ''}`}
            />
            <span className={`text-[10px] font-bold text-center leading-none ${isMoreMenuOpen ? 'text-[#062F26]' : ''}`}>
              More
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-68 bg-white border-r border-slate-100 flex flex-col h-full font-serif">
      {/* Logo */}
      <div className="h-[65px] px-6 flex items-center shrink-0 border-b border-slate-100  ">
        <Link to="/">
          <img src={logo} alt="Housynest" className="h-12 object-contain" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between pr-0 pb-6 overflow-y-auto custom-scrollbar">
        {/* Navigation */}
        <div className="space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.name === 'Analytics' && location.pathname.includes('/admin/dashboard'));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center justify-between px-4 py-3 transition-all duration-300 group mx-4 ${isActive
                  ? 'bg-[#062F26] border-l-[4px] border-[#25D366] text-white rounded-md shadow-md'
                  : 'border-l-[4px] border-transparent text-slate-500 hover:text-[#062F26] hover:bg-slate-50/50 rounded-md'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    icon={item.icon}
                    className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#062F26]'}`}
                  />
                  <span className={`text-sm font-bold tracking-wide`}>
                    {item.name}
                  </span>
                </div>
                {item.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Profile Area */}
        <div className="mx-4 mt-auto relative pt-2">

          {/* Collapsible Options */}
          <div
            className={`flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden ${isProfileOpen ? 'max-h-[50px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'
              }`}
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
            >
              <Icon icon="lucide:power" className="w-[18px] h-[18px] text-red-400" />
              Logout
            </button>
          </div>

          {/* Profile Widget Trigger */}
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="p-3 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between group shadow-sm bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#062F26] text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">{user?.fullName || 'Admin User'}</h4>
                <p className="text-xs text-slate-500 font-medium">{user?.email || 'admin@housynest.com'}</p>
              </div>
            </div>
            <Icon
              icon="lucide:chevron-up"
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
