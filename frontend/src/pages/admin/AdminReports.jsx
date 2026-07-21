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

const AdminReports = () => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
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

  // Resolve Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const [resolveMessage, setResolveMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch('/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const rawData = await res.json();

        const formattedData = rawData.map(report => ({
          id: report._id,
          image: report.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150&h=150',
          propertyName: report.propertyId?.pgName || report.propertyId?.propertyCategory || 'Unknown Property',
          propertyType: report.propertyId?.propertyType || 'N/A',
          reportedByName: report.reporterId?.fullName || 'Unknown User',
          reportedByEmail: report.reporterId?.email || 'N/A',
          reason: report.reason + (report.details ? ` - ${report.details}` : ''),
          date: new Date(report.createdAt).toLocaleDateString(),
          status: report.status,
        }));

        setData(formattedData);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id, newStatus, message = '') => {
    try {
      if (newStatus === 'Resolved') setIsSubmitting(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, message })
      });

      if (res.ok) {
        toast.success(`Report status updated to ${newStatus}`);
        if (newStatus === 'Resolved') {
          setIsResolveModalOpen(false);
          setResolveMessage('');
          setActiveReportId(null);
        }
        fetchReports(); // Refresh data
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      if (newStatus === 'Resolved') setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => <span className="text-sm font-medium text-slate-400">{row.index + 1}</span>,
    },
    {
      accessorKey: 'propertyName',
      header: 'Property',
      cell: ({ row }) => {
        const item = row.original;
        const isPg = item.propertyType === 'PG';
        return (
          <div className="flex items-center gap-3 py-2">
            <img src={item.image} alt={item.propertyName} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
            <div className="flex flex-col items-start gap-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${isPg ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {item.propertyType}
              </span>
              <span className="text-sm font-bold text-[#062F26] leading-tight whitespace-nowrap">{item.propertyName}</span>
            </div>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const name = row.original.propertyName.toLowerCase();
        const value = filterValue.toLowerCase();
        return name.includes(value);
      }
    },
    {
      accessorKey: 'reportedBy',
      header: 'Reported By',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col py-2 whitespace-nowrap">
            <span className="text-sm font-bold text-[#062F26]">{item.reportedByName}</span>
            <span className="text-xs font-medium text-slate-500 mt-0.5">{item.reportedByEmail}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: info => (
        <div className="max-w-62.5 min-w-50">
          <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-2" title={info.getValue()}>
            {info.getValue()}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: info => <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{info.getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        let badgeClass = 'bg-slate-100 text-slate-600';
        let iconClass = 'lucide:circle-dashed';

        if (status === 'Resolved') {
          badgeClass = 'bg-slate-100 text-slate-500';
          iconClass = 'lucide:check-circle-2';
        } else if (status === 'Open') {
          badgeClass = 'bg-rose-50 text-rose-600';
          iconClass = 'lucide:alert-circle';
        } else if (status === 'Investigating') {
          badgeClass = 'bg-amber-50 text-amber-600';
          iconClass = 'lucide:search';
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
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original.id;
        const isResolvedOrDismissed = status === 'Resolved' || status === 'Dismissed';

        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            {!isResolvedOrDismissed ? (
              <>
                <button
                  onClick={() => updateStatus(id, 'Dismissed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setActiveReportId(id);
                    setIsResolveModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-xs font-bold text-white hover:bg-rose-600 transition-colors shadow-sm shadow-rose-500/20 cursor-pointer"
                >
                  <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                  Resolve
                </button>
              </>
            ) : (
              <span className="text-xs font-bold text-slate-400 px-3 py-1.5 flex items-center gap-1">
                <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                {status}
              </span>
            )}
          </div>
        );
      },
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const stats = useMemo(() => {
    const total = data.length;
    const open = data.filter(d => d.status === 'Open' || d.status === 'Investigating').length;
    const resolved = data.filter(d => d.status === 'Resolved').length;
    return { total, open, resolved };
  }, [data]);

  return (
    <div className="max-w-350 3xl:max-w-420 mx-auto pb-4">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
            <Icon icon="lucide:flag" className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#062F26]">Reported Properties</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Review properties flagged by users for inappropriate behavior or fake listings.</p>
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
              placeholder="Search properties..."
              className="w-full sm:w-56 pl-9 pr-4 py-1.5 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-slate-400"
            />
          </div>

          <button onClick={fetchReports} className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto cursor-pointer">
            <Icon icon={isLoading ? "eos-icons:loading" : "lucide:refresh-cw"} className="w-3.5 h-3.5" />
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
                {['All', 'Open', 'Investigating', 'Resolved', 'Dismissed'].map(status => (
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

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Reports',
            value: stats.total,
            icon: 'lucide:flag',
            filterValue: 'All',
            hoverBorder: 'hover:border-blue-200',
            activeBorder: 'border-blue-400 ring-4 ring-blue-400/10',
            gradientFrom: 'from-blue-100/60',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            iconHoverBg: 'group-hover:bg-blue-100'
          },
          {
            label: 'Open Issues',
            value: stats.open,
            icon: 'lucide:alert-circle',
            filterValue: 'Open',
            hoverBorder: 'hover:border-rose-200',
            activeBorder: 'border-rose-400 ring-4 ring-rose-400/10',
            gradientFrom: 'from-rose-100/60',
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-500',
            iconHoverBg: 'group-hover:bg-rose-100'
          },
          {
            label: 'Properties Resolved',
            value: stats.resolved,
            icon: 'lucide:shield-check',
            filterValue: 'Resolved',
            hoverBorder: 'hover:border-emerald-200',
            activeBorder: 'border-emerald-400 ring-4 ring-emerald-400/10',
            gradientFrom: 'from-emerald-100/60',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            iconHoverBg: 'group-hover:bg-emerald-100'
          }
        ].map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group transition-all duration-300 border border-slate-200 ${card.hoverBorder}`}
          >
            <div className={`absolute right-0 top-0 w-24 h-24 bg-linear-to-bl ${card.gradientFrom} to-transparent rounded-bl-full opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="flex flex-col relative z-10">
              <span className="text-sm font-bold mb-1 transition-colors text-slate-500">{card.label}</span>
              <span className="text-3xl font-bold text-[#062F26] leading-none">{card.value}</span>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110 ${card.iconBg} ${card.iconColor} ${card.iconHoverBg}`}>
              <Icon icon={card.icon} className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col w-full overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
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
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center">
                    <Icon icon="eos-icons:loading" className="w-8 h-8 text-brand-teal mx-auto" />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
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
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getRowModel().rows.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500 text-center sm:text-left">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
              {table.getFilteredRowModel().rows.length} reports
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
        )}
      </div>

      {/* Resolve Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsResolveModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-[#062F26] flex items-center gap-2">
                <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-rose-500" />
                Resolve Report
              </h3>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Please enter a message detailing how this report was resolved. This will be sent directly to the user who reported the property.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Resolution Message</label>
              <textarea
                value={resolveMessage}
                onChange={(e) => setResolveMessage(e.target.value)}
                placeholder="Hi, we've reviewed the property and taken the following actions..."
                rows="4"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal resize-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(activeReportId, 'Resolved', resolveMessage)}
                disabled={!resolveMessage.trim() || isSubmitting}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors shadow-sm shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Icon icon="eos-icons:loading" className="w-4 h-4" />
                ) : (
                  <Icon icon="lucide:send" className="w-4 h-4" />
                )}
                Submit & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReports;
