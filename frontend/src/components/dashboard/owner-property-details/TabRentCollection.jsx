import React, { useState, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { Icon } from '@iconify/react';

const CustomDropdown = ({ icon, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[140px] flex-1 sm:flex-none" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-10 pr-4 py-2 bg-white border ${isOpen ? 'border-brand-teal ring-4 ring-brand-teal/10' : 'border-slate-200'} rounded-xl text-sm font-semibold text-slate-700 focus:outline-none transition-all shadow-sm h-[42px]`}
      >
        <Icon icon={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <span className="truncate mr-2">{value === 'All' ? placeholder : value}</span>
        <Icon icon="lucide:chevron-down" className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 min-w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
          <ReactLenis options={{ duration: 1.2, smoothWheel: true }} className="max-h-[240px] overflow-y-auto custom-scrollbar flex flex-col py-1.5">
            <button
              onClick={() => { onChange('All'); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${value === 'All' ? 'bg-brand-teal/5 text-brand-teal font-bold' : 'text-slate-600 font-medium hover:bg-slate-50'}`}
            >
              <span className="truncate">{placeholder}</span>
              {value === 'All' && <Icon icon="lucide:check" className="w-4 h-4 shrink-0 ml-3" />}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${value === opt ? 'bg-brand-teal/5 text-brand-teal font-bold' : 'text-slate-600 font-medium hover:bg-slate-50'}`}
              >
                <span className="truncate">{opt}</span>
                {value === opt && <Icon icon="lucide:check" className="w-4 h-4 shrink-0 ml-3" />}
              </button>
            ))}
          </ReactLenis>
        </div>
      )}
    </div>
  );
};

