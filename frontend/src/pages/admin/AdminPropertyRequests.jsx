import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import AdminPropertyViewModal from './AdminPropertyViewModal';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Approved':
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Approved
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Icon icon="lucide:x-circle" className="w-3.5 h-3.5 text-rose-500" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-amber-500" />
          Pending
        </span>
      );
  }
};

const formatPropertyPrice = (p) => {
  if (p.monthlyRent && Number(p.monthlyRent) > 0) {
    return {
      primary: `₹${Number(p.monthlyRent).toLocaleString('en-IN')}`,
      subtext: 'Monthly Rent'
    };
  }

  const validPrices = [];

  if (p.pgPricing) {
    Object.entries(p.pgPricing).forEach(([type, obj]) => {
      if (obj && obj.rentPerBed) {
        const num = Number(String(obj.rentPerBed).replace(/\D/g, ''));
        if (num > 0) {
          const sharingName = type.replace('_AC', ' AC').replace('_NonAC', ' Non-AC').replace('_', ' ');
          validPrices.push({ rent: num, label: sharingName });
        }
      }
    });
  }

  if (validPrices.length === 0 && p.floors && Array.isArray(p.floors)) {
    p.floors.forEach(f => {
      if (f.rooms && Array.isArray(f.rooms)) {
        f.rooms.forEach(r => {
          if (r.rentPerBed) {
            const num = Number(String(r.rentPerBed).replace(/\D/g, ''));
            if (num > 0) {
              validPrices.push({ rent: num, label: r.sharingType || 'Per Bed' });
            }
          }
        });
      }
    });
  }

  if (validPrices.length === 0 && p.rooms && Array.isArray(p.rooms)) {
    p.rooms.forEach(r => {
      if (r.rentPerBed) {
        const num = Number(String(r.rentPerBed).replace(/\D/g, ''));
        if (num > 0) {
          validPrices.push({ rent: num, label: r.sharingType || 'Per Bed' });
        }
      }
    });
  }

  if (validPrices.length > 0) {
    const minRent = Math.min(...validPrices.map(item => item.rent));
    const maxRent = Math.max(...validPrices.map(item => item.rent));

    if (minRent === maxRent) {
      return {
        primary: `₹${minRent.toLocaleString('en-IN')}`,
        subtext: validPrices[0].label || 'Per Bed'
      };
    } else {
      return {
        primary: `₹${minRent.toLocaleString('en-IN')} - ₹${maxRent.toLocaleString('en-IN')}`,
        subtext: `${validPrices.length} Sharing Options`
      };
    }
  }

  return {
    primary: '₹0',
    subtext: 'Pricing N/A'
  };
};

const tableHeaders = [
  { label: '#', align: 'left' },
  { label: 'Property Details', align: 'left' },
  { label: 'Owner Details', align: 'left' },
  { label: 'Location', align: 'left' },
  { label: 'Monthly Rent', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Actions', align: 'right' }
];

const AdminPropertyRequests = () => {
  const [data, setData] = useState([]);
  const [rawProperties, setRawProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('/api/properties/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const properties = await res.json();
        setRawProperties(properties);
        const mappedData = properties.map((p, index) => ({
          _id: p._id,
          id: index + 1,
          image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150&h=150',
          type: p.propertyType === 'PG' ? 'PG' : 'Tenant',
          category: p.propertyCategory || p.bhkType || '',
          propertyName: p.pgName || p.societyName || p.propertyCategory || 'Property',
          ownerName: p.owner?.fullName || 'Unknown Owner',
          ownerEmail: p.owner?.email || 'N/A',
          ownerPhone: p.owner?.phone || 'N/A',
          address: p.address || '',
          localityCity: [p.locality, p.city].filter(Boolean).join(', ') || 'Unknown Location',
          location: [p.address, p.locality, p.city].filter(Boolean).join(', ') || 'Unknown Location',
          priceInfo: formatPropertyPrice(p),
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
      toast.error('Failed to load property requests.');
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Property marked as ${newStatus}`);
        fetchProperties();
      } else {
        toast.error('Failed to update property status');
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified })
      });
      if (res.ok) {
        toast.success('Property verified successfully');
        fetchProperties();
      } else {
        toast.error('Failed to verify property');
      }
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.propertyName.toLowerCase().includes(searchLower) ||
        item.ownerName.toLowerCase().includes(searchLower) ||
        item.ownerEmail.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower);

      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [data, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const stats = useMemo(() => {
    return {
      total: data.length,
      pending: data.filter(d => d.status === 'Pending').length,
      approved: data.filter(d => d.status === 'Approved' || d.status === 'Active').length,
      rejected: data.filter(d => d.status === 'Rejected').length,
    };
  }, [data]);

  const metricCards = useMemo(() => [
    { title: 'Total Submissions', value: stats.total, icon: 'lucide:home', bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Pending Approval', value: stats.pending, icon: 'lucide:clock', bg: 'bg-amber-50 text-amber-600' },
    { title: 'Approved Properties', value: stats.approved, icon: 'lucide:check-circle-2', bg: 'bg-blue-50 text-blue-600' },
    { title: 'Rejected Submissions', value: stats.rejected, icon: 'lucide:x-circle', bg: 'bg-rose-50 text-rose-600' }
  ], [stats]);

  return (
    <div className="space-y-4 mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26]">Property Requests</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Review, approve, and verify new property listing submissions from landlords.
          </p>
        </div>
        <button
          onClick={fetchProperties}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-[#062F26] hover:text-white rounded-lg font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
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
              placeholder="Search property, owner, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${filterStatus === status
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
          <table className="w-full text-left border-collapse min-w-[900px]">
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
                  <td colSpan="7" className="py-16 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Loading property requests...</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-xs">
                    No property requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isPg = item.type === 'PG';
                  const isPending = item.status === 'Pending';
                  const isVerified = item.verified;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 text-xs font-bold text-slate-400">
                        {item.id}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.propertyName}
                            className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="text-sm font-bold text-[#062F26] leading-tight block">{item.propertyName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-1 ${isPg ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}
                            >
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-slate-800 block">{item.ownerName}</span>
                        <span className="text-xs font-semibold text-brand-teal block mt-0.5">{item.ownerPhone}</span>
                        <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[180px]">{item.ownerEmail}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col max-w-[220px] sm:max-w-[280px]">
                          {item.address && (
                            <span className="text-xs font-bold text-slate-800 leading-tight truncate" title={item.address}>
                              {item.address}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5" title={item.localityCity}>
                            <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.localityCity}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-brand-teal whitespace-nowrap block">
                          {item.priceInfo.primary}
                        </span>
                        {item.priceInfo.subtext && (
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 whitespace-nowrap">
                            {item.priceInfo.subtext}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              const fullProp = rawProperties.find(p => p._id === item._id);
                              setSelectedProperty(fullProp);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-md transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                            View
                          </button>

                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(item._id, 'Approved')}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-md transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-md transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          ) : !isVerified ? (
                            <button
                              onClick={() => handleUpdateVerification(item._id, true)}
                              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-md transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                            >
                              <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" />
                              Verify
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100 inline-flex items-center gap-1">
                              <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" /> Verified
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 text-center sm:text-left">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} property requests
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
