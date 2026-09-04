import React from 'react';
import { Icon } from '@iconify/react';

const TabTenants = ({ bookings, invoices, property, tenantSearchQuery, setSelectedTenant }) => {
  const activeBookings = bookings.filter(b => ['Active', 'Confirmed', 'Moved Out', 'Reserved'].includes(b.status));

  const tenants = activeBookings.map((b) => {
    const name = b.tenantId?.fullName || (b.personalInfo?.firstName ? b.personalInfo.firstName + ' ' + (b.personalInfo.lastName || '') : 'Unknown');
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const rentInfo = (() => {
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
        const stampFees = 800;
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
      id: b._id.substring(b._id.length - 4).toUpperCase(),
      name: name,
      initials: initials,
      email: b.tenantId?.email || b.personalInfo?.email || 'N/A',
      phone: b.tenantId?.phone || b.personalInfo?.mobileNumber || 'N/A',
      room: b.roomDetails?.roomName || (property.propertyType === 'Tenant' ? 'Full Property' : 'N/A'),
      roomNumber: b.roomDetails?.roomName || 'N/A',
      bedNumber: b.roomDetails?.bedName ? b.roomDetails.bedName.replace(/\D/g, '') : '',
      bed: b.roomDetails?.bedName || (property.propertyType === 'Tenant' ? '-' : 'N/A'),
      rent: `₹${pricing.rent.toLocaleString()}`,
      deposit: `Deposit: ₹${pricing.deposit.toLocaleString()}`,
      payment: rentInfo.due > 0 ? 'DUE' : 'PAID',
      rentDueAmount: rentInfo.due,
      paidStr: rentInfo.paid > 0 ? (isToken ? `Token: ₹${rentInfo.paid.toLocaleString()}` : `Paid: ₹${rentInfo.paid.toLocaleString()}`) : '-',
      dueStr: rentInfo.due > 0 ? `${rentInfo.dueType}: ₹${rentInfo.due.toLocaleString()}` : 'No Dues',
      dueDateStr: rentInfo.dueDate ? rentInfo.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
      moveIn: b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
      moveInIso: b.moveInDate ? new Date(b.moveInDate).toISOString().split('T')[0] : '',
      bookingId: b._id.substring(b._id.length - 8).toUpperCase(),
      leaseDuration: b.leaseDuration || '-',
      monthlyRentNum: `₹${pricing.rent.toLocaleString()}`,
      securityDepositNum: `₹${pricing.deposit.toLocaleString()}`,
      personalInfo: b.personalInfo,
      emergencyContact: b.emergencyContact,
      propertyName: property.pgName || property.societyName || b.propertyId?.pgName || b.propertyId?.societyName || 'Unknown Property',
      propertyType: property.propertyType || b.propertyId?.propertyType || 'PG',
      paymentDetails: b.paymentDetails,
      status: b.status,
      rawBooking: b,
    };
  });

  const getPaymentStyle = (status) => {
    if (status === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'DUE') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'OVERDUE') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
    t.room.toLowerCase().includes(tenantSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden animate-fadeIn">

      <div className="flex-1 bg-white relative">
        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">#</th>
              <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
              <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Room / Bed</th>
              <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent</th>
              <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move-in</th>
              <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
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
                  <div className="font-bold text-slate-800 text-sm">{t.room}</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-1">{t.bed}</div>
                </td>
                <td className="py-4 px-5 align-middle">
                  <div className="font-bold text-slate-800 text-sm">{t.rent}</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide">{t.deposit}</div>
                </td>
                <td className="py-4 px-5 align-middle">
                  <div className="text-sm font-semibold text-slate-700">{t.moveIn}</div>
                </td>
                <td className="py-4 px-5 align-middle">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPaymentStyle(t.payment)}`}>
                      {t.payment}
                    </span>
                    {t.paidStr.startsWith('Token') && (
                      <div className="text-[11px] font-bold text-brand-teal mt-0.5">{t.paidStr}</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-5 align-middle text-right">
                  <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                    {t.payment === 'DUE' && (
                      <button className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md transition-colors uppercase tracking-wide">
                        Remind Now
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedTenant(t); }}
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

      {/* Mobile View (Cards) */}
      <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/50">
        {filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12">
            <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No tenants found.</p>
          </div>
        ) : (
          filteredTenants.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTenant(t)}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#062F26] text-sm line-clamp-1">{t.name}</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{t.room} • {t.bed}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getPaymentStyle(t.payment)}`}>
                  {t.payment}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rent</p>
                  <p className="text-sm font-bold text-slate-700">{t.rent}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Move In</p>
                  <p className="text-sm font-bold text-slate-700">{t.moveIn}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment Info</p>
                    <p className="text-sm font-bold text-slate-700">{t.paidStr}</p>
                  </div>
                  {t.payment === 'DUE' && (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Status</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); }}
                        className="text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors uppercase tracking-wide"
                      >
                        Remind Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
};

export default TabTenants;
