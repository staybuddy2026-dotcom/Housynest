import { useState } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const PerformanceChartWidget = () => {
  const [filter, setFilter] = useState('Monthly');
  const [hiddenSeries, setHiddenSeries] = useState({
    Bookings: false,
    Leads: false,
    'Rent Collected': false
  });

  const series = [
    {
      name: 'Bookings (Vol)',
      type: 'column',
      data: [15, 25, 20, 10, 30, 25, 45, 40]
    },
    {
      name: 'Leads (Vol)',
      type: 'column',
      data: [10, 15, 25, 15, 20, 30, 25, 20]
    },
    {
      name: 'Bookings',
      type: 'line',
      data: [25, 45, 30, 35, 52, 48, 55, 60]
    },
    {
      name: 'Leads',
      type: 'line',
      data: [28, 25, 42, 38, 45, 55, 58, 62]
    },
    {
      name: 'Rent Collected',
      type: 'line',
      data: [25, 30, 45, 40, 58, 42, 65, 100]
    }
  ];

  const options = {
    chart: {
      id: 'performance-chart',
      height: 350,
      type: 'line',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: { enabled: true, speed: 350 }
      }
    },
    colors: ['#bfdbfe', '#fde68a', '#3b82f6', '#f59e0b', '#0AA87D'],
    stroke: {
      width: [0, 0, 3, 3, 3],
      curve: 'smooth'
    },
    fill: {
      type: ['solid', 'solid', 'solid', 'solid', 'solid'],
      opacity: [0.4, 0.4, 1, 1, 1],
    },
    labels: ['Today', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    xaxis: {
      categories: ['Today', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      labels: {
        style: { colors: '#94a3b8', fontWeight: 600 }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      crosshairs: {
        show: true,
        stroke: {
          color: '#cbd5e1',
          width: 1,
          dashArray: 4
        }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontWeight: 600 },
        formatter: (value) => {
          return `₹${value}k`;
        },
        offsetX: -10
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0
      },
      yaxis: {
        lines: { show: true }
      },
      xaxis: {
        lines: { show: false }
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      bar: {
        columnWidth: '22%',
        borderRadius: 3
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
      strokeWidth: 3,
      hover: {
        size: 6
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit'
      },
      y: {
        formatter: function (y) {
          if (typeof y !== "undefined") {
            return `₹${y}k`;
          }
          return y;
        }
      }
    }
  };

  const handleLegendClick = (seriesName) => {
    if (window.ApexCharts) {
      if (seriesName === 'Bookings') {
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Bookings');
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Bookings (Vol)');
      } else if (seriesName === 'Leads') {
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Leads');
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Leads (Vol)');
      } else {
        window.ApexCharts.exec('performance-chart', 'toggleSeries', seriesName);
      }
      setHiddenSeries(prev => ({
        ...prev,
        [seriesName]: !prev[seriesName]
      }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 relative group cursor-default hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-1 relative z-10">
        <div>
          <h3 className="text-[22px] font-bold text-[#062F26] flex items-center gap-1.5 cursor-pointer hover:text-brand-teal transition-colors">
            Organization Performance
            <Icon icon="lucide:chevron-down" className="w-5 h-5 text-slate-400" />
          </h3>
          
          {/* Interactive Custom Legend */}
          <div className="flex items-center gap-5 mt-3 text-[13px] font-bold">
            <div 
              onClick={() => handleLegendClick('Bookings')}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${hiddenSeries.Bookings ? 'text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-colors ${hiddenSeries.Bookings ? 'bg-slate-200' : 'bg-blue-500'}`}></div>
              Bookings
            </div>
            <div 
              onClick={() => handleLegendClick('Leads')}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${hiddenSeries.Leads ? 'text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-colors ${hiddenSeries.Leads ? 'bg-slate-200' : 'bg-amber-400'}`}></div>
              Leads
            </div>
            <div 
              onClick={() => handleLegendClick('Rent Collected')}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${hiddenSeries['Rent Collected'] ? 'text-slate-300' : 'text-brand-teal hover:text-emerald-700'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-colors ${hiddenSeries['Rent Collected'] ? 'bg-slate-200' : 'hidden'}`}></div>
              Rent Collected
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-50/80 p-1 rounded-xl border border-slate-100/80 shadow-sm">
          {['Monthly', 'Weekly', 'Daily'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                filter === tab 
                  ? 'bg-white text-[#062F26] shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-[#062F26]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[320px] w-full relative z-10 mt-6">
        <Chart options={options} series={series} type="line" height="100%" width="100%" />
      </div>
    </div>
  );
};

export default PerformanceChartWidget;
