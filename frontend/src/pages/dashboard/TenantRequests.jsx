import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const RequestCard = ({ request }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status-based styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'New':
        return {
          border: 'border-l-emerald-500',
          badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
          icon: 'lucide:sparkles'
        };
      case 'Contacted':
        return {
          border: 'border-l-blue-500',
          badge: 'bg-blue-50 text-blue-600 border border-blue-100',
          icon: 'lucide:phone-call'
        };
      case 'In Discussion':
        return {
          border: 'border-l-orange-500',
          badge: 'bg-orange-50 text-orange-600 border border-orange-100',
          icon: 'lucide:message-circle'
        };
      case 'Closed':
        return {
          border: 'border-l-slate-400',
          badge: 'bg-slate-50 text-slate-500 border border-slate-200',
          icon: 'lucide:archive'
        };
      default:
        return {
          border: 'border-l-slate-400',
          badge: 'bg-slate-100 text-slate-700',
          icon: 'lucide:circle'
        };
    }
  };

  const styles = getStatusStyles(request.status);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${styles.border} shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] transition-all duration-300 overflow-hidden mb-5 group`}>
      <div
        className="px-4 py-3 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
          {/* Property Image */}
          <div className="relative w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
            <img src={request.propertyImage} alt={request.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent"></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles.badge} flex items-center gap-1.5 w-fit shadow-sm`}>
                <Icon icon={styles.icon} className="w-3.5 h-3.5" />
                {request.status}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-[#062F26] leading-tight mb-1.5 group-hover:text-brand-teal transition-colors">
              {request.title}
            </h3>

            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Icon icon="lucide:map-pin" className="w-4 h-4 text-slate-400" />
              <span className="truncate">{request.location}</span>
            </div>
          </div>
        </div>

        {/* Date Badge */}
        <div className="flex items-center gap-4 w-full md:w-auto md:shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
          <div className="flex items-center gap-4 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sent On:</span>
              <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-slate-400" />
                {request.date}
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

      {/* Expanded Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0">
            <div className="border-t border-slate-100 pt-5 mt-2 flex flex-col lg:flex-row gap-6">

              {/* Left Column: Owner info & tags */}
              <div className="flex-1 space-y-5">
                {request.owner && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Owner Contact</h4>
                    <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Icon icon="lucide:user" className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#062F26]">{request.owner.fullName || 'Owner'}</p>
                          <p className="text-xs font-medium text-slate-500">{request.owner.phone || 'Phone unavailable'}</p>
                        </div>
                      </div>
                      {request.owner.phone && (
                        <a href={`tel:${request.owner.phone}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white transition-colors">
                          <Icon icon="lucide:phone" className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Request Details</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { label: 'Room', value: request.roomType, icon: 'lucide:home' },
                      { label: 'Move-in', value: request.moveIn, icon: 'lucide:calendar-clock' },
                      { label: 'Subject', value: request.subject, icon: 'lucide:tag' },
                      { label: 'Budget', value: request.budget, icon: 'lucide:wallet' },
                      { label: 'Occupants', value: request.occupants, icon: 'lucide:users' },
                      { label: 'Gender', value: request.gender, icon: 'lucide:user' },
                    ].map((tag, idx) => (
                      <div key={idx} className="bg-slate-50 px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 border border-slate-100 shadow-sm min-w-25">
                        <span className="text-slate-400 font-bold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                          <Icon icon={tag.icon} className="w-3 h-3" />
                          {tag.label}
                        </span>
                        <span className="text-[#062F26] font-bold">{tag.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Message */}
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 shadow-inner shadow-slate-100/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Icon icon="lucide:message-square" className="w-3.5 h-3.5" />
                    Your Message
                  </h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-slate-300 pl-3 py-0.5 whitespace-pre-wrap">{request.message}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TenantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/inquiries/tenant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedRequests = data.map(inq => ({
            id: inq._id,
            title: inq.propertyId?.pgName || (inq.propertyId?.bhkType ? `${inq.propertyId.bhkType} ${inq.propertyId.propertyCategory}` : inq.propertyId?.propertyCategory) || 'Unknown Property',
            status: inq.status,
            date: new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            roomType: inq.propertyId?.propertyType || 'N/A',
            moveIn: inq.moveInDate ? new Date(inq.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            budget: inq.propertyId?.monthlyRent ? `₹${inq.propertyId.monthlyRent}` : (inq.propertyId?.rooms?.[0]?.rentPerBed ? `₹${inq.propertyId.rooms[0].rentPerBed}` : 'N/A'),
            subject: inq.subject || 'N/A',
            occupants: inq.occupants || 'N/A',
            gender: inq.gender || 'Any',
            message: inq.message,
            propertyImage: inq.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
            location: inq.propertyId?.locality ? `${inq.propertyId.locality}, ${inq.propertyId.city}` : (inq.propertyId?.city || 'Location unavailable'),
            owner: inq.ownerId
          }));
          setRequests(mappedRequests);
        } else {
          toast.error('Failed to fetch requests');
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        toast.error('Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="animate-fadeIn max-w-340 3xl:max-w-420 mx-auto pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#062F26] tracking-tight">My Requests</h1>
        <span className="bg-slate-100 text-slate-600 font-bold text-sm px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
          {requests.length} requests
        </span>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm font-medium">
            <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin mx-auto text-brand-teal mb-2" />
            Loading your requests...
          </div>
        ) : requests.length > 0 ? (
          requests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Icon icon="lucide:message-circle-x" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Requests Yet</h3>
            <p className="text-sm text-slate-500">You haven't sent any inquiries or booking requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantRequests;
