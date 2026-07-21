import { Icon } from '@iconify/react';
import ReactApexChart from 'react-apexcharts';
import StatCards from '../../components/dashboard/StatCards';
import { useState, useEffect, useRef, useCallback } from 'react';

const AdminOverview = () => {
  const [adminStats, setAdminStats] = useState([
    { title: 'Total Property Listed', value: '0', subtitle: '0 verified properties', icon: 'lucide:home', color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { title: 'Total Users', value: '0', subtitle: '0 Landlords • 0 Renters', icon: 'lucide:users', color: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'Pending Reports', value: '0', subtitle: 'No action required', icon: 'lucide:clipboard-list', color: 'bg-amber-50', iconColor: 'text-amber-500' },
    { title: 'Active Lawyers', value: '0', subtitle: 'Fully approved', icon: 'lucide:shield-check', color: 'bg-emerald-50', iconColor: 'text-emerald-600' }
  ]);

  const [chartSeries, setChartSeries] = useState([
    { name: 'Properties', data: [0, 0, 0, 0, 0, 0] },
    { name: 'Users', data: [0, 0, 0, 0, 0, 0] },
    { name: 'Reports', data: [0, 0, 0, 0, 0, 0] }
  ]);

  const [chartCategories, setChartCategories] = useState(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);

  const [activities, setActivities] = useState([]);
  const [recentPropertyRequests, setRecentPropertyRequests] = useState([]);

  const [allProperties, setAllProperties] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [chartRange, setChartRange] = useState(6);
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const chartDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setIsChartDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (allProperties.length === 0 && allUsers.length === 0) return;
    const months = [];
    const propData = Array(chartRange).fill(0);
    const userData = Array(chartRange).fill(0);
    const reportData = Array(chartRange).fill(0);

    const d = new Date();
    d.setMonth(d.getMonth() - (chartRange - 1));
    for (let i = 0; i < chartRange; i++) {
      months.push(d.toLocaleString('default', { month: 'short' }));

      allProperties.forEach(p => {
        const date = new Date(p.createdAt);
        if (date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()) {
          propData[i]++;
        }
      });

      allUsers.forEach(u => {
        const date = new Date(u.createdAt);
        if (date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()) {
          userData[i]++;
        }
      });

      d.setMonth(d.getMonth() + 1);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartCategories(months);
    setChartSeries([
      { name: 'Properties', data: propData },
      { name: 'Users', data: userData },
      { name: 'Reports', data: reportData }
    ]);
  }, [chartRange, allProperties, allUsers]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [propRes, userRes] = await Promise.all([
        fetch('/api/properties/admin/all', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users/admin/all', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (propRes.ok && userRes.ok) {
        const properties = await propRes.json();
        const users = await userRes.json();

        // Compute Stats
        const verifiedProps = properties.filter(p => p.isVerified).length;
        const landlords = users.filter(u => u.role === 'owner').length;
        const renters = users.filter(u => u.role === 'tenant').length;
        const lawyers = users.filter(u => u.role === 'lawyer').length;

        setAdminStats([
          { title: 'Total Property Listed', value: properties.length.toString(), subtitle: `${verifiedProps} verified properties`, icon: 'lucide:home', color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { title: 'Total Users', value: users.length.toString(), subtitle: `${landlords} Landlords • ${renters} Renters`, icon: 'lucide:users', color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { title: 'Pending Reports', value: '0', subtitle: 'No action required', icon: 'lucide:clipboard-list', color: 'bg-amber-50', iconColor: 'text-amber-500' },
          { title: 'Active Lawyers', value: lawyers.toString(), subtitle: 'Fully approved', icon: 'lucide:shield-check', color: 'bg-emerald-50', iconColor: 'text-emerald-600' }
        ]);

        setAllProperties(properties);
        setAllUsers(users);

        // Compute Recent Activities
        const allActivities = [];

        properties.forEach(p => {
          if (p.status === 'Pending') {
            allActivities.push({
              id: `prop-req-${p._id}`,
              title: 'New property request',
              subtitle: `${p.propertyType === 'PG' ? 'PG' : (p.bhkType || 'Property')} in ${p.city || p.locality || 'Unknown'}`,
              timestamp: new Date(p.createdAt),
              icon: 'lucide:clipboard-list',
              iconBg: 'bg-amber-50',
              iconColor: 'text-amber-600'
            });
          } else if (p.status === 'Approved' || p.status === 'Active') {
            allActivities.push({
              id: `prop-add-${p._id}`,
              title: `New property "${p.pgName || p.societyName || p.propertyCategory || 'Property'}"`,
              subtitle: `added by ${p.owner?.fullName || 'Unknown'}`,
              timestamp: new Date(p.createdAt),
              icon: 'lucide:home',
              iconBg: 'bg-emerald-50',
              iconColor: 'text-emerald-600'
            });
          }
        });

        users.forEach(u => {
          let roleDisplay = 'Renter';
          if (u.role === 'owner') roleDisplay = 'Landlord';
          if (u.role === 'lawyer') roleDisplay = 'Lawyer';

          allActivities.push({
            id: `user-${u._id}`,
            title: 'New user registered',
            subtitle: `${u.fullName} (${roleDisplay})`,
            timestamp: new Date(u.createdAt),
            icon: 'lucide:user',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
          });
        });

        // Sort by newest first and take top 5
        allActivities.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(allActivities.slice(0, 5));

        // Compute Recent Property Requests Table
        const pendingProperties = properties.filter(p => p.status === 'Pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        const mappedRequests = pendingProperties.map((p) => ({
          id: p._id,
          propertyImage: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&q=80',
          propertyName: p.pgName || p.societyName || p.propertyCategory || 'Property',
          requestedBy: p.owner?.fullName || 'Unknown',
          email: p.owner?.email || 'N/A',
          type: p.propertyType === 'PG' ? 'PG' : 'Tenant',
          typeColor: p.propertyType === 'PG' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600',
          location: p.locality ? `${p.locality}, ${p.city || ''}` : (p.address || 'Unknown'),
          date: new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'Pending',
          statusColor: 'bg-amber-50 text-amber-600'
        }));
        setRecentPropertyRequests(mappedRequests);

      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const chartOptions = {
    chart: {
      type: 'area',
      stacked: true,
      height: 350,
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true }
    },
    colors: ['#25D366', '#0ea5e9', '#f43f5e'], // Brand Green, Sky Blue, Rose Red
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } }
    },
    yaxis: {
      min: 0,
      labels: {
        style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 },
        formatter: (val) => parseInt(val)
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 0 }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => val }
    }
  };



  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };


  const quickActions = [
    {
      id: 1,
      title: 'Add New Property',
      icon: 'lucide:home',
      bgClass: 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50',
      iconBg: 'bg-emerald-100 text-emerald-600',
      textColor: 'text-emerald-800'
    },
    {
      id: 2,
      title: 'View All Users',
      icon: 'lucide:users',
      bgClass: 'border-blue-100 bg-blue-50/30 hover:bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-600',
      textColor: 'text-blue-800'
    },
    {
      id: 3,
      title: 'Manage Requests',
      icon: 'lucide:clipboard-list',
      bgClass: 'border-amber-100 bg-amber-50/30 hover:bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-600',
      textColor: 'text-amber-800'
    },
    {
      id: 4,
      title: 'Generate Report',
      icon: 'lucide:bar-chart-2',
      bgClass: 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50',
      iconBg: 'bg-emerald-100 text-emerald-600',
      textColor: 'text-emerald-800'
    }
  ];

  return (
    <div className="space-y-6 max-w-350 3xl:max-w-420 mx-auto pb-10">

      {/* Mobile Welcome Header */}
      <div className="lg:hidden mb-2 px-1">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5 mb-1">
          <span>Welcome back, Admin!</span>
          <span className="animate-wave inline-block origin-bottom-right shrink-0">👋</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Here's what's happening with Housynest today.
        </p>
      </div>

      {/* Top Metrics Row */}
      <StatCards data={adminStats} />

      {/* Middle Row (Chart & Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Icon icon="lucide:trending-up" className="w-5 h-5 text-emerald-600" />
                Analytics Overview
                <span className="text-xs font-medium text-slate-400 ml-2">in India • Last {chartRange} months</span>
              </h3>
            </div>
            <div className="relative" ref={chartDropdownRef}>
              <button
                onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Last {chartRange} Months <Icon icon="lucide:chevron-down" className="w-4 h-4" />
              </button>
              {isChartDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1.5 z-10">
                  <button onClick={() => { setChartRange(3); setIsChartDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${chartRange === 3 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>Last 3 Months</button>
                  <button onClick={() => { setChartRange(6); setIsChartDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${chartRange === 6 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>Last 6 Months</button>
                  <button onClick={() => { setChartRange(12); setIsChartDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${chartRange === 12 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>Last 12 Months</button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-2">
            <h4 className="text-sm font-bold text-slate-700">Monthly Activity Trend</h4>
          </div>

          <div className="-ml-4 -mr-2">
            <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={320} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Recent Activities</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All
            </button>
          </div>

          <div className="flex-1 space-y-6">
            {activities.length > 0 ? activities.map(act => (
              <div key={act.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full ${act.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon icon={act.icon} className={`w-5 h-5 ${act.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{act.title}</h4>
                  <p className="text-xs text-slate-500">{act.subtitle}</p>
                </div>
                <span className="text-xs font-bold text-slate-400">{timeAgo(act.timestamp)}</span>
              </div>
            )) : (
              <div className="text-sm text-slate-500 text-center py-4">No recent activities</div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-50">
            <button className="text-xs font-bold text-[#062F26] hover:text-brand-teal flex items-center gap-1">
              View All Activities <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row (Table & Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Property Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Recent Property Requests</h3>
            <button className="flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-emerald-600 hover:bg-emerald-50">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-bold text-slate-500 rounded-tl-xl">Property</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-slate-500">Requested By</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-slate-500">Type</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-slate-500">Location</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-slate-500">Date</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-slate-500">Status</th>
                  <th className="py-3.5 px-4 rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentPropertyRequests.length > 0 ? recentPropertyRequests.map((request) => (
                  <tr key={request.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <img src={request.propertyImage} alt={request.propertyName} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{request.propertyName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <h4 className="text-sm font-bold text-slate-800">{request.requestedBy}</h4>
                      <p className="text-xs text-slate-500">{request.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${request.typeColor}`}>
                        {request.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{request.location}</td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-500">{request.date}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${request.statusColor}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors">
                        <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500 text-sm font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Icon icon="lucide:inbox" className="w-8 h-8 text-slate-300" />
                        <p>No pending property requests found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button key={action.id} className={`flex flex-col items-start gap-3 p-4 rounded-xl border transition-colors group text-left ${action.bgClass}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${action.iconBg}`}>
                  <Icon icon={action.icon} className="w-4 h-4" />
                </div>
                <span className={`text-sm font-bold ${action.textColor}`}>{action.title}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminOverview;
