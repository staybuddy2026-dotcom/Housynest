import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import toast from 'react-hot-toast';

const AdminLawyerRequests = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/admin/lawyer-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setIsFilterDropdownOpen(false);
      }
      if (!event.target.closest('.action-dropdown')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => <span className="text-sm font-medium text-slate-400">{row.index + 1}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Lawyer',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col py-2 whitespace-nowrap">
            <span className="text-sm font-bold text-[#062F26] leading-tight">{item.name}</span>
            <span className="text-xs font-medium text-slate-500 mt-0.5">{item.email}</span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const name = row.original.name.toLowerCase();
        const email = row.original.email.toLowerCase();
        const value = filterValue.toLowerCase();
        return name.includes(value) || email.includes(value);
      }
    },
    {
      accessorKey: 'phone',
      header: 'Contact Info',
      cell: info => (
        <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
          <Icon icon="lucide:phone" className="w-3.5 h-3.5 shrink-0" />
          <span className="text-sm font-medium">{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'credentials',
      header: 'Credentials',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:scale" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700">Bar #: {item.barNumber}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:briefcase" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-500">{item.experience}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'verification',
      header: 'Verification',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:fingerprint" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-500">Aadhar: {item.aadhar}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${item.certificateUploaded ? 'text-emerald-600' : 'text-rose-500'}`}>
              <Icon icon={item.certificateUploaded ? "lucide:file-check-2" : "lucide:file-warning"} className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-bold">
                {item.certificateUploaded ? 'Certificate uploaded' : 'Certificate missing'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'registeredDate',
      header: 'Registered',
      cell: info => <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{info.getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        let badgeClass = 'bg-slate-100 text-slate-600';
        let iconClass = 'lucide:circle-dashed';

        if (status === 'Approved') {
          badgeClass = 'bg-emerald-50 text-emerald-600';
          iconClass = 'lucide:check-circle-2';
        } else if (status === 'Pending') {
          badgeClass = 'bg-amber-50 text-amber-600';
          iconClass = 'lucide:clock';
        } else if (status === 'Rejected') {
          badgeClass = 'bg-rose-50 text-rose-600';
          iconClass = 'lucide:x-circle';
        }

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${badgeClass}`}>
            <Icon icon={iconClass} className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row, table }) => {
        const item = row.original;
        const isPending = item.status === 'Pending';
        const isApproved = item.status === 'Approved';
        const isOpen = table.options.meta.openActionId === item.id;
        const toggleDropdown = (e) => {
          e.stopPropagation();
          table.options.meta.setOpenActionId(isOpen ? null : item.id);
        };

        return (
          <div className="relative flex items-center action-dropdown">
            <button onClick={toggleDropdown} className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
              <Icon icon="lucide:more-vertical" className="w-4 h-4" />
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-1 w-auto min-w-37.5 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    item.certificateUrl ? window.open(item.certificateUrl, '_blank') : null;
                    table.options.meta.setOpenActionId(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                  View Certificate
                </button>

                {isPending && (
                  <button
                    onClick={() => {
                      table.options.meta.updateStatus(item.id, 'approved');
                      table.options.meta.setOpenActionId(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors whitespace-nowrap"
                  >
                    <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}

                {isApproved && (
                  <button
                    onClick={() => {
                      table.options.meta.updateStatus(item.id, 'rejected');
                      table.options.meta.setOpenActionId(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    <Icon icon="lucide:ban" className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            )}
          </div>
        );
      },
    }
  ], []);

  // Filter logic
  const filteredData = useMemo(() => {
    let result = data;
    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }
    return result;
  }, [data, statusFilter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    meta: {
      openActionId,
      setOpenActionId,
      updateStatus: async (id, status) => {
        try {
          const response = await fetch(`/api/users/admin/lawyer-requests/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ status })
          });
          if (response.ok) {
            toast.success(`Request ${status} successfully`);
            setData(prev => prev.map(item => item.id === id ? { ...item, status: status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending' } : item));
          } else {
            toast.error('Failed to update status');
          }
        } catch {
          toast.error('An error occurred');
        }
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  return (
    <div className="max-w-350 mx-auto pb-4">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon icon="lucide:scale" className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26]">Lawyer Requests</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Review and verify lawyer credentials and certificates.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex items-center shrink-0 w-full sm:w-auto">
            <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search lawyer..."
              className="w-full sm:w-56 pl-9 pr-4 py-1.5 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <button onClick={fetchRequests} className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto">
            <Icon icon={isLoading ? "lucide:loader" : "lucide:refresh-cw"} className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">Refresh</span>
          </button>

          <div className="relative filter-dropdown shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center justify-between w-full sm:w-40 bg-white border rounded-lg px-3 py-1.5 transition-all ${isFilterDropdownOpen ? 'border-[#062F26] ring-2 ring-[#062F26]/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="lucide:filter" className={`w-3.5 h-3.5 ${isFilterDropdownOpen ? 'text-[#062F26]' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${statusFilter !== 'All' ? 'text-[#062F26]' : 'text-slate-600'}`}>
                  {statusFilter === 'All' ? 'All Status' : statusFilter}
                </span>
              </div>
              <Icon
                icon="lucide:chevron-down"
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180 text-[#062F26]' : 'text-slate-400'
                  }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full min-w-35 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-xs font-bold transition-colors text-left ${statusFilter === status
                      ? 'bg-[#062F26]/5 text-[#062F26]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {statusFilter === status && <Icon icon="lucide:check" className="w-3.5 h-3.5 mr-2 text-[#062F26]" />}
                    <span className={statusFilter === status ? '' : 'ml-5'}>{status === 'All' ? 'All Status' : status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col w-full">
        <div className="w-full overflow-x-auto custom-scrollbar min-h-55">
          <table className="w-full text-left border-collapse table-auto min-w-200">
            <thead className="bg-[#F8F9FA] border-b border-slate-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-3 px-4 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" onClick={header.column.getToggleSortingHandler()}>
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
                    No lawyer requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500 text-center sm:text-left">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} requests
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

    </div>
  );
};

export default AdminLawyerRequests;
