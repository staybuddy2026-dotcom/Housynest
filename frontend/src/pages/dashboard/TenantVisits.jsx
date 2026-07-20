import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const VisitCard = ({ visit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status-based styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Accepted':
        return {
          border: 'border-l-brand-teal',
          badge: 'bg-[#EAF5F2] text-[#062F26]',
          icon: 'lucide:check-circle-2',
        };
      case 'Pending':
        return {
          border: 'border-l-amber-500',
          badge: 'bg-amber-50 text-amber-700',
          icon: 'lucide:clock',
        };
      case 'Rejected':
        return {
          border: 'border-l-red-500',
          badge: 'bg-red-50 text-red-700',
          icon: 'lucide:x-circle',
        };
      case 'Rescheduled':
        return {
          border: 'border-l-blue-500',
          badge: 'bg-blue-50 text-blue-700',
          icon: 'lucide:calendar-clock',
        };
      case 'Completed':
        return {
          border: 'border-l-purple-500',
          badge: 'bg-purple-50 text-purple-700',
          icon: 'lucide:flag',
        };
      default:
        return {
          border: 'border-l-slate-400',
          badge: 'bg-slate-100 text-slate-700',
          icon: 'lucide:circle',
        };
    }
  };

  const styles = getStatusStyles(visit.status);
  const propertyImage = visit.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
  const propertyName = visit.property?.pgName || (visit.property?.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property?.propertyCategory) || 'Unknown Property';
  const location = visit.property?.locality ? `${visit.property.locality}, ${visit.property.city}` : (visit.property?.city || 'Location unavailable');

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${styles.border} shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] transition-all duration-300 overflow-hidden mb-5 group`}>
      <div
        className="px-3 py-2 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
          {/* Property Image */}
          <div className="relative w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
            <img src={propertyImage} alt={propertyName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent"></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles.badge} flex items-center gap-1.5 w-fit shadow-sm`}>
                <Icon icon={styles.icon} className="w-3.5 h-3.5" />
                {visit.status}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-[#062F26] leading-tight mb-1.5 group-hover:text-brand-teal transition-colors">
              {propertyName}
            </h3>

            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Icon icon="lucide:map-pin" className="w-4 h-4 text-slate-400" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Date & Time Badge */}
        <div className="flex items-center gap-4 w-full md:w-auto md:shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
          <div className="flex items-center gap-4 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200">
            <div className="flex flex-col items-end border-r border-slate-200 pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</span>
              <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-slate-400" />
                {visit.date}
              </span>
            </div>
            <div className="flex flex-col items-start pl-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time</span>
              <span className="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-slate-400" />
                {visit.time}
              </span>
            </div>
          </div>

          <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 border ${isExpanded ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white border-slate-200 text-slate-400 group-hover:border-brand-teal group-hover:bg-brand-teal/5 group-hover:text-brand-teal'}`}>
            <Icon
              icon="lucide:chevron-down"
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0">
            <div className="border-t border-slate-100 pt-5 mt-2 flex flex-col lg:flex-row gap-6">

              {/* Contact Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <Icon icon="lucide:user" className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Property Owner</p>
                    <p className="text-[15px] font-bold text-[#062F26]">{visit.owner?.fullName || 'Unknown Owner'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href={`tel:${visit.owner?.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-sm transition-all text-sm font-bold border border-emerald-100/50">
                    <Icon icon="lucide:phone" className="w-4 h-4" />
                    {visit.owner?.phone || 'N/A'}
                  </a>
                  <a href={`mailto:${visit.owner?.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm transition-all text-sm font-bold border border-blue-100/50">
                    <Icon icon="lucide:mail" className="w-4 h-4" />
                    Email Owner
                  </a>
                </div>
              </div>

              {/* Message Details */}
              <div className="flex-1 flex flex-col gap-3">
                {visit.status === 'Rescheduled' && visit.suggestedTime && (
                  <div className="bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Icon icon="lucide:info" className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-0.5">Owner Suggested Time</p>
                      <p className="text-sm font-bold text-[#062F26]">{visit.suggestedTime}</p>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 shadow-inner shadow-slate-100/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Icon icon="lucide:message-square" className="w-3.5 h-3.5" />
                    Your Message
                  </h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-slate-300 pl-3 py-0.5">{visit.message || 'No message provided.'}</p>
                </div>
              </div>

            </div>

            {visit.status === 'Completed' && (
              <div className="flex justify-end mt-6 border-t border-slate-100 pt-5">
                <button className="flex items-center justify-center gap-2 bg-[#062F26] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#05261e] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                  <Icon icon="lucide:home" className="w-4 h-4" />
                  Proceed to Book Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TenantVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/visits/tenant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setVisits(data);
        }
      } catch {
        toast.error('Failed to load visits');
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-340 3xl:max-w-420 mx-auto pb-10">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#062F26] tracking-tight">My Property Visits</h1>
        <span className="bg-slate-100 text-slate-600 font-bold text-sm px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
          {visits.length} visits
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {visits.map(visit => (
          <VisitCard key={visit._id} visit={visit} />
        ))}

        {visits.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Icon icon="lucide:calendar-x" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Visits Yet</h3>
            <p className="text-sm text-slate-500">You haven't scheduled any property visits yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantVisits;
