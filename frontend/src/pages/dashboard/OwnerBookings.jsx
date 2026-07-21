import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const OwnerBookings = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  const summaryData = [
    { id: 1, title: '14', subtitle: 'Active Bookings', bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-brand-teal', progress: 'w-[85%]', progressBg: 'bg-brand-teal' },
    { id: 2, title: '5', subtitle: 'Upcoming', bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-500', progress: 'w-[30%]', progressBg: 'bg-blue-500' },
    { id: 3, title: '2', subtitle: 'Pending Approval', bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-500', progress: 'w-[15%]', progressBg: 'bg-amber-500' },
  ];

  const bookingsData = [
    { id: 1, name: 'Priya Sharma', room: 'Room 4A', checkIn: 'Jun 1', checkOut: 'Nov 30', status: 'Confirmed', statusColor: 'bg-emerald-50 text-brand-teal border-emerald-100' },
    { id: 2, name: 'Arjun Mehta', room: 'Room 2B', checkIn: 'Jun 5', checkOut: 'Dec 5', status: 'Confirmed', statusColor: 'bg-emerald-50 text-brand-teal border-emerald-100' },
    { id: 3, name: 'Divya Rao', room: 'Room 7C', checkIn: 'Jun 10', checkOut: 'Oct 10', status: 'Pending', statusColor: 'bg-amber-50 text-amber-500 border-amber-100' },
    { id: 4, name: 'Suresh Babu', room: 'Room 1A', checkIn: 'May 28', checkOut: 'Aug 28', status: 'Active', statusColor: 'bg-blue-50 text-blue-500 border-blue-100' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-340 3xl:max-w-420 mx-auto w-full relative pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] mb-1">Bookings</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <span>{today}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Bengaluru</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all"
          >
            <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-teal' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {summaryData.map((item) => (
          <div key={item.id} className={`${item.bg} border ${item.border} rounded-xl p-5 relative overflow-hidden group hover:shadow-sm transition-all cursor-pointer`}>
            <h2 className={`text-3xl font-bold ${item.text} mb-1 transition-transform group-hover:-translate-y-0.5`}>{item.title}</h2>
            <p className="text-sm font-medium text-slate-500 mb-4">{item.subtitle}</p>
            <div className="w-full h-1 bg-white/50 rounded-full overflow-hidden absolute bottom-5 left-5 right-5 max-w-[calc(100%-40px)]">
              <div className={`h-full rounded-full ${item.progressBg} ${item.progress} transition-all duration-1000 ease-out`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {bookingsData.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md hover:border-brand-teal/20 transition-all cursor-pointer group hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors shrink-0">
                {booking.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#062F26] mb-0.5 group-hover:text-brand-teal transition-colors">{booking.name}</span>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <span>{booking.room}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1"><Icon icon="lucide:calendar-range" className="w-3 h-3" /> {booking.checkIn} - {booking.checkOut}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${booking.statusColor}`}>
                {booking.status}
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-brand-teal hover:text-white transition-colors flex items-center justify-center">
                  <Icon icon="lucide:eye" className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#062F26] hover:text-white transition-colors flex items-center justify-center">
                  <Icon icon="lucide:message-square" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <div className="bg-[#062F26] rounded-xl p-4 pr-6 flex items-center gap-4 shadow-xl translate-y-2 hover:translate-y-0 transition-transform cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-teal/20 transition-colors">
            <Icon icon="lucide:bell-ring" className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-brand-teal uppercase tracking-wider mb-0.5">New Request</p>
            <p className="text-white font-bold text-base">Room 8B <span className="font-normal text-white/70">from Alex</span></p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OwnerBookings;
