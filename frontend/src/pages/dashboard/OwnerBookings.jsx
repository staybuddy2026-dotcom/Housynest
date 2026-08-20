import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { ReactLenis } from 'lenis/react';
import CustomDropdown from '../../components/list-property/CustomDropdown';

const OwnerBookings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('All Properties');
  const [dateFilter, setDateFilter] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [deductions, setDeductions] = useState('');
  const [processingMoveOutId, setProcessingMoveOutId] = useState(null);

  const [showEsignOtp, setShowEsignOtp] = useState(false);
  const [esignOtp, setEsignOtp] = useState('');
  const [isVerifyingEsign, setIsVerifyingEsign] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/bookings/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusMapping = (dbStatus) => {
    if (dbStatus === 'Pending Payment') return 'PENDING PAYMENT';
    if (dbStatus === 'Reserved') return 'RESERVED';
    if (dbStatus === 'Confirmed') return 'CONFIRMED';
    if (dbStatus === 'Completed') return 'MOVED OUT';
    if (dbStatus === 'Active') return 'ACTIVE';
    return null; // Don't show pending requests or rejected in bookings tab
  };

  const bookingData = bookings
    .filter(b => getStatusMapping(b.status) !== null)
    .map(b => {
      const sharing = b.roomDetails?.sharingType || '';
      let baseType = 'Other';
      if (sharing.includes('Single')) baseType = 'Single';
      else if (sharing.includes('Double')) baseType = 'Double';
      else if (sharing.includes('Triple')) baseType = 'Triple';
      else if (sharing.includes('Four')) baseType = 'Four';

      const typeAC = `${baseType}_AC`;
      const typeNonAC = `${baseType}_NonAC`;

      let rentAmt = 0;
      let depositAmt = 0;
      let maintenanceAmt = 0;

      if (b.propertyId?.propertyType === 'PG' && b.propertyId?.pgPricing) {
        let pricing = null;
        if (b.propertyId.pgPricing[typeNonAC]?.rentPerBed) {
          pricing = b.propertyId.pgPricing[typeNonAC];
        } else if (b.propertyId.pgPricing[typeAC]?.rentPerBed) {
          pricing = b.propertyId.pgPricing[typeAC];
        }
        if (pricing) {
          rentAmt = Number(String(pricing.rentPerBed || '').replace(/\D/g, '') || 0);
          depositAmt = Number(String(pricing.depositPerBed || '').replace(/\D/g, '') || 0);
        }
      } else if (b.propertyId) {
        rentAmt = Number(String(b.propertyId.monthlyRent || '').replace(/\D/g, '') || 0);
        depositAmt = Number(String(b.propertyId.securityAmount || '').replace(/\D/g, '') || 0);
        maintenanceAmt = Number(String(b.propertyId.maintenanceCharges || '').replace(/\D/g, '') || 0);
      }

      const stampFees = 300;
      const totalAmount = rentAmt + depositAmt + maintenanceAmt + stampFees;
      const tokenAmt = Math.round(totalAmount * 0.40);
      const paidAmt = b.paymentDetails?.amount || 0;
      const dueAmt = Math.max(totalAmount - paidAmt, 0);

      const rawStatus = getStatusMapping(b.status);
      const moveInDateObj = new Date(b.moveInDate);
      moveInDateObj.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPastMoveIn = moveInDateObj <= today;

      let filterStatus = rawStatus;
      if (['CONFIRMED', 'RESERVED', 'PENDING PAYMENT'].includes(rawStatus) && isPastMoveIn) {
        filterStatus = 'ACTIVE';
      }

      return {
        _id: b._id,
        id: b._id.substring(b._id.length - 8).toUpperCase(),
        date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }),
        tenant: b.tenantId?.fullName || b.personalInfo?.firstName + ' ' + b.personalInfo?.lastName || 'Unknown',
        phone: b.tenantId?.phone || b.personalInfo?.mobileNumber || 'N/A',
        email: b.tenantId?.email || b.personalInfo?.email || 'N/A',
        property: b.propertyId?.societyName || b.propertyId?.pgName || b.propertyId?.propertyCategory || 'Property',
        propertyType: b.propertyId?.propertyType || 'N/A',
        bed: b.propertyId?.propertyType === 'Tenant' ? 'Entire Property' : (b.roomDetails?.roomName ? `${b.roomDetails.roomName} • ${b.roomDetails.bedName}` : 'N/A'),
        moveIn: new Date(b.moveInDate).toISOString().split('T')[0],
        movedOut: b.expectedMoveOutDate ? new Date(b.expectedMoveOutDate).toISOString().split('T')[0] : null,
        rent: rentAmt,
        token: tokenAmt,
        paid: paidAmt,
        due: dueAmt,
        isTokenPaid: paidAmt > 0 && paidAmt < totalAmount,
        isFullPaid: paidAmt > 0 && paidAmt >= totalAmount,
        status: rawStatus,
        filterStatus: filterStatus,
        source: b.propertyId?.bookingType === 'Direct Booking' ? 'DIRECT' : 'REQUEST',
        moveOutRequest: b.moveOutRequest || null,
        raw: b,
      };
    });

  const stats = [
    { title: bookingData.length, subtitle: 'Total Bookings', desc: 'All time bookings', icon: 'lucide:layers', color: 'text-brand-teal', bgColor: 'bg-brand-teal/10', borderColor: 'border-brand-teal/20', filterValue: 'ALL', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: bookingData.filter(b => ['CONFIRMED', 'RESERVED', 'PENDING PAYMENT'].includes(b.filterStatus)).length, subtitle: 'Upcoming', desc: 'Confirmed & Reserved', icon: 'lucide:calendar-check', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', filterValue: 'UPCOMING', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: bookingData.filter(b => b.filterStatus === 'ACTIVE').length, subtitle: 'Active', desc: 'Currently Staying', icon: 'lucide:home', color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', filterValue: 'ACTIVE', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: bookingData.filter(b => b.filterStatus === 'MOVED OUT').length, subtitle: 'Moved Out', desc: 'Past Bookings', icon: 'lucide:log-out', color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'border-slate-200', filterValue: 'MOVED OUT', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
  ];

  const getBookingStatusBadge = (status) => {
    if (['CONFIRMED', 'ACTIVE'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-colors">
          <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else if (['RESERVED'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm hover:bg-blue-100 transition-colors">
          <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else if (['PENDING PAYMENT'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm hover:bg-amber-100 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else if (['CANCELLED'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full shadow-sm hover:bg-rose-100 transition-colors">
          <Icon icon="lucide:x-circle" className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
          <Icon icon="lucide:info" className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    }
  };

  const handleRejectMoveOut = async (bookingId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setProcessingMoveOutId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/reject-move-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        toast.success('Move-out request rejected.');
        setBookings(bookings.map(b => b._id === bookingId ? updatedBooking : b));
        setRejectionReason('');
        setSelectedBooking(null); // close drawer to refresh data smoothly
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to reject move-out request.');
      }
    } catch (error) {
      console.error('Error rejecting move-out:', error);
      toast.error('An error occurred while rejecting the request.');
    } finally {
      setProcessingMoveOutId(null);
    }
  };

  const handleProcessCheckout = async (bookingId) => {
    setProcessingMoveOutId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/process-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deductions: Number(deductions) || 0 })
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        toast.success('Checkout processed successfully.');
        setBookings(bookings.map(b => b._id === bookingId ? updatedBooking : b));
        setDeductions('');
        setSelectedBooking(null); // close drawer
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to process checkout.');
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('An error occurred during checkout processing.');
    } finally {
      setProcessingMoveOutId(null);
    }
  };

  const handleSendEsignOtp = () => {
    setShowEsignOtp(true);
    toast.success('OTP sent to your Aadhaar linked mobile number for eSign');
  };

  const handleVerifyEsign = async (bookingId) => {
    if (esignOtp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifyingEsign(true);
    try {
      // Simulate backend delay for eSign verification
      await new Promise(r => setTimeout(r, 2000));
      
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/consent`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success('Agreement E-Signed Successfully!');
        
        // Update local state
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, ownerConsentStatus: 'Consented' } : b));
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, ownerConsentStatus: 'Consented', raw: { ...selectedBooking.raw, ownerConsentStatus: 'Consented' } });
        }
        setShowEsignOtp(false);
        setEsignOtp('');
      }
    } catch (error) {
      toast.error('Failed to verify eSign OTP');
    } finally {
      setIsVerifyingEsign(false);
    }
  };

  const filteredBookings = bookingData.filter(bk => {
    const matchesSearch = bk.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.phone.includes(searchQuery) ||
      bk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.property.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'UPCOMING') {
      matchesStatus = ['CONFIRMED', 'RESERVED', 'PENDING PAYMENT'].includes(bk.filterStatus);
    } else if (statusFilter !== 'ALL') {
      if (['PENDING PAYMENT', 'RESERVED', 'CONFIRMED', 'CANCELLED'].includes(statusFilter)) {
        matchesStatus = bk.status === statusFilter;
      } else {
        matchesStatus = bk.filterStatus === statusFilter;
      }
    }

    const matchesProperty = propertyFilter === 'All Properties' || bk.property === propertyFilter;
    const matchesDate = !dateFilter || bk.moveIn === dateFilter;

    return matchesSearch && matchesStatus && matchesProperty && matchesDate;
  });

  const uniqueProperties = ['All Properties', ...new Set(bookingData.map(b => b.property))];

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full relative pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="lucide:calendar-check-2" className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Bookings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage all your property bookings and reservations</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#062F26] hover:bg-brand-teal text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm shrink-0">
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Create Booking
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => setStatusFilter(stat.filterValue)}
            className={`relative overflow-hidden bg-white rounded-xl border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group cursor-pointer ${statusFilter === stat.filterValue ? 'border-brand-teal ring-2 ring-brand-teal/20' : 'border-slate-200'}`}
          >
            <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className="text-2xl font-bold text-[#062F26]">{stat.title}</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${stat.bgColor} ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={stat.icon} className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-base font-bold text-slate-600 group-hover:text-[#062F26] transition-colors">{stat.subtitle}</p>
              <p className="text-xs text-slate-400 font-medium group-hover:text-slate-500 transition-colors">{stat.desc}</p>
            </div>

            {/* Sparkline Chart Anchored to Bottom Right */}
            <div className="absolute right-0 bottom-0 w-32 h-14 opacity-40 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible drop-shadow-sm" preserveAspectRatio="none">
                <path
                  d={stat.chartPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={stat.color}
                />

                {/* Subtle gradient fill under the line */}
                <path
                  d={`${stat.chartPath} L 100 40 L 0 40 Z`}
                  fill="currentColor"
                  className={`${stat.color} opacity-10`}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col relative z-10">

        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/30 rounded-t-2xl relative z-20">
          {/* Search */}
          <div className="relative w-full xl:w-96 group shrink-0">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, booking id, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3 w-full xl:w-auto">
            {/* Status Dropdown */}
            <div className="w-full sm:w-[180px] shrink-0">
              <CustomDropdown
                value={
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <span className="text-[#062F26]">{statusFilter === 'ALL' ? 'All' : statusFilter === 'UPCOMING' ? 'Upcoming' : statusFilter}</span>
                  </span>
                }
                options={[
                  { label: 'All', value: 'ALL' },
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Upcoming', value: 'UPCOMING' },
                  { label: 'Moved Out', value: 'MOVED OUT' },
                  { label: 'Pending Payment', value: 'PENDING PAYMENT' },
                  { label: 'Reserved', value: 'RESERVED' },
                  { label: 'Confirmed', value: 'CONFIRMED' }
                ]}
                onChange={(val) => setStatusFilter(val)}
                buttonClassName="shadow-sm !py-2.5 border-slate-200 w-full"
                containerClassName="w-full"
              />
            </div>

            {/* Property Dropdown */}
            <div className="w-full sm:w-[220px] shrink-0">
              <CustomDropdown
                value={
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400 font-medium shrink-0">Property:</span>
                    <span className="truncate text-[#062F26]">{propertyFilter}</span>
                  </span>
                }
                options={uniqueProperties.map(prop => ({ label: prop, value: prop }))}
                onChange={(val) => setPropertyFilter(val)}
                buttonClassName="shadow-sm !py-2.5 border-slate-200 w-full"
                containerClassName="w-full"
              />
            </div>

            {/* Date Filter */}
            <div className="w-full sm:w-[200px] relative shrink-0">
              <div className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-sm font-medium text-slate-700 hover:border-brand-teal transition-all cursor-pointer relative overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 flex-1 truncate">
                  <span className="text-slate-400 shrink-0">Move-in:</span>
                  <span className="truncate">
                    {dateFilter ? new Date(dateFilter).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Any Date'}
                  </span>
                </div>
                <Icon icon="lucide:calendar" className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                
                {/* Transparent Date Input Overlay */}
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ WebkitAppearance: 'none' }}
                />

                {/* Clear button (sits above the transparent input) */}
                {dateFilter && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDateFilter(''); }} 
                    className="absolute right-10 z-10 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Icon icon="lucide:x" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white rounded-b-2xl relative z-10">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Booking</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move - In Date</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={`hover:bg-[#F8F9FA] transition-colors group cursor-pointer ${selectedBooking?.id === booking.id ? 'bg-[#F8F9FA]' : ''}`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <td className="py-4 px-5 align-middle">
                    <div className="inline-block px-2.5 py-1 bg-brand-teal/10 text-brand-teal rounded-lg font-bold text-[13px] uppercase tracking-wide group-hover:bg-brand-teal group-hover:text-white transition-colors">{booking.id}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1.5">{booking.date}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <p className="text-sm font-bold text-[#062F26] mb-1">{booking.tenant}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{booking.phone}</p>
                    {booking.email && booking.email !== 'N/A' && (
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{booking.email}</p>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{booking.property}</div>
                    <div className="mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${booking.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : booking.propertyType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {booking.propertyType}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{booking.bed}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-700">{booking.moveIn}</div>
                    {booking.movedOut && (
                      <div className="text-[11px] font-medium text-slate-400 mt-1">{booking.movedOut}</div>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    {booking.isFullPaid ? (
                      <>
                        <div className="font-bold text-slate-800 text-sm">Full Paid: ₹{booking.paid.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-sm inline-block">Paid</div>
                      </>
                    ) : booking.isTokenPaid ? (
                      <>
                        <div className="font-bold text-slate-800 text-sm">Token Paid: ₹{booking.paid.toLocaleString()}</div>
                        <div className="text-xs font-bold text-rose-600 mt-1 mb-1">Due: ₹{booking.due.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-sm inline-block">Pending Full Payment</div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-800 text-sm">Rent: ₹{booking.rent.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-rose-600 mt-1 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-sm inline-block">Unpaid</div>
                      </>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    {getBookingStatusBadge(booking.status)}
                    {booking.moveOutRequest?.isRequested && booking.moveOutRequest.status === 'Pending' && (
                      <div className="mt-2 flex">
                        <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Icon icon="lucide:log-out" className="w-3 h-3" /> Move-out Req
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-teal transition-colors"
                        title="View Details"
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No bookings found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer Overlay */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setSelectedBooking(null)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-full bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out transform flex flex-col ${selectedBooking ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {selectedBooking && (
          <>
            {/* Drawer Header */}
            <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-start justify-between z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal font-bold flex items-center justify-center text-lg shadow-inner">
                  {selectedBooking.tenant.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#062F26]">{selectedBooking.tenant}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedBooking.property} - {selectedBooking.bed}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <ReactLenis
              className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50"
              options={{ smoothTouch: true }}
            >
              <div className="p-6 space-y-6">

                {/* Move-out Action Card */}
                {selectedBooking.raw.moveOutRequest?.isRequested && selectedBooking.raw.moveOutRequest?.status === 'Pending' && (
                  <div className="bg-amber-50 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-amber-200">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:log-out" className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-amber-900">Move-out Request Pending</h4>
                        <p className="text-sm font-medium text-amber-700/80 mt-0.5">
                          Intended Date: {new Date(selectedBooking.raw.moveOutRequest.intendedMoveOutDate).toDateString()}
                        </p>
                        {selectedBooking.raw.moveOutRequest.reason && (
                          <p className="text-xs text-amber-700 mt-1 italic">"{selectedBooking.raw.moveOutRequest.reason}"</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Reject Section */}
                      <div className="bg-white/60 p-3 rounded-xl border border-amber-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reject Request</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Reason for rejection (e.g. Unpaid dues)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="flex-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                          <button
                            onClick={() => handleRejectMoveOut(selectedBooking._id)}
                            disabled={processingMoveOutId === selectedBooking._id}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {/* Checkout Section */}
                      <div className="bg-white/60 p-3 rounded-xl border border-amber-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Process Checkout</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1 w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                            <input
                              type="number"
                              placeholder="Deductions (Damages/Dues)"
                              value={deductions}
                              onChange={(e) => setDeductions(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                            />
                          </div>
                          <button
                            onClick={() => handleProcessCheckout(selectedBooking._id)}
                            disabled={processingMoveOutId === selectedBooking._id}
                            className="w-full sm:w-auto px-4 py-2 bg-[#062F26] text-white hover:bg-brand-teal font-bold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            Checkout & Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* E-Stamp / E-Sign Banner */}
                {selectedBooking.raw.status === 'Confirmed' && selectedBooking.raw.ownerConsentStatus !== 'Consented' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-[#062F26] mb-4">Agreement Signature</h3>
                    
                    {selectedBooking.raw.eStampStatus === 'Completed' && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <Icon icon="lucide:pen-tool" className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-indigo-900">E-Sign Your Agreement</p>
                            <p className="text-xs text-indigo-700/80 leading-relaxed mt-0.5 mb-4">The e-Stamp has been generated for this booking. As the owner, please eSign the agreement using your Aadhaar OTP.</p>
                            
                            {!showEsignOtp ? (
                              <button
                                onClick={handleSendEsignOtp}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors shrink-0 whitespace-nowrap flex items-center gap-2"
                              >
                                <Icon icon="lucide:file-signature" className="w-4 h-4" />
                                Send OTP for eSign
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                  type="text"
                                  placeholder="Enter 6-digit eSign OTP"
                                  value={esignOtp}
                                  onChange={(e) => setEsignOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  className="flex-1 bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 max-w-xs"
                                />
                                <button
                                  onClick={() => handleVerifyEsign(selectedBooking._id)}
                                  disabled={isVerifyingEsign || esignOtp.length < 6}
                                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-70 transition-colors shrink-0 flex items-center justify-center min-w-[120px]"
                                >
                                  {isVerifyingEsign ? (
                                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Verify & eSign'
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Phone</span>
                      <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.personalInfo?.mobileNumber || selectedBooking.raw.tenantId?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Email</span>
                      <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{selectedBooking.raw.personalInfo?.email || selectedBooking.raw.tenantId?.email || 'N/A'}</span>
                    </div>
                    {selectedBooking.raw.personalInfo?.dob && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                        <span className="text-sm font-bold text-slate-800">{new Date(selectedBooking.raw.personalInfo.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedBooking.raw.personalInfo?.gender && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Gender</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.personalInfo.gender}</span>
                      </div>
                    )}
                    {selectedBooking.raw.personalInfo?.institutionName && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Institution</span>
                        <span className="text-sm font-bold text-slate-800 text-right">{selectedBooking.raw.personalInfo.institutionName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedBooking.raw.emergencyContact?.name && (
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h4 className="text-sm font-bold text-[#062F26] mb-4">Emergency Contact</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Name</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Relationship</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.emergencyContact.relation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Phone</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </ReactLenis>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;
