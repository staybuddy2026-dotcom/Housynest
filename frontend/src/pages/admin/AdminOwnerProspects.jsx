import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Converted':
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
          <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-emerald-500" />
          Converted
        </span>
      );
    case 'Contacted':
    case 'In Discussion':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
          <Icon icon="lucide:phone-call" className="w-3.5 h-3.5 text-blue-500" />
          Contacted
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
          <Icon icon="lucide:x-circle" className="w-3.5 h-3.5 text-rose-500" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          New Lead
        </span>
      );
  }
};

const AdminOwnerProspects = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/owner-prospects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProspects(data);
      } else {
        toast.error('Failed to load owner prospects');
      }
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/owner-prospects/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Prospect status updated to ${status}`);
        setProspects(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Server error while updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const name = p.name || p.fullName || '';
      const email = p.email || '';
      const phone = p.phone || '';
      const city = p.city || p.locality || '';
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        phone.includes(searchLower) ||
        city.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter || (statusFilter === 'New' && (!p.status || p.status === 'New'));

      return matchesSearch && matchesStatus;
    });
  }, [prospects, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = prospects.length;
    const newLeads = prospects.filter(p => !p.status || p.status === 'New' || p.status === 'Pending').length;
    const contacted = prospects.filter(p => p.status === 'Contacted' || p.status === 'In Discussion').length;
    const converted = prospects.filter(p => p.status === 'Converted' || p.status === 'Active').length;
    return { total, newLeads, contacted, converted };
  }, [prospects]);

  return (
    <div className="space-y-6 max-w-350 mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26]">Owner Prospects</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage prospective landlords & property partners interested in joining Housynest.
          </p>
        </div>
        <button
          onClick={fetchProspects}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-[#062F26] hover:text-white rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Icon icon="lucide:users" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prospects</p>
            <h3 className="text-2xl font-extrabold text-[#062F26] mt-0.5">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Icon icon="lucide:user-plus" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Leads</p>
            <h3 className="text-2xl font-extrabold text-[#062F26] mt-0.5">{stats.newLeads}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon icon="lucide:phone-call" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Discussion</p>
            <h3 className="text-2xl font-extrabold text-[#062F26] mt-0.5">{stats.contacted}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Icon icon="lucide:check-circle-2" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Onboarded</p>
            <h3 className="text-2xl font-extrabold text-[#062F26] mt-0.5">{stats.converted}</h3>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            {['All', 'New', 'Contacted', 'Converted', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#062F26] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contact Details</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">City / Property Details</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Submitted Date</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Update Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Loading prospects...</p>
                  </td>
                </tr>
              ) : filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400 font-medium text-xs">
                    No owner prospects found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProspects.map((p) => {
                  const isUpdating = updatingId === p._id;
                  const name = p.name || p.fullName || 'Landlord Lead';
                  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#062F26] flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#062F26] block leading-tight">{name}</span>
                            <span className="text-xs text-slate-400 font-medium block mt-0.5">{p.propertyType || 'Property Owner'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <a href={`tel:${p.phone}`} className="text-xs font-semibold text-slate-700 hover:text-brand-teal transition-colors flex items-center gap-1.5">
                            <Icon icon="lucide:phone" className="w-3.5 h-3.5 text-slate-400" />
                            {p.phone || 'N/A'}
                          </a>
                          <a href={`mailto:${p.email}`} className="text-xs font-medium text-slate-500 hover:text-brand-teal transition-colors flex items-center gap-1.5">
                            <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-slate-400" />
                            {p.email || 'N/A'}
                          </a>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-700 block">{p.city || p.locality || 'Location N/A'}</span>
                        {p.notes && <span className="text-xs text-slate-400 italic block mt-0.5 line-clamp-1">"{p.notes}"</span>}
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-800 block">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(p.status)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(p._id, 'Contacted')}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            title="Mark as Contacted"
                          >
                            Contacted
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(p._id, 'Converted')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            title="Mark as Converted/Onboarded"
                          >
                            Converted
                          </button>
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
    </div>
  );
};

export default AdminOwnerProspects;
