import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/list-property/CustomDropdown';
import { useNavigate } from 'react-router-dom';

const TenantVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');

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

  // Status-based styling for badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return { bg: 'bg-[#EAF5F2]', text: 'text-[#062F26]', border: 'border-[#062F26]/20', icon: 'lucide:check-circle-2' };
      case 'Pending':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'lucide:clock' };
      case 'Rejected':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'lucide:x-circle' };
      case 'Rescheduled':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'lucide:calendar-clock' };
      case 'Completed':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'lucide:flag' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: 'lucide:circle' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-[#0AA87D]" />
      </div>
    );
  }

  const uniqueProperties = [...new Set(visits.map(v => {
    if (!v.property) return 'Deleted Property';
    return v.property.pgName || (v.property.bhkType ? `${v.property.bhkType} ${v.property.propertyCategory}` : v.property.propertyCategory) || 'Unknown Property';
  }))].filter(Boolean);

  const filteredVisits = visits.filter(visit => {
    const propName = !visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property');

    // Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (visit.owner?.fullName && visit.owner.fullName.toLowerCase().includes(searchLower)) ||
      (visit.owner?.phone && visit.owner.phone.toLowerCase().includes(searchLower)) ||
      (visit.owner?.email && visit.owner.email.toLowerCase().includes(searchLower));

    // Property Filter
    const matchesProperty = !filterProperty || propName === filterProperty;

    // Date Filter
    const matchesDate = !filterDate || visit.date === filterDate;

    // Time Filter
    const matchesTime = !filterTime || (visit.time && visit.time.toLowerCase() === filterTime.toLowerCase());

    return matchesSearch && matchesProperty && matchesDate && matchesTime;
  });

  return (
    <div className="animate-fadeIn mx-auto pb-10 space-y-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26]">My Property Visits</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage your scheduled property viewings</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700">
          <Icon icon="lucide:calendar-days" className="w-4 h-4 text-[#0AA87D]" />
          Total Visits: <span className="text-[#062F26]">{visits.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by owner name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0AA87D] focus:ring-1 focus:ring-[#0AA87D] transition-all"
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
            buttonClassName="py-2 !border-slate-200 hover:!border-slate-300 bg-slate-50 text-slate-700 font-semibold"
          />
        </div>

        {/* Date Filter */}
        <div className="w-full lg:w-40 relative shrink-0">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0AA87D] transition-all text-center"
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
            buttonClassName="py-2 !border-slate-200 hover:!border-slate-300 bg-slate-50 text-slate-700 font-semibold"
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
            className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Clear all filters"
          >
            <Icon icon="lucide:filter-x" className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Visits Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">

        {visits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Icon icon="lucide:calendar-x" className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Visits Scheduled</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You haven't scheduled any property visits yet. Once you do, they will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 z-20">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100">Property Details</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100">Schedule</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100">Owner Name</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100">Contact</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisits.map((visit) => {
                    const propertyImage = visit.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
                    const propertyName = !visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property');
                    const location = visit.property?.locality ? `${visit.property.locality}, ${visit.property.city}` : (visit.property?.city || 'Location unavailable');
                    const statusStyles = getStatusBadge(visit.status);
                    const isMessageExpanded = expandedMessageId === visit._id;

                    return (
                      <React.Fragment key={visit._id}>
                        <tr className="hover:bg-slate-50/50 transition-colors group">

                          {/* Property Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                <img src={propertyImage} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-[#062F26] mb-0.5">{propertyName}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                  <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
                                  {location}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Schedule Date & Time */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 whitespace-nowrap">
                                <Icon icon="lucide:calendar" className="w-4 h-4 text-slate-400" />
                                {visit.date}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 whitespace-nowrap capitalize">
                                <Icon icon="lucide:clock" className="w-4 h-4 text-slate-400" />
                                {visit.time}
                              </div>
                            </div>
                          </td>

                          {/* Owner Name */}
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-700">{visit.owner?.fullName || 'Unknown Owner'}</span>
                          </td>

                          {/* Owner Contact */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <a href={`tel:${visit.owner?.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-[#0AA87D] transition-colors group" title="Call Owner">
                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#0AA87D]">
                                  <Icon icon="lucide:phone" className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-semibold">{visit.owner?.phone || 'N/A'}</span>
                              </a>
                              <a href={`mailto:${visit.owner?.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-500 transition-colors group" title="Email Owner">
                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-blue-500">
                                  <Icon icon="lucide:mail" className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-semibold truncate max-w-[150px]">{visit.owner?.email || 'N/A'}</span>
                              </a>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                              <Icon icon={statusStyles.icon} className="w-3.5 h-3.5" />
                              {visit.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {(visit.message || visit.suggestedTime) && (
                                <button
                                  onClick={() => setExpandedMessageId(isMessageExpanded ? null : visit._id)}
                                  className={`p-2 rounded-xl border transition-colors flex items-center justify-center gap-2 text-xs font-bold ${isMessageExpanded
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#062F26]'
                                    }`}
                                  title="View Details"
                                >
                                  <Icon icon="lucide:message-square-text" className="w-4 h-4" />
                                  {isMessageExpanded ? 'Hide' : 'Details'}
                                </button>
                              )}

                              {visit.status === 'Completed' && (
                                <button 
                                  onClick={() => navigate(`/properties/${visit.property?._id || visit.property}?book=true`)}
                                  className="px-4 py-2 bg-[#062F26] text-white rounded-xl font-bold text-xs hover:bg-[#08483B] transition-colors shadow-xs flex items-center gap-1.5"
                                >
                                  Book Now
                                  <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Message / Reschedule Row */}
                        <tr>
                          <td colSpan="6" className={`p-0 ${isMessageExpanded ? 'border-b border-slate-100' : 'border-b-0'}`}>
                            <div
                              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isMessageExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                            >
                              <div className="overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50/50">
                                  <div className="flex flex-col sm:flex-row gap-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">

                                    {/* Tenant Message */}
                                    <div className="flex-1">
                                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Icon icon="lucide:message-circle" className="w-3.5 h-3.5" />
                                        Your Message to Owner
                                      </h4>
                                      <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3 leading-relaxed">
                                        {visit.message || 'No message provided.'}
                                      </p>
                                    </div>

                                    {/* Owner Suggested Time (If Rescheduled) */}
                                    {visit.status === 'Rescheduled' && visit.suggestedTime && (
                                      <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                          <Icon icon="lucide:clock-4" className="w-3.5 h-3.5" />
                                          Owner Suggested Time
                                        </h4>
                                        <p className="text-sm font-bold text-blue-900">
                                          {visit.suggestedTime}
                                        </p>
                                      </div>
                                    )}

                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden flex flex-col divide-y divide-slate-100">
              {filteredVisits.map((visit) => {
                const propertyImage = visit.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
                const propertyName = !visit.property ? 'Deleted Property' : (visit.property.pgName || (visit.property.bhkType ? `${visit.property.bhkType} ${visit.property.propertyCategory}` : visit.property.propertyCategory) || 'Unknown Property');
                const location = visit.property?.locality ? `${visit.property.locality}, ${visit.property.city}` : (visit.property?.city || 'Location unavailable');
                const statusStyles = getStatusBadge(visit.status);
                const isMessageExpanded = expandedMessageId === visit._id;

                return (
                  <div key={visit._id} className="p-4 flex flex-col gap-4 hover:bg-slate-50 transition-colors">
                    {/* Header: Property & Status */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={propertyImage} alt="Property" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#062F26] mb-0.5 line-clamp-1">{propertyName}</h3>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                            <Icon icon="lucide:map-pin" className="w-3 h-3 text-slate-400" />
                            {location}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                        <Icon icon={statusStyles.icon} className="w-3 h-3" />
                        {visit.status}
                      </span>
                    </div>

                    {/* Middle: Schedule & Owner */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Schedule</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-slate-400" />
                          {visit.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 capitalize mt-0.5">
                          <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-slate-400" />
                          {visit.time}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Owner Contact</span>
                        <span className="text-xs font-bold text-slate-700 block line-clamp-1 mb-1">{visit.owner?.fullName || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${visit.owner?.phone}`} className="text-[#0AA87D] bg-[#EAF5F2] p-1.5 rounded-md hover:bg-[#0AA87D] hover:text-white transition-colors" title="Call">
                            <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                          </a>
                          <a href={`mailto:${visit.owner?.email}`} className="text-blue-600 bg-blue-50 p-1.5 rounded-md hover:bg-blue-600 hover:text-white transition-colors" title="Email">
                            <Icon icon="lucide:mail" className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-1">
                      {(visit.message || visit.suggestedTime) ? (
                        <button
                          onClick={() => setExpandedMessageId(isMessageExpanded ? null : visit._id)}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${isMessageExpanded ? 'text-[#062F26]' : 'text-slate-500 hover:text-[#0AA87D]'}`}
                        >
                          <Icon icon="lucide:message-square-text" className="w-4 h-4" />
                          {isMessageExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      ) : <div></div>}

                      {visit.status === 'Completed' && (
                        <button 
                          onClick={() => navigate(`/properties/${visit.property?._id || visit.property}?book=true`)}
                          className="px-3 py-1.5 bg-[#062F26] text-white rounded-lg font-bold text-[11px] hover:bg-[#08483B] transition-colors shadow-xs flex items-center gap-1"
                        >
                          Book Now
                          <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isMessageExpanded && (
                      <div className="mt-2 flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        {visit.message && (
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Icon icon="lucide:message-circle" className="w-3 h-3" />
                              Your Message
                            </h4>
                            <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2 leading-relaxed">
                              {visit.message}
                            </p>
                          </div>
                        )}
                        {visit.status === 'Rescheduled' && visit.suggestedTime && (
                          <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Icon icon="lucide:clock-4" className="w-3 h-3" />
                              Owner Suggested Time
                            </h4>
                            <p className="text-xs font-bold text-blue-900">
                              {visit.suggestedTime}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantVisits;
