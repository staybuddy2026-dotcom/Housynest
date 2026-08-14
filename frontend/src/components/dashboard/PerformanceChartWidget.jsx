import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const PerformanceChartWidget = () => {
  const [filter, setFilter] = useState('Daily');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: ['Today', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    series: [
      { name: 'Bookings (Vol)', type: 'column', data: [15, 25, 20, 10, 30, 25, 45, 40] },
      { name: 'Leads (Vol)', type: 'column', data: [10, 15, 25, 15, 20, 30, 25, 20] },
      { name: 'Rent Collected (Vol)', type: 'column', data: [25, 30, 45, 40, 58, 42, 65, 100] },
      { name: 'Bookings', type: 'line', data: [25, 45, 30, 35, 52, 48, 55, 60] },
      { name: 'Leads', type: 'line', data: [28, 25, 42, 38, 45, 55, 58, 62] },
      { name: 'Rent Collected', type: 'line', data: [25, 30, 45, 40, 58, 42, 65, 100] }
    ]
  });

  const [hiddenSeries, setHiddenSeries] = useState({
    Bookings: false,
    Leads: false,
    'Rent Collected': false
  });
  const [hoveredSeries, setHoveredSeries] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/users/owner/analytics/performance?filter=${filter}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setChartData({
            labels: data.labels,
            series: [
              { name: 'Bookings (Vol)', type: 'column', data: data.series.bookings },
              { name: 'Leads (Vol)', type: 'column', data: data.series.leads },
              { name: 'Rent Collected (Vol)', type: 'column', data: data.series.rentCollected.map((val, i) => val + (data.series.bookingsRevenue[i] || 0)) },
              { name: 'Bookings', type: 'line', data: data.series.bookings },
              { name: 'Leads', type: 'line', data: data.series.leads },
              { name: 'Rent Collected', type: 'line', data: data.series.rentCollected.map((val, i) => val + (data.series.bookingsRevenue[i] || 0)) }
            ]
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filter]);

  // We removed the static series array

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
    colors: ['#bfdbfe', '#fde68a', '#a7f3d0', '#3b82f6', '#f59e0b', '#0AA87D'],
    stroke: {
      width: [
        0, 0, 0,
        hoveredSeries && hoveredSeries !== 'Bookings' ? 1 : 3,
        hoveredSeries && hoveredSeries !== 'Leads' ? 1 : 3,
        hoveredSeries && hoveredSeries !== 'Rent Collected' ? 1 : 3
      ],
      curve: 'smooth'
    },
    fill: {
      type: ['solid', 'solid', 'solid', 'solid', 'solid', 'solid'],
      opacity: [
        hoveredSeries && hoveredSeries !== 'Bookings' ? 0.05 : 0.4,
        hoveredSeries && hoveredSeries !== 'Leads' ? 0.05 : 0.4,
        hoveredSeries && hoveredSeries !== 'Rent Collected' ? 0.05 : 0.4,
        hoveredSeries && hoveredSeries !== 'Bookings' ? 0.1 : 1,
        hoveredSeries && hoveredSeries !== 'Leads' ? 0.1 : 1,
        hoveredSeries && hoveredSeries !== 'Rent Collected' ? 0.1 : 1
      ],
    },
    labels: chartData.labels,
    xaxis: {
      categories: chartData.labels,
      tickPlacement: 'on',
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
    yaxis: [
      {
        // 0: Bookings (Vol) -> Right Axis (Volume)
        opposite: true,
        show: true,
        labels: {
          style: { colors: '#94a3b8', fontWeight: 600 },
          formatter: (value) => {
            if (value % 1 !== 0) return '';
            return value;
          }
        }
      },
      {
        // 1: Leads (Vol) -> Sync with Bookings (Vol)
        show: false,
        seriesName: 'Bookings (Vol)'
      },
      {
        // 2: Rent Collected (Vol) -> Left Axis (Revenue)
        show: true,
        labels: {
          style: { colors: '#0AA87D', fontWeight: 600 },
          formatter: (value) => {
            if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
            return `₹${Math.round(value)}`;
          }
        },
        seriesName: 'Rent Collected (Vol)'
      },
      {
        // 3: Bookings (Line) -> Sync with Bookings (Vol)
        show: false,
        seriesName: 'Bookings (Vol)'
      },
      {
        // 4: Leads (Line) -> Sync with Bookings (Vol)
        show: false,
        seriesName: 'Bookings (Vol)'
      },
      {
        // 5: Rent Collected Line -> Sync with Rent Collected (Vol)
        show: false,
        seriesName: 'Rent Collected (Vol)'
      }
    ],
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
        formatter: function (y, { seriesIndex }) {
          if (typeof y !== "undefined") {
            // Rent Collected Vol (2) and Line (5) show ₹
            if (seriesIndex === 2 || seriesIndex === 5) {
              return `₹${y.toLocaleString()}`;
            }
            // Otherwise it's Bookings (Vol)/Leads (Vol)/Bookings Count/Leads Count
            return `${y}`;
          }
          return y;
        }
      }
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 280,
            offsetX: -5
          },
          plotOptions: {
            bar: {
              columnWidth: '50%'
            }
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '10px'
              },
              rotate: -45,
              hideOverlappingLabels: true
            }
          },
          yaxis: [
            {
              opposite: true,
              show: true,
              labels: {
                style: { fontSize: '10px', colors: '#94a3b8', fontWeight: 600 },
                formatter: (value) => value % 1 === 0 ? value : ''
              }
            },
            { show: false },
            {
              show: true,
              labels: {
                style: { fontSize: '10px', colors: '#0AA87D', fontWeight: 600 },
                formatter: (value) => value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${Math.round(value)}`
              }
            },
            { show: false },
            { show: false },
            { show: false }
          ]
        }
      }
    ]
  };

  const handleLegendClick = (seriesName) => {
    if (window.ApexCharts) {
      if (seriesName === 'Bookings') {
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Bookings');
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Bookings (Vol)');
      } else if (seriesName === 'Leads') {
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Leads');
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Leads (Vol)');
      } else if (seriesName === 'Rent Collected') {
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Rent Collected');
        window.ApexCharts.exec('performance-chart', 'toggleSeries', 'Rent Collected (Vol)');
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
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-0 sm:p-6 relative group cursor-default hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-1 relative z-10 p-4 sm:p-0">
        <div>
          <h3 className="text-[22px] font-bold text-[#062F26] flex items-center gap-1.5 transition-colors">
            Organization Performance
          </h3>

          {/* Interactive Custom Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-3 text-[12px] sm:text-[13px] font-bold">
            <div
              onClick={() => handleLegendClick('Bookings')}
              onMouseEnter={() => setHoveredSeries('Bookings')}
              onMouseLeave={() => setHoveredSeries(null)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${hiddenSeries.Bookings ? 'text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-colors ${hiddenSeries.Bookings ? 'bg-slate-200' : 'bg-blue-500'}`}></div>
              Bookings
            </div>
            <div
              onClick={() => handleLegendClick('Leads')}
              onMouseEnter={() => setHoveredSeries('Leads')}
              onMouseLeave={() => setHoveredSeries(null)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${hiddenSeries.Leads ? 'text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-colors ${hiddenSeries.Leads ? 'bg-slate-200' : 'bg-amber-400'}`}></div>
              Leads
            </div>
            <div
              onClick={() => handleLegendClick('Rent Collected')}
              onMouseEnter={() => setHoveredSeries('Rent Collected')}
              onMouseLeave={() => setHoveredSeries(null)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${hiddenSeries['Rent Collected'] ? 'text-slate-300' : 'text-brand-teal hover:text-emerald-700'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-colors ${hiddenSeries['Rent Collected'] ? 'bg-slate-200' : 'bg-brand-teal'}`}></div>
              Rent Collected
            </div>
          </div>
        </div>

        <div className="flex w-full sm:w-auto bg-slate-50/80 p-1 rounded-xl border border-slate-100/80 shadow-sm">
          {['Monthly', 'Weekly', 'Daily'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-lg transition-all ${filter === tab
                ? 'bg-white text-[#062F26] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-[#062F26]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[320px] w-full relative z-10 mt-0 sm:mt-2">
        {loading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin"></div>
          </div>
        ) : (
          <Chart
            options={options}
            series={chartData.series}
            type="line"
            height={350}
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

export default PerformanceChartWidget;
