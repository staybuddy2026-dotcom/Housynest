import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import EditPropertyForm from '../../components/dashboard/EditPropertyForm';

const OwnerListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterOptions = ['All', 'Active', 'Inactive', 'Pending', 'Sold/Rented'];
  const [viewType, setViewType] = useState('grid');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch('/api/properties/owner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setListings(listings.filter(listing => listing._id !== id));
      } else {
        alert("Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const filteredListings = listings.filter(listing => {
    const title = listing.pgName || listing.propertyCategory || 'Property';
    const location = listing.address || listing.locality || 'Location';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : listing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="animate-fadeIn py-12 flex justify-center"><Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" /></div>;
  }

  if (editingPropertyId) {
    return (
      <div className="animate-fadeIn">
        <EditPropertyForm
          propertyId={editingPropertyId}
          onClose={() => setEditingPropertyId(null)}
          onSuccess={() => {
            setEditingPropertyId(null);
            fetchProperties();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] tracking-tight mb-2">My Listings</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and monitor all your listed properties in one place.</p>
        </div>

        <Link
          to="/list-property"
          className="flex items-center justify-center gap-2 bg-[#062F26] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-brand-teal transition-all duration-300 shadow-lg shadow-[#062F26]/20 hover:shadow-brand-teal/30 hover:-translate-y-0.5 shrink-0"
        >
          <Icon icon="lucide:plus" className="w-[18px] h-[18px]" />
          Add New Property
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by property name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Custom Status Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-auto bg-white border border-slate-200 text-[#062F26] text-sm font-bold rounded-lg pl-4 pr-3 py-2.5 outline-none cursor-pointer hover:border-brand-teal transition-colors min-w-[130px]"
            >
              <span>{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
              <Icon icon="lucide:chevron-down" className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)}></div>
                <div className="absolute right-0 top-[calc(100%+8px)] w-full sm:w-40 bg-white border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-1.5 z-20 animate-[fadeIn_0.15s_ease-out]">
                  {filterOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setFilterStatus(option);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${filterStatus === option ? 'text-brand-teal bg-brand-teal/5' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      {option === 'All' ? 'All Status' : option}
                      {filterStatus === option && <Icon icon="lucide:check" className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-md transition-colors ${viewType === 'grid' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon icon="lucide:layout-grid" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-md transition-colors ${viewType === 'list' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon icon="lucide:list" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Display */}
      {filteredListings.length > 0 ? (
        <div className={viewType === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {filteredListings.map((rawListing) => {
            const title = rawListing.pgName || rawListing.propertyCategory || 'Property';
            const type = rawListing.propertyType === 'PG' ? 'PG / Co-living' : 'Flat / Apartment';
            const location = rawListing.locality ? `${rawListing.locality}, ${rawListing.city || ''}` : (rawListing.address || 'Unknown Location');
            const price = rawListing.monthlyRent ? `₹${rawListing.monthlyRent}` : (rawListing.rooms && rawListing.rooms.length > 0 ? `₹${rawListing.rooms[0].rentPerBed}` : 'N/A');
            const image = (rawListing.images && rawListing.images.length > 0) ? rawListing.images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';
            const addedOn = new Date(rawListing.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const views = rawListing.views || 0;
            const inquiries = rawListing.inquiries || 0;
            const status = rawListing.status || 'Pending';

            if (viewType === 'grid') {
              return (
                <div
                  key={rawListing._id}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden group hover:border-brand-teal/30 hover:shadow-[0_12px_40px_rgba(10,168,125,0.08)] transition-all duration-300 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-[140px] w-full overflow-hidden shrink-0">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${status === 'Active' || status === 'Approved' ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-white'
                        }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3.5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider">{type}</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#062F26] mb-1 line-clamp-1 group-hover:text-brand-teal transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-2.5">
                      <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0" />
                      <p className="text-xs font-medium truncate">{location}</p>
                    </div>

                    <div className="w-full h-[1px] bg-slate-100 mb-2.5" />

                    <div className="flex items-center justify-between mt-auto mb-3">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Rent / Month</p>
                        <p className="text-sm font-bold text-[#062F26]">{price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Added On</p>
                        <p className="text-xs font-bold text-slate-700">{addedOn}</p>
                      </div>
                    </div>

                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 py-1.5">
                      <div className="flex-1 flex items-center justify-center gap-1 border-r border-slate-200">
                        <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">{views}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Views</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-1">
                        <Icon icon="lucide:message-square" className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700">{inquiries}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Inquiries</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
                      <Link to={`/properties/${rawListing._id}`} className="flex-1 bg-white border border-slate-200 hover:border-brand-teal hover:bg-brand-teal/5 text-slate-600 hover:text-brand-teal py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => setEditingPropertyId(rawListing._id)}
                        className="flex-1 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(rawListing._id)} className="flex-1 bg-white border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-600 hover:text-red-600 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // ==========================================
            // HIGHLY OPTIMIZED LIST VIEW LAYOUT
            // ==========================================
            return (
              <div
                key={rawListing._id}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden group hover:border-brand-teal/30 hover:shadow-[0_12px_40px_rgba(10,168,125,0.08)] transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Left: Image Container */}
                <div className="relative h-[140px] sm:h-auto sm:w-[220px] shrink-0 overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${status === 'Active' || status === 'Approved' ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-white'
                      }`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Middle: Core Details */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider mb-1.5">{type}</span>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    {/* Title & Location */}
                    <div>
                      <h3 className="text-lg font-bold text-[#062F26] mb-1.5 group-hover:text-brand-teal transition-colors">
                        {title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-sm font-medium">{location}</p>
                      </div>
                    </div>

                    {/* Rent & Date (Row Aligned) */}
                    <div className="flex items-center sm:items-start justify-between sm:justify-end gap-6 sm:gap-8">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-slate-400 mb-0.5">Rent / Month</p>
                        <p className="text-base font-bold text-[#062F26]">{price}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-slate-400 mb-0.5">Added On</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{addedOn}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Actions Sidebar */}
                <div className="sm:w-[220px] bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-100 p-4 sm:p-5 flex flex-col justify-center gap-3">
                  {/* Metrics */}
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 py-2 shadow-sm">
                    <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-bold text-slate-700">{views}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Views</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon icon="lucide:message-square" className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-sm font-bold text-slate-700">{inquiries}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inquiries</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/properties/${rawListing._id}`} className="flex-1 bg-white border border-slate-200 hover:border-brand-teal hover:bg-brand-teal/5 text-slate-600 hover:text-brand-teal py-2 rounded-xl flex items-center justify-center transition-all shadow-sm">
                      <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setEditingPropertyId(rawListing._id)}
                      className="flex-1 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-2 rounded-xl flex items-center justify-center transition-all shadow-sm"
                    >
                      <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(rawListing._id)} className="flex-1 bg-white border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-600 hover:text-red-600 py-2 rounded-xl flex items-center justify-center transition-all shadow-sm">
                      <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
            <Icon icon="lucide:building-2" className="w-10 h-10 text-brand-teal" />
          </div>
          <h3 className="text-xl font-bold text-[#062F26] mb-2">No listings found</h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            We couldn't find any properties matching your current filters or search terms. Try adjusting them or add a new property.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setFilterStatus('All'); }}
            className="text-brand-teal font-bold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerListings;
