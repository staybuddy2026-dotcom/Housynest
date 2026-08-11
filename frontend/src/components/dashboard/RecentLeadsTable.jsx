import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const avatarColors = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700'
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'New':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    case 'In Discussion':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm hover:bg-amber-100 transition-colors">
          <Icon icon="lucide:message-circle" className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    case 'Contacted':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm hover:bg-blue-100 transition-colors">
          <Icon icon="lucide:phone-call" className="w-3 h-3 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    case 'Closed':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
          <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider">{status || 'NEW'}</span>
        </div>
      );
  }
};

const RecentLeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/leads/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Take top 3 most recent leads
          const recent = data.slice(0, 3).map((inq, idx) => {
            const date = new Date(inq.createdAt);
            const name = inq.senderId?.fullName || 'Unknown User';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return {
              id: inq._id,
              name,
              property: inq.propertyId?.societyName || inq.propertyId?.pgName || inq.propertyId?.propertyCategory || 'Property',
              propertyType: inq.propertyId?.propertyType,
              date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              status: inq.status || 'New',
              initials,
              initials,
              color: avatarColors[idx % avatarColors.length]
            };
          });
          setLeads(recent);
        }
      } catch (error) {
        console.error("Failed to fetch recent leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#062F26]">Recent Leads</h3>
        <Link to="/owner/leads" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
          View All Leads <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-5 text-xs font-bold text-slate-500">Name</th>
              <th className="py-3 px-5 text-xs font-bold text-slate-500">Property</th>
              <th className="py-3 px-5 text-xs font-bold text-slate-500">Inquired On</th>
              <th className="py-3 px-5 text-xs font-bold text-slate-500">Status</th>
              <th className="py-3 px-5 text-xs font-bold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center">
                  <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-brand-teal mx-auto" />
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400 text-sm font-medium">
                  No recent leads found
                </td>
              </tr>
            ) : (
              leads.map((inq) => (
                <tr key={inq.id} className="border-b border-slate-50 hover:bg-[#F8F9FA] transition-colors group">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${inq.color}`}>
                        {inq.initials}
                      </div>
                      <span className="text-sm font-bold text-[#062F26]">{inq.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[150px]">{inq.property}</span>
                      {inq.propertyType && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${inq.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : inq.propertyType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {inq.propertyType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-slate-600 font-medium">
                    {inq.date}
                  </td>
                  <td className="py-3 px-5">
                    {getStatusBadge(inq.status)}
                  </td>
                  <td className="py-3 px-5">
                    <button
                      onClick={() => navigate('/owner/leads')}
                      className="text-xs font-bold text-brand-teal border border-brand-teal/30 hover:bg-brand-teal hover:text-white px-4 py-1.5 rounded-lg transition-colors bg-white"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentLeadsTable;
