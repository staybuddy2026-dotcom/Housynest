import React from 'react';
import Chart from 'react-apexcharts';

const TabReports = ({ property }) => {
  // Generate some somewhat realistic base revenue based on the property rent
  const baseRent = property.monthlyRent
    ? parseInt(property.monthlyRent.replace(/[^0-9]/g, ''), 10)
    : (property.propertyType === 'PG' ? 8500 : 15000);

  // Assuming maybe 4 occupied beds on average for PGs, or just 1 for a Tenant flat
  const multiplier = property.propertyType === 'PG' ? 4 : 1;
  const baseRevenue = baseRent * multiplier;

  // Simulate 12 months of data around this base revenue
  const mockData = Array.from({ length: 12 }, (_, i) => {
    const variation = 1 - 0.1 + (Math.random() * 0.2); // Random +- 10%
    // Trending up slightly over the year
    const trend = 1 + (i * 0.02);
    return Math.floor(baseRevenue * variation * trend);
  });

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
        formatter: (value) => `₹${(value / 1000).toFixed(1)}k`
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
          <div class="px-4 py-3 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col gap-0.5 min-w-[120px]">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${month} Revenue</span>
            <span class="text-base font-bold text-[#062F26]">₹${value}</span>
          </div>
        `;
      }
    },
  };

  const chartSeries = [{
    name: 'Revenue',
    data: mockData
  }];

  const totalRevenue = mockData.reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#062F26]">Property Revenue Report</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Financial performance over the last 12 months</p>
        </div>
        <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9] text-right min-w-[200px]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total 12m Revenue</span>
          <span className="text-2xl font-black text-brand-teal">₹{totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
      </div>
    </div>
  );
};

export default TabReports;
