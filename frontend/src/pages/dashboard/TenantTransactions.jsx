import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const TenantTransactions = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  const summaryData = [
    { id: 1, title: '₹14,500', subtitle: 'Next Rent Due', icon: 'lucide:calendar-clock', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: 'w-[40%]', progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-[#062F26] hover:border-[#062F26]', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-slate-300' },
    { id: 2, title: '05 May', subtitle: 'Due Date', icon: 'lucide:calendar', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: 'w-[100%]', progressBg: 'bg-indigo-500', hoverBg: 'hover:bg-indigo-500 hover:border-indigo-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-indigo-100' },
    { id: 3, title: '₹0', subtitle: 'Late Fees', icon: 'lucide:alert-circle', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: 'w-[0%]', progressBg: 'bg-amber-500', hoverBg: 'hover:bg-amber-500 hover:border-amber-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-amber-100' },
    { id: 4, title: '₹1.5L', subtitle: 'Total Paid (YTD)', icon: 'lucide:check-circle', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: 'w-[75%]', progressBg: 'bg-emerald-500', hoverBg: 'hover:bg-brand-teal hover:border-brand-teal', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-emerald-50' },
  ];

  const transactionData = [
    { id: 1, to: 'Sharma Properties (PG)', amount: '₹14,500', date: '05 Apr 2025', method: 'UPI', status: 'Paid', statusColor: 'bg-emerald-50 text-brand-teal border-emerald-100' },
    { id: 2, to: 'Sharma Properties (PG)', amount: '₹14,500', date: '05 Mar 2025', method: 'UPI', status: 'Paid', statusColor: 'bg-emerald-50 text-brand-teal border-emerald-100' },
    { id: 3, to: 'Sharma Properties (PG)', amount: '₹14,500', date: '05 Feb 2025', method: 'Bank Transfer', status: 'Paid', statusColor: 'bg-emerald-50 text-brand-teal border-emerald-100' },
    { id: 4, to: 'Sharma Properties (PG)', amount: '₹29,000', date: '01 Jan 2025', method: 'Credit Card', status: 'Security Deposit', statusColor: 'bg-indigo-50 text-indigo-500 border-indigo-100' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500  mx-auto w-full relative pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] mb-1">My Transactions</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <span>{today}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Transaction History</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryData.map((item) => (
          <div key={item.id} className={`${item.bg} border ${item.border} rounded-xl p-5 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${item.hoverBg}`}>

            {/* Background pattern for hover state */}
            <Icon icon={item.icon} className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-500 text-white pointer-events-none`} />

            <div className="flex justify-between items-start mb-2 relative z-10">
              <h2 className={`text-3xl font-extrabold ${item.text} ${item.hoverText} transition-colors duration-300 tracking-tight`}>{item.title}</h2>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 group-hover:scale-110`}>
                <Icon icon={item.icon} className="w-5 h-5" />
              </div>
            </div>

            <p className={`text-sm font-medium text-slate-500 mb-6 ${item.hoverSubtitle} transition-colors duration-300 relative z-10`}>{item.subtitle}</p>

            <div className="w-full h-1.5 bg-slate-100 group-hover:bg-white/30 rounded-full overflow-hidden absolute bottom-5 left-5 right-5 max-w-[calc(100%-40px)] transition-colors duration-300">
              <div className={`h-full rounded-full ${item.progressBg} group-hover:bg-white ${item.progress} transition-all duration-1000 ease-out`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {transactionData.map((tx) => (
          <div key={tx.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md hover:border-brand-teal/20 transition-all cursor-pointer group hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors shrink-0">
                <Icon icon="lucide:arrow-up-right" className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#062F26] mb-0.5 group-hover:text-brand-teal transition-colors">Paid to {tx.to}</span>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <span className="font-bold text-[#062F26]">{tx.amount}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1"><Icon icon="lucide:calendar" className="w-3 h-3" /> {tx.date}</span>
                  {tx.method !== '—' && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{tx.method}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${tx.statusColor}`}>
                {tx.status}
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-brand-teal hover:text-white transition-colors flex items-center justify-center">
                  <Icon icon="lucide:download" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Make Payment Button */}
      <div className="mt-4 flex justify-end">
        <button className="px-6 py-3 bg-[#062F26] text-white font-bold text-sm rounded-xl hover:bg-brand-teal transition-colors shadow-sm flex items-center gap-2">
          <Icon icon="lucide:credit-card" className="w-4 h-4" />
          Make a Payment
        </button>
      </div>

    </div>
  );
};

export default TenantTransactions;
