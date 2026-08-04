import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const OwnerPayments = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [summaryData, setSummaryData] = useState([]);
  const [rentData, setRentData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRentData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/bookings/owner/rent-collection', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data.summaryData);
        setRentData(data.rentData);
      }
    } catch (error) {
      console.error('Error fetching rent data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRentData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRentData();
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-340 3xl:max-w-420 mx-auto w-full relative pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] mb-1">Rent Collection</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <span>{today}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{currentMonthYear}</span>
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

      {/* Rent List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
          </div>
        ) : rentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
            <Icon icon="lucide:calendar-clock" className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No rent collection data available.</p>
          </div>
        ) : (
          rentData.map((rent) => (
            <div key={rent.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md hover:border-brand-teal/20 transition-all cursor-pointer group hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors shrink-0">
                {rent.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#062F26] mb-0.5 group-hover:text-brand-teal transition-colors">{rent.name}</span>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <span className="font-bold text-[#062F26]">{rent.amount}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1"><Icon icon="lucide:calendar" className="w-3 h-3" /> {rent.date}</span>
                  {rent.method !== '—' && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{rent.method}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${rent.statusColor}`}>
                {rent.status}
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
        ))
      )}
      </div>

    </div>
  );
};

export default OwnerPayments;
