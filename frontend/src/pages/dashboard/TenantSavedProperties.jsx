import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { MOCK_PROPERTIES } from '../../data/mockProperties';
import PropertyListingCard from '../../components/properties/PropertyListingCard';

const TenantSavedProperties = () => {
  const [activeFilter, setActiveFilter] = useState('All Properties');
  const [savedPropertiesList, setSavedPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Recently Saved');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sort-dropdown')) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateSavedProperties = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setSavedPropertiesList([]);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/properties/saved', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedProperties = data.map(property => ({
            ...property,
            id: property._id,
            title: property.pgName || (property.bhkType ? `${property.bhkType} ${property.propertyCategory}` : property.propertyCategory) || 'Property',
            type: property.propertyType,
            category: property.propertyCategory,
            societyName: property.societyName,
            location: `${property.locality || ''}, ${property.city || ''}`.replace(/^, | , $/g, ''),
            price: (property.monthlyRent || '0').toString(),
            image: property.images && property.images.length > 0 ? property.images[0].url : null,
            images: property.images && property.images.length > 0 ? property.images.map(img => img.url) : [],
            isVerified: property.isVerified || false,
            rating: property.rating || '4.5',
            reviews: property.views || 0,
            amenities: [
              ...(property.societyAmenities || []),
              ...(property.commonAmenities || []),
              ...(property.services || [])
            ]
          }));

          const userStr = localStorage.getItem('user');
          let mockSaved = [];
          if (userStr) {
            const user = JSON.parse(userStr);
            const savedIds = user.savedProperties || [];
            mockSaved = MOCK_PROPERTIES.filter(p => savedIds.includes(String(p.id)));
          }

          setSavedPropertiesList([...mappedProperties, ...mockSaved]);
        } else {
          setSavedPropertiesList([]);
        }
      } catch (error) {
        console.error("Failed to fetch saved properties", error);
        setSavedPropertiesList([]);
      } finally {
        setLoading(false);
      }
    };

    updateSavedProperties();
    window.addEventListener('user-updated', updateSavedProperties);
    return () => window.removeEventListener('user-updated', updateSavedProperties);
  }, []);


  const filters = [
    { name: 'All Properties', count: savedPropertiesList.length },
    { name: 'PG', count: savedPropertiesList.filter(p => p.type === 'PG').length },
    { name: 'Tenant', count: savedPropertiesList.filter(p => p.type === 'Home').length },
  ];

  const displayedProperties = activeFilter === 'All Properties'
    ? savedPropertiesList
    : savedPropertiesList.filter(p => p.type === (activeFilter === 'Tenant' ? 'Home' : activeFilter));

  return (
    <div className="animate-fadeIn max-w-340 3xl:max-w-420 mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="lucide:heart" className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] tracking-tight mb-0.5">Saved Properties</h1>
            <p className="text-sm font-medium text-slate-500">Your favorite PGs and properties, all in one place.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Custom Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm ${isSortDropdownOpen ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
            >
              <Icon icon="lucide:arrow-down-up" className="w-3.5 h-3.5 text-slate-400" />
              {sortOption}
              <Icon icon="lucide:chevron-down" className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {['Recently Saved', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortOption(opt);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-xs font-bold transition-colors text-left ${sortOption === opt
                      ? 'bg-[#062F26]/5 text-[#062F26]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {sortOption === opt && <Icon icon="lucide:check" className="w-3.5 h-3.5 mr-2 text-[#062F26]" />}
                    <span className={sortOption === opt ? '' : 'ml-5'}>{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded-xl text-slate-400 bg-white hover:bg-slate-50 hover:text-brand-teal transition-all shadow-sm">
            <Icon icon="lucide:sliders-horizontal" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setActiveFilter(filter.name)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${activeFilter === filter.name
              ? 'bg-[#062F26] border-[#062F26] text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
          >
            {filter.name}
            <span className={`px-2 py-0.5 rounded-md text-xs flex items-center justify-center min-w-6 ${activeFilter === filter.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 mb-8">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-medium">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-4" />
            Loading your saved properties...
          </div>
        ) : displayedProperties.length > 0 ? (
          displayedProperties.map((property) => (
            <div key={property.id} className="transition-transform duration-300 hover:-translate-y-1">
              <PropertyListingCard property={property} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner">
            <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4 border border-slate-200">
              <Icon icon="lucide:heart-crack" className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-[#062F26] mb-2">No Saved Properties</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-6">
              You haven't saved any {activeFilter !== 'All Properties' ? activeFilter.toLowerCase() : ''} properties yet. Start browsing and click the heart icon to save your favorites!
            </p>
            <button className="px-6 py-2.5 bg-[#062F26] hover:bg-[#05261e] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Explore Properties
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {displayedProperties.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500 font-medium">Showing <strong className="text-slate-800">1 to {displayedProperties.length}</strong> of {displayedProperties.length} properties</p>
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors shadow-sm">
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#062F26] text-white font-bold text-sm shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors shadow-sm">
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSavedProperties;
