import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';
import AddTenantModal from '../../components/dashboard/AddTenantModal';

const OwnerTenants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/bookings/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const bookings = await res.json();
          const activeTenants = bookings
            .filter(b => b.status === 'Confirmed' || b.status === 'Reserved' || b.status === 'Active' || b.status === 'Completed')
            .map((b) => {
              const name = b.tenantId?.fullName || (b.personalInfo?.firstName ? b.personalInfo.firstName + ' ' + (b.personalInfo.lastName || '') : 'Unknown');
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
              
              const rentInfo = (() => {
                 const isToken = b.paymentDetails?.paymentMethod === 'Token Amount' || b.paymentDetails?.paymentMethod === 'Token (40%)';
                 if (b.paymentDetails?.status === 'Paid') {
                   if (isToken) {
                     const getPricing = () => {
                       if (b.propertyId?.propertyType === 'PG' && b.roomDetails?.sharingType) {
                         const floor = b.propertyId.floors?.find(f => f.floorName === b.roomDetails.floorName);
                         const room = floor?.rooms?.find(r => r.roomName === b.roomDetails.roomName);
                         let baseType = 'Single';
                         let isAC = false;
                         
                         if (room) {
                             baseType = room.sharingType || 'Single';
                             isAC = room.isAC;
                         } else if (b.roomDetails?.sharingType) {
                             const st = b.roomDetails.sharingType;
                             baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
                             isAC = st.includes('(AC)');
                         }

                         const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
                         const pricing = b.propertyId.pgPricing?.[typeStr];
                         if (pricing) {
                           return {
                             rent: Number(pricing.rentPerBed?.replace(/\D/g, '') || 0),
                             deposit: Number(pricing.depositPerBed?.replace(/\D/g, '') || 0),
                             maintenance: 0
                           };
                         }
                       }
                       return {
                         rent: Number(b.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
                         deposit: Number(b.propertyId?.securityAmount?.replace(/\D/g, '') || 0),
                         maintenance: Number(b.propertyId?.maintenanceCharges?.replace(/\D/g, '') || 0)
                       };
                     };

                     const pricing = getPricing();
                     const stampFees = 300;
                     const fullAmount = pricing.rent + pricing.deposit + pricing.maintenance + stampFees;
                     const due = fullAmount > 0 ? fullAmount - Number(b.paymentDetails?.amount || 0) : 0;
                     return { due, fullAmount, paid: b.paymentDetails?.amount || 0 };
                   }
                   return { due: 0, fullAmount: 0, paid: b.paymentDetails?.amount || 0 };
                 }
                 return { due: Number(b.paymentDetails?.amount || 0), fullAmount: 0, paid: 0 };
              })();

              const isToken = b.paymentDetails?.paymentMethod === 'Token Amount' || b.paymentDetails?.paymentMethod === 'Token (40%)';
              
              const pricing = (() => {
                if (b.propertyId?.propertyType === 'PG' && b.roomDetails?.sharingType) {
                  const floor = b.propertyId.floors?.find(f => f.floorName === b.roomDetails.floorName);
                  const room = floor?.rooms?.find(r => r.roomName === b.roomDetails.roomName);
                  let baseType = 'Single';
                  let isAC = false;
                  
                  if (room) {
                      baseType = room.sharingType || 'Single';
                      isAC = room.isAC;
                  } else if (b.roomDetails?.sharingType) {
                      const st = b.roomDetails.sharingType;
                      baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
                      isAC = st.includes('(AC)');
                  }

                  const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
                  const pgPric = b.propertyId.pgPricing?.[typeStr];
                  if (pgPric) {
                    return {
                      rent: Number(pgPric.rentPerBed?.replace(/\D/g, '') || 0),
                      deposit: Number(pgPric.depositPerBed?.replace(/\D/g, '') || 0)
                    };
                  }
                }
                return {
                  rent: Number(b.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
                  deposit: Number(b.propertyId?.securityAmount?.replace(/\D/g, '') || 0)
                };
              })();

              return {
                id: `TN-${b._id.substring(b._id.length - 4).toUpperCase()}`,
                name: name,
                initials: initials,
                email: b.tenantId?.email || b.personalInfo?.email || 'N/A',
                phone: b.tenantId?.phone || b.personalInfo?.mobileNumber || 'N/A',
                room: b.roomDetails?.roomName || 'N/A',
                roomNumber: b.roomDetails?.roomName || 'N/A',
                bedNumber: b.roomDetails?.bedName ? b.roomDetails.bedName.replace(/\D/g, '') : '',
                bed: b.roomDetails?.bedName || 'N/A',
                rent: `₹${pricing.rent.toLocaleString()}`,
                deposit: `Deposit: ₹${pricing.deposit.toLocaleString()}`,
                payment: rentInfo.due > 0 ? 'DUE' : 'PAID',
                rentDueAmount: rentInfo.due,
                paidStr: isToken ? `Token: ₹${rentInfo.paid.toLocaleString()}` : `Paid: ₹${rentInfo.paid.toLocaleString()}`,
                dueStr: rentInfo.due > 0 ? `Move-In Due: ₹${rentInfo.due.toLocaleString()}` : 'No Dues',
                moveIn: new Date(b.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                moveInIso: new Date(b.moveInDate).toISOString().split('T')[0],
                kyc: b.kycDocs && b.kycDocs.length > 0 ? 'VERIFIED' : 'KYC PENDING',
                bookingId: b._id.substring(b._id.length - 8).toUpperCase(),
                leaseDuration: '-',
                monthlyRentNum: `₹${(b.propertyId?.monthlyRent || 0).toLocaleString()}`,
                securityDepositNum: `₹${(b.propertyId?.securityDeposit || 0).toLocaleString()}`,
                personalInfo: b.personalInfo || {},
                emergencyContact: b.emergencyContact || {},
                kycDocs: b.kycDocs || [],
              };
            });
          setTenants(activeTenants);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const stats = [
    { title: tenants.length.toString(), subtitle: 'Total Tenants', desc: 'All Active', icon: 'lucide:users', color: 'text-brand-teal', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { title: tenants.filter(t => t.payment === 'DUE').length.toString(), subtitle: 'Unpaid Tenants', desc: 'Requires Action', icon: 'lucide:clock', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    { title: `₹${tenants.reduce((acc, curr) => acc + (curr.rentDueAmount || 0), 0).toLocaleString()}`, subtitle: 'Revenue Due', desc: 'This Month', icon: 'lucide:indian-rupee', color: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
    { title: '0', subtitle: 'Upcoming Move-outs', desc: 'Next 30 Days', icon: 'lucide:calendar-clock', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
  ];

  const getPaymentStyle = (status) => {
    return status === 'PAID'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const getKycStyle = (status) => {
    return status === 'VERIFIED'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full relative pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#062F26] mb-1 tracking-tight">Tenants</h1>
          <p className="text-sm text-slate-500 font-medium">Manage tenant information and status.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#062F26] hover:bg-brand-teal text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm shrink-0"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-extrabold text-[#062F26]">{stat.title}</h3>
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          {/* Search */}
          <div className="relative w-full sm:w-96 group">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, tenant id, room or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-[#062F26] hover:border-[#062F26] transition-colors shadow-sm">
              Sort <Icon icon="lucide:arrow-up-down" className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-[#062F26] hover:border-[#062F26] transition-colors shadow-sm">
              <Icon icon="lucide:filter" className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-white">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Room / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move-in</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">KYC</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{t.name}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{t.email}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.room}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{t.bed}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.rent}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide">{t.deposit}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.paidStr}</div>
                    <div className={`text-[11px] font-bold mt-1 tracking-wide ${t.rentDueAmount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{t.dueStr}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-semibold text-slate-700">{t.moveIn}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getKycStyle(t.kyc)} shadow-sm`}>
                      {t.kyc}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      {t.payment === 'DUE' && (
                        <button className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md transition-colors uppercase tracking-wide">
                          Remind Now
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedTenant(t)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-teal transition-colors"
                        title="View Details"
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No tenants found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer Overlay */}
      {selectedTenant && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setSelectedTenant(null)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out transform ${selectedTenant ? 'translate-x-0' : 'translate-x-full'
          } flex flex-col`}
      >
        {selectedTenant && (
          <>
            {/* Drawer Header */}
            <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-start justify-between z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg shadow-inner">
                  {selectedTenant.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#062F26]">{selectedTenant.name}</h2>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Icon icon="lucide:more-vertical" className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-500">{selectedTenant.room} - {selectedTenant.bed}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
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

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-[12px] font-bold transition-colors">
                      Action Item 1
                    </button>
                    <button className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-[12px] font-bold transition-colors">
                      Action Item 2
                    </button>
                    <button className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-[12px] font-bold transition-colors">
                      Action Item 3
                    </button>
                  </div>
                </div>

                {/* Tenant Documents */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:folder" className="w-4 h-4 text-slate-700" />
                      <h4 className="text-[13px] font-bold text-slate-800">Tenant Documents</h4>
                    </div>
                  </div>
                  
                  {selectedTenant.kycDocs && selectedTenant.kycDocs.length > 0 ? (
                    <div className="bg-[#F8F9FA] rounded-xl p-3 flex flex-col gap-1 border border-slate-100 mb-4">
                      {selectedTenant.kycDocs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-200/80 group last:border-0 last:pb-0">
                          <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50 shrink-0">
                              <Icon icon="lucide:image" className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-slate-800">{doc.type}</span>
                              <span className="text-[11px] text-slate-500 font-medium">{doc.number}</span>
                            </div>
                          </div>
                          {doc.documentUrl && (
                            <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-brand-teal transition-colors shrink-0">
                              <Icon icon="lucide:eye" className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#F8F9FA] rounded-xl p-6 text-center border border-slate-100 mb-4">
                      <p className="text-sm font-medium text-slate-500">No documents uploaded.</p>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Phone</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.phone}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Email</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.email}</span>
                    </div>
                    {selectedTenant.personalInfo?.dob && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                        <span className="text-sm font-bold text-slate-800">{new Date(selectedTenant.personalInfo.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTenant.personalInfo?.gender && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Gender</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.personalInfo.gender}</span>
                      </div>
                    )}
                    {selectedTenant.personalInfo?.profession && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Profession</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.personalInfo.profession}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Joined</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.moveIn}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedTenant.emergencyContact?.name && (
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h4 className="text-sm font-bold text-[#062F26] mb-4">Emergency Contact</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Name</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Relationship</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.emergencyContact.relation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Phone</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                )}



                {/* Room & Booking Details */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Room & Booking Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Room Number</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.roomNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Bed Number</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.bedNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Booking ID</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.bookingId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Moved In Date</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.moveInIso}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Lease Duration</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.leaseDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Financial Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Monthly Rent</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.monthlyRentNum}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Security Deposit</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.securityDepositNum}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Payment Status</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getPaymentStyle(selectedTenant.payment)}`}>
                        {selectedTenant.payment}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KYC Status */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 mb-4">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">KYC Status</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Verification Status</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getKycStyle(selectedTenant.kyc)}`}>
                      {selectedTenant.kyc === 'KYC PENDING' ? 'PENDING' : 'VERIFIED'}
                    </span>
                  </div>
                </div>
              </div>
            </ReactLenis>
          </>
        )}
      </div>

      <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default OwnerTenants;
