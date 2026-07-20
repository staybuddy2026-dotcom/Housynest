import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import loginImg from '../assets/aboutmain.png';
import PropertiesFilter from '../components/properties/PropertiesFilter';
import PropertiesGrid from '../components/properties/PropertiesGrid';

// Removed MOCK_PROPERTIES

const Properties = () => {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);

  const initialLocationQuery = searchParams.get('search') || searchParams.get('location') || '';
  const initialType = searchParams.get('type') || 'Both';
  const initialOccupancy = searchParams.get('occupancy') || '';
  const initialPgFor = searchParams.get('pgFor') || '';
  const initialTenants = searchParams.get('tenants') || '';

  let initialBudgetRange = 'Any';
  const priceQuery = searchParams.get('price');
  if (priceQuery) {
    if (priceQuery === 'Under ₹5,000' || priceQuery === '₹5,000 - ₹10,000') initialBudgetRange = '₹0 - ₹10K';
    else if (priceQuery === '₹10,000 - ₹15,000' || priceQuery === '₹15,000 - ₹20,000') initialBudgetRange = '₹10K - ₹20K';
    else if (priceQuery === 'Above ₹20,000') initialBudgetRange = '₹20K+';
  }

  const [searchQuery, setSearchQuery] = useState(initialLocationQuery);
  const [propertyFor, setPropertyFor] = useState(initialType);
  const [propertyType, setPropertyType] = useState('');
  const [roomType, setRoomType] = useState(initialOccupancy);
  const [budgetRange, setBudgetRange] = useState(initialBudgetRange);
  const [pgForFilter, setPgForFilter] = useState(initialPgFor);
  const [tenantsFilter, setTenantsFilter] = useState(initialTenants);
  const [amenitiesFilter, setAmenitiesFilter] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode] = useState('Grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const loaderRef = useRef(null);

  const [dbProperties, setDbProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties');
        if (res.ok) {
          const data = await res.json();
          // Filter to approved ones? The backend endpoint '/api/properties' might return all. 
          // If you only want approved ones, maybe check `p.isApproved === 'approved'`
          const mappedProperties = data.map(p => ({
            id: p._id,
            title: p.pgName || (p.bhkType ? `${p.bhkType} ${p.propertyCategory}` : p.propertyCategory) || 'Property',
            type: p.propertyType,
            bhkType: p.bhkType,
            societyName: p.societyName,
            location: `${p.locality || ''}, ${p.city || ''}`.replace(/^, | , $/g, ''),
            price: (p.monthlyRent || '0').toString(),
            gender: p.preferredGender || 'Anyone',
            roomType: p.rooms && p.rooms.length > 0 ? p.rooms[0].sharingType : '',
            rating: p.rating || '4.5',
            reviews: p.views || 0,
            image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
            images: p.images && p.images.length > 0 ? p.images.map(img => img.url) : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'],
            amenities: p.societyAmenities?.length > 0 ? p.societyAmenities : (p.commonAmenities?.length > 0 ? p.commonAmenities : []),
            isVerified: p.isVerified || false,
            category: p.propertyCategory || '',
            rooms: p.rooms || [],
            vegNonVeg: p.vegNonVeg || ''
          }));
          setDbProperties(mappedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Derive active filters dynamically
  const activeFilters = [];
  if (searchQuery) activeFilters.push(`Search: ${searchQuery}`);
  if (propertyFor !== 'Both') activeFilters.push(propertyFor);
  if (propertyType) activeFilters.push(propertyType);
  if (roomType) activeFilters.push(roomType);
  if (budgetRange !== 'Any') activeFilters.push(budgetRange);
  if (pgForFilter && pgForFilter !== 'Both') activeFilters.push(`For ${pgForFilter}`);
  if (tenantsFilter && tenantsFilter !== 'Both') activeFilters.push(`Tenants: ${tenantsFilter}`);
  if (amenitiesFilter) activeFilters.push(amenitiesFilter);
  if (foodPreference && foodPreference !== 'Any') activeFilters.push(`Food: ${foodPreference}`);
  if (verifiedOnly) activeFilters.push('Verified Only');

  const handleRemoveFilter = (filterToRemove) => {
    if (filterToRemove.startsWith('Search: ')) setSearchQuery('');
    if (filterToRemove === 'PG' || filterToRemove === 'Tenant') setPropertyFor('Both');
    if (filterToRemove === propertyType) setPropertyType('');
    if (filterToRemove === roomType) setRoomType('');
    if (filterToRemove === budgetRange) setBudgetRange('Any');
    if (filterToRemove.startsWith('For ')) setPgForFilter('');
    if (filterToRemove.startsWith('Tenants: ')) setTenantsFilter('');
    if (filterToRemove === amenitiesFilter) setAmenitiesFilter('');
    if (filterToRemove.startsWith('Food: ')) setFoodPreference('');
    if (filterToRemove === 'Verified Only') setVerifiedOnly(false);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setPropertyFor('Both');
    setPropertyType('');
    setRoomType('');
    setBudgetRange('Any');
    setAmenitiesFilter('');
    setFoodPreference('');
    setVerifiedOnly(false);
  };

  // Filter properties logic
  const filteredProperties = dbProperties.filter(property => {
    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!property.title.toLowerCase().includes(q) && !property.location.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Verified
    if (verifiedOnly && !property.isVerified) return false;

    // Property For (PG vs Tenant)
    if (propertyFor !== 'Both' && property.type !== propertyFor) return false;

    // Property Type (Villa, Flat, etc.)
    if (propertyType && !property.title.toLowerCase().includes(propertyType.toLowerCase()) && !property.category.toLowerCase().includes(propertyType.toLowerCase())) return false;

    // Budget Range
    const price = parseInt(property.price.replace(/,/g, ''), 10);
    if (budgetRange === '₹0 - ₹10K' && price > 10000) return false;
    if (budgetRange === '₹10K - ₹20K' && (price < 10000 || price > 20000)) return false;
    if (budgetRange === '₹20K+' && price <= 20000) return false;

    // PG For (Gender)
    if (pgForFilter && pgForFilter !== 'Both' && property.gender !== 'Anyone' && property.gender !== pgForFilter) return false;

    // Preferred Tenants
    // Assuming backend returns this in some field, or we just map it loosely. If not available on property, we skip strict filtering.
    // We'll skip strict filtering if the property doesn't have a preferred tenants field, to avoid hiding everything.

    // Amenities & Room Type
    if (amenitiesFilter && (!property.amenities || !property.amenities.includes(amenitiesFilter))) return false;
    // Room type (occupancy)
    if (roomType && property.roomType !== roomType && (!property.amenities || !property.amenities.includes(roomType))) return false;

    // Food Preference
    if (foodPreference && foodPreference !== 'Any') {
      if (property.vegNonVeg && property.vegNonVeg !== 'Both' && property.vegNonVeg !== foodPreference) return false;
    }

    return true;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price_low') {
      return parseInt(a.price.replace(/,/g, ''), 10) - parseInt(b.price.replace(/,/g, ''), 10);
    }
    if (sortBy === 'price_high') {
      return parseInt(b.price.replace(/,/g, ''), 10) - parseInt(a.price.replace(/,/g, ''), 10);
    }
    if (sortBy === 'rating') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    return 0;
  });

  // Visible Properties
  const displayedProperties = sortedProperties.slice(0, visibleCount);

  // Reset visible count when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(12);
  }, [searchQuery, propertyFor, propertyType, roomType, budgetRange, amenitiesFilter, foodPreference, verifiedOnly, sortBy]);

  // Infinite Scroll Observer
  useEffect(() => {
    const currentLoader = loaderRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredProperties.length) {
        // Add a slight artificial delay for a realistic "loading" feel (optional)
        setTimeout(() => setVisibleCount((prev) => prev + 12), 300);
      }
    }, { threshold: 0.1, rootMargin: '100px' });

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [visibleCount, filteredProperties.length]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">

      {/* Hero Section */}
      <div className="relative w-full h-60 lg:h-70">
        <img src={loginImg} alt="Hero" className="w-full h-full object-cover brightness-[0.85] opacity-90" />
        <div className="absolute inset-0 bg-linear-to-b from-[#F8F9FA]/5 via-[#F8F9FA]/10 to-[#F8F9FA]"></div>

        <div className="absolute inset-0 pt-10 px-4 sm:px-6 xl:px-0">
          <div className="max-w-340 3xl:max-w-420 mx-auto">
            <div className="flex items-center text-xs font-semibold text-brand-teal mb-4">
              <span className="hover:underline cursor-pointer">Home</span>
              <Icon icon="lucide:chevron-right" className="mx-1 w-3 h-3 text-slate-400" />
              <span className="text-slate-600">All Properties</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#062F26] mb-2">All Properties</h1>
            <p className="text-slate-600 text-sm font-medium">Explore verified PGs and homes across India.</p>
          </div>
        </div>
      </div>

      <div className="max-w-340 3xl:max-w-420 mx-auto px-4 sm:px-6 xl:px-0 -mt-8 sm:-mt-16 lg:-mt-24 relative flex flex-col lg:flex-row gap-6">

        {/* Left Sidebar - Filters */}
        <PropertiesFilter
          propertyFor={propertyFor} setPropertyFor={setPropertyFor}
          propertyType={propertyType} setPropertyType={setPropertyType}
          roomType={roomType} setRoomType={setRoomType}
          budgetRange={budgetRange} setBudgetRange={setBudgetRange}
          amenitiesFilter={amenitiesFilter} setAmenitiesFilter={setAmenitiesFilter}
          foodPreference={foodPreference} setFoodPreference={setFoodPreference}
          verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
          isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}
        />

        {/* Right Area - Properties */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 lg:p-6 mb-4 flex flex-col gap-4">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full flex-1 group">
                <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal transition-colors w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by locality, city or landmark..."
                  className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-md py-2.5 pl-9 pr-4 text-sm outline-none focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 font-medium placeholder:text-slate-400 transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                {/* Filters Button (Mobile/Tablet) */}
                <div
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 border border-slate-200 rounded-md px-4 py-2 bg-white cursor-pointer hover:border-brand-teal hover:shadow-sm transition-all group"
                >
                  <Icon icon="lucide:sliders-horizontal" className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-teal transition-colors" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-brand-teal transition-colors">Filters</span>
                </div>

                <div className="relative">
                  <div
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 border border-slate-200 rounded-md px-4 py-2 bg-white cursor-pointer hover:border-brand-teal hover:shadow-sm transition-all group"
                  >
                    <Icon icon="lucide:arrow-up-down" className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-teal transition-colors" />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-brand-teal transition-colors">
                      {sortBy === 'price_low' ? 'Price: Low to High' : sortBy === 'price_high' ? 'Price: High to Low' : sortBy === 'rating' ? 'Highest Rating' : 'Sort By'}
                    </span>
                    <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-teal transition-colors" />
                  </div>

                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 z-50 py-2 overflow-hidden transform origin-top transition-all duration-200">
                        <div
                          onClick={() => { setSortBy(''); setIsSortOpen(false); }}
                          className={`px-4 py-2.5 text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors ${sortBy === '' ? 'text-brand-teal bg-teal-50/50' : 'text-slate-600'}`}
                        >
                          Default
                        </div>
                        <div
                          onClick={() => { setSortBy('price_low'); setIsSortOpen(false); }}
                          className={`px-4 py-2.5 text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors ${sortBy === 'price_low' ? 'text-brand-teal bg-teal-50/50' : 'text-slate-600'}`}
                        >
                          Price: Low to High
                        </div>
                        <div
                          onClick={() => { setSortBy('price_high'); setIsSortOpen(false); }}
                          className={`px-4 py-2.5 text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors ${sortBy === 'price_high' ? 'text-brand-teal bg-teal-50/50' : 'text-slate-600'}`}
                        >
                          Price: High to Low
                        </div>
                        <div
                          onClick={() => { setSortBy('rating'); setIsSortOpen(false); }}
                          className={`px-4 py-2.5 text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors ${sortBy === 'rating' ? 'text-brand-teal bg-teal-50/50' : 'text-slate-600'}`}
                        >
                          Highest Rating
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filters & Count */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 pt-1">
              <p className="text-slate-600 text-xs font-medium whitespace-nowrap md:border-r border-slate-200 md:pr-3 block">
                Showing <span className="font-bold text-brand-teal">{filteredProperties.length}</span> properties
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, idx) => (
                  <span key={idx} onClick={() => handleRemoveFilter(filter)} className="group flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-full border border-slate-200 hover:border-red-200 cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm">
                    {filter}
                    <div className="bg-slate-200 group-hover:bg-red-200 rounded-full p-0.5 transition-colors">
                      <Icon icon="lucide:x" className="w-2 h-2 text-slate-500 group-hover:text-red-600" />
                    </div>
                  </span>
                ))}
                {activeFilters.length > 0 && (
                  <button onClick={clearAllFilters} className="text-brand-teal text-xs font-bold ml-1 cursor-pointer hover:text-[#062F26] flex items-center gap-1 transition-colors px-2 py-1 rounded-full hover:bg-teal-50 border border-transparent hover:border-teal-100">
                    <Icon icon="lucide:trash-2" className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full lg:w-auto h-full overflow-y-auto custom-scrollbar pr-0 lg:pr-4">

            {loading ? (
              <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-slate-100 h-[60vh]">
                <div className="w-24 h-24 bg-[#EAF5F2] rounded-full flex items-center justify-center mb-6">
                  <Icon icon="lucide:search-x" className="w-12 h-12 text-brand-teal" />
                </div>
                <h3 className="text-xl font-bold text-[#062F26] mb-3">No Properties Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  We couldn't find any properties matching your current filters. Try adjusting your search criteria or explore other options.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-8 px-8 py-3 bg-brand-teal text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-[#062F26] transition-colors hover:shadow-lg hover:shadow-brand-teal/20"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <PropertiesGrid
                properties={displayedProperties}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onClearFilters={clearAllFilters}
              />
            )}

            {/* Infinite Scroll Loader Trigger */}
            {visibleCount < filteredProperties.length && (
              <div ref={loaderRef} className="w-full flex justify-center items-center py-8">
                <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin" />
              </div>
            )}

            {visibleCount >= filteredProperties.length && filteredProperties.length > 0 && (
              <div className="w-full text-center py-8">
                <p className="text-slate-400 text-sm font-medium">You've reached the end of the list!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Properties;
