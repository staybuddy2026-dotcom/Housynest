import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const LawyerOverview = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/contracts/lawyer', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setContracts(data);
        } else {
          toast.error('Failed to fetch contracts');
        }
      } catch (error) {
        toast.error('Failed to fetch contracts');
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const totalContracts = contracts.length;
  const pendingContracts = contracts.filter(c => ['DRAFT', 'PENDING_OWNER_REVIEW', 'REVISION_REQUIRED', 'PENDING_TENANT_REVIEW'].includes(c.status)).length;
  const approvedContracts = contracts.filter(c => c.status === 'TENANT_SIGNED' || c.status === 'OWNER_SIGNED').length;
  const rejectedContracts = contracts.filter(c => c.status === 'REJECTED' || c.status === 'REVISION_REQUIRED').length;
  const expiredContracts = contracts.filter(c => c.endDate && new Date(c.endDate) < new Date()).length;
  const statCards = [
    {
      title: 'Total Contracts',
      count: totalContracts,
      subtitle: 'All your contracts',
      icon: 'lucide:file-text',
      color: 'bg-emerald-50 text-emerald-600',
      textColor: 'text-slate-800'
    },
    {
      title: 'Pending Contracts',
      count: pendingContracts,
      subtitle: 'Awaiting review',
      icon: 'lucide:clock',
      color: 'bg-amber-50 text-amber-500',
      textColor: 'text-slate-800'
    },
    {
      title: 'Approved Contracts',
      count: approvedContracts,
      subtitle: 'Successfully approved',
      icon: 'lucide:check-circle-2',
      color: 'bg-brand-teal/10 text-brand-teal',
      textColor: 'text-brand-teal'
    },
    {
      title: 'Rejected Contracts',
      count: rejectedContracts,
      subtitle: 'Need attention',
      icon: 'lucide:x-circle',
      color: 'bg-red-50 text-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'Expired Contracts',
      count: expiredContracts,
      subtitle: 'Last 7 days',
      icon: 'lucide:alert-triangle',
      color: 'bg-orange-50 text-orange-500',
      textColor: 'text-orange-500'
    }
  ];

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#062F26] tracking-tight mb-2 flex items-center gap-2">
          Welcome back, {user.fullName ? user.fullName.split(' ')[0] : 'Lawyer'}! <span className="animate-wave inline-block origin-bottom-right">👋</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">Here's an overview of your contract activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                <Icon icon={stat.icon} className="w-5 h-5" />
              </div>
              <Icon icon="lucide:chevron-right" className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold mb-1 ${stat.textColor}`}>{stat.count}</h3>
              <p className={`text-sm font-bold mb-0.5 ${stat.textColor === 'text-slate-800' ? 'text-slate-700' : stat.textColor}`}>
                {stat.title}
              </p>
              <p className="text-xs text-slate-400 font-medium">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contracts Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Recent Contracts</h2>
            <p className="text-sm text-slate-500">Track and manage all your contract requests.</p>
          </div>
          <Link to="/lawyer/contracts" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-[#EAF5F2] hover:text-brand-teal border border-slate-200 hover:border-brand-teal/30 text-slate-600 text-sm font-bold rounded-lg transition-colors">
            View All Contracts <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Contract ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Owner</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Property</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Created On</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No contracts found.
                  </td>
                </tr>
              ) : (
                contracts.slice(0, 5).map((contract) => {
                  const createdDate = new Date(contract.createdAt);
                  const expiryDate = contract.endDate ? new Date(contract.endDate) : null;
                  return (
                    <tr key={contract._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {/* Contract ID */}
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-slate-800 mb-0.5 truncate w-24" title={contract._id}>{contract._id}</p>
                        <p className="text-xs text-slate-500 truncate w-32" title={contract.title || 'Rental Agreement'}>{contract.title || 'Rental Agreement'}</p>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-brand-teal/10 text-brand-teal`}>
                            {contract.ownerId?.fullName ? contract.ownerId.fullName.charAt(0).toUpperCase() : 'O'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-0.5 truncate max-w-[120px]">{contract.ownerId?.fullName || 'Unknown Owner'}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[120px]">{contract.ownerId?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-3 min-w-[200px]">
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-0.5 truncate max-w-[160px]">{contract.propertyAddress || 'No Address'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${contract.status === 'TENANT_SIGNED' ? 'bg-[#EAF5F2] text-brand-teal' : contract.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'}`}>
                          <Icon icon={contract.status === 'TENANT_SIGNED' ? 'lucide:check-circle-2' : 'lucide:clock'} className="w-3.5 h-3.5" />
                          {contract.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Created On */}
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-800 font-medium mb-0.5">
                          <Icon icon="lucide:calendar" className="w-4 h-4 text-slate-400" />
                          {createdDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <p className="text-xs text-slate-500 ml-6">
                          {createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        {expiryDate ? (
                          <>
                            <div className="flex items-center gap-2 text-sm text-slate-800 font-medium mb-0.5">
                              <Icon icon="lucide:calendar" className="w-4 h-4 text-slate-400" />
                              {expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 font-medium">Not specified</p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <Link to={`/lawyer/contracts/${contract._id}`} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-brand-teal/20 text-brand-teal rounded-lg text-xs font-bold hover:bg-[#EAF5F2] transition-colors whitespace-nowrap">
                            <Icon icon="lucide:eye" className="w-4 h-4" /> View Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Contract Management CTA */}
      <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full text-brand-teal">
              <path d="M20 30 L80 30 L80 80 L20 80 Z" fill="#EAF5F2" />
              <path d="M30 20 L70 20 L70 90 L30 90 Z" fill="#062F26" />
              <rect x="40" y="40" width="20" height="5" fill="#EAF5F2" />
              <rect x="40" y="55" width="20" height="5" fill="#EAF5F2" />
              <circle cx="50" cy="75" r="5" fill="#EAF5F2" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Smart Contract Management</h3>
            <p className="text-sm text-slate-600 mb-1">Create, review, and manage rental contracts securely and efficiently.</p>
            <p className="text-sm text-slate-500">All your legal documents in one place.</p>
          </div>
        </div>
        <button className="bg-[#062F26] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-teal transition-colors shadow-sm whitespace-nowrap self-start md:self-center">
          Create New Contract +
        </button>
      </div>

    </div>
  );
};

export default LawyerOverview;
