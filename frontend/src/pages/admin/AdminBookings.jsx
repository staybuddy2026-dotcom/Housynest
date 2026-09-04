import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import ReactApexChart from 'react-apexcharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const tableHeaders = [
  { label: 'Property', align: 'left' },
  { label: 'Tenant', align: 'left' },
  { label: 'Landlord', align: 'left' },
  { label: 'Unit Details', align: 'left' },
  { label: 'Move-In Date', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Action', align: 'right' }
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Active':
    case 'Confirmed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {status}
        </span>
      );
    case 'Reserved':
    case 'Pending Payment':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">
          <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-amber-500" />
          {status}
        </span>
      );
    case 'Pending Request':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">
          <Icon icon="lucide:hourglass" className="w-3.5 h-3.5 text-blue-500" />
          Pending
        </span>
      );
    case 'Cancelled':
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">
          <Icon icon="lucide:x-circle" className="w-3.5 h-3.5 text-rose-500" />
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">
          {status || 'Unknown'}
        </span>
      );
  }
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [rentRevenue, setRentRevenue] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const [bookRes, statsRes] = await Promise.all([
        fetch('/api/bookings/admin/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/invoices/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (bookRes.ok) {
        const data = await bookRes.json();
        setBookings(data);
      } else {
        toast.error('Failed to load bookings');
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setRentRevenue(statsData?.stats?.current?.collected || 0);
      }
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (booking) => {
    if (!booking) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const propName = booking.propertyId?.pgName || booking.propertyId?.societyName || booking.propertyId?.propertyCategory || 'Property';
      const propType = booking.propertyId?.propertyType || 'Booking';
      const address = booking.propertyId?.address || '';
      const locCity = [booking.propertyId?.locality, booking.propertyId?.city].filter(Boolean).join(', ') || 'N/A';
      const tenantName = booking.tenantId?.fullName || booking.personalInfo?.fullName || 'N/A';
      const tenantPhone = booking.tenantId?.phone || booking.personalInfo?.phone || 'N/A';
      const tenantEmail = booking.tenantId?.email || booking.personalInfo?.email || 'N/A';
      const ownerName = booking.ownerId?.fullName || 'N/A';
      const ownerEmail = booking.ownerId?.email || 'N/A';
      const amount = booking.paymentDetails?.amount ? `INR ${booking.paymentDetails.amount.toLocaleString('en-IN')}` : 'INR 0';
      const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB');
      const moveInStr = booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
      const txnId = booking._id ? `TXN-${booking._id.slice(-8).toUpperCase()}` : 'TXN-ONLINE';
      const recId = booking._id ? `REC-${booking._id.slice(-6).toUpperCase()}` : 'REC-001';

      // Header Accent Bar
      doc.setFillColor(6, 47, 38);
      doc.rect(0, 0, 210, 32, 'F');

      // Title / Logo Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Housynest', 15, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Payment Receipt', 15, 25);

      // Status Badge
      doc.setFillColor(230, 244, 241);
      doc.roundedRect(150, 10, 45, 12, 3, 3, 'F');
      doc.setTextColor(6, 47, 38);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.status ? booking.status.toUpperCase() : 'CONFIRMED', 172.5, 17.5, { align: 'center' });

      // Receipt Meta Details
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Receipt #${recId}  •  Date: ${dateStr}`, 195, 27, { align: 'right' });

      // Section 1: Property Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 40, 180, 28, 3, 3, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`PROPERTY DETAILS (${propType.toUpperCase()})`, 20, 47);

      doc.setTextColor(6, 47, 38);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(propName, 20, 54);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let yPos = 60;
      if (address) {
        doc.text(address.length > 70 ? address.substring(0, 70) + '...' : address, 20, yPos);
        yPos += 4.5;
      }
      doc.text(`Location: ${locCity}`, 20, yPos);

      // Section 2: Payer & Payee Cards
      // Payer Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 75, 87, 36, 3, 3, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('TENANT (PAYER)', 20, 82);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(tenantName, 20, 89);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Phone: ${tenantPhone}`, 20, 96);
      doc.text(`Email: ${tenantEmail}`, 20, 102);

      // Payee Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(108, 75, 87, 36, 3, 3, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('LANDLORD (PAYEE)', 113, 82);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(ownerName, 113, 89);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Email: ${ownerEmail}`, 113, 96);
      doc.text(`Move-In Date: ${moveInStr}`, 113, 102);

      // Section 3: Payment Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 118, 180, 10, 'F');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', 20, 124.5);
      doc.text('TRANSACTION REF', 100, 124.5);
      doc.text('AMOUNT', 190, 124.5, { align: 'right' });

      // Table Row
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Booking Advance / Initial Payment', 20, 136);
      doc.text(txnId, 100, 136);
      doc.setFont('helvetica', 'bold');
      doc.text(amount, 190, 136, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.line(15, 142, 195, 142);

      // Total Row
      doc.setFillColor(240, 253, 244);
      doc.rect(15, 145, 180, 12, 'F');

      doc.setTextColor(22, 101, 52);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL AMOUNT PAID', 20, 152.5);
      doc.text(amount, 190, 152.5, { align: 'right' });

      // Footer Notes
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('This is an official computer-generated receipt issued by Housynest Platform.', 105, 175, { align: 'center' });
      doc.text('Thank you for booking with Housynest!', 105, 180, { align: 'center' });

      // Directly trigger browser PDF download!
      doc.save(`Receipt_${recId}.pdf`);
      toast.success('Payment receipt PDF downloaded!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF receipt.');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const propName = b.propertyId?.pgName || b.propertyId?.societyName || b.propertyId?.propertyCategory || '';
      const tenantName = b.tenantId?.fullName || b.personalInfo?.fullName || '';
      const ownerName = b.ownerId?.fullName || '';
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        propName.toLowerCase().includes(searchLower) ||
        tenantName.toLowerCase().includes(searchLower) ||
        ownerName.toLowerCase().includes(searchLower);

      let matchesStatus = false;
      if (statusFilter === 'All') {
        matchesStatus = true;
      } else if (statusFilter === 'Confirmed') {
        matchesStatus = b.status === 'Confirmed' && !b.tenantConfirmedMoveIn;
      } else if (statusFilter === 'Active') {
        matchesStatus = b.status === 'Active' || (b.status === 'Confirmed' && b.tenantConfirmedMoveIn);
      } else {
        matchesStatus = b.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => ['Active', 'Confirmed'].includes(b.status)).length;
    const pending = bookings.filter(b => ['Pending Request', 'Pending Payment', 'Reserved'].includes(b.status)).length;
    const totalRevenue = rentRevenue;
    return { total, active, pending, totalRevenue };
  }, [bookings, rentRevenue]);

  const sparklineOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: true } },
    stroke: { width: 1.5, curve: 'smooth' },
    fill: {
      type: 'solid',
      opacity: 0.15
    },
    grid: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
    yaxis: {
      min: 0,
      max: 95,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: false },
      tooltip: { enabled: false }
    },
    tooltip: { enabled: false }
  };

  const sparklineData = [
    [57, 75, 85, 62, 80, 58, 65],
    [88, 70, 80, 62, 75, 60, 62],
    [75, 62, 75, 50, 76, 55, 80],
    [50, 90, 62, 75, 52, 62, 77]
  ];

  const getColorHex = (colorClass) => {
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('amber') || colorClass.includes('orange')) return '#f59e0b';
    if (colorClass.includes('purple')) return '#a855f7';
    return '#10b981';
  };

  const getHoverBgClass = (colorClass) => {
    if (colorClass.includes('emerald')) return 'group-hover:bg-emerald-500';
    if (colorClass.includes('blue')) return 'group-hover:bg-blue-500';
    if (colorClass.includes('amber') || colorClass.includes('orange')) return 'group-hover:bg-amber-500';
    if (colorClass.includes('purple')) return 'group-hover:bg-purple-500';
    return 'group-hover:bg-emerald-500';
  };

  const metricCards = useMemo(() => [
    {
      id: 'total',
      title: 'Total Bookings',
      value: stats.total,
      subtitle: '▲ 12.5% vs last month',
      icon: 'lucide:calendar-check',
      color: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      filterAction: () => {
        setStatusFilter('All');
        setCurrentPage(1);
      }
    },
    {
      id: 'active',
      title: 'Active Stays',
      value: stats.active,
      subtitle: '▲ 8.2% vs last month',
      icon: 'lucide:check-circle',
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      filterAction: () => {
        setStatusFilter('Active');
        setCurrentPage(1);
      }
    },
    {
      id: 'pending',
      title: 'Pending Bookings',
      value: stats.pending,
      subtitle: 'Requires admin action',
      icon: 'lucide:clock',
      color: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      filterAction: () => {
        setStatusFilter('Pending');
        setCurrentPage(1);
      }
    },
    {
      id: 'revenue',
      title: 'Booking Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: 'Across all confirmed stays',
      icon: 'lucide:indian-rupee',
      color: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      filterAction: () => { }
    }
  ], [stats]);

  return (
    <div className="space-y-4 mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon icon="lucide:calendar-check" className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bookings & Payments</h1>
            <p className="text-sm text-slate-500 font-medium">
              Monitor and manage all platform bookings, reservations, and payment receipts.
            </p>
          </div>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-[#062F26] hover:text-white rounded-md font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            onClick={card.filterAction}
            className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col relative group cursor-pointer hover:border-[#062F26]/20 hover:shadow-[0_8px_30px_rgba(6,47,38,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[125px]"
          >
            {/* Subtle hover background gradient flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#062F26]/5 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Background Sparkline Chart */}
            <div className="absolute -bottom-3 -left-4 -right-4 h-20 pointer-events-none z-0 opacity-70 group-hover:opacity-100 transition-opacity">
              <ReactApexChart
                options={{ ...sparklineOptions, colors: [getColorHex(card.iconColor)] }}
                series={[{ data: sparklineData[idx % 4] }]}
                type="area"
                height="100%"
                width="100%"
              />
            </div>

            <div className="flex items-start gap-4 mb-3 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out shadow-xs`}>
                <Icon icon={card.icon} className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-[#062F26] leading-none tracking-tight mb-1">{card.value}</h3>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 relative z-10">
              <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">{card.subtitle}</p>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getHoverBgClass(card.iconColor)} group-hover:text-white text-slate-400 transition-all duration-300 transform group-hover:translate-x-1`}>
                <Icon icon="lucide:arrow-right" className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search property, tenant, landlord..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            {['All', 'Confirmed', 'Active', 'Reserved', 'Moved Out', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${statusFilter === status
                  ? 'bg-[#062F26] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className={`py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${header.align === 'right' ? 'text-right' : ''}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Loading bookings...</p>
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-xs">
                    No bookings found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const propName = b.propertyId?.pgName || b.propertyId?.societyName || b.propertyId?.propertyCategory || 'Property';
                  const propType = b.propertyId?.propertyType;
                  const tenantName = b.tenantId?.fullName || b.personalInfo?.fullName || 'Tenant';
                  const ownerName = b.ownerId?.fullName || 'Landlord';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&q=80'}
                            alt={propName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[#062F26] leading-tight">{propName}</span>
                              {propType && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${propType === 'PG' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                  {propType}
                                </span>
                              )}
                            </div>
                            {b.propertyId?.address && (
                              <span className="text-xs font-bold text-slate-800 leading-tight block mt-0.5 max-w-[220px] truncate" title={b.propertyId.address}>
                                {b.propertyId.address}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 font-medium block mt-0.5 max-w-[220px] truncate" title={[b.propertyId?.locality, b.propertyId?.city].filter(Boolean).join(', ')}>
                              {[b.propertyId?.locality, b.propertyId?.city].filter(Boolean).join(', ') || 'Location N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-slate-800 block">{tenantName}</span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">{b.tenantId?.phone || b.personalInfo?.phone || 'No phone'}</span>
                        <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[180px]">{b.tenantId?.email || b.personalInfo?.email || 'No email'}</span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm font-semibold text-slate-700 block">{ownerName}</span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">{b.ownerId?.phone || 'No phone'}</span>
                        <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[180px]">{b.ownerId?.email || 'No email'}</span>
                      </td>

                      <td className="py-4 px-6">
                        {propType === 'Tenant' ? (
                          <span className="text-xs font-bold text-slate-700">Entire Property</span>
                        ) : b.roomDetails?.roomName ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <span>{b.roomDetails.roomName}</span>
                            <span>•</span>
                            <span className="text-brand-teal">{b.roomDetails.bedName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-800 block">
                          {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(b.status)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 text-xs font-bold text-brand-teal bg-emerald-50 hover:bg-[#062F26] hover:text-white rounded-md transition-all cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 text-center sm:text-left">
            Showing {filteredBookings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredBookings.length)} of {filteredBookings.length} bookings
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors cursor-pointer ${currentPage === index + 1
                    ? 'bg-[#062F26] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-[#062F26]">Booking Overview</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Booking Status</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-[#062F26] text-sm">
                    {selectedBooking.propertyId?.pgName || selectedBooking.propertyId?.societyName || selectedBooking.propertyId?.propertyCategory || 'Property'}
                  </p>
                  {selectedBooking.propertyId?.propertyType && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${selectedBooking.propertyId.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {selectedBooking.propertyId.propertyType}
                    </span>
                  )}
                </div>
                {selectedBooking.propertyId?.address && (
                  <p className="text-slate-700 font-semibold text-xs">{selectedBooking.propertyId.address}</p>
                )}
                <p className="text-slate-500 text-xs mt-0.5 font-medium flex items-center gap-1">
                  <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{[selectedBooking.propertyId?.locality, selectedBooking.propertyId?.city].filter(Boolean).join(', ') || 'Location N/A'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tenant Name</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedBooking.tenantId?.fullName || selectedBooking.personalInfo?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tenant Phone</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedBooking.tenantId?.phone || selectedBooking.personalInfo?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Landlord Name</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedBooking.ownerId?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Landlord Email</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">{selectedBooking.ownerId?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Move-In Date</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedBooking.moveInDate ? new Date(selectedBooking.moveInDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Paid Amount</p>
                  <p className="font-bold text-brand-teal text-xs mt-0.5">{formatCurrency(selectedBooking.paymentDetails?.amount)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDownloadReceipt(selectedBooking)}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-[#062F26] hover:text-white border border-emerald-200 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Icon icon="lucide:download" className="w-4 h-4" />
                Download Receipt
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-[#062F26] text-white rounded-md text-xs font-bold hover:bg-[#062F26]/90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
