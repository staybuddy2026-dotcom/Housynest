import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import OwnerPropertyDetails from '../../components/dashboard/OwnerPropertyDetails';
import OwnerPropertyEdit from '../../components/dashboard/OwnerPropertyEdit';
import CustomDropdown from '../../components/list-property/CustomDropdown';

const OwnerListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingPropertyId, setViewingPropertyId] = useState(null);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const filterOptions = ['All', ...new Set(listings.map(l => l.status || 'Pending'))].filter(Boolean);

  const fetchProperties = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = (id) => {
    setPropertyToDelete(id);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/properties/${propertyToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setListings(listings.filter(listing => listing._id !== propertyToDelete));
      } else {
        alert("Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    } finally {
      setPropertyToDelete(null);
    }
  };

  const filteredListings = listings.filter(listing => {
    const title = listing.pgName || listing.societyName || listing.propertyCategory || 'Property';
    const location = listing.locality ? `${listing.locality}, ${listing.city || ''}` : (listing.address || 'Unknown Location');
    const type = listing.propertyType === 'PG' ? 'PG / Co-living' : 'Flat / Apartment';
    const status = listing.status || 'Pending';

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      title.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower) ||
      type.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'All' ? true : listing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="animate-fadeIn py-12 flex justify-center"><Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" /></div>;
  }

  if (viewingPropertyId) {
    return (
      <div className="animate-fadeIn">
        <OwnerPropertyDetails
          propertyId={viewingPropertyId}
          onClose={() => setViewingPropertyId(null)}
          onEdit={() => {
            setEditingPropertyId(viewingPropertyId);
            setViewingPropertyId(null);
          }}
        />
      </div>
    );
  }

  if (editingPropertyId) {
    return (
      <div className="animate-fadeIn">
        <OwnerPropertyEdit
          propertyId={editingPropertyId}
          onClose={(shouldRefresh) => {
            setEditingPropertyId(null);
            if (shouldRefresh) fetchProperties();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#062F26] tracking-tight mb-1 sm:mb-2">My Listings</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage and monitor all your listed properties in one place.</p>
        </div>

        <Link
          to="/list-property"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#062F26] text-white px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm hover:bg-brand-teal transition-all duration-300 shadow-lg shadow-[#062F26]/20 hover:shadow-brand-teal/30 hover:-translate-y-0.5 shrink-0"
        >
          <Icon icon="lucide:plus" className="w-4.5 h-4.5" />
          Add New Property
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
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
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Custom Status Dropdown */}
          <div className="flex-1 sm:flex-none sm:w-[150px] shrink-0">
            <CustomDropdown
              value={filterStatus === 'All' ? 'All Status' : filterStatus}
              options={filterOptions.map(opt => ({ label: opt === 'All' ? 'All Status' : opt, value: opt }))}
              onChange={setFilterStatus}
              buttonClassName="!border-slate-200 text-[#062F26] !font-bold h-[42px]"
            />
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
        <div className={viewType === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4! gap-4" : "flex flex-col gap-4"}>
          {filteredListings.map((rawListing) => {
            const title = rawListing.pgName || rawListing.societyName || rawListing.propertyCategory || 'Property';
            const type = rawListing.propertyType === 'PG' ? 'PG / Co-living' : 'Flat / Apartment';
            const location = rawListing.locality ? `${rawListing.locality}${rawListing.city ? `, ${rawListing.city}` : ''}` : '';
            let pgPrices = [];
            if (rawListing.propertyType === 'PG' && rawListing.pgPricing) {
              const pricingMap = {};
              Object.keys(rawListing.pgPricing).forEach(key => {
                const priceObj = rawListing.pgPricing[key];
                if (priceObj && priceObj.rentPerBed && Number(priceObj.rentPerBed) > 0) {
                  const type = key.split('_')[0]; // Single, Double, etc.
                  const currentRent = Number(priceObj.rentPerBed);
                  if (!pricingMap[type] || currentRent < pricingMap[type]) {
                    pricingMap[type] = currentRent;
                  }
                }
              });
              pgPrices = Object.keys(pricingMap).map(type => ({
                sharingType: type,
                rentPerBed: pricingMap[type]
              }));
            }
            
            const price = rawListing.propertyType === 'PG' 
              ? (pgPrices.length > 0 ? `₹${Math.min(...pgPrices.map(p => p.rentPerBed))} / month` : 'N/A')
              : (rawListing.monthlyRent ? `₹${rawListing.monthlyRent}` : 'N/A');
            const image = (rawListing.images && rawListing.images.length > 0) ? rawListing.images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';
            const addedOn = rawListing.createdAt ? new Date(rawListing.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown';
            const views = rawListing.views || 0;
            const leads = rawListing.leads || 0;
            const bookings = rawListing.bookings || 0;
            const status = rawListing.status || 'Pending';

            if (viewType === 'grid') {
              return (
                <div
                  key={rawListing._id}
                  onClick={() => setViewingPropertyId(rawListing._id)}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden group hover:border-brand-teal/30 hover:shadow-[0_12px_40px_rgba(10,168,125,0.08)] transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-35 w-full overflow-hidden shrink-0">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <div className="flex flex-col gap-1.5 text-slate-500 mb-2.5">
                      {rawListing.address && (
                        <div className="flex items-start gap-1.5">
                          <Icon icon="lucide:map" className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-teal/70" />
                          <p className="text-xs font-medium line-clamp-1" title={rawListing.address}>{rawListing.address}</p>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-start gap-1.5">
                          <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium line-clamp-1" title={location}>{location}</p>
                        </div>
                      )}
                      {!rawListing.address && !location && (
                        <div className="flex items-start gap-1.5">
                          <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium truncate">Unknown Location</p>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-slate-100 mb-2.5" />

                    <div className="flex items-center justify-between mt-auto mb-3">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 mb-0.5">{rawListing.propertyType === 'PG' ? 'Rent per bed' : 'Rent / Month'}</p>
                        {rawListing.propertyType === 'PG' && pgPrices.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {pgPrices.slice(0, 2).map((pgPrice, idx) => (
                              <span key={idx} className="flex items-center gap-1 bg-[#EAF5F2] text-[#062F26] px-1.5 py-0.5 rounded text-[10px] font-bold border border-brand-teal/20">
                                 <Icon icon={pgPrice.sharingType.toLowerCase().includes('single') ? "lucide:user" : "lucide:users"} className="w-3 h-3 text-brand-teal" />
                                 ₹{pgPrice.rentPerBed.toLocaleString('en-IN')} <span className="font-semibold text-brand-teal opacity-80 ml-0.5">{pgPrice.sharingType}</span>
                              </span>
                            ))}
                            {pgPrices.length > 2 && (
                              <span className="flex items-center bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                                +{pgPrices.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-[#062F26]">{price}</span>
                        )}
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
                      <div className="flex-1 flex items-center justify-center gap-1 border-r border-slate-200">
                        <Icon icon="lucide:message-square" className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700">{leads}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Leads</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-1">
                        <Icon icon="lucide:calendar-check" className="w-3.5 h-3.5 text-brand-teal" />
                        <span className="text-xs font-bold text-slate-700">{bookings}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Bookings</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
                      <button onClick={(e) => { e.stopPropagation(); setViewingPropertyId(rawListing._id); }} className="flex-1 cursor-pointer bg-white border border-slate-200 hover:border-brand-teal hover:bg-brand-teal/5 text-slate-600 hover:text-brand-teal py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingPropertyId(rawListing._id); }} className="flex-1 cursor-pointer bg-white border border-slate-200 hover:border-brand-teal hover:bg-brand-teal/5 text-slate-600 hover:text-brand-teal py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <Icon icon="lucide:edit" className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(rawListing._id); }} className="flex-1 bg-white border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-600 hover:text-red-600 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // ==========================================
            // COMPACT LIST VIEW LAYOUT
            // ==========================================
            return (
              <div
                key={rawListing._id}
                onClick={() => setViewingPropertyId(rawListing._id)}
                className="bg-white rounded-xl border border-slate-100 p-3 group hover:border-brand-teal/30 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
              >
                {/* Thumbnail & Core Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-20 shrink-0 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${status === 'Active' || status === 'Approved' ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-white'
                        }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider mb-0.5 block">{type}</span>
                    <h3 className="text-[15px] font-bold text-[#062F26] mb-1 truncate group-hover:text-brand-teal transition-colors">
                      {title}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-slate-500 mt-1.5">
                      {rawListing.address && (
                        <div className="flex items-start gap-1.5">
                          <Icon icon="lucide:map" className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-teal/70" />
                          <p className="text-xs font-medium line-clamp-1" title={rawListing.address}>{rawListing.address}</p>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-start gap-1.5">
                          <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium line-clamp-1" title={location}>{location}</p>
                        </div>
                      )}
                      {!rawListing.address && !location && (
                        <div className="flex items-start gap-1.5">
                          <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium truncate">Unknown Location</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Columns */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 px-2 sm:px-0">
                  {/* Price */}
                  <div className="w-24 shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">{rawListing.propertyType === 'PG' ? 'Rent per bed' : 'Rent / Month'}</p>
                    {rawListing.propertyType === 'PG' && pgPrices.length > 0 ? (
                      <div className="flex flex-col gap-1 mt-1">
                        {pgPrices.slice(0, 2).map((pgPrice, idx) => (
                          <span key={idx} className="flex items-center gap-1 bg-[#EAF5F2] text-[#062F26] px-1.5 py-0.5 rounded text-[10px] font-bold border border-brand-teal/20 w-fit">
                             <Icon icon={pgPrice.sharingType.toLowerCase().includes('single') ? "lucide:user" : "lucide:users"} className="w-3 h-3 text-brand-teal" />
                             ₹{pgPrice.rentPerBed.toLocaleString('en-IN')} <span className="font-semibold text-brand-teal opacity-80 ml-0.5">{pgPrice.sharingType}</span>
                          </span>
                        ))}
                        {pgPrices.length > 2 && (
                          <span className="flex items-center bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200 w-fit">
                            +{pgPrices.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-[#062F26]">{price}</p>
                    )}
                  </div>
                  
                  {/* Date */}
                  <div className="w-24 shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Added On</p>
                    <p className="text-xs font-bold text-slate-700">{addedOn}</p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50/50 border border-blue-100 rounded-lg" title="Views">
                      <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold text-blue-700">{views}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50/50 border border-orange-100 rounded-lg" title="Leads">
                      <Icon icon="lucide:message-square" className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-bold text-orange-700">{leads}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-lg" title="Bookings">
                      <Icon icon="lucide:calendar-check" className="w-3.5 h-3.5 text-brand-teal" />
                      <span className="text-xs font-bold text-brand-teal">{bookings}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-100 sm:pl-4 shrink-0 justify-end mt-2 sm:mt-0">
                  <button onClick={(e) => { e.stopPropagation(); setViewingPropertyId(rawListing._id); }} className="cursor-pointer w-8 h-8 rounded-lg text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 flex items-center justify-center transition-all" title="View">
                    <Icon icon="lucide:eye" className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingPropertyId(rawListing._id); }} className="cursor-pointer w-8 h-8 rounded-lg text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 flex items-center justify-center transition-all" title="Edit">
                    <Icon icon="lucide:edit" className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(rawListing._id); }} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all" title="Delete">
                    <Icon icon="lucide:trash-2" className="w-4 h-4" />
                  </button>
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

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <Icon icon="lucide:alert-triangle" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#062F26] mb-2">Delete Property</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete this property? This action cannot be undone and will permanently remove the listing and all its data.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerListings;
