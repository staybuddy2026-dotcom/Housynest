import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/list-property/CustomDropdown';


const getStatusBadge = (status) => {
  switch (status) {
    case 'Accepted':
      return <span className="w-fit bg-[#25D366]/20 text-[#062F26] px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold border border-[#25D366]/30 flex items-center gap-1.5 shadow-sm"><Icon icon="lucide:check-circle" className="w-3.5 h-3.5" /> Accepted</span>;
    case 'Pending':
      return <span className="w-fit bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold border border-amber-200 flex items-center gap-1.5 shadow-sm"><Icon icon="lucide:clock" className="w-3.5 h-3.5" /> Pending</span>;
    case 'Rejected':
      return <span className="w-fit bg-red-100 text-red-800 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold border border-red-200 flex items-center gap-1.5 shadow-sm"><Icon icon="lucide:x-circle" className="w-3.5 h-3.5" /> Rejected</span>;
    case 'Rescheduled':
      return <span className="w-fit bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold border border-blue-200 flex items-center gap-1.5 shadow-sm"><Icon icon="lucide:calendar-clock" className="w-3.5 h-3.5" /> Rescheduled</span>;
    case 'Completed':
      return <span className="w-fit bg-purple-100 text-purple-800 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold border border-purple-200 flex items-center gap-1.5 shadow-sm"><Icon icon="lucide:flag" className="w-3.5 h-3.5" /> Completed</span>;
    default:
      return null;
  }
};

