import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const avatarColors = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700'
];

const getStatusColor = (status) => {
  switch (status) {
    case 'New': return 'text-brand-teal bg-[#EAF5F2]';
    case 'In Discussion': return 'text-orange-500 bg-orange-50';
    case 'Contacted': return 'text-blue-500 bg-blue-50';
    case 'Closed': return 'text-slate-500 bg-slate-100';
    default: return 'text-slate-500 bg-slate-100';
  }
};

const RecentInquiriesTable = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/inquiries/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Take top 3 most recent inquiries
          const recent = data.slice(0, 3).map((inq, idx) => {
            const date = new Date(inq.createdAt);
            const name = inq.senderId?.fullName || 'Unknown User';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return {
              id: inq._id,
              name,
              property: inq.propertyId?.pgName || inq.propertyId?.propertyCategory || 'Property',
              date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              status: inq.status || 'New',
              initials,
              color: avatarColors[idx % avatarColors.length],
              statusColor: getStatusColor(inq.status || 'New')
            };
          });
          setInquiries(recent);
        }
      } catch (error) {
        console.error("Failed to fetch recent inquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#062F26]">Recent Inquiries</h3>
        <Link to="/owner/inquiries" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
          View All Inquiries <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
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
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400 text-sm font-medium">
                  No recent inquiries found
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => (
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
                    {inq.property}
                  </td>
                  <td className="py-3 px-5 text-sm text-slate-600 font-medium">
                    {inq.date}
                  </td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${inq.statusColor}`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <button
                      onClick={() => navigate('/owner/inquiries')}
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

export default RecentInquiriesTable;
