import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const navLinks = [
  { title: 'About Us', path: '/about' },
  { title: 'All Properties', path: '/properties' },
  { title: 'Contact Us', path: '/contact' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
      setUser(JSON.parse(localStorage.getItem('user')) || null);
    };

    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        // Tenant uses /api/users/tenant/notifications, Owner uses /api/users/notification-counts
        // But /api/users/notification-counts works for both unreadMessages
        const res = await fetch('/api/users/notification-counts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadMessages || 0);
        }
      } catch (err) {
        console.error('Error fetching navbar counts', err);
      }
    };

    if (isAuthenticated) {
      fetchCounts();
    }

    const handleGlobalNotification = () => {
      setUnreadCount(prev => prev + 1);
    };

    const handleMessagesRead = () => {
      fetchCounts();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('profilePicUpdated', handleAuthChange);
    window.addEventListener('globalNewNotification', handleGlobalNotification);
    window.addEventListener('messagesRead', handleMessagesRead);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('profilePicUpdated', handleAuthChange);
      window.removeEventListener('globalNewNotification', handleGlobalNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [isAuthenticated]);

  return (
    <nav className="bg-white sticky top-0 z-50 px-4 sm:px-6 xl:px-0">
      <div className="max-w-340 3xl:max-w-420 mx-auto">
        <div className="flex justify-between items-center h-16 sm:h-19">

          {/* Logo Section */}
          <div className="shrink-0 flex items-center flex-1">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="HousyNest Logo" className="h-11 sm:h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex justify-center items-center space-x-10">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) => `
                  relative font-semibold text-sm transition-colors duration-200 group
                  ${isActive ? 'text-brand-teal' : 'text-slate-700 hover:text-brand-teal'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {link.title}
                    <span className={`absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-brand-teal origin-left transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            {isAuthenticated && user?.role === 'owner' && (
              <Link
                to="/list-property"
                className="hidden sm:flex text-brand-teal hover:bg-[#EAF5F2] cursor-pointer font-bold text-sm items-center gap-2 border-2 border-brand-teal px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                List Property
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative group cursor-pointer z-50">
                <div
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-md border border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-[#EAF5F2]/50 hover:shadow-sm transition-all duration-300"
                >
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 rounded-full bg-linear-to-tr from-[#062F26] to-brand-teal text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white uppercase overflow-hidden">
                      {user?.profilePic ? (
                        <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-slate-700 group-hover:text-[#062F26] transition-colors">{user?.fullName || 'User'}</span>
                  <svg className={`w-4 h-4 text-slate-400 group-hover:text-brand-teal transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>

                {/* Mobile dismiss overlay */}
                {isProfileDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }}
                  ></div>
                )}

                {/* Dropdown Menu */}
                <div className={`absolute right-0 top-full pt-3 w-56 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top z-50 ${isProfileDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'}`}>
                  <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-teal to-[#062F26]"></div>

                    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-[15px] font-bold text-slate-800">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{user?.email || ''}</p>
                    </div>

                    <div className="p-2 flex flex-col gap-1">
                      <Link to={user?.role ? `/${user.role}/profile` : '/profile'} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-[#EAF5F2] hover:text-brand-teal transition-colors group/item">
                        <svg className="w-4.5 h-4.5 text-slate-400 group-hover/item:text-brand-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        My Profile
                      </Link>
                      <Link
                        to={user?.role ? `/${user.role}/dashboard` : '/dashboard'}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-[#EAF5F2] hover:text-brand-teal transition-colors group/item"
                        onClick={() => {
                          setUnreadCount(0); // clear on click
                        }}
                      >
                        <svg className="w-4.5 h-4.5 text-slate-400 group-hover/item:text-brand-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Dashboard
                      </Link>

                      <div className="h-px bg-slate-100 my-1"></div>

                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/auth/logout', { method: 'POST' });
                          } catch (e) { console.error(e) }
                          localStorage.removeItem('isAuthenticated');
                          localStorage.removeItem('accessToken');
                          localStorage.removeItem('user');
                          window.dispatchEvent(new Event('auth-change'));
                          setIsProfileDropdownOpen(false);
                          toast.success('Logged out successfully', { duration: 3000 });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors group/item"
                      >
                        <svg className="w-4.5 h-4.5 text-red-400 group-hover/item:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-teal cursor-pointer hover:bg-brand-teal-hover text-white px-3 py-2 text-sm sm:px-5 sm:py-2 rounded-md sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap"
              >
                Login / Sign Up
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-brand-teal p-1 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute w-full left-0 bg-white overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-100 border-t border-gray-100 shadow-md opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
      >
        <div className="px-4 py-5 flex flex-col space-y-5">
          {navLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                block font-semibold text-[15px] transition-all duration-200 hover:translate-x-1
                ${isActive ? 'text-brand-teal' : 'text-slate-700 hover:text-brand-teal'}
              `}
            >
              {link.title}
            </NavLink>
          ))}
          {isAuthenticated && user?.role === 'owner' && (
            <Link
              to="/list-property"
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden text-brand-teal font-bold text-[15px] flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
              List Property
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
