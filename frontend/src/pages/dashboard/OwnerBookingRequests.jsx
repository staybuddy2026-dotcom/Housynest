import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { ReactLenis } from 'lenis/react';

const OwnerBookingRequests = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/bookings/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to only show requests (Pending Request, Rejected) and maybe recently Confirmed if needed.
          // The tabs are 'All', 'Pending Approval', 'Approved', 'Rejected'
          // We will map 'Pending Request' -> 'PENDING APPROVAL'
          // 'Confirmed' -> 'APPROVED'
          // 'Rejected' -> 'REJECTED'
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching booking requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();

    window.dispatchEvent(new Event('refreshCounts'));

    const handleRefresh = () => {
      fetchBookings();
    };
    window.addEventListener('refreshBookingsList', handleRefresh);

    return () => {
      window.removeEventListener('refreshBookingsList', handleRefresh);
    };
  }, []);

  const getStatusMapping = (dbStatus) => {
    if (dbStatus === 'Pending Request') return 'PENDING APPROVAL';
    if (dbStatus === 'Pending Payment' || dbStatus === 'Confirmed' || dbStatus === 'Reserved' || dbStatus === 'Completed') return 'APPROVED';
    if (dbStatus === 'Rejected' || dbStatus === 'Cancelled') return 'REJECTED';
    return dbStatus;
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setProcessingId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        toast.success(`Booking request ${newStatus === 'Pending Payment' ? 'Approved' : newStatus}`);
        window.dispatchEvent(new Event('refreshCounts'));
      } else {
        toast.error('Failed to update request status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating request status');
    } finally {
      setProcessingId(null);
    }
  };

  const requests = bookings
    .map(b => ({
      _id: b._id,
      id: b._id.substring(b._id.length - 8).toUpperCase(),
      date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }),
      customer: b.tenantId?.fullName || b.personalInfo?.firstName + ' ' + b.personalInfo?.lastName || 'Unknown',
      phone: b.tenantId?.phone || b.personalInfo?.mobileNumber || 'N/A',
      email: b.tenantId?.email || b.personalInfo?.email || 'N/A',
      property: b.propertyId?.societyName || b.propertyId?.pgName || b.propertyId?.propertyCategory || 'Property',
      propertyType: b.propertyId?.propertyType || 'N/A',
      bed: b.roomDetails?.roomName ? `${b.roomDetails.roomName} • ${b.roomDetails.bedName}` : 'N/A',
      moveIn: new Date(b.moveInDate).toISOString().split('T')[0],
      rent: `₹ ${b.paymentDetails?.amount?.toLocaleString() || 0}`,
      token: `₹ ${b.paymentDetails?.amount?.toLocaleString() || 0}`,
      paymentStatus: b.paymentDetails?.status || 'Pending',
      status: getStatusMapping(b.status),
      originalStatus: b.status,
      raw: b
    }));

  const tabs = ['All', 'Pending Approval', 'Approved', 'Rejected'];

  const filteredRequests = requests.filter(req => {
    let matchesTabLogic = true;
    if (activeTab === 'Pending Approval') matchesTabLogic = req.status === 'PENDING APPROVAL';
    else if (activeTab === 'Approved') matchesTabLogic = req.status === 'APPROVED';
    else if (activeTab === 'Rejected') matchesTabLogic = req.status === 'REJECTED';

    const matchesSearch = req.customer.toLowerCase().includes(searchQuery.toLowerCase()) || req.phone.includes(searchQuery) || req.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTabLogic && matchesSearch;
  });
  const stats = [
    { title: requests.filter(r => r.status === 'PENDING APPROVAL').length, subtitle: 'Total Pending', desc: 'Requires Action', icon: 'lucide:clock', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    { title: requests.filter(r => r.status === 'APPROVED').length, subtitle: 'Approved', desc: 'Awaiting Full Payment', icon: 'lucide:check-circle-2', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { title: requests.filter(r => r.status === 'REJECTED').length, subtitle: 'Rejected', desc: 'Not Proceeded', icon: 'lucide:x-circle', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
    { title: requests.length > 0 ? Math.round((requests.filter(r => r.status === 'APPROVED').length / requests.length) * 100) + '%' : '0%', subtitle: 'Conversion Rate', desc: 'Requests to Bookings', icon: 'lucide:percent', color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { title: `₹ ${requests.reduce((acc, curr) => acc + parseInt(curr.token.replace(/\D/g, '') || 0), 0).toLocaleString()}`, subtitle: 'Total Request Revenue', desc: 'From Tokens', icon: 'lucide:indian-rupee', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'PENDING APPROVAL': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-100px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full relative pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[28px] font-bold text-[#062F26] mb-1 tracking-tight">Booking Requests</h1>
        <p className="text-sm text-slate-500 font-medium">Manage pre-booking applications. Approve requests to notify customers for full payment.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group ${idx === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#062F26]">{stat.title}</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${stat.bgColor} ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={stat.icon} className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{stat.subtitle}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden min-h-0">

        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          {/* Search */}
          <div className="relative w-full sm:w-80 group">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-slate-100 flex overflow-x-auto hide-scrollbar bg-slate-50/30">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#062F26]' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#25D366] rounded-t-full shadow-[0_-2px_8px_rgba(37,211,102,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Responsive Content Container */}
        <div className="flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar bg-white min-h-0 relative">

          {/* Mobile View (Cards) */}
          <div className="md:hidden flex flex-col p-4 gap-4">
            {filteredRequests.map(req => (
              <div
                key={req.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${selectedRequest?.id === req.id ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
                onClick={() => setSelectedRequest(req)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#062F26]">{req.customer}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{req.id} • {req.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Property</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{req.property}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{req.bed}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Financials</p>
                    <p className="text-sm font-bold text-slate-700">{req.rent}</p>
                    <p className="text-xs font-bold text-[#25D366] mt-0.5">Token: {req.token}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Move-in</p>
                    <p className="text-sm font-bold text-slate-700">{req.moveIn}</p>
                  </div>

                  <div className="flex gap-2">
                    {req.status === 'PENDING APPROVAL' ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, 'Rejected'); }}
                          disabled={processingId === req._id}
                          className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Icon icon="lucide:x" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, 'Pending Payment'); }}
                          disabled={processingId === req._id}
                          className="px-4 h-9 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center transition-colors shadow-sm disabled:bg-emerald-400"
                        >
                          {processingId === req._id ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : 'Approve'}
                        </button>
                      </>
                    ) : (
                      <button className="px-3 h-9 rounded-lg bg-slate-50 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-100">
                        Action Taken
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No booking requests found.</p>
              </div>
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block w-full">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Request</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Customer</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Bed</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move - In Date</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent / Token</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-[#F8F9FA] transition-colors group cursor-pointer ${selectedRequest?.id === req.id ? 'bg-[#F8F9FA]' : ''}`}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-4 px-5 align-middle">
                      <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{req.id}</div>
                      <div className="text-[11px] font-medium text-slate-400 mt-1">{req.date}</div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <p className="text-sm font-bold text-[#062F26] mb-1">{req.customer}</p>
                      <p className="text-[11px] font-semibold text-slate-400">{req.phone}</p>
                      {req.email && req.email !== 'N/A' && (
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{req.email}</p>
                      )}
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="font-bold text-slate-800 text-sm">{req.property}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{req.propertyType}</div>
                      <div className="text-[11px] font-medium text-slate-400 mt-1">{req.bed}</div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="text-sm font-bold text-slate-700">{req.moveIn}</div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="font-bold text-slate-800 text-sm">{req.rent}</div>
                      <div className="text-[11px] font-bold text-[#25D366] mt-1 tracking-wide">Token: {req.token}</div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold w-max">
                        <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
                        {req.paymentStatus}
                      </div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider ${getStatusStyle(req.status)} shadow-sm`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                          className="px-3 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-[#062F26] text-xs font-bold rounded-lg transition-colors shadow-sm min-w-[64px]"
                        >
                          View
                        </button>

                        {req.status === 'PENDING APPROVAL' ? (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, 'Pending Payment'); }}
                              disabled={processingId === req._id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center min-w-[72px]"
                            >
                              {processingId === req._id ? (
                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, 'Rejected'); }}
                              disabled={processingId === req._id}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 disabled:text-slate-400 disabled:hover:bg-white disabled:hover:border-slate-200 text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 ml-2">Action taken</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No booking requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Drawer Overlay */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setSelectedRequest(null)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out transform flex flex-col ${selectedRequest ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {selectedRequest && (
          <>
            {/* Drawer Header */}
            <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-start justify-between z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal font-bold flex items-center justify-center text-lg shadow-inner">
                  {selectedRequest.customer.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#062F26]">{selectedRequest.customer}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedRequest.property} - {selectedRequest.bed}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
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


                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Phone</span>
                      <span className="text-sm font-bold text-slate-800">{selectedRequest.raw.personalInfo?.mobileNumber || selectedRequest.raw.tenantId?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Email</span>
                      <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{selectedRequest.raw.personalInfo?.email || selectedRequest.raw.tenantId?.email || 'N/A'}</span>
                    </div>
                    {selectedRequest.raw.personalInfo?.dob && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                        <span className="text-sm font-bold text-slate-800">{new Date(selectedRequest.raw.personalInfo.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedRequest.raw.personalInfo?.gender && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Gender</span>
                        <span className="text-sm font-bold text-slate-800">{selectedRequest.raw.personalInfo.gender}</span>
                      </div>
                    )}
                    {selectedRequest.raw.personalInfo?.institutionName && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Institution</span>
                        <span className="text-sm font-bold text-slate-800 text-right">{selectedRequest.raw.personalInfo.institutionName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedRequest.raw.emergencyContact?.name && (
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h4 className="text-sm font-bold text-[#062F26] mb-4">Emergency Contact</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Name</span>
                        <span className="text-sm font-bold text-slate-800">{selectedRequest.raw.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Relationship</span>
                        <span className="text-sm font-bold text-slate-800">{selectedRequest.raw.emergencyContact.relation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Phone</span>
                        <span className="text-sm font-bold text-slate-800">{selectedRequest.raw.emergencyContact.phone}</span>
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

export default OwnerBookingRequests;
