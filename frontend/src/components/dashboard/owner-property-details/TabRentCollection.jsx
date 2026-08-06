import React from 'react';
import { Icon } from '@iconify/react';

const TabRentCollection = ({ bookings, property, setSelectedTenant }) => {
  const rentItems = [];
  const today = new Date();

  const activeBookings = bookings.filter(b => ['Active', 'Confirmed', 'Completed', 'Reserved'].includes(b.status));

  let totalExpected = 0;
  let totalCollected = 0;
  let totalOverdue = 0;
  let totalPending = 0;

  activeBookings.forEach(booking => {
    let rentAmount = 14500;
    if (property.propertyType === 'PG') {
      if (property.pgPricing && booking.roomDetails && booking.roomDetails.sharingType) {
        const baseType = booking.roomDetails.sharingType.includes('Single') ? 'Single' : booking.roomDetails.sharingType.includes('Double') ? 'Double' : booking.roomDetails.sharingType.includes('Triple') ? 'Triple' : booking.roomDetails.sharingType.includes('Four') ? 'Four' : 'Other';
        const typeStr = `${baseType}_${property.isAC ? 'AC' : 'NonAC'}`;
        if (property.pgPricing[typeStr]?.rentPerBed) {
          rentAmount = Number(property.pgPricing[typeStr].rentPerBed.replace(/\D/g, ''));
        }
      }
    } else if (property.monthlyRent) {
      rentAmount = Number(property.monthlyRent.replace(/\D/g, ''));
    }

    const todayDate = new Date();
    const moveInDate = booking.moveInDate ? new Date(booking.moveInDate) : new Date(booking.createdAt);
    let nextDueDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), moveInDate.getDate());

    if (nextDueDate < todayDate) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    const diffMs = nextDueDate - todayDate;
    const daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    let status = 'Paid';
    if (daysDue <= 7 && daysDue > 0) {
      status = 'Due';
    } else if (nextDueDate < todayDate) {
      status = 'Overdue';
    }

    totalExpected += rentAmount;
    if (status === 'Paid') totalCollected += rentAmount;
    else if (status === 'Overdue') totalOverdue += rentAmount;
    else totalPending += rentAmount;

    const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const name = booking.tenantId ? booking.tenantId.fullName : (booking.personalInfo?.firstName + ' ' + booking.personalInfo?.lastName);

    rentItems.push({
      id: booking._id,
      name: name,
      initials: name.charAt(0).toUpperCase(),
      rentAmount: rentAmount,
      dueDate: formatDate(nextDueDate),
      rawDate: nextDueDate,
      daysDue: (status === 'Overdue' || status === 'Due') ? daysDue : 0,
      status: status,
      room: booking.roomDetails?.roomName ? `${booking.roomDetails.roomName} | ${booking.roomDetails.bedName}` : 'Full Property',
    });
  });

  rentItems.sort((a, b) => a.rawDate - b.rawDate);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Due': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  const formatNum = (n) => {
     if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`;
     if (n >= 1000) return `₹${(n/1000).toFixed(1)}k`;
     return `₹${n}`;
  };

  return (
    <div className="flex flex-col animate-fadeIn">
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm relative overflow-hidden group hover:border-brand-teal/30 transition-colors">
           <Icon icon="lucide:indian-rupee" className="absolute right-4 top-4 w-5 h-5 text-slate-200 group-hover:text-slate-300 transition-colors" />
           <div className="text-xl font-bold text-slate-800">{formatNum(totalExpected)}</div>
           <div className="text-xs font-medium text-slate-500 mt-1">Expected</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
           <Icon icon="lucide:trending-up" className="absolute right-4 top-4 w-5 h-5 text-emerald-200 group-hover:text-emerald-300 transition-colors" />
           <div className="text-xl font-bold text-emerald-600">{formatNum(totalCollected)}</div>
           <div className="text-xs font-medium text-slate-500 mt-1">Collected</div>
        </div>
        <div className="bg-white rounded-xl border border-rose-100 p-4 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-colors">
           <Icon icon="lucide:alert-circle" className="absolute right-4 top-4 w-5 h-5 text-rose-200 group-hover:text-rose-300 transition-colors" />
           <div className="text-xl font-bold text-rose-600">{formatNum(totalOverdue)}</div>
           <div className="text-xs font-medium text-slate-500 mt-1">Overdue</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
           <Icon icon="lucide:clock" className="absolute right-4 top-4 w-5 h-5 text-amber-200 group-hover:text-amber-300 transition-colors" />
           <div className="text-xl font-bold text-amber-500">{formatNum(totalPending)}</div>
           <div className="text-xs font-medium text-slate-500 mt-1">Pending</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search tenants by name or phone number..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            Sort <Icon icon="lucide:chevron-down" className="w-4 h-4" />
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Icon icon="lucide:filter" className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      {rentItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
          <Icon icon="lucide:construction" className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-[#062F26] mb-2">Rent Collection Data Not Found</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            The rent collection information for this property is not available or is currently under development.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Contact</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Due Date</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">History</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentItems.map(item => (
                <tr key={item.id} className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer" onClick={() => setSelectedTenant({ ...item, name: item.name })}>
                  <td className="py-4 px-5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                        {item.initials}
                      </div>
                      <div>
                        <p className="font-bold text-[#062F26] text-sm group-hover:text-brand-teal transition-colors">{item.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.room}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="w-7 h-7 rounded bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/5 transition-all"><Icon icon="lucide:phone" className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 rounded bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/5 transition-all"><Icon icon="lucide:mail" className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className="font-bold text-[#062F26] text-sm">₹{item.rentAmount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <p className="text-sm font-bold text-slate-700">{item.dueDate}</p>
                    {item.daysDue > 0 && <p className={`text-[11px] font-bold mt-0.5 tracking-wide ${item.status === 'Overdue' ? 'text-rose-500' : 'text-amber-500'}`}>{item.daysDue} days {item.status === 'Overdue' ? 'late' : 'remaining'}</p>}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle text-center">
                    <button onClick={(e) => e.stopPropagation()} className="w-7 h-7 mx-auto rounded text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 flex items-center justify-center transition-colors"><Icon icon="lucide:history" className="w-4 h-4" /></button>
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      {item.status !== 'Paid' && (
                        <button className="px-3 py-1.5 rounded-lg bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 border border-emerald-200 text-xs font-bold transition-all shadow-sm">
                          Mark as Paid
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-brand-teal transition-colors p-1"><Icon icon="lucide:more-vertical" className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabRentCollection;
