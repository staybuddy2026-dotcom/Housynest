import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';
import AddTenantModal from '../../components/dashboard/AddTenantModal';
import TenantDetailsDrawer from '../../components/dashboard/TenantDetailsDrawer';
import CustomDropdown from '../../components/list-property/CustomDropdown';

const OwnerTenants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getPaymentBadge = (status) => {
    if (status === 'PAID') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-colors">
          <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">PAID</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm hover:bg-amber-100 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    }
  };

  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [bookingsRes, invoicesRes] = await Promise.all([
          fetch('/api/bookings/owner', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/invoices/owner', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (bookingsRes.ok && invoicesRes.ok) {
          const bookings = await bookingsRes.json();
          const invoices = await invoicesRes.json();
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
                  const bookingInvoices = invoices.filter(i =>
                    i.bookingId === b._id || (i.bookingId && i.bookingId._id === b._id)
                  );
                  const unpaidInvoice = bookingInvoices.find(i => i.status === 'Pending' || i.status === 'Overdue');

                  if (unpaidInvoice) {
                    return { due: unpaidInvoice.amount, paid: 0, dueType: unpaidInvoice.status === 'Overdue' ? 'Overdue' : 'Rent Due', dueDate: new Date(unpaidInvoice.dueDate) };
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
                property: b.propertyId?.pgName || b.propertyId?.societyName || b.propertyId?.propertyCategory || 'Property',
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
    { title: tenants.length.toString(), subtitle: 'Total Tenants', desc: 'Active & Notice', icon: 'lucide:users', color: 'text-brand-teal', bgColor: 'bg-brand-teal/10', borderColor: 'border-brand-teal/20', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: tenants.filter(t => t.payment === 'DUE').length.toString(), subtitle: 'Unpaid Tenants', desc: 'Requires Action', icon: 'lucide:clock', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: `₹${tenants.reduce((acc, curr) => acc + (curr.rentDueAmount || 0), 0).toLocaleString()}`, subtitle: 'Revenue Due', desc: 'This Month', icon: 'lucide:indian-rupee', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: '0', subtitle: 'Upcoming Move-outs', desc: 'Next 30 Days', icon: 'lucide:calendar-clock', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-100', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
  ];

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === 'All' || t.payment === paymentFilter.toUpperCase();
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full relative pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="relative overflow-hidden bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className="text-2xl font-bold text-[#062F26]">{stat.title}</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${stat.bgColor} ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={stat.icon} className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-base font-bold text-slate-600 group-hover:text-[#062F26] transition-colors">{stat.subtitle}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium group-hover:text-slate-500 transition-colors">{stat.desc}</p>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/30">
          {/* Search */}
          <div className="relative w-full xl:w-96 group shrink-0">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, tenant id, room or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3 w-full xl:w-auto">
            <div className="w-full sm:w-[180px] shrink-0">
              <CustomDropdown
                value={
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Payment:</span>
                    <span className="text-[#062F26]">{paymentFilter}</span>
                  </span>
                }
                options={[
                  { label: 'All', value: 'All' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'Due', value: 'Due' }
                ]}
                onChange={setPaymentFilter}
                buttonClassName="shadow-sm border-slate-200 w-full"
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white">
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
                    <div className="mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${t.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : t.propertyType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {t.propertyType}
                      </span>
                    </div>
                    {t.propertyType === 'PG' && <div className="text-[11px] font-medium text-slate-400 mt-1">{t.room} • {t.bed}</div>}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.rent}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide">{t.deposit}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    {getPaymentBadge(t.payment)}
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
        getPaymentBadge={getPaymentBadge}
      />

      <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default OwnerTenants;