const VisitMobileCard = ({ visit, onUpdateStatus }) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [suggestedTime, setSuggestedTime] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (status) => {
    if (status === 'Rescheduled' && !suggestedTime.trim()) {
      toast.error('Please suggest a new time');
      return;
    }
    setIsUpdating(true);
    await onUpdateStatus(visit._id, status, suggestedTime);
    setIsUpdating(false);
    setShowReschedule(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm relative overflow-hidden">
      {visit.status === 'Pending' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm overflow-hidden">
            {visit.tenant?.profilePic ? (
              <img src={visit.tenant.profilePic} alt={visit.name} className="w-full h-full object-cover" />
            ) : (
              <Icon icon="lucide:user" className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 tracking-tight block">{visit.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <a href={`tel:${visit.phone}`} className="text-xs font-semibold text-slate-500 hover:text-brand-teal transition-colors"><Icon icon="lucide:phone" className="w-3 h-3 inline" /></a>
              <a href={`mailto:${visit.tenant?.email}`} className="text-xs font-semibold text-slate-500 hover:text-brand-teal transition-colors"><Icon icon="lucide:mail" className="w-3 h-3 inline" /></a>
            </div>
          </div>
        </div>
        {getStatusBadge(visit.status)}
      </div>

      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Property</span>
        <span className="text-sm font-bold text-[#062F26] leading-tight block truncate">
          {!visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property')}
        </span>
        {visit.message && (
          <div className="mt-2 text-xs text-slate-600 font-medium italic border-l-2 border-brand-teal/30 pl-2.5 leading-relaxed bg-brand-teal/[0.03] p-1.5 rounded-r">
            "{visit.message}"
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 whitespace-nowrap mb-4">
        <span className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-brand-teal/10 flex items-center justify-center text-brand-teal"><Icon icon="lucide:calendar" className="w-3 h-3" /></div> {visit.date}</span>
        <span className="flex items-center gap-2 capitalize"><div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-500"><Icon icon="lucide:clock" className="w-3 h-3" /></div> {visit.time}</span>
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
        {visit.status === 'Pending' && (
          <div className="flex flex-col gap-2 w-full">
            {showReschedule ? (
              <div className="flex flex-col gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 animate-fadeIn">
                <input type="text" placeholder="New Time (e.g. 5 PM)" value={suggestedTime} onChange={(e) => setSuggestedTime(e.target.value)} className="w-full px-2 py-1.5 rounded border border-blue-200 text-xs focus:outline-none focus:border-blue-400 bg-white" />
                <div className="flex gap-1.5">
                  <button onClick={() => handleUpdate('Rescheduled')} disabled={isUpdating} className="bg-blue-600 text-white px-2 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition-all flex-1">Send</button>
                  <button onClick={() => setShowReschedule(false)} className="bg-white text-slate-600 px-2 py-1.5 rounded text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all flex-1">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleUpdate('Accepted')} disabled={isUpdating} className="flex-1 bg-[#25D366] text-[#062F26] hover:bg-[#20bd5a] py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                  <Icon icon="lucide:check" className="w-3.5 h-3.5" /> Accept
                </button>
                <button onClick={() => setShowReschedule(true)} disabled={isUpdating} className="flex-1 bg-slate-50 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border border-blue-200 shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                  <Icon icon="lucide:calendar-clock" className="w-3.5 h-3.5" /> Reschedule
                </button>
                <button onClick={() => handleUpdate('Rejected')} disabled={isUpdating} className="flex-1 bg-slate-50 text-red-600 hover:bg-red-50 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border border-red-200 shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                  <Icon icon="lucide:x" className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
          </div>
        )}
        {visit.status === 'Accepted' && (
          <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="w-full bg-gradient-to-r from-[#062F26] to-[#0A4739] text-white hover:opacity-90 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm flex justify-center items-center gap-1.5">
            <Icon icon="lucide:flag" className="w-3.5 h-3.5" /> Mark Completed
          </button>
        )}
      </div>
    </div>
  );
};

const VisitTableRow = ({ visit, onUpdateStatus }) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [suggestedTime, setSuggestedTime] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (status) => {
    if (status === 'Rescheduled' && !suggestedTime.trim()) {
      toast.error('Please suggest a new time');
      return;
    }

    setIsUpdating(true);
    await onUpdateStatus(visit._id, status, suggestedTime);
    setIsUpdating(false);
    setShowReschedule(false);
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group relative border-b border-slate-100 last:border-0">

      {/* Tenant Info */}
      <td className="px-6 py-4 align-middle relative">
        {visit.status === 'Pending' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r"></div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm overflow-hidden">
            {visit.tenant?.profilePic ? (
              <img src={visit.tenant.profilePic} alt={visit.name} className="w-full h-full object-cover" />
            ) : (
              <Icon icon="lucide:user" className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <span className="text-sm font-bold text-slate-800 tracking-tight truncate">{visit.name}</span>
        </div>
      </td>

      {/* Contact Details */}
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col gap-1.5">
          <a href={`tel:${visit.phone}`} className="text-xs font-semibold text-slate-500 hover:text-brand-teal transition-colors flex items-center gap-2 truncate">
            <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500"><Icon icon="lucide:phone" className="w-3 h-3" /></div> {visit.phone}
          </a>
          <a href={`mailto:${visit.tenant?.email}`} className="text-xs font-semibold text-slate-500 hover:text-brand-teal transition-colors flex items-center gap-2 truncate">
            <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500"><Icon icon="lucide:mail" className="w-3 h-3" /></div> {visit.tenant?.email || 'No email provided'}
          </a>
        </div>
      </td>

      {/* Property & Message */}
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col gap-1.5 max-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#062F26] leading-tight group-hover:text-brand-teal transition-colors">
              {!visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property')}
            </span>
            {visit.property?.propertyType && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${visit.property.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : visit.property.propertyType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                {visit.property.propertyType}
              </span>
            )}
          </div>
          {visit.message && (
            <div className="text-xs text-slate-600 font-medium italic border-l-2 border-brand-teal/30 pl-2.5 leading-relaxed bg-brand-teal/[0.03] p-1.5 rounded-r">
              "{visit.message}"
            </div>
          )}
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
          <span className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-brand-teal/10 flex items-center justify-center text-brand-teal"><Icon icon="lucide:calendar" className="w-3 h-3" /></div> {visit.date}</span>
          <span className="flex items-center gap-2 capitalize"><div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-500"><Icon icon="lucide:clock" className="w-3 h-3" /></div> {visit.time}</span>
        </div>
      </td>

      {/* Status & Actions */}
      <td className="px-6 py-4 align-middle text-right">
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(visit.status)}

          {visit.status === 'Pending' && (
            <div className="flex flex-col xl:flex-row justify-end items-center gap-2 w-full mt-1">
              {showReschedule ? (
                <div className="flex flex-col gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 min-w-[180px] animate-fadeIn">
                  <input type="text" placeholder="New Time (e.g. 5 PM)" value={suggestedTime} onChange={(e) => setSuggestedTime(e.target.value)} className="w-full px-2 py-1 rounded border border-blue-200 text-xs focus:outline-none focus:border-blue-400 bg-white" />
                  <div className="flex gap-1.5">
                    <button onClick={() => handleUpdate('Rescheduled')} disabled={isUpdating} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-700 transition-all flex-1">Send</button>
                    <button onClick={() => setShowReschedule(false)} className="bg-white text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 hover:bg-slate-50 transition-all flex-1">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => handleUpdate('Accepted')} disabled={isUpdating} className="w-full xl:w-auto bg-[#25D366] text-[#062F26] hover:bg-[#20bd5a] px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                    <Icon icon="lucide:check" className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button onClick={() => setShowReschedule(true)} disabled={isUpdating} className="w-full xl:w-auto bg-slate-50 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border border-blue-200 shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                    <Icon icon="lucide:calendar-clock" className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button onClick={() => handleUpdate('Rejected')} disabled={isUpdating} className="w-full xl:w-auto bg-slate-50 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border border-red-200 shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                    <Icon icon="lucide:x" className="w-3.5 h-3.5" /> Reject
                  </button>
                </>
              )}
            </div>
          )}
          {visit.status === 'Accepted' && (
            <div className="w-full flex justify-end mt-1">
              <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="w-full xl:w-auto bg-gradient-to-r from-[#062F26] to-[#0A4739] text-white hover:opacity-90 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm flex justify-center items-center gap-1.5">
                <Icon icon="lucide:flag" className="w-3.5 h-3.5" /> Mark Completed
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const OwnerVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');

  const fetchVisits = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/visits/owner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVisits(data);
      }
    } catch {
      toast.error('Failed to load visit requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (visitId, status, suggestedTime) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/visits/${visitId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, suggestedTime })
      });

      if (res.ok) {
        toast.success(`Visit ${status.toLowerCase()} successfully`);
        fetchVisits(); // Refresh list
      } else {
        toast.error('Failed to update visit status');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <Icon icon="lucide:loader-2" className="w-10 h-10 animate-spin text-brand-teal" />
        <span className="text-sm font-bold text-slate-500 animate-pulse">Loading Visits...</span>
      </div>
    );
  }

  const pendingCount = visits.filter(v => v.status === 'Pending').length;

  const uniqueProperties = [...new Set(visits.map(v => {
    if (!v.property) return 'Deleted Property';
    return v.property.pgName || (v.property.bhkType ? `${v.property.bhkType} ${v.property.propertyCategory}` : v.property.propertyCategory) || 'Unknown Property';
  }))].filter(Boolean);

  const filteredVisits = visits.filter(visit => {
    const propName = !visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property');

    // Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (visit.name && visit.name.toLowerCase().includes(searchLower)) ||
      (visit.phone && visit.phone.toLowerCase().includes(searchLower)) ||
      (visit.tenant?.email && visit.tenant.email.toLowerCase().includes(searchLower));

    // Property Filter
    const matchesProperty = !filterProperty || propName === filterProperty;

    // Date Filter
    const matchesDate = !filterDate || visit.date === filterDate;

    // Time Filter
    const matchesTime = !filterTime || (visit.time && visit.time.toLowerCase() === filterTime.toLowerCase());

    return matchesSearch && matchesProperty && matchesDate && matchesTime;
  });

  return (
    <div className="animate-fadeIn mx-auto pb-12">
      <div className="bg-gradient-to-r from-[#062F26] to-[#0A4739] rounded-xl px-6 py-5 mb-4 text-white shadow-xl relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-[#25D366]/10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Icon icon="lucide:calendar-days" className="w-8 h-8 text-[#25D366]" />
              Visit Requests
            </h1>
            <p className="text-[#EAF5F2]/80 text-[15px] font-medium max-w-xl leading-relaxed">
              Manage physical property visits requested by prospective tenants. Accept, reject, or suggest alternative times seamlessly.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-6 shrink-0">
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] uppercase font-bold text-[#EAF5F2]/70 tracking-widest mb-1.5">Pending Action</span>
              <span className="text-3xl font-black text-[#25D366] leading-none">{pendingCount}</span>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] uppercase font-bold text-[#EAF5F2]/70 tracking-widest mb-1.5">Total Visits</span>
              <span className="text-3xl font-black text-white leading-none">{visits.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
          />
        </div>

        {/* Property Filter */}
        <div className="w-full lg:w-48 relative shrink-0">
          <CustomDropdown
            icon="lucide:building-2"
            placeholder="All Properties"
            value={filterProperty || "All Properties"}
            options={["All Properties", ...uniqueProperties]}
            onChange={(val) => setFilterProperty(val === "All Properties" ? "" : val)}
            containerClassName="w-full"
            buttonClassName="py-2.5 !border-slate-200 hover:!border-slate-300 bg-slate-50 text-slate-700 font-semibold"
          />
        </div>

        {/* Date Filter */}
        <div className="w-full lg:w-40 relative shrink-0">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-teal transition-all text-center"
          />
        </div>

        {/* Time Filter */}
        <div className="w-full lg:w-40 relative shrink-0">
          <CustomDropdown
            icon="lucide:clock"
            placeholder="All Times"
            value={filterTime ? filterTime.charAt(0).toUpperCase() + filterTime.slice(1) : "All Times"}
            options={["All Times", "Morning", "Afternoon", "Evening"]}
            onChange={(val) => setFilterTime(val === "All Times" ? "" : val.toLowerCase())}
            containerClassName="w-full"
            buttonClassName="py-2.5 !border-slate-200 hover:!border-slate-300 bg-slate-50 text-slate-700 font-semibold"
          />
        </div>

        {/* Clear Filters */}
        {(searchQuery || filterProperty || filterDate || filterTime) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterProperty('');
              setFilterDate('');
              setFilterTime('');
            }}
            className="shrink-0 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Clear all filters"
          >
            <Icon icon="lucide:filter-x" className="w-5 h-5" />
          </button>
        )}
      </div>

      {filteredVisits.length > 0 ? (
        <div className="bg-white rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden relative">

          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredVisits.map(visit => (
              <VisitMobileCard key={visit._id} visit={visit} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-white sticky top-0 z-20">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-[18%]">Tenant</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-[20%]">Contact Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-[25%]">Property & Message</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-[17%]">Schedule</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right w-[20%]">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map(visit => (
                  <VisitTableRow key={visit._id} visit={visit} onUpdateStatus={handleUpdateStatus} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-[#EAF5F2] rounded-full flex items-center justify-center mb-6 shadow-inner border border-brand-teal/20">
            <Icon icon="lucide:calendar-x" className="w-12 h-12 text-brand-teal" />
          </div>
          <h3 className="text-2xl font-bold text-[#062F26] mb-3">No Visit Requests Yet</h3>
          <p className="text-[15px] font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
            When tenants request to physically inspect your listed properties, those requests will beautifully appear right here.
          </p>
        </div>
      )}
    </div>
  );
};

export default OwnerVisits;
