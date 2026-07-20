import { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import PropertyListingCard from '../properties/PropertyListingCard';


// import { MOCK_PROPERTIES } from '../../data/mockProperties';

// We will fetch properties from the backend API

const FeaturedProperties = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties');
        if (res.ok) {
          const data = await res.json();
          const mappedProperties = data.slice(0, 8).map(p => ({
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
            rooms: p.rooms || []
          }));
          setProperties(mappedProperties); // Top 8 properties mapped
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-340 3xl:max-w-420 mx-auto w-full pt-12 sm:pt-16 px-4 sm:px-6 xl:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex flex-col">
          <h2 className="text-[22px] sm:text-2xl font-serif md:text-3xl font-bold text-[#04473a] flex items-center gap-2 sm:gap-3">
            Featured Properties
            <Icon icon="lucide:building-2" className="text-brand-yellow w-6 h-6 sm:w-7 sm:h-7" />
          </h2>
          <div className="relative mt-3 w-28 flex items-center">
            <div className="w-full h-[3px] bg-[#04473a] rounded-full"></div>
            <div className="absolute left-0 w-[60%] h-[3px] bg-[#04473a] rounded-full"></div>
            <div className="absolute left-[50%] w-2.5 h-2.5 rounded-full ring-[3px] ring-[#04473a] bg-brand-yellow shadow-sm"></div>
          </div>
        </div>

        <button className="group relative overflow-hidden hidden sm:flex items-center justify-center cursor-pointer px-6 py-2.5 rounded-md border border-gray-200 text-[#04473a] font-bold text-sm hover:border-[#04473a] hover:bg-teal-50 transition-all shadow-sm">
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="absolute left-4 -translate-x-[150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out"
          />
          <span className="transform group-hover:translate-x-5 transition-transform duration-500 ease-out">
            View All Properties
          </span>
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="ml-2 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out"
          />
        </button>
      </div>

      {/* Slider Area */}
      <div className="relative group/slider">

        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className={`absolute cursor-pointer left-[-40px] top-[40%] z-20 w-12 h-12 rounded-full bg-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] flex items-center justify-center text-slate-700 hover:text-[#04473a] hover:scale-110 transition-all duration-300 ${!canScrollLeft ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-0 xl:group-hover/slider:opacity-100'}`}
        >
          <Icon icon="lucide:chevron-left" width="24" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className={`absolute cursor-pointer right-[-32px] top-[40%] z-20 w-12 h-12 rounded-full bg-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] flex items-center justify-center text-slate-700 hover:text-[#04473a] hover:scale-110 transition-all duration-300 ${!canScrollRight ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-0 xl:group-hover/slider:opacity-100'}`}
        >
          <Icon icon="lucide:chevron-right" width="24" />
        </button>

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-3 sm:gap-5 pb-8 sm:pb-12 pt-4 px-4 mx-0 sm:px-6 xl:mx-0 xl:px-0 hide-scrollbar snap-x snap-mandatory"
        >
          {loading ? (
            <div className="w-full py-12 flex justify-center text-slate-500">
              <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
          ) : properties.length > 0 ? (
            properties.map(property => (
              <div key={property._id || property.id} className="snap-start shrink-0 w-[270px] sm:w-[260px] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.33px)] xl:w-[calc(25%-15px)]">
                <PropertyListingCard property={property} />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center text-slate-500 font-medium">
              No featured properties available at the moment.
            </div>
          )}
        </div>
      </div>

      {/* Mobile only View All button */}
      <div className="mt-0 sm:mt-2 flex sm:hidden justify-center pb-6">
        <button className="group relative overflow-hidden flex items-center justify-center cursor-pointer px-6 py-3 rounded-md border border-gray-200 text-[#04473a] font-bold text-sm hover:border-[#04473a] hover:bg-teal-50 transition-all w-full shadow-sm">
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="absolute left-[30%] -translate-x-[150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out"
          />
          <span className="transform group-hover:translate-x-3 transition-transform duration-500 ease-out">
            View All Properties
          </span>
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="ml-2 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out"
          />
        </button>
      </div>
    </section>
  );
};

export default FeaturedProperties;
