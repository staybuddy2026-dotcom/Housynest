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
import AdminPropertyViewModal from './AdminPropertyViewModal';

const AdminListings = () => {
  const [data, setData] = useState([]);
  const [rawProperties, setRawProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Listings');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedListingForDelete, setSelectedListingForDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.listing-dropdown')) {
        setOpenDropdownId(null);
      }
      if (!event.target.closest('.filter-dropdown')) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenDeleteModal = (listing) => {
    setSelectedListingForDelete(listing);
    setDeleteReason('');
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedListingForDelete(null);
  };

  const handleDeleteListing = async () => {
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion');
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/properties/admin/${selectedListingForDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: deleteReason })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Listing deleted and owner notified');
        handleCloseDeleteModal();
        fetchProperties();
      } else {
        toast.error(data.message || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Server error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: info => <span className="text-sm font-medium text-slate-500">{info.getValue()}</span>,
    },
    {
      accessorKey: 'propertyName',
      header: 'Property',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 py-2">
            <div className="w-15 h-10 rounded-md bg-slate-100 overflow-hidden shrink-0">
              <img src={item.propertyImage} alt={item.propertyName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.type === 'PG' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                  {item.type}
                </span>
                {item.isVerified && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 flex items-center gap-1">
                    <Icon icon="lucide:check-circle" className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-slate-800">{item.propertyName}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: info => (
        <div className="flex items-start gap-1.5 text-xs font-medium text-slate-600">
          <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span className="leading-tight">{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => {
        const names = row.original.owner.split(' ');
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">{names[0] || 'Unknown'}</span>
            <span className="text-sm font-bold text-slate-800">{names[1] || ''}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate w-32" title={item.email}>{item.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:phone" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.phone}</span>
            </div>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const owner = row.original.owner.toLowerCase();
        const email = row.original.email.toLowerCase();
        const phone = row.original.phone.toLowerCase();
        const value = filterValue.toLowerCase();
        return owner.includes(value) || email.includes(value) || phone.includes(value);
      }
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: info => <span className="text-sm font-bold text-emerald-600">{info.getValue()}</span>,
    },
    {
      accessorKey: 'dateAdded',
      header: 'Date Added',
      cell: info => <span className="text-xs font-medium text-slate-500">{info.getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1 w-fit">
            <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
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
        const isDropdownOpen = openDropdownId === item.id;

        return (
          <div className="flex items-center gap-2 relative listing-dropdown">
            <button
              onClick={() => {
                const fullProp = rawProperties.find(p => p._id === item._id);
                setSelectedProperty(fullProp);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
              View
            </button>
            <button
              onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Icon icon="lucide:more-vertical" className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2 z-60 flex flex-col">
                <button
                  onClick={() => handleOpenDeleteModal(item)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                  Delete Listing
                </button>
              </div>
            )}
          </div>
        );
      },
    }
  ], [rawProperties, openDropdownId]);

  useEffect(() => {
    fetchProperties();
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
        // Only keep properties that are Approved or Active
        const filteredProperties = properties.filter(p => p.status === 'Approved' || p.status === 'Active');

        setRawProperties(filteredProperties);
        const mappedData = filteredProperties.map((p, index) => ({
          _id: p._id,
          id: index + 1,
          propertyImage: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150&h=150',
          type: p.propertyType === 'PG' ? 'PG' : 'Tenant',
          propertyName: p.pgName || p.propertyCategory || 'Property',
          location: p.locality ? `${p.locality}, ${p.city || ''}` : (p.address || 'Unknown'),
          owner: p.owner?.fullName || 'Unknown',
          email: p.owner?.email || 'N/A',
          phone: p.owner?.phone || 'N/A',
          price: p.monthlyRent ? `₹${p.monthlyRent}` : (p.rooms && p.rooms.length > 0 ? `₹${p.rooms[0].rentPerBed}` : '₹0'),
          dateAdded: new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: p.status,
          isVerified: p.isVerified || false
        }));

        setData(mappedData);
      } else {
        toast.error('Failed to load listings');
      }
    } catch (error) {
      console.error('Failed to fetch admin listings', error);
      toast.error('Failed to load listings. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Use a derived data array based on the status dropdown filter
  const filteredData = useMemo(() => {
    if (statusFilter === 'All Listings') return data;
    return data.filter(item => item.status === statusFilter);
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
        pageSize: 5,
      },
    },
  });

  return (
    <div className="max-w-350 mx-auto pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-1">
            <Icon icon="lucide:building-2" className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Listings Management</h1>
            <p className="text-sm text-slate-500 font-medium">Manage all property listings across the platform.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative filter-dropdown shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center justify-between w-full sm:w-40 bg-white border rounded-lg px-3 py-2 transition-all ${isFilterDropdownOpen ? 'border-[#062F26] ring-2 ring-[#062F26]/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="lucide:filter" className={`w-4 h-4 ${isFilterDropdownOpen ? 'text-[#062F26]' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${statusFilter !== 'All Listings' ? 'text-[#062F26]' : 'text-slate-600'}`}>
                  {statusFilter === 'All Listings' ? 'All Listings' : statusFilter}
                </span>
              </div>
              <Icon
                icon="lucide:chevron-down"
                className={`w-4 h-4 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180 text-[#062F26]' : 'text-slate-400'
                  }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full min-w-35 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {['All Listings', 'Verified', 'Pending', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-sm font-bold transition-colors text-left ${statusFilter === status
                      ? 'bg-[#062F26]/5 text-[#062F26]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {statusFilter === status && <Icon icon="lucide:check" className="w-4 h-4 mr-2 text-[#062F26]" />}
                    <span className={statusFilter === status ? '' : 'ml-6'}>{status === 'All Listings' ? 'All Listings' : status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex items-center shrink-0 w-full sm:w-auto">
            <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search property..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Add New Button */}
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#062F26] text-white rounded-xl hover:bg-[#05261e] transition-colors shrink-0 w-full sm:w-auto">
            <Icon icon="lucide:plus" className="w-4 h-4" />
            <span className="text-sm font-bold">Add New Listing</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col w-full overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto min-w-225">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-3 px-4 text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={header.column.getToggleSortingHandler()}>
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
                    No listings found.
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
            {table.getFilteredRowModel().rows.length} listings
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

      {/* Property Details Modal */}
      {selectedProperty && (
        <AdminPropertyViewModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Delete Listing Modal */}
      {isDeleteModalOpen && selectedListingForDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#062F26]/10 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:trash-2" className="w-5 h-5 text-[#062F26]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#062F26]">Delete Listing</h3>
                  <p className="text-sm font-medium text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6">
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Listing</span>
                <h4 className="text-[15px] font-bold text-[#062F26]">{selectedListingForDelete.propertyName}</h4>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                  <Icon icon="lucide:user" className="w-3.5 h-3.5" />
                  {selectedListingForDelete.owner}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-[#062F26] flex items-center gap-1">
                  Reason for deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Duplicate listing, policy violation, inaccurate information..."
                  className="w-full h-28 p-3.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all resize-none placeholder:text-slate-400"
                  maxLength={300}
                ></textarea>

                <div className="flex items-start gap-2 mt-1 p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-lg">
                  <Icon icon="lucide:info" className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                    An email with this exact reason will be sent to <span className="font-bold">{selectedListingForDelete.email}</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-[#062F26] hover:bg-[#05261e] text-white rounded-xl transition-all shadow-md hover:shadow-lg ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isDeleting ? (
                  <Icon icon="lucide:loader" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                )}
                <span className="text-sm font-bold">{isDeleting ? 'Deleting...' : 'Confirm Deletion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminListings;
