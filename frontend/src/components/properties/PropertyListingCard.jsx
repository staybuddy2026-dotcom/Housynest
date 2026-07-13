import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PropertyListingCard = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return (user.savedProperties || []).includes(String(property.id));
      }
    } catch (e) { }
    return false;
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsLiked((user.savedProperties || []).includes(String(property.id)));
        }
      } catch (e) { }
    };

    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, [property.id]);

  let userRole = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userRole = user.role;
    }
  } catch (e) { }

  const showFavoriteBtn = !userRole || userRole === 'tenant';

  const images = property.images || [property.image, property.image, property.image, property.image, property.image];

  const navigate = useNavigate();

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      toast.error('Login is required to add to favorites');
      navigate('/login');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId: String(property.id) })
      });

      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }

      const result = await response.json();

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.savedProperties = result.savedProperties;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('user-updated'));
      }

      if (newLikedState) {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      toast.error('Failed to update favorites');
    }
  };

  return (
    <Link to={`/properties/${property.id}`} className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_15px_40px_rgba(4,71,58,0.08)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col group h-full">
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden bg-slate-200">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0 relative overflow-hidden">
              <img
                src={img}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-110"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-80 pointer-events-none z-10"></div>


        {/* Top Left Badges: Type & Room Type */}
        <div className="absolute top-3 left-3 right-12 flex flex-row flex-wrap gap-1 z-10 items-start pointer-events-none">
          <div className="bg-[#062F26] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
            {property.type === 'PG' ? 'PG' : 'TENANT'}
          </div>
          {property.type !== 'PG' && (property.bhkType || (property.title && property.title.match(/(\d+\s*BHK)/i))) && (
            <div className="bg-[#0aa87d] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm truncate max-w-[90px] sm:max-w-none">
              {property.bhkType || property.title.match(/(\d+\s*BHK)/i)[0]}
            </div>
          )}
          {property.isVerified ? (
            <div className="bg-white text-[#062F26] text-[9px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 shrink-0">
              <Icon icon="lucide:shield-check" className="w-3 h-3 text-[#0aa87d] shrink-0" /> Verified
            </div>
          ) : (
            <div className="bg-white text-slate-500 text-[9px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 shrink-0">
              <Icon icon="lucide:shield-alert" className="w-3 h-3 text-amber-500 shrink-0" /> Not Verified
            </div>
          )}
        </div>

        {/* Favorite */}
        {showFavoriteBtn && (
          <button onClick={handleFavoriteClick} className="absolute top-3 right-3 md:w-7 md:h-7 w-8 h-8 cursor-pointer rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white text-white transition-colors z-10 group/fav">
            <Icon icon={isLiked ? "mdi:cards-heart" : "mdi:cards-heart-outline"} className={`w-5 h-5 md:w-4 md:h-4 transition-colors ${isLiked ? 'text-red-500' : 'text-white group-hover/fav:text-red-500'}`} />
          </button>
        )}

        {/* Verified & Pagination & Link icon */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
            <Icon icon="mdi:star" className="text-[#FABB05] w-3 h-3" />
            <span className="text-[#062F26] text-[10px] font-bold">{property.rating}</span>
            <span className="text-slate-500 text-[9px] font-medium">({property.reviews})</span>
          </div>

          <div className="flex items-center gap-1">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}></div>
            ))}
          </div>

          <button onClick={handleNextImage} className="w-7 h-7 cursor-pointer rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform active:scale-95">
            <Icon icon="lucide:arrow-right" className="w-4 h-4 text-slate-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-slate-900 font-bold text-lg mb-0.5 line-clamp-1">{property.title}</h3>
        <p className="text-slate-500 text-xs font-medium mb-3 line-clamp-1">
          {property.societyName ? `${property.societyName}, ` : ''}{property.location}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(Array.isArray(property.amenities) ? property.amenities : []).slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded border border-slate-200 text-slate-600 text-xs font-medium">
              {amenity}
            </span>
          ))}
          {(Array.isArray(property.amenities) ? property.amenities : []).length > 3 && (
            <span className=" py-0.5 underline text-slate-600 text-[10px] font-semibold cursor-pointer transition-colors">
              +{(Array.isArray(property.amenities) ? property.amenities : []).length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center border-t border-slate-200 pt-3 h-auto min-h-[54px] w-full">
          {property.type === 'PG' ? (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              {(property.rooms && property.rooms.length > 0 ? property.rooms.slice(0, 2) : [{ sharingType: 'Single', rentPerBed: property.price }, { sharingType: 'Double', rentPerBed: (parseInt(String(property.price).replace(/,/g, '') || 0) * 0.6) }]).map((room, idx) => (
                <div key={idx} className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 bg-[#EAF5F2] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors group-hover:bg-[#d8efe8] w-full">
                  <Icon icon={room.sharingType?.toLowerCase().includes('single') ? "lucide:user" : "lucide:users"} className="w-4 h-4 text-brand-teal stroke-[2.5] shrink-0" />
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-brand-teal leading-none">{room.sharingType?.split(' ')[0]}</span>
                    <span className="text-xs sm:text-xs font-bold text-[#062F26] leading-none truncate">₹{Number(room.rentPerBed || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[#062F26] font-bold text-base leading-none">₹{property.price}</span>
              <span className="text-slate-400 text-xs font-semibold">/month</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyListingCard;
