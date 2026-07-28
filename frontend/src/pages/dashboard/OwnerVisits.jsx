import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

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

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group relative border-b border-slate-100 last:border-0">
      
      {/* Tenant Info */}
      <td className="px-6 py-6 align-top relative">
        {visit.status === 'Pending' && (
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r"></div>
        )}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm overflow-hidden">
            {visit.tenant?.profilePic ? (
              <img src={visit.tenant.profilePic} alt={visit.name} className="w-full h-full object-cover" />
            ) : (
              <Icon icon="lucide:user" className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <span className="text-base font-extrabold text-slate-800 tracking-tight truncate">{visit.name}</span>
        </div>
      </td>
      
      {/* Contact Details */}
      <td className="px-6 py-6 align-top">
        <div className="flex flex-col gap-2.5 pt-1">
          <a href={`tel:${visit.phone}`} className="text-sm font-semibold text-slate-500 hover:text-brand-teal transition-colors flex items-center gap-2.5 truncate">
             <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Icon icon="lucide:phone" className="w-3.5 h-3.5" /></div> {visit.phone}
          </a>
          <a href={`mailto:${visit.tenant?.email}`} className="text-sm font-semibold text-slate-500 hover:text-brand-teal transition-colors flex items-center gap-2.5 truncate">
             <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Icon icon="lucide:mail" className="w-3.5 h-3.5" /></div> {visit.tenant?.email || 'No email provided'}
          </a>
        </div>
      </td>
      
      {/* Property & Message */}
      <td className="px-6 py-6 align-top">
        <div className="flex flex-col gap-2.5 max-w-[280px]">
          <span className="text-base font-bold text-[#062F26] leading-tight pt-1">
            {!visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property')}
          </span>
          {visit.message && (
             <div className="text-sm text-slate-600 font-medium italic border-l-4 border-brand-teal/30 pl-3 leading-relaxed bg-brand-teal/[0.03] p-2.5 rounded-r-lg">
                "{visit.message}"
             </div>
          )}
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-6 align-top">
        <div className="flex flex-col gap-2.5 text-sm font-semibold text-slate-700 whitespace-nowrap pt-1">
           <span className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal"><Icon icon="lucide:calendar" className="w-4 h-4" /></div> {visit.date}</span>
           <span className="flex items-center gap-2 capitalize"><div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><Icon icon="lucide:clock" className="w-4 h-4" /></div> {visit.time}</span>
        </div>
      </td>

      {/* Status & Actions */}
      <td className="px-6 py-6 align-top text-right">
        <div className="flex flex-col items-end gap-3 pt-1">
           {getStatusBadge(visit.status)}
           
           {visit.status === 'Pending' && (
              <div className="flex flex-col xl:flex-row justify-end items-end gap-2 w-full mt-1">
                 {showReschedule ? (
                    <div className="flex flex-col gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100 min-w-[200px] animate-fadeIn">
                       <input type="text" placeholder="New Time (e.g. 5 PM)" value={suggestedTime} onChange={(e) => setSuggestedTime(e.target.value)} className="w-full px-2.5 py-1.5 rounded-md border border-blue-200 text-xs focus:outline-none focus:border-blue-400 bg-white" />
                       <div className="flex gap-2">
                         <button onClick={() => handleUpdate('Rescheduled')} disabled={isUpdating} className="bg-blue-600 text-white px-3 py-1.5 rounded text-[11px] font-bold hover:bg-blue-700 transition-all flex-1">Send</button>
                         <button onClick={() => setShowReschedule(false)} className="bg-white text-slate-600 px-3 py-1.5 rounded text-[11px] font-bold border border-slate-200 hover:bg-slate-50 transition-all flex-1">Cancel</button>
                       </div>
                    </div>
                 ) : (
                    <>
                      <button onClick={() => handleUpdate('Accepted')} disabled={isUpdating} className="w-full xl:w-auto bg-[#25D366] text-[#062F26] hover:bg-[#20bd5a] px-3.5 py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                        <Icon icon="lucide:check" className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => setShowReschedule(true)} disabled={isUpdating} className="w-full xl:w-auto bg-slate-50 text-blue-600 hover:bg-blue-50 px-3.5 py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all border border-blue-200 shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                        <Icon icon="lucide:calendar-clock" className="w-4 h-4" /> Reschedule
                      </button>
                      <button onClick={() => handleUpdate('Rejected')} disabled={isUpdating} className="w-full xl:w-auto bg-slate-50 text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all border border-red-200 shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5">
                        <Icon icon="lucide:x" className="w-4 h-4" /> Reject
                      </button>
                    </>
                 )}
              </div>
           )}
           {visit.status === 'Accepted' && (
              <div className="w-full flex justify-end mt-1">
                 <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="w-full xl:w-auto bg-gradient-to-r from-[#062F26] to-[#0A4739] text-white hover:opacity-90 px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all shadow-md flex justify-center items-center gap-1.5">
                    <Icon icon="lucide:flag" className="w-4 h-4" /> Mark Completed
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

  return (
    <div className="animate-fadeIn max-w-7xl 3xl:max-w-[1600px] mx-auto pb-12">
      <div className="bg-gradient-to-r from-[#062F26] to-[#0A4739] rounded-xl px-6 py-5 mb-8 text-white shadow-xl relative overflow-hidden">
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

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-6 shrink-0">
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

      {visits.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                 <tr className="bg-[#F8FAFC] border-b border-slate-200">
                   <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-slate-500 w-[18%]">Tenant</th>
                   <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-slate-500 w-[20%]">Contact Details</th>
                   <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-slate-500 w-[25%]">Property & Message</th>
                   <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-slate-500 w-[17%]">Schedule</th>
                   <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-slate-500 text-right w-[20%]">Status & Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {visits.map(visit => (
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
