import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import ReactApexChart from 'react-apexcharts';
import CustomDropdown from '../../components/list-property/CustomDropdown';
import AdminPagination from '../../components/admin/AdminPagination';

const AdminRentCollection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterProperty, setFilterProperty] = useState('All Properties');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterMonth, setFilterMonth] = useState('All Months');
  const [chartPeriod, setChartPeriod] = useState('This Year');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableDateFilter, setTableDateFilter] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [remindedInvoices, setRemindedInvoices] = useState({});
  const [sendingAllReminders, setSendingAllReminders] = useState(false);

  const handleRemind = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/invoices/${id}/remind`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
    setRemindedInvoices(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setRemindedInvoices(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSendAll = async () => {
    setSendingAllReminders(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/invoices/admin/remind-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error sending all reminders:', error);
    }
    setTimeout(() => {
      setSendingAllReminders(false);
    }, 2000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/invoices/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch rent stats');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueProperties = useMemo(() => {
    if (!data?.invoices) return ['All Properties'];
    const props = new Set(data.invoices.map(inv => inv.propertyId?.pgName || inv.propertyId?.societyName).filter(Boolean));
    return ['All Properties', ...Array.from(props)];
  }, [data]);

  const uniqueMonths = useMemo(() => {
    if (!data?.invoices) return ['All Months'];
    const months = new Set(data.invoices.map(inv => {
      const date = new Date(inv.dueDate);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }));
    return ['All Months', ...Array.from(months)];
  }, [data]);

  const filteredInvoices = useMemo(() => {
    if (!data?.invoices) return [];

    return data.invoices.filter(inv => {
      // Property Filter (Top Dropdown)
      const propName = inv.propertyId?.pgName || inv.propertyId?.societyName;
      if (filterProperty !== 'All Properties' && propName !== filterProperty) return false;

      // Status Filter (Top Dropdown)
      if (filterStatus !== 'All Status' && inv.status !== filterStatus) return false;

      // Month Filter (Top Dropdown)
      if (filterMonth !== 'All Months') {
        const invMonth = new Date(inv.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (invMonth !== filterMonth) return false;
      }

      // Search Query (Table)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const tenantName = (inv.tenantId?.fullName || '').toLowerCase();
        const property = (propName || '').toLowerCase();
        if (!tenantName.includes(query) && !property.includes(query)) return false;
      }

      // Table Date Filter (Table)
      if (tableDateFilter !== 'All Time') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(inv.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (tableDateFilter === 'Past Due' && diffDays >= 0) return false;
        if (tableDateFilter === 'Next 7 Days' && (diffDays < 0 || diffDays > 7)) return false;
        if (tableDateFilter === 'Next 30 Days' && (diffDays < 0 || diffDays > 30)) return false;
      }

      return true;
    });
  }, [data, filterProperty, filterStatus, filterMonth, searchQuery, tableDateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterProperty, filterStatus, filterMonth, searchQuery, tableDateFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const overviewChartData = useMemo(() => {
    if (!data) return { labels: [], collected: [], pending: [], overdue: [], total: [] };

    if (chartPeriod === 'This Year') {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const collected = data.historical.collected;
      const pending = data.historical.pending;
      const overdue = data.historical.overdue;
      const total = collected.map((c, i) => c + pending[i] + overdue[i]);
      return { labels, collected, pending, overdue, total };
    }

    if (chartPeriod === 'Last Year') {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { labels, collected: Array(12).fill(0), pending: Array(12).fill(0), overdue: Array(12).fill(0), total: Array(12).fill(0) };
    }

    // Monthly view
    let targetMonthStr = chartPeriod;
    if (chartPeriod === 'This Month') {
      targetMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    const [monthName, yearStr] = targetMonthStr.split(' ');
    const year = parseInt(yearStr);
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
    const collected = Array(daysInMonth).fill(0);
    const pending = Array(daysInMonth).fill(0);
    const overdue = Array(daysInMonth).fill(0);

    if (data.invoices) {
      data.invoices.forEach(inv => {
        const invDate = new Date(inv.dueDate);
        if (invDate.getMonth() === monthIndex && invDate.getFullYear() === year) {
          const dayIndex = invDate.getDate() - 1; // 0-indexed
          if (inv.status === 'Paid') collected[dayIndex] += inv.amount;
          else if (inv.status === 'Pending') pending[dayIndex] += inv.amount;
          else if (inv.status === 'Overdue') overdue[dayIndex] += inv.amount;
        }
      });
    }

    const total = collected.map((c, i) => c + pending[i] + overdue[i]);

    return { labels, collected, pending, overdue, total };
  }, [data, chartPeriod]);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-teal"></div></div>;
  }

  if (error) {
    return <div className="p-5 text-red-500 bg-red-50 rounded-xl text-sm font-medium">Error: {error}</div>;
  }

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const { stats, historical, recentOverdue, invoices } = data;

  // --- Dynamic Data Mapping ---
  const topStats = [
    {
      title: 'Total Expected Rent',
      amount: formatCurrency(stats.expected),
      trendValue: '100%',
      trendUp: true,
      icon: 'lucide:pie-chart',
      colorClass: 'text-brand-teal',
      bgClass: 'bg-brand-teal/10',
      sparklineColor: '#09A17A',
      sparklineData: historical.collected.map((c, i) => c + historical.pending[i] + historical.overdue[i]).slice(-7)
    },
    {
      title: 'Total Rent Collected',
      amount: formatCurrency(stats.current.collected),
      trendValue: `${stats.trends.collected.value}%`,
      trendUp: stats.trends.collected.up,
      icon: 'lucide:wallet',
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50',
      sparklineColor: '#10b981',
      sparklineData: historical.collected.slice(-7)
    },
    {
      title: 'Pending Rent',
      amount: formatCurrency(stats.current.pending),
      trendValue: `${stats.trends.pending.value}%`,
      trendUp: stats.trends.pending.up,
      icon: 'lucide:camera',
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-50',
      sparklineColor: '#3b82f6',
      sparklineData: historical.pending.slice(-7)
    },
    {
      title: 'Overdue Rent',
      amount: formatCurrency(stats.current.overdue),
      trendValue: `${stats.trends.overdue.value}%`,
      trendUp: stats.trends.overdue.up,
      icon: 'lucide:clipboard-x',
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-50',
      sparklineColor: '#f97316',
      sparklineData: historical.overdue.slice(-7)
    }
  ];

  // --- Charts Configurations ---
  const totalTrendData = historical.collected.map((c, i) => c + historical.pending[i] + historical.overdue[i]);

  const overviewChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#10b981', '#3b82f6', '#f97316', '#0f172a'], // Collected, Pending, Overdue, Total
    stroke: {
      width: [2, 2, 2, 3], // 3 area lines, 1 solid trend line
      curve: 'smooth',
      dashArray: [0, 0, 0, 4]
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.0,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    labels: overviewChartData.labels,
    markers: {
      size: [0, 0, 0, 4],
      colors: ['#fff'],
      strokeColors: '#0f172a',
      strokeWidth: 2,
      hover: { size: 6 }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '12px', fontWeight: 500 } },
      crosshairs: {
        show: true,
        stroke: { color: '#cbd5e1', width: 1, dashArray: 4 }
      },
      tooltip: { enabled: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px', fontWeight: 500 },
        formatter: (value) => {
          if (value === 0) return '₹0';
          if (value >= 1000) return '₹' + (value / 1000) + 'k';
          return '₹' + value;
        }
      },
      min: 0,
      tickAmount: 4
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
      y: { formatter: (val) => formatCurrency(val) }
    }
  };

  const overviewChartSeries = [
    { name: 'Collected', type: 'area', data: overviewChartData.collected },
    { name: 'Pending', type: 'area', data: overviewChartData.pending },
    { name: 'Overdue', type: 'area', data: overviewChartData.overdue },
    { name: 'Total Trend', type: 'line', data: overviewChartData.total }
  ];

  const donutChartOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#22c55e', '#3b82f6', '#f97316'],
    labels: ['Collected', 'Pending', 'Overdue'],
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '78%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748b',
              offsetY: -4
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 700,
              color: '#062F26',
              offsetY: 6,
              formatter: (val) => formatCurrency(val)
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Expected',
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748b',
              formatter: () => formatCurrency(stats.expected)
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val)
      }
    },
    legend: { show: false }
  };

  const donutChartSeries = [stats.current.collected, stats.current.pending, stats.current.overdue];

  const sparklineOptions = (color) => ({
    chart: { type: 'area', sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [color],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] }
    },
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
  });

  const CustomLegend = ({ color, label, value, percentage }) => (
    <div className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-300" style={{ backgroundColor: color }}></div>
        <span className="text-slate-600 font-semibold group-hover:text-slate-900 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="font-bold text-slate-800">{value}</span>}
        {percentage && <span className="text-slate-500 font-medium text-xs bg-slate-100 px-1.5 py-0.5 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">{percentage}</span>}
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">Paid</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">Pending</span>;
      case 'Overdue': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">Overdue</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">{status}</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon icon="lucide:wallet" className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Rent Collection</h1>
            <p className="text-sm text-slate-500 font-medium">
              Monitor and track all rent payments and collections across the platform.
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-[#062F26] hover:text-white rounded-md font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[150px] relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.bgClass}`}>
                <Icon icon={stat.icon} className={`w-6 h-6 ${stat.colorClass}`} strokeWidth="2.5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-[#062F26] leading-tight tracking-tight mb-0.5">{stat.amount}</h3>
                <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
              </div>
            </div>

            <div className="flex items-end justify-between mt-auto relative z-10">
              <div className="flex items-center gap-1.5 pb-0.5">
                <Icon icon={stat.trendUp ? "lucide:arrow-up" : "lucide:arrow-down"} className={`w-4 h-4 ${stat.colorClass}`} strokeWidth="3" />
                <span className={`text-sm font-bold ${stat.colorClass}`}>{stat.trendValue}</span>
                <span className="text-xs font-semibold text-slate-400 ml-1 whitespace-nowrap">vs last month</span>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-48 h-16 pointer-events-none">
              <ReactApexChart
                options={{
                  ...sparklineOptions(stat.sparklineColor),
                  stroke: { curve: 'smooth', width: 2 }
                }}
                series={[{ data: stat.sparklineData }]}
                type="area"
                height="100%"
                width="100%"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rent Collection Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#062F26]">Rent Collection Overview</h3>
            <div className="relative z-20 min-w-[140px]">
              <CustomDropdown
                value={chartPeriod}
                onChange={setChartPeriod}
                options={['This Year', 'Last Year', 'This Month', ...uniqueMonths.filter(m => m !== 'All Months')]}
                containerClassName="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pl-2">
            {[
              { label: 'Collected', bgClass: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100', dotClass: 'bg-emerald-500' },
              { label: 'Pending', bgClass: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100', dotClass: 'bg-blue-500' },
              { label: 'Overdue', bgClass: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100', dotClass: 'bg-orange-500' }
            ].map((item, idx) => (
              <div key={idx} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors cursor-pointer border shadow-sm group ${item.bgClass}`}>
                <div className={`w-2 h-2 rounded-full group-hover:scale-125 transition-transform ${item.dotClass}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="-ml-2">
            <ReactApexChart options={overviewChartOptions} series={overviewChartSeries} type="line" height={320} />
          </div>
        </div>

        {/* Rent Status (Donut) */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col h-full">
          <h3 className="text-lg font-bold text-[#062F26] mb-4">Rent Status (This Month)</h3>

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative w-full h-48 flex justify-center hover:scale-105 transition-transform duration-500 ease-out cursor-pointer">
              <ReactApexChart options={donutChartOptions} series={donutChartSeries} type="donut" height="100%" />
            </div>

            <div className="w-full space-y-1 mt-auto px-1">
              <CustomLegend color="#22c55e" label="Collected" value={formatCurrency(stats.current.collected)} percentage={stats.expected > 0 ? `${Math.round((stats.current.collected / stats.expected) * 100)}%` : '0%'} />
              <CustomLegend color="#3b82f6" label="Pending" value={formatCurrency(stats.current.pending)} percentage={stats.expected > 0 ? `${Math.round((stats.current.pending / stats.expected) * 100)}%` : '0%'} />
              <CustomLegend color="#f97316" label="Overdue" value={formatCurrency(stats.current.overdue)} percentage={stats.expected > 0 ? `${Math.round((stats.current.overdue / stats.expected) * 100)}%` : '0%'} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 z-20 relative">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <CustomDropdown
            value={filterProperty}
            onChange={setFilterProperty}
            options={uniqueProperties}
            placeholder="All Properties"
            containerClassName="min-w-[140px] flex-1 xl:flex-none"
          />
          <CustomDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={['All Status', 'Paid', 'Pending', 'Overdue']}
            placeholder="All Status"
            containerClassName="min-w-[140px] flex-1 xl:flex-none"
          />
          <CustomDropdown
            value={filterMonth}
            onChange={setFilterMonth}
            options={uniqueMonths}
            icon="lucide:calendar"
            placeholder="All Months"
            containerClassName="min-w-[150px] flex-1 xl:flex-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm">
            <Icon icon="lucide:download" className="w-4 h-4" />
            Download
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#062F26] border border-transparent rounded-lg text-sm font-bold text-white hover:bg-[#062F26]/90 shadow-sm transition-colors">
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Rent Collection List */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-[#062F26]">Rent Collection List</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon icon="lucide:search" className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by tenant, property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-teal/50 transition-colors"
                />
              </div>
              <div className="relative z-20 min-w-[130px]">
                <CustomDropdown
                  value={tableDateFilter}
                  onChange={setTableDateFilter}
                  options={['All Time', 'Next 7 Days', 'Next 30 Days', 'Past Due']}
                  containerClassName="w-full"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Tenant', 'Property / Room', 'Due Date', 'Rent Amount', 'Status', 'Action'].map((head) => (
                    <th
                      key={head}
                      className={`py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${head === 'Action' ? 'text-center w-[120px]' : ''}`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-sm font-medium text-slate-500">No invoices found.</td>
                  </tr>
                ) : paginatedInvoices.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {item.tenantId?.profilePic ? (
                          <img src={item.tenantId.profilePic} alt="Tenant" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-600 shrink-0`}>
                            {getInitials(item.tenantId?.fullName)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{item.tenantId?.fullName || 'Unknown'}</span>
                          {item.tenantId?.phone && <span className="text-[11px] text-slate-500 font-medium mt-0.5">{item.tenantId.phone}</span>}
                          {item.tenantId?.email && <span className="text-[11px] text-slate-400 font-medium">{item.tenantId.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#062F26] leading-tight">{item.propertyId?.pgName || item.propertyId?.societyName || 'N/A'}</span>
                        <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                          {item.bookingId?.roomDetails?.roomName ? `Room ${item.bookingId.roomDetails.roomName}` : 'Entire Property'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600">{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">{formatCurrency(item.amount)}</td>
                    <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          if (item.status === 'Pending' || item.status === 'Overdue') {
                            handleRemind(item._id || idx);
                          }
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded transition-all duration-300 ${(item.status === 'Pending' || item.status === 'Overdue')
                          ? (remindedInvoices[item._id || idx] ? 'text-white bg-blue-500' : 'text-blue-600 bg-blue-50 hover:bg-blue-100')
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}>
                        {item.status === 'Pending' || item.status === 'Overdue'
                          ? (remindedInvoices[item._id || idx] ? 'Reminded!' : 'Remind')
                          : 'Receipt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInvoices.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="invoices"
          />
        </div>

        {/* Recent Overdue */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#062F26]">Recent Overdue</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto mb-4 pr-1">
            {recentOverdue.length === 0 ? (
              <div className="text-sm font-medium text-slate-500 text-center py-8">No overdue payments.</div>
            ) : recentOverdue.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold bg-rose-50 text-rose-600`}>
                    {getInitials(item.tenant)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{item.tenant}</span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">{item.property}</span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5 block">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800 mb-1">{formatCurrency(item.amount)}</span>
                  <span className="text-[10px] font-bold text-rose-500 px-2 py-0.5 rounded-full bg-rose-50">{item.daysOverdue} Days</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-auto flex justify-center">
            <button
              onClick={handleSendAll}
              disabled={sendingAllReminders}
              className={`px-5 py-2.5 rounded-lg border text-sm font-bold transition-all duration-300 w-auto shadow-sm ${sendingAllReminders
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                }`}>
              {sendingAllReminders ? 'Reminders Sent! ✓' : 'Send Reminders'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminRentCollection;
