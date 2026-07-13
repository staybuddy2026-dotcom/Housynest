import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const InquiriesChartWidget = () => {
  const [series, setSeries] = useState([0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/inquiries/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const inquiries = await response.json();
          let newCount = 0;
          let contactedCount = 0;
          let discussionCount = 0;
          let closedCount = 0;

          inquiries.forEach(inq => {
            if (inq.status === 'New') newCount++;
            else if (inq.status === 'Contacted') contactedCount++;
            else if (inq.status === 'In Discussion') discussionCount++;
            else if (inq.status === 'Closed') closedCount++;
          });

          setSeries([newCount, contactedCount, discussionCount, closedCount]);
        }
      } catch (error) {
        console.error("Failed to fetch inquiries for chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

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
    labels: ['New', 'Contacted', 'In Discussion', 'Closed'],
    colors: ['#0aa87d', '#3b82f6', '#f59e0b', '#f97316'],
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '78%',
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
      offsetY: 0,
      height: 150,
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
        vertical: 8
      },
      customLegendItems: ['New', 'Contacted', 'In Discussion', 'Closed'],
      formatter: function (seriesName, opts) {
        return [seriesName, " <span style='float: right; margin-left: 20px; font-weight: 700; color: #062F26'>" + opts.w.globals.series[opts.seriesIndex] + "</span>"]
      }
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      y: {
        formatter: function (value) {
          return value + " inquiries"
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 relative group cursor-default hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
      {/* Subtle hover gradient flair */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-teal/5 to-transparent rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-lg font-bold text-[#062F26]">Inquiries Overview</h3>
        <div className="relative">
          <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#062F26] hover:border-brand-teal/50 transition-colors text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-brand-teal/20">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="h-[160px] flex items-center justify-center relative z-10 group-hover:scale-[1.02] transition-transform duration-500 ease-out">
        {loading ? (
          <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-brand-teal" />
        ) : series.every(v => v === 0) ? (
          <p className="text-sm font-semibold text-slate-400">No inquiries yet</p>
        ) : (
          <Chart options={options} series={series} type="donut" width="100%" height="100%" />
        )}
      </div>
    </div>
  );
};

export default InquiriesChartWidget;
