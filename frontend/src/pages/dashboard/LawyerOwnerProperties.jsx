import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const LawyerOwnerProperties = () => {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewType, setViewType] = useState('grid');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [ownerId]);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`/api/properties/lawyer/owner/${ownerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Error fetching owner properties:", error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="animate-fadeIn max-w-[1400px] mx-auto pb-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-2">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/lawyer/owners')} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0 mt-0.5">
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26]">Owner's Properties</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">View and manage properties listed by this owner.</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-colors ${viewType === 'grid' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon icon="lucide:layout-grid" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-lg transition-colors ${viewType === 'list' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon icon="lucide:list" className="w-5 h-5" />
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

            return (
              <div key={rawListing._id} className={`bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex ${viewType === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>
                {/* Image Section */}
                <div className={`relative ${viewType === 'list' ? 'w-full sm:w-[280px] h-48 sm:h-auto shrink-0' : 'w-full h-52'} overflow-hidden`}>
                  <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      {type}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#062F26] text-lg leading-tight mb-1">{title}</h3>
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                        <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 mr-1" />
                        {location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Price</p>
                      <p className="font-bold text-brand-teal text-lg leading-none">{price}<span className="text-sm font-medium text-slate-500">/mo</span></p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Added On</p>
                      <p className="font-bold text-slate-700 text-sm leading-none">{addedOn}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link to={`/properties/${rawListing._id}`} className="flex-1 flex items-center justify-center gap-2 bg-[#062F26] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-teal transition-colors">
                      <Icon icon="lucide:eye" className="w-4 h-4" /> View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Icon icon="lucide:home" className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No properties found</h3>
          <p className="text-slate-500 text-sm font-medium max-w-md">This owner hasn't listed any active properties yet.</p>
        </div>
      )}
    </div>
  );
};

export default LawyerOwnerProperties;
