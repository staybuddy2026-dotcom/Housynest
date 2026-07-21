import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import AdminPropertyViewModal from './AdminPropertyViewModal';

const AdminPropertyRequests = () => {
  const [data, setData] = useState([]);
  const [rawProperties, setRawProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
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

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('/api/properties/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const properties = await res.json();
        setRawProperties(properties);
        const mappedData = properties.map((p, index) => ({
          _id: p._id,
          id: index + 1,
          image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150&h=150',
          type: p.propertyType === 'PG' ? 'PG' : 'Tenant',
          propertyName: p.pgName || p.propertyCategory || 'Property',
          ownerName: p.owner?.fullName || 'Unknown',
          ownerEmail: p.owner?.email || 'N/A',
          location: p.locality ? `${p.locality}, ${p.city || ''}` : (p.address || 'Unknown'),
          price: p.monthlyRent || (p.rooms && p.rooms.length > 0 ? p.rooms[0].rentPerBed : '0'),
          status: p.status || 'Pending',
          verified: p.isVerified || false,
        }));
        setData(mappedData);
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.message || 'Failed to fetch'}`);
      }
    } catch (error) {
      console.error('Failed to fetch admin properties', error);
      toast.error('Failed to load property requests. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleUpdateStatus = async (propertyId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/properties/admin/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Property ${newStatus}`);
        fetchProperties();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateVerification = async (propertyId, isVerified) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/properties/admin/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified })
      });
      if (res.ok) {
        toast.success('Property verification updated');
        fetchProperties();
      }
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: info => <span className="text-sm font-medium text-slate-400">{info.getValue()}</span>,
    },
    {
      accessorKey: 'propertyName',
      header: 'Property',
      cell: ({ row }) => {
        const item = row.original;
        const isPg = item.type === 'PG';
        return (
          <div className="flex items-center gap-3 py-2">
            <img src={item.image} alt={item.propertyName} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
            <div className="flex flex-col items-start gap-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${isPg ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {item.type}
              </span>
              <span className="text-sm font-bold text-[#062F26] leading-tight whitespace-nowrap">{item.propertyName}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'ownerName',
      header: 'Owner',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-sm font-bold text-[#062F26]">{item.ownerName}</span>
            <span className="text-xs font-medium text-slate-400">{item.ownerEmail}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: info => (
        <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
          <Icon icon="lucide:map-pin" className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: info => <span className="text-sm font-bold text-blue-900 whitespace-nowrap">₹{info.getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const isPending = status === 'Pending';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold w-fit ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        const isPending = item.status === 'Pending';
        const isVerified = item.verified;

        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button
              onClick={() => {
                const fullProp = rawProperties.find(p => p._id === item._id);
                setSelectedProperty(fullProp);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-white text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
              View
            </button>

            {isPending ? (
              <>
                <button
                  onClick={() => handleUpdateStatus(item._id, 'Approved')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981] text-xs font-bold text-white hover:bg-[#059669] transition-colors"
                >
                  <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                  OK
                </button>
                <button
                  onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-white text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                  No
                </button>
              </>
            ) : !isVerified ? (
              <button
                onClick={() => handleUpdateVerification(item._id, true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#059669] text-xs font-bold text-white hover:bg-[#047857] transition-colors"
              >
                <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" />
                Verify
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/50 text-xs font-bold text-emerald-500/70 border border-emerald-100/50 cursor-not-allowed">
                <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      },
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [rawProperties]);

  const filteredData = useMemo(() => {
    if (filterStatus === 'All') return data;
    return data.filter(item => item.status === filterStatus);
  }, [data, filterStatus]);

  const stats = useMemo(() => {
    return {
      pending: data.filter(d => d.status === 'Pending').length,
      approved: data.filter(d => d.status === 'Approved').length,
      rejected: data.filter(d => d.status === 'Rejected').length,
    };
  }, [data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  return (
    <div className="max-w-350 3xl:max-w-420 mx-auto pb-4">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26]">Property Requests</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Review and approve new property listing submissions</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchProperties}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >
            <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
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
                <span className={`text-xs font-bold ${filterStatus !== 'All' ? 'text-[#062F26]' : 'text-slate-600'}`}>
                  {filterStatus === 'All' ? 'All' : filterStatus}
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
                      setFilterStatus(status);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-xs font-bold transition-colors text-left ${filterStatus === status
                      ? 'bg-[#062F26]/5 text-[#062F26]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {filterStatus === status && <Icon icon="lucide:check" className="w-3.5 h-3.5 mr-2 text-[#062F26]" />}
                    <span className={filterStatus === status ? '' : 'ml-5'}>{status}</span>
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
            label: 'Pending',
            value: stats.pending,
            icon: 'lucide:clock',
            filterValue: 'Pending',
            hoverBorder: 'hover:border-amber-200',
            activeBorder: 'border-amber-400 ring-4 ring-amber-400/10',
            gradientFrom: 'from-amber-100/60',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            iconHoverBg: 'group-hover:bg-amber-100'
          },
          {
            label: 'Approved',
            value: stats.approved,
            icon: 'lucide:check-circle-2',
            filterValue: 'Approved',
            hoverBorder: 'hover:border-emerald-200',
            activeBorder: 'border-emerald-400 ring-4 ring-emerald-400/10',
            gradientFrom: 'from-emerald-100/60',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            iconHoverBg: 'group-hover:bg-emerald-100'
          },
          {
            label: 'Rejected',
            value: stats.rejected,
            icon: 'lucide:x-circle',
            filterValue: 'Rejected',
            hoverBorder: 'hover:border-rose-200',
            activeBorder: 'border-rose-400 ring-4 ring-rose-400/10',
            gradientFrom: 'from-rose-100/60',
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-500',
            iconHoverBg: 'group-hover:bg-rose-100'
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
                    <th key={header.id} className="py-3 px-4 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <AdminPropertyViewModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default AdminPropertyRequests;
