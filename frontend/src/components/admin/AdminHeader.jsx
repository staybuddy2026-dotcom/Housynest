import { Icon } from '@iconify/react';
import logo from '../../assets/logo.png';
import { useState, useRef, useEffect } from 'react';

const AdminHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('this_year');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDateRangeText = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    switch (selectedRange) {
      case 'this_month':
        return `${new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentYear, currentMonth + 1, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'last_6_months':
        return `${new Date(currentYear, currentMonth - 5, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${formatDate(now)}`;
      case 'this_year':
      default:
        return `Jan 1 - Dec 31, ${currentYear}`;
    }
  };

  return (
    <header className="h-[65px] bg-white px-4 md:px-6 flex items-center justify-between border-b border-slate-100 shrink-0 gap-2">
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
        {/* Date Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg cursor-pointer border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 bg-white shadow-sm sm:shadow-none"
          >
            <Icon icon="lucide:calendar" className="w-4 h-4 text-slate-500 sm:text-slate-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 hidden sm:block">{getDateRangeText()}</span>
            <Icon icon="lucide:chevron-down" className={`w-3 h-3 sm:w-4 sm:h-4 text-slate-400 sm:ml-2 shrink-0 hidden sm:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-50">
              <button onClick={() => { setSelectedRange('this_month'); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${selectedRange === 'this_month' ? 'bg-emerald-50/50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>This Month</button>
              <button onClick={() => { setSelectedRange('last_6_months'); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${selectedRange === 'last_6_months' ? 'bg-emerald-50/50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>Last 6 Months</button>
              <button onClick={() => { setSelectedRange('this_year'); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${selectedRange === 'this_year' ? 'bg-emerald-50/50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>This Year</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
