import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserForBlock._id,
          isBlocked: true,
          blockReason
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        handleCloseBlockModal();
        fetchUsers(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to block user');
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          isBlocked: false,
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to unblock user');
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

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: info => <span className="text-sm font-medium text-slate-500">{info.getValue()}</span>,
    },
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 py-2">
            <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#062F26] leading-tight whitespace-nowrap">{item.name}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: info => {
        const role = info.getValue();
        let colorClass = 'bg-slate-50 text-slate-600';
        if (role === 'Landlord') colorClass = 'bg-blue-50 text-blue-600';
        if (role === 'Renter') colorClass = 'bg-emerald-50 text-emerald-600';
        if (role === 'Lawyer') colorClass = 'bg-amber-50 text-amber-600';

        return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${colorClass}`}>
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1 text-sm font-medium text-slate-500 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-1.5 w-full">
              <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-37.5 block" title={item.email}>{item.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:phone" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: info => {
        const provider = info.getValue();
        const label = provider === 'Email' ? 'Credentials' : provider;
        return (
          <span className="px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: 'verified',
      header: 'Verified',
      cell: info => {
        const isVerified = info.getValue();
        return isVerified ? (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Icon icon="lucide:check-circle" className="w-4 h-4" />
            <span className="text-sm font-bold">Yes</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Icon icon="lucide:minus-circle" className="w-4 h-4" />
            <span className="text-sm font-medium">No</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'joinedDate',
      header: 'Joined Date',
      cell: info => <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{info.getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const isSuspended = status === 'Suspended';
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit ${isSuspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <Icon icon={isSuspended ? "lucide:x-circle" : "lucide:check-circle-2"} className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isBlocked = row.original.status === 'Suspended';
        return (
          <div className="flex items-center gap-2">
            {isBlocked ? (
              <button
                onClick={() => handleUnblockUser(row.original)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs font-bold text-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                Unblock
              </button>
            ) : (
              <button
                onClick={() => handleOpenBlockModal(row.original)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Icon icon="lucide:ban" className="w-3.5 h-3.5" />
                Block
              </button>
            )}
          </div>
        );
      },
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch('/api/users/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
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
            avatar: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'User')}&background=random`,
            name: u.fullName || 'Unknown User',
            role: roleDisplay,
            email: u.email || 'N/A',
            phone: u.phone || 'N/A',
            provider: u.googleId ? 'Google' : 'Email',
            verified: true, // Assuming default true, unless there's an isVerified field
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
      toast.error('Failed to load users. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (roleFilter === 'All') return data;
    return data.filter(item => item.role === roleFilter);
  }, [data, roleFilter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="max-w-350 3xl:max-w-420 mx-auto pb-4">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <h1 className="text-2xl font-bold text-[#062F26]">User Management</h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Filter Dropdown */}
          <div className="relative filter-dropdown shrink-0">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center justify-between w-full sm:w-36 bg-white border rounded-lg px-3 py-2 transition-all ${isFilterDropdownOpen ? 'border-[#062F26] ring-2 ring-[#062F26]/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="lucide:filter" className={`w-4 h-4 ${isFilterDropdownOpen ? 'text-[#062F26]' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${roleFilter !== 'All' ? 'text-[#062F26]' : 'text-slate-600'}`}>
                  {roleFilter}
                </span>
              </div>
              <Icon
                icon="lucide:chevron-down"
                className={`w-4 h-4 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180 text-[#062F26]' : 'text-slate-400'
                  }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 flex flex-col overflow-hidden">
                {['All', 'Landlord', 'Renter', 'Lawyer'].map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setRoleFilter(role);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2.5 text-sm font-bold transition-colors text-left ${roleFilter === role
                      ? 'bg-[#062F26]/5 text-[#062F26]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {roleFilter === role && <Icon icon="lucide:check" className="w-3.5 h-3.5 mr-2 text-[#062F26]" />}
                    <span className={roleFilter === role ? '' : 'ml-5'}>{role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col w-full overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto min-w-200">
            <thead className="bg-[#F8F9FA] border-b border-slate-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-3 px-4 text-sm font-bold text-[#062F26] cursor-pointer hover:bg-slate-100 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <Icon icon="lucide:chevron-up" className="w-3 h-3 text-slate-400" />,
                          desc: <Icon icon="lucide:chevron-down" className="w-3 h-3 text-slate-400" />,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-3 px-4 border-b border-slate-50">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center text-slate-500 font-medium">
                    {loading ? 'Loading...' : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="py-10 text-center text-slate-500 font-medium w-full">Loading users...</div>
          )}

          {!loading && table.getRowModel().rows.length === 0 && (
            <div className="py-10 text-center text-slate-500 font-medium w-full flex flex-col items-center gap-2">
              <Icon icon="lucide:search-x" className="w-8 h-8 text-slate-400" />
              No users found matching your criteria
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500 text-center sm:text-left">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} users
          </p>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-center">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => table.setPageIndex(index)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${table.getState().pagination.pageIndex === index
                    ? 'bg-[#062F26] text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Block User Modal */}
      {isBlockModalOpen && selectedUserForBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:ban" className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#062F26]">Block User</h3>
                  <p className="text-sm font-medium text-slate-500">{selectedUserForBlock.name.toLowerCase()} {selectedUserForBlock.role.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={handleCloseBlockModal}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">

              <div className="flex gap-3 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                <Icon icon="lucide:alert-triangle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium leading-relaxed">
                  This will block the account and send an email to <strong className="font-bold">{selectedUserForBlock.email}</strong> with the reason.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#062F26]">
                  Reason for blocking <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Violation of terms of service, fraudulent activity, spam..."
                  className="w-full h-32 p-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all resize-none placeholder:text-slate-400"
                  maxLength={500}
                ></textarea>
                <div className="text-xs font-medium text-slate-400 flex justify-between">
                  <span>{blockReason.length}/500</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseBlockModal}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={isSubmittingBlock}
                className={`flex items-center gap-2 px-5 py-2.5 bg-red-400 hover:bg-red-500 text-white rounded-xl transition-colors shadow-sm ${isSubmittingBlock ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmittingBlock ? (
                  <Icon icon="lucide:loader" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon icon="lucide:ban" className="w-4 h-4" />
                )}
                <span className="text-sm font-bold">{isSubmittingBlock ? 'Blocking...' : 'Block & Notify'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
