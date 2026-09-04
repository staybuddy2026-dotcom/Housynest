import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';
import { useState, useRef, useEffect } from 'react';

import socket, { disconnectSocket } from '../../lib/socket';

const AdminHeader = () => {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error', err);
    }
    disconnectSocket();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/control/login';
  };

  return (
    <header className="h-16.25 bg-white px-4 md:px-6 flex items-center justify-between border-b border-slate-100 shrink-0 gap-2">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="lg:hidden shrink-0">
          <img src={logo} alt="Housynest" className="h-8 object-contain" />
        </div>

        <div className="flex-1 min-w-0 hidden lg:block">
          <h1 className="text-[15px] sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="truncate">Welcome back, Admin!</span>
            <span className="animate-wave inline-block origin-bottom-right shrink-0">👋</span>
          </h1>
          <p className="text-xs sm:text-xs text-slate-500 font-medium truncate hidden sm:block mt-0.5">
            Here's what's happening with Housynest today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg cursor-pointer border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white shadow-sm sm:shadow-none"
        >
          <Icon icon="lucide:log-out" className="w-4 h-4 shrink-0" />
          <span className="text-xs sm:text-sm hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
