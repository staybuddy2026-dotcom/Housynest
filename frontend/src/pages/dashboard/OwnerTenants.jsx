import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';
import AddTenantModal from '../../components/dashboard/AddTenantModal';
import TenantDetailsDrawer from '../../components/dashboard/TenantDetailsDrawer';

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

                 if (b.status === 'Reserved') {
                   const stampFees = 300;
                   const fullAmount = pricing.rent + pricing.deposit + pricing.maintenance + stampFees;
                   const due = fullAmount > 0 ? fullAmount - Number(b.paymentDetails?.amount || 0) : 0;
                   return { due, paid: b.paymentDetails?.amount || 0, dueType: 'Move-In Due', dueDate: new Date(b.createdAt) };
                 } else if (b.status === 'Active' || b.status === 'Confirmed') {
                   const today = new Date();
                   const moveInDate = b.moveInDate ? new Date(b.moveInDate) : new Date(b.createdAt);
                   let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());
                   
                   if (nextDueDate < today) {
                     nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                   }

                   const diffMs = nextDueDate - today;
                   const daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

                   if ((daysDue <= 7 && daysDue > 0) || nextDueDate < today) {
                      return { due: pricing.rent, paid: 0, dueType: 'Rent Due', dueDate: nextDueDate };
                   } else {
                      return { due: 0, paid: pricing.rent, dueType: 'No Dues', dueDate: null };
                   }
                 }
                 
                 return { due: 0, paid: b.paymentDetails?.amount || 0, dueType: 'No Dues', dueDate: null };
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
                property: b.propertyId?.pgName || b.propertyId?.propertyCategory || 'Property',
                propertyType: b.propertyId?.propertyType || 'N/A',
                room: b.roomDetails?.roomName || 'N/A',
                roomNumber: b.roomDetails?.roomName || 'N/A',
                bedNumber: b.roomDetails?.bedName ? b.roomDetails.bedName.replace(/\D/g, '') : '',
                bed: b.roomDetails?.bedName || 'N/A',
                rent: `₹${pricing.rent.toLocaleString()}`,
                deposit: `Deposit: ₹${pricing.deposit.toLocaleString()}`,
                payment: rentInfo.due > 0 ? 'DUE' : 'PAID',
                rentDueAmount: rentInfo.due,
                paidStr: rentInfo.paid > 0 ? (isToken ? `Token: ₹${rentInfo.paid.toLocaleString()}` : `Paid: ₹${rentInfo.paid.toLocaleString()}`) : '-',
                dueStr: rentInfo.due > 0 ? `${rentInfo.dueType}: ₹${rentInfo.due.toLocaleString()}` : 'No Dues',
                dueDateStr: rentInfo.dueDate ? rentInfo.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
                moveIn: new Date(b.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                moveInIso: new Date(b.moveInDate).toISOString().split('T')[0],
                bookingId: b._id.substring(b._id.length - 8).toUpperCase(),
                leaseDuration: '-',
                monthlyRentNum: `₹${pricing.rent.toLocaleString()}`,
                securityDepositNum: `₹${pricing.deposit.toLocaleString()}`,
                personalInfo: b.personalInfo || {},
                emergencyContact: b.emergencyContact || {},
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
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">#</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Room</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move-in</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t, index) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{index + 1}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{t.name}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{t.email}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{t.phone}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.property}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">{t.propertyType}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{t.room} • {t.bed}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.rent}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide">{t.deposit}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.paidStr}</div>
                    <div className={`text-[11px] font-bold mt-1 tracking-wide flex items-center gap-1 ${t.rentDueAmount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {t.dueStr}
                      {t.rentDueAmount > 0 && t.dueDateStr && (
                         <span className="text-slate-400 font-medium ml-1">(Due {t.dueDateStr})</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-semibold text-slate-700">{t.moveIn}</div>
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
                  <td colSpan="8" className="py-12 text-center">
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

      <TenantDetailsDrawer 
        selectedTenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        getPaymentStyle={(status) => {
          if (status === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          if (status === 'DUE') return 'bg-amber-100 text-amber-700 border-amber-200';
          return 'bg-slate-100 text-slate-500 border-slate-200';
        }}
      />

      <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default OwnerTenants;
