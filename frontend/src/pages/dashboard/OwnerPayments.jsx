import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const OwnerPayments = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  const summaryData = [
    { id: 1, title: '₹13.4L', subtitle: 'Collected', bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-brand-teal', progress: 'w-[85%]', progressBg: 'bg-brand-teal' },
    { id: 2, title: '₹1.2L', subtitle: 'Pending', bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-500', progress: 'w-[15%]', progressBg: 'bg-amber-500' },
    { id: 3, title: '₹0.4L', subtitle: 'Overdue', bg: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-500', progress: 'w-[5%]', progressBg: 'bg-red-500' },
  ];

  const paymentsData = [
    { id: 1, name: 'Priya Sharma', room: 'Room 4A', date: 'Due Jun 1', amount: '₹8,500', status: 'Paid', statusColor: 'text-brand-teal' },
    { id: 2, name: 'Arjun Mehta', room: 'Room 2B', date: 'Due Jun 1', amount: '₹12,000', status: 'Paid', statusColor: 'text-brand-teal' },
    { id: 3, name: 'Divya Rao', room: 'Room 7C', date: 'Due Jun 5', amount: '₹6,000', status: 'Pending', statusColor: 'text-amber-500' },
    { id: 4, name: 'Suresh Babu', room: 'Room 1A', date: 'Due May 28', amount: '₹15,000', status: 'Overdue', statusColor: 'text-red-500' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-340 3xl:max-w-420 mx-auto w-full relative pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] mb-1">Payments</h1>
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
          <div key={item.id} className={`${item.bg} border ${item.border} rounded-xl p-5 relative overflow-hidden group hover:shadow-sm transition-all`}>
            <h2 className={`text-2xl font-bold ${item.text} mb-1 transition-transform group-hover:-translate-y-0.5`}>{item.title}</h2>
            <p className="text-sm font-medium text-slate-500 mb-4">{item.subtitle}</p>
            <div className="w-full h-1 bg-white/50 rounded-full overflow-hidden absolute bottom-5 left-5 right-5 max-w-[calc(100%-40px)]">
              <div className={`h-full rounded-full ${item.progressBg} ${item.progress} transition-all duration-1000 ease-out`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Payments List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {paymentsData.map((payment) => (
          <div key={payment.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors shrink-0">
                {payment.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#062F26] mb-0.5 group-hover:text-brand-teal transition-colors">{payment.name}</span>
                <span className="text-[11px] font-medium text-slate-400">
                  {payment.room} <span className="mx-1">·</span> {payment.date}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-[#062F26] mb-1">{payment.amount}</span>
              <span className={`text-[10px] font-bold ${payment.statusColor}`}>
                {payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action / Just Collected */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <div className="bg-[#062F26] rounded-xl p-4 pr-6 flex items-center gap-4 shadow-xl translate-y-2 hover:translate-y-0 transition-transform cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-teal/20 transition-colors">
            <span className="text-lg font-bold text-white">₹</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-brand-teal uppercase tracking-wider mb-0.5">Just Collected</p>
            <p className="text-white font-bold text-base">₹12,500 <span className="font-normal text-white/70">from Rohan</span></p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OwnerPayments;
