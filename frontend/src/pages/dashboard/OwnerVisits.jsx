import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const VisitRequestCard = ({ visit, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <span className="bg-[#25D366]/20 text-[#062F26] px-3 py-1 rounded-full text-xs font-bold border border-[#25D366]/30 flex items-center gap-1"><Icon icon="lucide:check-circle" className="w-3.5 h-3.5" /> Accepted</span>;
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1"><Icon icon="lucide:clock" className="w-3.5 h-3.5" /> Pending</span>;
      case 'Rejected':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1"><Icon icon="lucide:x-circle" className="w-3.5 h-3.5" /> Rejected</span>;
      case 'Rescheduled':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1"><Icon icon="lucide:calendar-clock" className="w-3.5 h-3.5" /> Rescheduled</span>;
      case 'Completed':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1"><Icon icon="lucide:flag" className="w-3.5 h-3.5" /> Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mb-6 group relative">
      {/* Decorative top accent for pending requests */}
      {visit.status === 'Pending' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-400 to-amber-500"></div>
      )}

      <div
        className="px-6 py-4 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 border border-slate-200 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
            {visit.tenant?.profilePic ? (
              <img src={visit.tenant.profilePic} alt={visit.name} className="w-full h-full object-cover" />
            ) : (
              <Icon icon="lucide:user" className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#062F26]">{visit.name}</h3>
                {getStatusBadge(visit.status)}
              </div>

              <div className="h-4 w-px bg-slate-300 hidden md:block"></div>

              <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Property:</span>
                <strong className="text-[#062F26]">
                  {visit.property?.pgName || (visit.property?.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property?.propertyCategory) || 'Unknown Property'}
                </strong>
              </p>

              <div className="h-4 w-px bg-slate-300 hidden md:block"></div>

              <div className="flex flex-wrap items-center text-sm text-slate-600 font-medium gap-2">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                  <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-brand-teal" />
                  {visit.date}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm capitalize">
                  <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-amber-500" />
                  {visit.time}
                </span>
              </div>
            </div>
          </div>
        </div>

        {visit.status === 'Pending' && (
          <div className="flex items-center gap-3 mt-4 lg:mt-0 lg:ml-auto shrink-0 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); handleUpdate('Accepted'); }}
              disabled={isUpdating}
              className="bg-[#25D366] text-[#062F26] hover:bg-[#20bd5a] px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Icon icon="lucide:check" className="w-4 h-4" /> Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReschedule(!showReschedule); }}
              disabled={isUpdating}
              className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200 shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Icon icon="lucide:calendar-clock" className="w-4 h-4" /> Reschedule
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpdate('Rejected'); }}
              disabled={isUpdating}
              className="bg-white text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-red-200 shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Icon icon="lucide:x" className="w-4 h-4" /> Reject
            </button>
          </div>
        )}

        {visit.status === 'Accepted' && (
          <div className="flex items-center gap-3 mt-4 lg:mt-0 lg:ml-auto shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleUpdate('Completed'); }}
              disabled={isUpdating}
              className="bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Icon icon="lucide:flag" className="w-4 h-4" /> Mark Completed
            </button>
          </div>
        )}

        {/* Expand/Collapse Chevron */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-500 shadow-sm group-hover:bg-slate-100 group-hover:text-[#062F26] transition-all ml-auto lg:ml-2 mt-4 lg:mt-0 shrink-0 ${!visit.status.match(/Pending|Accepted/) && 'lg:ml-auto'}`}>
          <Icon
            icon="lucide:chevron-down"
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {showReschedule && visit.status === 'Pending' && (
        <div className="px-6 pb-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <label className="block text-sm font-bold text-blue-900 mb-3 items-center gap-2">
              <Icon icon="lucide:calendar-plus" className="w-5 h-5 text-blue-600" /> Suggest New Date/Time
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. Tomorrow at 5 PM"
                value={suggestedTime}
                onChange={(e) => setSuggestedTime(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white shadow-inner"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate('Rescheduled')}
                  disabled={isUpdating}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md flex-1 sm:flex-none"
                >
                  Send
                </button>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="bg-white text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-all shadow-sm flex-1 sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap gap-8 mb-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5"><Icon icon="lucide:phone" className="w-3 h-3" /> Tenant Phone</span>
                <a href={`tel:${visit.phone}`} className="text-sm font-bold text-[#062F26] hover:text-brand-teal transition-colors">
                  {visit.phone}
                </a>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5"><Icon icon="lucide:mail" className="w-3 h-3" /> Tenant Email</span>
                <a href={`mailto:${visit.tenant?.email}`} className="text-sm font-bold text-[#062F26] hover:text-brand-teal transition-colors">
                  {visit.tenant?.email || 'Not provided'}
                </a>
              </div>
            </div>

            {visit.message && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon icon="lucide:message-square" className="w-3.5 h-3.5" /> Message from Tenant
                </h4>
                <p className="text-sm text-slate-700 font-medium leading-relaxed italic border-l-4 border-brand-teal/30 pl-4">{visit.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="animate-fadeIn max-w-7xl 3xl:max-w-[1600px] mx-auto pb-12">
      <div className="bg-linear-to-r from-[#062F26] to-[#0A4739] rounded-xl px-6 py-4 mb-4 text-white shadow-xl relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-[#25D366]/10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Icon icon="lucide:calendar-days" className="w-8 h-8 text-[#25D366]" />
              Visit Requests
            </h1>
            <p className="text-[#EAF5F2]/80 text-base max-w-xl leading-relaxed">
              Manage physical property visits requested by prospective tenants. Accept, reject, or suggest alternative times.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-5 shrink-0">
            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold text-[#EAF5F2]/70 tracking-wider mb-1">Pending Action</span>
              <span className="text-3xl font-bold text-[#25D366]">{pendingCount}</span>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold text-[#EAF5F2]/70 tracking-wider mb-1">Total Visits</span>
              <span className="text-xl font-bold text-white">{visits.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {visits.map(visit => (
          <VisitRequestCard
            key={visit._id}
            visit={visit}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}

        {visits.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <div className="w-20 h-20 bg-[#EAF5F2] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Icon icon="lucide:calendar-x" className="w-10 h-10 text-brand-teal" />
            </div>
            <h3 className="text-xl font-bold text-[#062F26] mb-2">No Visit Requests Yet</h3>
            <p className="text-base text-slate-500 max-w-md mx-auto">
              When tenants request to physically inspect your listed properties, those requests will appear right here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerVisits;
