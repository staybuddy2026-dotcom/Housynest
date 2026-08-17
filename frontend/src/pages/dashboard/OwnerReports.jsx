import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const OwnerReports = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12M');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/invoices/owner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        toast.error('Failed to load reports data');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInvoices();
  };

  const {
    chartCategories,
    collectedSeries,
    expectedSeries,
    totalExpected,
    totalCollected,
    totalPending,
    totalOverdue,
    lastPayment
  } = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    if (timeRange === '6M') startDate.setMonth(now.getMonth() - 5);
    if (timeRange === '12M') startDate.setMonth(now.getMonth() - 11);
    if (timeRange === 'YTD') startDate = new Date(now.getFullYear(), 0, 1);

    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const filtered = invoices.filter(inv => new Date(inv.dueDate) >= startDate);

    let totExpected = 0;
    let totCollected = 0;
    let totPending = 0;
    let totOverdue = 0;

    filtered.forEach(inv => {
      totExpected += inv.amount;
      if (inv.status === 'Paid') totCollected += inv.amount;
      else if (inv.status === 'Overdue') totOverdue += inv.amount;
      else totPending += inv.amount;
    });

    const months = [];
    const collectedData = [];
    const expectedData = [];

    const numMonths = timeRange === '6M' ? 6 : timeRange === '12M' ? 12 : now.getMonth() + 1;
    let currentMonth = new Date(startDate);

    for (let i = 0; i < numMonths; i++) {
      const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push(monthLabel);

      const monthInvoices = filtered.filter(inv => {
        const d = new Date(inv.dueDate);
        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
      });

      const mCollected = monthInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
      const mExpected = monthInvoices.reduce((sum, i) => sum + i.amount, 0);

      collectedData.push(mCollected);
      expectedData.push(mExpected);

      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    // Get the most recent paid invoice for the "Just Collected" bubble
    const paidInvoices = invoices.filter(i => i.status === 'Paid').sort((a, b) => new Date(b.paidAt || b.dueDate) - new Date(a.paidAt || a.dueDate));
    const recentPayment = paidInvoices[0] || null;

    return {
      chartCategories: months,
      collectedSeries: collectedData,
      expectedSeries: expectedData,
      totalExpected: totExpected,
      totalCollected: totCollected,
      totalPending: totPending,
      totalOverdue: totOverdue,
      lastPayment: recentPayment
    };

  }, [invoices, timeRange]);

  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const chartOptions = {
    chart: { type: 'area', toolbar: { show: false }, parentHeightOffset: 0, fontFamily: 'inherit' },
    colors: ['#0aa87d', '#94a3b8'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: [3, 2], dashArray: [0, 4] },
    legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#64748b' }, markers: { radius: 12 } },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 },
        formatter: (value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
      }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: {
      y: { formatter: (val) => `₹${val.toLocaleString('en-IN')}` }
    }
  };

  const chartSeries = [
    { name: 'Collected', data: collectedSeries },
    { name: 'Expected', data: expectedSeries }
  ];

  const formatNum = (n) => `₹${n.toLocaleString('en-IN')}`;

  const statsData = [
    {
      id: 1,
      title: `${collectionRate}%`,
      label: 'Collection Rate',
      isPositive: collectionRate > 80,
      icon: 'lucide:percent',
      borderHover: 'hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      giantIconColor: 'text-emerald-50',
      gradientBottom: 'from-emerald-500/25',
      timeRangeColor: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 2,
      title: formatNum(totalCollected),
      label: 'Total Collected',
      isPositive: true,
      icon: 'lucide:indian-rupee',
      borderHover: 'hover:border-orange-300',
      iconBg: 'bg-orange-50 text-orange-500',
      giantIconColor: 'text-orange-50',
      gradientBottom: 'from-orange-500/25',
      timeRangeColor: 'bg-orange-50 text-orange-500'
    },
    {
      id: 3,
      title: formatNum(totalOverdue),
      label: 'Total Overdue',
      isPositive: false,
      icon: 'lucide:alert-circle',
      borderHover: 'hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-500',
      giantIconColor: 'text-purple-50',
      gradientBottom: 'from-purple-500/25',
      timeRangeColor: 'bg-purple-50 text-purple-500'
    },
    {
      id: 4,
      title: formatNum(totalExpected),
      label: 'Total Expected',
      isPositive: true,
      icon: 'lucide:trending-up',
      borderHover: 'hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-500',
      giantIconColor: 'text-rose-50',
      gradientBottom: 'from-rose-500/25',
      timeRangeColor: 'bg-rose-50 text-rose-500'
    },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center pt-20">
        <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full relative pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="lucide:bar-chart-3" className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Financial Reports</h1>
            <p className="text-sm text-slate-500 font-medium">View your portfolio overview and collection performance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            {['6M', '12M', 'YTD'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${timeRange === range ? 'bg-slate-100 text-brand-teal shadow-inner' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="w-10 h-10 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-teal hover:border-brand-teal transition-all"
          >
            <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-teal' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statsData.map((stat) => (
          <div key={stat.id} className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group ${stat.borderHover}`}>

            {/* Background pattern for hover state */}
            <Icon icon={stat.icon} className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-0 group-hover:opacity-100 transition-all duration-500 ${stat.giantIconColor} pointer-events-none group-hover:rotate-12 group-hover:scale-110`} />
            
            {/* Gradient shadow at the bottom */}
            <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t ${stat.gradientBottom} to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

            <div className="flex justify-between items-start relative z-10">
              <h3 className={`text-2xl lg:text-[28px] font-bold text-[#062F26] transition-colors duration-300 tracking-tight`}>{stat.title}</h3>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm`}>
                <Icon icon={stat.icon} className="w-5 h-5" />
              </div>
            </div>

            <p className={`text-xs font-bold text-slate-500 mb-4 transition-colors duration-300 relative z-10`}>{stat.label}</p>

            <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-bold transition-colors duration-300 relative z-10 ${stat.timeRangeColor}`}>
              <Icon icon={stat.isPositive ? 'lucide:trending-up' : 'lucide:trending-down'} className="w-3 h-3" />
              {timeRange}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-base font-bold text-[#062F26]">Portfolio Revenue Trend</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Aggregate collected vs expected revenue across all properties</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-brand-teal rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-100 shrink-0">
            <Icon icon="lucide:arrow-up" className="w-3 h-3" />
            Active
          </span>
        </div>
        <div className="h-[300px] sm:h-[380px] w-full mt-2">
          <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
        </div>
      </div>

      {/* Floating Action / Just Collected */}
      {lastPayment && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-700 max-w-[calc(100vw-32px)] md:max-w-none">
          <div className="bg-[#062F26] rounded-2xl p-3 sm:p-4 pr-4 sm:pr-6 flex items-center gap-3 sm:gap-4 shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-teal/20 flex items-center justify-center shrink-0 group-hover:bg-brand-teal transition-colors">
              <span className="text-lg sm:text-xl font-black text-white">₹</span>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 truncate">Most Recent Payment</p>
              <p className="text-white font-bold text-base sm:text-lg truncate">
                {formatNum(lastPayment.amount)}{' '}
                <span className="font-medium text-white/70 text-xs sm:text-sm">from {lastPayment.tenantId?.fullName || lastPayment.bookingId?.personalInfo?.firstName || 'Tenant'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerReports;
