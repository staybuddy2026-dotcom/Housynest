import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const LeadsChartWidget = () => {
  const [series, setSeries] = useState([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Time');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/leads/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const leads = await response.json();
          let newCount = 0;
          let contactedCount = 0;
          let siteVisitCount = 0;
          let bookedCount = 0;
          let cancelledCount = 0;

          const now = new Date();
          let startDate = new Date(0); // All time fallback

          if (filter === 'This Week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
          } else if (filter === 'This Month') {
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
          } else if (filter === 'This Year') {
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
          }

          leads.forEach(inq => {
            const inqDate = new Date(inq.createdAt || now);
            if (inqDate >= startDate) {
              if (inq.status === 'New') newCount++;
              else if (inq.status === 'Contacted') contactedCount++;
              else if (inq.status === 'In Discussion') siteVisitCount++;
              else if (inq.status === 'Closed') bookedCount++;
              else if (inq.status === 'Cancelled') cancelledCount++;
            }
          });

          setSeries([newCount, contactedCount, siteVisitCount, bookedCount, cancelledCount]);
        }
      } catch (error) {
        console.error("Failed to fetch leads for chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filter]);

  const options = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      dropShadow: {
        enabled: true,
        color: '#062F26',
        top: 4,
        left: 0,
        blur: 6,
        opacity: 0.08
      }
    },
    labels: ['New', 'Contacted', 'Site Visit', 'Booked', 'Cancelled'],
    colors: ['#8b5cf6', '#3b82f6', '#f59e0b', '#0aa87d', '#ef4444'],
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#64748b',
              offsetY: 20,
            },
            value: {
              show: true,
              fontSize: '28px',
              fontFamily: 'inherit',
              fontWeight: 700,
              color: '#062F26',
              offsetY: -15,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '15px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#64748b',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0)
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100]
      }
    },
    stroke: {
      show: true,
      width: 5,
      colors: ['#ffffff']
    },
    legend: {
      show: true,
      position: 'right',
      offsetY: -5,
      height: 180,
      fontSize: '12px',
      fontWeight: 500,
      labels: {
        colors: '#475569',
      },
      markers: {
        width: 8,
        height: 8,
        radius: 12,
        offsetX: -5,
      },
      itemMargin: {
        horizontal: 0,
        vertical: 6
      },
      customLegendItems: ['New', 'Contacted', 'Site Visit', 'Booked', 'Cancelled'],
      formatter: function (seriesName, opts) {
        return [seriesName, " <span style='display: inline-block; width: 30px; text-align: right; font-weight: 700; color: #062F26'>" + opts.w.globals.series[opts.seriesIndex] + "</span>"]
      }
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      y: {
        formatter: function (value) {
          return value + " leads"
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 relative group cursor-default hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
      {/* Subtle hover gradient flair */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-brand-teal/5 to-transparent rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-lg font-bold text-[#062F26]">Leads Overview</h3>
        <div className="relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#062F26] hover:border-brand-teal/50 transition-colors text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-brand-teal/20"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="h-52 flex items-center justify-center relative z-10 group-hover:scale-[1.02] transition-transform duration-500 ease-out">
        {loading ? (
          <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-brand-teal" />
        ) : series.every(v => v === 0) ? (
          <p className="text-sm font-semibold text-slate-400">No leads yet</p>
        ) : (
          <Chart options={options} series={series} type="donut" width="100%" height="100%" />
        )}
      </div>
    </div>
  );
};

export default LeadsChartWidget;