const TabRentCollection = ({ bookings, invoices, property, setSelectedTenant }) => {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTenantHistory, setSelectedTenantHistory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleViewHistory = (bookingId, tenantData) => {
    const tenantInvoices = (invoices || []).filter(inv => inv.bookingId === bookingId || (inv.bookingId && inv.bookingId._id === bookingId));
    tenantInvoices.sort((a, b) => new Date(b.billingPeriodStart) - new Date(a.billingPeriodStart));

    setSelectedTenantHistory({
      tenant: tenantData,
      invoices: tenantInvoices
    });
    setHistoryModalOpen(true);
  };
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

    const bookingInvoices = (invoices || []).filter(i =>
      i.bookingId === booking._id || (i.bookingId && i.bookingId._id === booking._id)
    );
    const unpaidInvoice = bookingInvoices.find(i => i.status === 'Pending' || i.status === 'Overdue');
    const latestPaid = bookingInvoices.filter(i => i.status === 'Paid').sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))[0];

    let status = 'Paid';
    let nextDueDate = null;
    let daysDue = 0;

    if (unpaidInvoice) {
      status = unpaidInvoice.status === 'Overdue' ? 'Overdue' : 'Due';
      rentAmount = unpaidInvoice.amount;
      nextDueDate = new Date(unpaidInvoice.dueDate);
      const diffMs = nextDueDate - new Date();
      daysDue = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    } else if (latestPaid) {
      status = 'Paid';
      nextDueDate = new Date(latestPaid.paidAt || latestPaid.dueDate);
    } else {
      const moveInDate = booking.moveInDate ? new Date(booking.moveInDate) : new Date(booking.createdAt);
      nextDueDate = new Date(new Date().getFullYear(), new Date().getMonth(), moveInDate.getDate());
      if (nextDueDate < new Date()) nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    let cycleStart = unpaidInvoice ? unpaidInvoice.billingPeriodStart : (latestPaid ? latestPaid.billingPeriodStart : booking.moveInDate);
    let cycleEnd = unpaidInvoice ? unpaidInvoice.billingPeriodEnd : (latestPaid ? latestPaid.billingPeriodEnd : new Date(new Date(booking.moveInDate).setMonth(new Date(booking.moveInDate).getMonth() + 1)));

    totalExpected += rentAmount;
    if (status === 'Paid') totalCollected += rentAmount;
    else if (status === 'Overdue') totalOverdue += rentAmount;
    else totalPending += rentAmount;

    const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const name = booking.tenantId ? booking.tenantId.fullName : (booking.personalInfo?.firstName + ' ' + booking.personalInfo?.lastName);
    const phone = booking.tenantId?.phone || booking.personalInfo?.mobileNumber || '';
    const whatsapp = (booking.tenantId?.whatsappNumber || booking.personalInfo?.whatsappNumber || phone || '').replace(/[^0-9]/g, '');
    const email = booking.tenantId?.email || booking.personalInfo?.email || '';

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
      phone,
      whatsapp,
      email,
      cycleStart,
      cycleEnd
    });
  });

  rentItems.sort((a, b) => a.rawDate - b.rawDate);

  const filteredItems = rentItems.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.name?.toLowerCase().includes(searchLower) ||
      item.phone?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

    let matchesMonth = true;
    if (filterMonth !== 'All') {
      const cycleStartString = item.cycleStart ? new Date(item.cycleStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';
      const cycleEndString = item.cycleEnd ? new Date(item.cycleEnd).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';
      matchesMonth = (cycleStartString === filterMonth) || (cycleEndString === filterMonth);
    }

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const uniqueMonths = Array.from(new Set([
    ...rentItems.map(i => i.cycleStart ? new Date(i.cycleStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''),
    ...rentItems.map(i => i.cycleEnd ? new Date(i.cycleEnd).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '')
  ])).filter(x => x).sort((a, b) => new Date(b) - new Date(a));

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Due': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  const formatNum = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
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
        <div className="relative flex-1 w-full max-w-md group">
          <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
          <input
            type="text"
            placeholder="Search by name, phone number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm h-[42px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Month Filter */}
          <CustomDropdown
            icon="lucide:calendar"
            value={filterMonth}
            options={uniqueMonths}
            onChange={setFilterMonth}
            placeholder="All Months"
          />

          {/* Status Filter */}
          <CustomDropdown
            icon="lucide:activity"
            value={filterStatus}
            options={['Paid', 'Due', 'Overdue']}
            onChange={setFilterStatus}
            placeholder="All Statuses"
          />
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
          <Icon icon="lucide:search" className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No tenants found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl md:border border-slate-100 md:shadow-sm overflow-hidden relative">

          {/* Mobile View (Cards) */}
          <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/50">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm" onClick={() => setSelectedTenant({ ...item, name: item.name })}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">{item.initials}</div>
                    <div>
                      <h3 className="font-bold text-[#062F26] text-sm">{item.name}</h3>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.room}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rent Amount</p>
                    <p className="text-sm font-bold text-slate-700">₹{item.rentAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rent Cycle</p>
                    <p className="text-[11px] sm:text-sm font-bold text-slate-700 leading-tight break-words">{item.cycleStart ? new Date(item.cycleStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'} - {item.cycleEnd ? new Date(item.cycleEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.status === 'Paid' ? 'Paid On' : 'Due Date'}</p>
                    <p className="text-sm font-bold text-slate-700">{item.dueDate}</p>
                    {item.daysDue > 0 && <p className={`text-[10px] font-bold mt-0.5 ${item.status === 'Overdue' ? 'text-rose-500' : 'text-amber-500'}`}>{item.daysDue} days {item.status === 'Overdue' ? 'late' : 'left'}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <a href={`tel:${item.phone}`} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:phone" className="w-4 h-4" /></a>
                    <a href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:message-circle" className="w-4 h-4" /></a>
                    <a href={`mailto:${item.email}`} className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:mail" className="w-4 h-4" /></a>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {item.status !== 'Paid' && (
                      <button className="px-3 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all border border-emerald-100 shadow-sm">
                        Mark Paid
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleViewHistory(item.id, item); }} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors border border-slate-100 shadow-sm"><Icon icon="lucide:history" className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar w-full">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Contact</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent Cycle</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Due / Paid On</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">History</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer" onClick={() => setSelectedTenant({ ...item, name: item.name })}>
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                          {item.initials}
                        </div>
                        <div>
                          <p className="font-bold text-[#062F26] text-sm group-hover:text-brand-teal transition-colors">{item.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wide">{item.phone}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.room}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <a href={`tel:${item.phone}`} className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Call">
                          <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="WhatsApp">
                          <Icon icon="lucide:message-circle" className="w-3.5 h-3.5" />
                        </a>
                        <a href={`mailto:${item.email}`} className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title={item.email || 'Email'}>
                          <Icon icon="lucide:mail" className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="text-[12px] font-semibold text-slate-600 flex items-center whitespace-nowrap">
                        <span className="truncate">{item.cycleStart ? new Date(item.cycleStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
                        <span className="mx-1 text-slate-400 shrink-0">-</span>
                        <span className="truncate">{item.cycleEnd ? new Date(item.cycleEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
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
                      <button onClick={(e) => { e.stopPropagation(); handleViewHistory(item.id, item); }} className="w-7 h-7 mx-auto rounded text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 flex items-center justify-center transition-colors"><Icon icon="lucide:history" className="w-4 h-4" /></button>
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
        </div>
      )}

      {/* History Modal */}
      {historyModalOpen && selectedTenantHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm">
                  {selectedTenantHistory.tenant?.initials || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Payment History</h3>
                  <p className="text-xs font-medium text-slate-500">
                    {selectedTenantHistory.tenant?.name} • {selectedTenantHistory.tenant?.room}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
              {selectedTenantHistory.invoices.length > 0 ? (
                <div className="space-y-4">
                  {selectedTenantHistory.invoices.map((inv, idx) => (
                    <div key={inv._id || idx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-800">
                            {inv.billingPeriodStart ? new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'} - {inv.billingPeriodEnd ? new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                          Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          {inv.paidAt && ` • Paid: ${new Date(inv.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                      <div className="text-left sm:text-right mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <div className="text-base font-bold text-slate-800">
                          ₹ {inv.amount?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {inv.paymentMethod || (inv.status === 'Paid' ? 'Online' : 'Not paid')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon icon="lucide:receipt" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No payment history found for this tenant.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabRentCollection;
