import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const TabReports = ({ property, invoices = [] }) => {
  const [timeRange, setTimeRange] = useState('6M');

  const propertyInvoices = invoices.filter(inv => inv.propertyId && inv.propertyId._id === property._id);

  const {
    chartCategories,
    collectedSeries,
    expectedSeries,
    totalExpected,
    totalCollected,
    totalPending,
    totalOverdue
  } = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    if (timeRange === '6M') startDate.setMonth(now.getMonth() - 5);
    if (timeRange === '12M') startDate.setMonth(now.getMonth() - 11);
    if (timeRange === 'YTD') startDate = new Date(now.getFullYear(), 0, 1);
    
    startDate.setDate(1);
    startDate.setHours(0,0,0,0);

    const filtered = propertyInvoices.filter(inv => new Date(inv.dueDate) >= startDate);

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

    return {
        chartCategories: months,
        collectedSeries: collectedData,
        expectedSeries: expectedData,
        totalExpected: totExpected,
        totalCollected: totCollected,
        totalPending: totPending,
        totalOverdue: totOverdue
    };

  }, [propertyInvoices, timeRange]);

  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const areaChartOptions = {
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

  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    colors: ['#0aa87d', '#fcd34d', '#f87171'],
    labels: ['Paid', 'Pending', 'Overdue'],
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { fontSize: '11px', fontWeight: 600, color: '#64748b' },
            value: { fontSize: '18px', fontWeight: 800, color: '#0f172a', formatter: (val) => `₹${val.toLocaleString('en-IN')}` },
            total: {
              show: true,
              label: 'Total Expected',
              fontSize: '10px',
              fontWeight: 600,
              color: '#94a3b8',
              formatter: () => `₹${totalExpected.toLocaleString('en-IN')}`
            }
          }
        }
      }
    },
    stroke: { width: 0 },
    legend: { show: false }
  };

  const donutSeries = [totalCollected, totalPending, totalOverdue];

  const formatNum = (n) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-[#062F26]">Financial Reports</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Track revenue, dues, and collection performance.</p>
        </div>
        <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
          {['6M', '12M', 'YTD'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeRange === range ? 'bg-white text-brand-teal shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range === '6M' ? 'Last 6 Months' : range === '12M' ? 'Last 12 Months' : 'Year to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Icon icon="lucide:indian-rupee" className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Collected</p>
          <h4 className="text-2xl font-black text-slate-800 mt-1">{formatNum(totalCollected)}</h4>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Icon icon="lucide:clock-4" className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
          <h4 className="text-2xl font-black text-slate-800 mt-1">{formatNum(totalPending + totalOverdue)}</h4>
          <div className="absolute right-5 top-5 text-right">
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Overdue: {formatNum(totalOverdue)}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:border-brand-teal transition-colors">
          <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Icon icon="lucide:percent" className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collection Rate</p>
          <div className="flex items-end gap-2 mt-1">
            <h4 className="text-2xl font-black text-slate-800">{collectionRate}%</h4>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-brand-teal h-full rounded-full transition-all duration-1000" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-[#062F26]">Revenue Trend</h4>
            <p className="text-[11px] font-medium text-slate-400">Monthly collected vs expected revenue</p>
          </div>
          <div className="h-[280px] w-full">
            <Chart options={areaChartOptions} series={[{ name: 'Collected', data: collectedSeries }, { name: 'Expected', data: expectedSeries }]} type="area" height="100%" />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="mb-2">
            <h4 className="text-sm font-bold text-[#062F26]">Payment Status Breakdown</h4>
            <p className="text-[11px] font-medium text-slate-400">Total volume across selected period</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[200px] w-full flex items-center justify-center">
              <Chart options={donutOptions} series={donutSeries} type="donut" height="100%" />
            </div>
            
            {/* Legend underneath */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0aa87d]"></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Paid</p>
                  <p className="text-xs font-bold text-slate-800">{formatNum(totalCollected)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]"></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                  <p className="text-xs font-bold text-slate-800">{formatNum(totalPending)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Overdue</p>
                  <p className="text-xs font-bold text-slate-800">{formatNum(totalOverdue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabReports;
