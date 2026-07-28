import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const OwnerReports = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      parentHeightOffset: 0,
      zoom: { enabled: false },
      dropShadow: {
        enabled: true,
        top: 4,
        left: 0,
        blur: 4,
        color: '#0aa87d',
        opacity: 0.15
      }
    },
    colors: ['#0aa87d'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    markers: {
      size: 0,
      colors: ['#fff'],
      strokeColors: '#0aa87d',
      strokeWidth: 3,
      hover: { size: 6, sizeOffset: 3 }
    },
    legend: { show: false },
    xaxis: {
      categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 } },
      tooltip: { enabled: false },
      crosshairs: {
        show: true,
        stroke: { color: '#cbd5e1', width: 1, dashArray: 4 }
      }
    },
    yaxis: {
      show: true,
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 500 },
        formatter: (value) => `₹${value / 1000}k`
      }
    },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex].toLocaleString();
        const month = w.globals.labels[dataPointIndex];
        return `
          <div class="px-4 py-3 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col gap-0.5">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${month} Revenue</span>
            <span class="text-base font-bold text-[#062F26]">₹${value}</span>
          </div>
        `;
      }
    },
  };

  const chartSeries = [{
    name: 'Revenue',
    data: [12000, 14000, 13500, 16000, 18000, 17500, 20000, 21000, 19500, 24000, 25000, 28000]
  }];

  const statsData = [
    { id: 1, title: '87%', label: 'Avg Occupancy', change: '+4.2%', isPositive: true, icon: 'lucide:home', hoverBg: 'hover:bg-[#062F26] hover:border-[#062F26]', hoverText: 'group-hover:text-white', hoverLabel: 'group-hover:text-slate-300' },
    { id: 2, title: '₹9.2K', label: 'Avg Rent/Bed', change: '+6.1%', isPositive: true, icon: 'lucide:indian-rupee', hoverBg: 'hover:bg-brand-teal hover:border-brand-teal', hoverText: 'group-hover:text-white', hoverLabel: 'group-hover:text-emerald-50' },
    { id: 3, title: '8%', label: 'Churn Rate', change: '-2.1%', isPositive: false, icon: 'lucide:user-minus', hoverBg: 'hover:bg-amber-500 hover:border-amber-500', hoverText: 'group-hover:text-white', hoverLabel: 'group-hover:text-amber-100' },
    { id: 4, title: '34%', label: 'Lead Conversion', change: '+5.3%', isPositive: true, icon: 'lucide:trending-up', hoverBg: 'hover:bg-indigo-500 hover:border-indigo-500', hoverText: 'group-hover:text-white', hoverLabel: 'group-hover:text-indigo-100' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-340 3xl:max-w-420 mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] mb-1">Reports</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <span>{today}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>OVERVIEW</span>
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

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-700">Revenue <span className="text-slate-400 font-medium">· 12 Months</span></h2>
          <span className="text-xs font-bold text-brand-teal flex items-center gap-1">
            <Icon icon="lucide:arrow-up" className="w-3 h-3" />
            18% YoY
          </span>
        </div>
        <div className="h-[340px] w-full mt-2">
          <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statsData.map((stat) => (
          <div key={stat.id} className={`bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${stat.hoverBg}`}>
            
            {/* Background pattern for hover state */}
            <Icon icon={stat.icon} className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-500 text-white pointer-events-none`} />

            <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className={`text-3xl font-extrabold text-[#062F26] ${stat.hoverText} transition-colors duration-300 tracking-tight`}>{stat.title}</h3>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 group-hover:scale-110`}>
                <Icon icon={stat.icon} className="w-5 h-5" />
              </div>
            </div>

            <p className={`text-xs font-bold text-slate-400 mb-4 ${stat.hoverLabel} transition-colors duration-300 relative z-10`}>{stat.label}</p>
            
            <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-bold transition-colors duration-300 relative z-10 ${
              stat.isPositive ? 'bg-emerald-50 text-brand-teal group-hover:bg-white/20 group-hover:text-white' : 'bg-red-50 text-red-500 group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <Icon icon={stat.isPositive ? 'lucide:trending-up' : 'lucide:trending-down'} className="w-3.5 h-3.5" />
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Action / Just Collected */}
      <div className="mt-auto flex justify-end">
        <div className="bg-[#062F26] rounded-xl p-4 pr-6 flex items-center gap-4 shadow-xl translate-y-2 hover:translate-y-0 transition-transform cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-teal/20 transition-colors">
            <span className="text-lg font-bold text-white">₹</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-brand-teal uppercase tracking-wider mb-0.5">Just Collected</p>
            <p className="text-white font-bold text-base">₹12,500 <span className="font-normal text-white/70">from Rohit</span></p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OwnerReports;
