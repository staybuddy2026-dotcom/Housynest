import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const getRoleBadge = (role) => {
  switch (role) {
    case 'Landlord':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
          Landlord
        </span>
      );
    case 'Renter':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Renter
        </span>
      );
    case 'Lawyer':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
          Lawyer
        </span>
      );
    case 'Admin':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-xs">
          Admin
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          {role}
        </span>
      );
  }
};

const getStatusBadge = (status) => {
  if (status === 'Suspended') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
        <Icon icon="lucide:ban" className="w-3.5 h-3.5 text-rose-500" />
        Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Active
    </span>
  );
};

const tableHeaders = [
  { label: '#', align: 'left' },
  { label: 'User Details', align: 'left' },
  { label: 'Role', align: 'left' },
  { label: 'Contact Details', align: 'left' },
  { label: 'Auth Provider', align: 'left' },
  { label: 'Joined Date', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Actions', align: 'right' }
];

const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch('/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const users = await res.json();
        const mappedData = users.map((u, index) => {
          let roleDisplay = 'Renter';
          if (u.role === 'owner') roleDisplay = 'Landlord';
          if (u.role === 'lawyer') roleDisplay = 'Lawyer';
          if (u.role === 'admin') roleDisplay = 'Admin';
          if (u.role === 'tenant') roleDisplay = 'Renter';

          return {
            _id: u._id,
            id: index + 1,
            avatar: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'User')}&background=062F26&color=fff`,
            name: u.fullName || 'Unknown User',
            role: roleDisplay,
            email: u.email || 'N/A',
            phone: u.phone || 'N/A',
            provider: u.googleId ? 'Google' : 'Email',
            joinedDate: new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: u.isBlocked ? 'Suspended' : 'Active',
          };
        });

        setData(mappedData);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Failed to fetch admin users', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUser = async () => {
    if (!blockReason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }

    setIsSubmittingBlock(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/admin/block-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserForBlock._id,
          isBlocked: true,
          blockReason
        })
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || 'User blocked successfully');
        handleCloseBlockModal();
        fetchUsers();
      } else {
        toast.error(resData.message || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Server error');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/admin/block-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          isBlocked: false
        })
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || 'User unblocked successfully');
        fetchUsers();
      } else {
        toast.error(resData.message || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Server error');
    }
  };

  const handleOpenBlockModal = (user) => {
    setSelectedUserForBlock(user);
    setBlockReason('');
    setIsBlockModalOpen(true);
  };

  const handleCloseBlockModal = () => {
    setIsBlockModalOpen(false);
    setSelectedUserForBlock(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.phone.includes(searchLower);

      let matchesRole = true;
      if (roleFilter === 'Suspended') {
        matchesRole = item.status === 'Suspended';
      } else if (roleFilter !== 'All') {
        matchesRole = item.role === roleFilter;
      }

      return matchesSearch && matchesRole;
    });
  }, [data, roleFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = data.length;
    const landlords = data.filter(d => d.role === 'Landlord').length;
    const renters = data.filter(d => d.role === 'Renter').length;
    const suspended = data.filter(d => d.status === 'Suspended').length;
    return { total, landlords, renters, suspended };
  }, [data]);

  const metricCards = useMemo(() => [
    { title: 'Total Registered Users', value: stats.total, icon: 'lucide:users', bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Landlords (Owners)', value: stats.landlords, icon: 'lucide:building-2', bg: 'bg-blue-50 text-blue-600' },
    { title: 'Renters (Tenants)', value: stats.renters, icon: 'lucide:user-check', bg: 'bg-purple-50 text-purple-600' },
    { title: 'Suspended Accounts', value: stats.suspended, icon: 'lucide:user-x', bg: 'bg-rose-50 text-rose-600' }
  ], [stats]);

  return (
    <div className="space-y-4 mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26]">User Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Overview and access controls for all registered landlords, tenants, and system users.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-[#062F26] hover:text-white rounded-lg font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Users
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
              <Icon icon={card.icon} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-extrabold text-[#062F26] mt-0.5">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            {['All', 'Landlord', 'Renter', 'Lawyer', 'Admin', 'Suspended'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${roleFilter === role
                    ? 'bg-[#062F26] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {tableHeaders.map((header, idx) => (
                  <th
                    key={idx}
                    className={`py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${header.align === 'right' ? 'text-right' : ''
                      }`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Loading user accounts...</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400 font-medium text-xs">
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-xs font-bold text-slate-400">
                      {item.id}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="text-sm font-bold text-[#062F26] leading-tight block">{item.name}</span>
                          <span className="text-xs text-slate-400 font-medium block mt-0.5">ID: {item._id.substring(item._id.length - 6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {getRoleBadge(item.role)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <a href={`mailto:${item.email}`} className="font-semibold text-slate-700 hover:text-brand-teal transition-colors flex items-center gap-1.5">
                          <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-slate-400" />
                          {item.email}
                        </a>
                        <a href={`tel:${item.phone}`} className="font-medium text-slate-500 hover:text-brand-teal transition-colors flex items-center gap-1.5">
                          <Icon icon="lucide:phone" className="w-3.5 h-3.5 text-slate-400" />
                          {item.phone}
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Icon icon={item.provider === 'Google' ? 'logos:google-icon' : 'lucide:key'} className="w-3.5 h-3.5" />
                        {item.provider}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs font-bold text-slate-700 whitespace-nowrap">
                      {item.joinedDate}
                    </td>

                    <td className="py-4 px-6">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {item.status === 'Suspended' ? (
                        <button
                          onClick={() => handleUnblockUser(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenBlockModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <Icon icon="lucide:ban" className="w-3.5 h-3.5" />
                          Block User
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 text-center sm:text-left">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors cursor-pointer ${currentPage === index + 1
                      ? 'bg-[#062F26] text-white shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Block User Modal */}
      {isBlockModalOpen && selectedUserForBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:ban" className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#062F26]">Block User Account</h3>
                  <p className="text-xs font-medium text-slate-500">{selectedUserForBlock.name} ({selectedUserForBlock.role})</p>
                </div>
              </div>
              <button
                onClick={handleCloseBlockModal}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
                <Icon icon="lucide:alert-triangle" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  Blocking will restrict account access immediately and send an email notification to <strong className="font-bold">{selectedUserForBlock.email}</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#062F26]">
                  Reason for Suspension <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Violation of terms of service, suspicious activity, spam listing..."
                  className="w-full h-28 p-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all resize-none placeholder:text-slate-400"
                  maxLength={500}
                ></textarea>
                <span className="text-[10px] font-semibold text-slate-400 text-right">{blockReason.length}/500</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseBlockModal}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={isSubmittingBlock}
                className={`flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer ${isSubmittingBlock ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmittingBlock ? (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon icon="lucide:ban" className="w-4 h-4" />
                )}
                <span>{isSubmittingBlock ? 'Processing...' : 'Confirm Block'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
