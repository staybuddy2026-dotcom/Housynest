import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ReactApexChart from 'react-apexcharts';

const defaultStats = [
  {
    title: 'Total Listings',
    value: '0',
    subtitle: '0 Active • 0 Inactive',
    icon: 'lucide:building-2',
    color: 'bg-brand-teal/10',
    iconColor: 'text-brand-teal',
  },
  {
    title: 'New Inquiries',
    value: '12',
    subtitle: 'In last 7 days',
    icon: 'lucide:message-circle-question',
    color: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    action: true
  },
  {
    title: 'Total Bookings',
    value: '0',
    subtitle: 'Across all listings',
    icon: 'lucide:calendar-check',
    color: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Active Contracts',
    value: '4',
    subtitle: 'View all contracts',
    icon: 'lucide:file-text',
    color: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  }
];

const StatCards = ({ data: initialData }) => {
  const [stats, setStats] = useState(initialData || defaultStats);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const sparklineOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'solid',
      opacity: 0.2
    },
    yaxis: {
      min: 0,
      max: 75,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    tooltip: { enabled: false }
  };

  const sparklineData = [
    { data: [45, 55, 50, 62, 54, 65, 58] },
    { data: [50, 48, 60, 52, 65, 58, 62] },
    { data: [55, 50, 65, 58, 62, 54, 68] },
    { data: [48, 62, 54, 65, 58, 62, 56] }
  ];

  const getColorHex = (colorClass) => {
    if (colorClass.includes('teal')) return '#0aa87d';
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('purple')) return '#a855f7';
    if (colorClass.includes('orange')) return '#f97316';
    if (colorClass.includes('amber')) return '#f59e0b';
    return '#0aa87d';
  };

  const getHoverBgClass = (colorClass) => {
    if (colorClass.includes('teal')) return 'group-hover:bg-brand-teal';
    if (colorClass.includes('emerald')) return 'group-hover:bg-emerald-500';
    if (colorClass.includes('blue')) return 'group-hover:bg-blue-500';
    if (colorClass.includes('purple')) return 'group-hover:bg-purple-500';
    if (colorClass.includes('orange')) return 'group-hover:bg-orange-500';
    if (colorClass.includes('amber')) return 'group-hover:bg-amber-500';
    return 'group-hover:bg-brand-teal';
  };

  const fetchOwnerStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [propertiesRes, countsRes] = await Promise.all([
        fetch('/api/properties/owner', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users/notification-counts', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (propertiesRes.ok && countsRes.ok) {
        const properties = await propertiesRes.json();
        const counts = await countsRes.json();

        const total = properties.length;
        const active = properties.filter(p => p.status === 'Active' || p.status === 'Approved').length;
        const inactive = total - active;

        setStats(prev => {
          const newStats = [...prev];

          // Total Listings
          newStats[0] = {
            ...newStats[0],
            value: total.toString(),
            subtitle: `${active} Active • ${inactive} Inactive`
          };

          // New Inquiries
          newStats[1] = {
            ...newStats[1],
            value: counts.newRequests?.toString() || '0',
            subtitle: 'Active unread requests'
          };

          // Total Bookings
          const totalBookings = properties.reduce((acc, p) => acc + (p.bookings || 0), 0);
          newStats[2] = {
            ...newStats[2],
            value: totalBookings.toString(),
            subtitle: 'Across all listings'
          };

          return newStats;
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStats(initialData);
    } else {
       
      fetchOwnerStats();
    }

    const handleMessagesRead = () => {
      fetchOwnerStats();
    };
    window.addEventListener('messagesRead', handleMessagesRead);
    return () => window.removeEventListener('messagesRead', handleMessagesRead);
  }, [initialData]);

  // Socket.io for Real-time stat card updates
  useEffect(() => {
    if (!user || initialData) return;

    const socket = io('http://localhost:5000');
    socket.emit('joinUserRoom', user.id || user._id);

    // Removed newNotification socket listener since Unread Messages card is gone

    socket.on('newInquiry', () => {
      setStats(prev => {
        const newStats = [...prev];
        const currentVal = parseInt(newStats[1].value) || 0;
        newStats[1] = { ...newStats[1], value: (currentVal + 1).toString() };
        return newStats;
      });
    });

    return () => socket.disconnect();
  }, [user, initialData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col relative group cursor-pointer hover:border-brand-teal/30 hover:shadow-[0_8px_30px_rgba(10,168,125,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle hover background gradient flare */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-brand-teal/5 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Background Sparkline Chart */}
          <div className="absolute bottom-0 left-0 right-0 h-22.5 pointer-events-none z-0">
            <ReactApexChart
              options={{ ...sparklineOptions, colors: [getColorHex(stat.iconColor)] }}
              series={[sparklineData[idx % 4]]}
              type="area"
              height="100%"
              width="100%"
            />
          </div>

          <div className="flex items-start gap-4 mb-3 relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out shadow-sm`}>
              <Icon icon={stat.icon} className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-[#062F26] leading-none tracking-tight mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 relative z-10">
            <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">{stat.subtitle}</p>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getHoverBgClass(stat.iconColor)} group-hover:text-white text-slate-400 transition-all duration-300 transform group-hover:translate-x-1`}>
              <Icon icon="lucide:arrow-right" className="w-3 h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
