import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import toast from 'react-hot-toast';

const LawyerOwners = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [requestingIds, setRequestingIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/lawyer/owners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        toast.error('Failed to fetch owners');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();

    const handleRequestUpdated = (e) => {
      const { ownerId, status, contractId, rejectionReason } = e.detail;
      setData(prevData => prevData.map(owner => {
        if (owner._id === ownerId) {
          return {
            ...owner,
            requestStatus: status,
            contractId: contractId || owner.contractId,
            rejectionReason: rejectionReason || owner.rejectionReason
          };
        }
        return owner;
      }));
    };

    window.addEventListener('globalLawyerRequestUpdated', handleRequestUpdated);

    return () => {
      window.removeEventListener('globalLawyerRequestUpdated', handleRequestUpdated);
    };
  }, []);

  const handleSendRequest = async (ownerId, requestCount = 0) => {
    if (requestCount >= 2) {
      toast.error('You have reached the maximum limit of 2 requests for this owner.');
      return;
    }

    setRequestingIds(prev => new Set(prev).add(ownerId));

    // Simulate 3 seconds loader
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const response = await fetch('/api/lawyer-requests/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ ownerId })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Request sent successfully!');
        setData(prevData => prevData.map(owner =>
          owner._id === ownerId ? { ...owner, requestStatus: 'pending', requestCount: (owner.requestCount || 0) + 1 } : owner
        ));
      } else {
        toast.error(result.message || 'Failed to send request');
      }
    } catch (error) {
      toast.error('An error occurred while sending request');
    } finally {
      setRequestingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(ownerId);
        return newSet;
      });
    }
  };

  const handleCreateNewContract = async (ownerId) => {
    try {
      const owner = data.find(o => o._id === ownerId);
      const title = `Contract with ${owner?.fullName || 'Owner'}`;

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ ownerId, title })
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/lawyer/contracts/draft/${result._id}`);
      } else {
        toast.error('Failed to create contract draft');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('An error occurred');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => <span className="text-sm font-medium text-slate-400">{row.index + 1}</span>,
    },
    {
      accessorKey: 'fullName',
      header: 'Owner',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-[#EAF5F2] flex items-center justify-center text-[#062F26] font-bold text-sm shrink-0 border border-brand-teal/20 uppercase">
              {item.profilePic ? (
                <img src={item.profilePic} alt={item.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                item.fullName?.charAt(0) || 'O'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#062F26] leading-tight whitespace-nowrap capitalize">{item.fullName}</span>
              <span className="text-xs font-medium text-slate-500 mt-0.5">{item.email}</span>
            </div>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const name = (row.original.fullName || '').toLowerCase();
        const email = (row.original.email || '').toLowerCase();
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
          <span className="text-sm font-medium">{info.getValue() || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'listedProperties',
      header: 'Properties',
      cell: ({ row }) => {
        const count = row.original.listedProperties?.length || 0;
        return (
          <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
            {count} {count === 1 ? 'Property' : 'Properties'}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        const isRequesting = requestingIds.has(item._id);

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/lawyer/owners/${item._id}`)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#062F26] bg-[#062F26]/5 hover:bg-[#062F26]/10 rounded-lg transition-colors whitespace-nowrap"
            >
              <Icon icon="lucide:home" className="w-3.5 h-3.5" />
              View Properties
            </button>

            {item.requestStatus === 'accepted' ? (
              <button
                onClick={() => {
                  if (item.contractId) {
                    navigate(`/lawyer/contracts/draft/${item.contractId}`);
                  } else {
                    handleCreateNewContract(item._id);
                  }
                }}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Icon icon="lucide:file-signature" className="w-4 h-4" />
                {item.contractId ? 'Edit Contract' : 'Create Contract'}
              </button>
            ) : item.requestStatus ? (
              <div className="flex items-center gap-2">
                <div className="relative group/tooltip flex items-center">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap border ${item.requestStatus === 'pending' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                    'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    <Icon icon={
                      item.requestStatus === 'pending' ? 'lucide:clock' :
                        'lucide:x-circle'
                    } className="w-3.5 h-3.5" />
                    {item.requestStatus.charAt(0).toUpperCase() + item.requestStatus.slice(1)}
                  </span>
                  {item.requestStatus === 'rejected' && item.rejectionReason && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                      <p className="font-bold mb-1">Rejection Reason:</p>
                      <p className="line-clamp-3 leading-relaxed">{item.rejectionReason}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  )}
                </div>
                {item.requestStatus === 'rejected' && (!item.requestCount || item.requestCount < 2) && (
                  <button
                    onClick={() => handleSendRequest(item._id, item.requestCount)}
                    disabled={isRequesting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors whitespace-nowrap ${isRequesting ? 'bg-[#062F26]/70 cursor-not-allowed' : 'bg-[#062F26] hover:bg-[#062F26]/90'
                      }`}
                  >
                    <Icon icon="lucide:refresh-cw" className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
                    Resend
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleSendRequest(item._id, item.requestCount)}
                disabled={isRequesting}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors whitespace-nowrap ${isRequesting ? 'bg-[#062F26]/70 cursor-not-allowed' : 'bg-[#062F26] hover:bg-[#062F26]/90'
                  }`}
              >
                {isRequesting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:send" className="w-3.5 h-3.5" />
                    Send Request
                  </>
                )}
              </button>
            )}
          </div>
        );
      },
    }
  ], [navigate]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="max-w-[1400px] mx-auto pb-4">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon icon="lucide:users" className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26]">Property Owners</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">View all property owners and manage their properties.</p>
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
              placeholder="Search owner..."
              className="w-full sm:w-64 pl-9 pr-4 py-1.5 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <button onClick={fetchOwners} className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto">
            <Icon icon={isLoading ? "lucide:loader" : "lucide:refresh-cw"} className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col w-full overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto min-w-[800px]">
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
                    {isLoading ? 'Loading owners...' : 'No owners found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500 text-center sm:text-left">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + (table.getFilteredRowModel().rows.length > 0 ? 1 : 0)} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} owners
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

export default LawyerOwners;
