import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const MyListingsWidget = () => {
  const [listings, setListings] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoading(false);
          return;
        }
        const response = await fetch('/api/properties/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Map data to match the widget structure and limit to 4
          const mappedListings = data.slice(0, 4).map(p => {
            const title = p.pgName || p.propertyCategory || 'Property';
            const location = `${p.locality || ''}, ${p.city || ''}`.replace(/^, | , $/g, '');
            const price = p.propertyType === 'PG'
              ? `₹${p.rooms?.[0]?.rentPerBed || '0'} / month`
              : `₹${p.monthlyRent || '0'} / month`;
            const image = p.images && p.images.length > 0
              ? p.images[0].url
              : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';

            return {
              id: p._id,
              title,
              status: p.status || 'Active',
              location,
              price,
              views: p.views || 0,
              inquiries: p.inquiries || 0,
              bookings: p.bookings || 0,
              image
            };
          });
          setListings(mappedListings);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#062F26]">My Listings</h3>
        <Link to="/owner/listings" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
          View All Listings <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex flex-col p-2">
        {listings.map((listing) => (
          <div key={listing.id} className="flex items-center gap-4 p-3 hover:bg-[#F8F9FA] rounded-xl transition-colors group">
            <div className="w-25 h-17.5 rounded-lg overflow-hidden shrink-0">
              <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-[#062F26] truncate">{listing.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${listing.status === 'Active' ? 'bg-[#EAF5F2] text-brand-teal' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {listing.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
                <Icon icon="lucide:map-pin" className="w-3 h-3" />
                <span className="truncate">{listing.location}</span>
              </div>
              <p className="text-xs font-bold text-[#062F26]">{listing.price}</p>
            </div>
            <div className="flex items-center gap-6 shrink-0 text-center pr-4">
              <div className="flex flex-col items-center">
                <Icon icon="lucide:eye" className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-sm font-bold text-[#062F26] leading-none mb-0.5">{listing.views}</span>
                <span className="text-[10px] font-semibold text-slate-400">Views</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon icon="lucide:message-square" className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-sm font-bold text-[#062F26] leading-none mb-0.5">{listing.inquiries}</span>
                <span className="text-[10px] font-semibold text-slate-400">Inquiries</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon icon="lucide:calendar-check" className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-sm font-bold text-[#062F26] leading-none mb-0.5">{listing.bookings}</span>
                <span className="text-[10px] font-semibold text-slate-400">Bookings</span>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors">
              <Icon icon="lucide:more-horizontal" className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListingsWidget;
