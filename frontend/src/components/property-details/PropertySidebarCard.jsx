import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

const PropertySidebarCard = ({
  property,
  propertyType,
  pgRooms,
  selectedRoomIndex,
  setSelectedRoomIndex,
  basePrice,
  isFavorite,
  setIsFavorite,
  setIsShareModalOpen,
  setIsScheduleModalOpen,
  setIsReportModalOpen,
  setIsLeadModalOpen,
  setIsBookNowModalOpen,
  toast
}) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isTenantOrGuest = !user || user.role === 'tenant';
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-[32%]">
      <div className="bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-6  border border-slate-50">

        <div className="flex items-start justify-between mb-2">
          <div className="flex gap-2">
            <span className="bg-[#062F26] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm">{propertyType === 'PG' ? 'PG' : 'TENANT'}</span>
            <span className="bg-[#0aa87d] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm">
              {propertyType === 'PG' ? pgRooms[selectedRoomIndex].title : (property.bhkType || property.title?.match(/(\d+\s*BHK)/i)?.[1] || property.amenities?.[0] || 'Entire Place')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-75 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Share Property"
            >
              <Icon icon="lucide:share-2" className="w-4 h-4 stroke-[2.5]" />
            </button>
            {isTenantOrGuest && (
              <button
                onClick={async () => {
                  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                  if (!isAuthenticated) {
                    toast.error('Login is required to add to favorites');
                    navigate('/login');
                    return;
                  }

                  const newFavoriteState = !isFavorite;
                  setIsFavorite(newFavoriteState);

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

                    if (newFavoriteState) {
                      toast.success('Added to favorites');
                    } else {
                      toast.success('Removed from favorites');
                    }
                  } catch {
                    setIsFavorite(!newFavoriteState);
                    toast.error('Failed to update favorites');
                  }
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-75 ${isFavorite ? 'bg-[#FFE8E8] text-red-500 hover:bg-red-100 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Icon icon={isFavorite ? "mdi:heart" : "lucide:heart"} className={`w-5 h-5 transition-all duration-300 ${isFavorite ? 'scale-110 text-red-500' : 'scale-100 stroke-[2.5]'}`} />
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl xl:text-[28px] font-serif font-bold text-[#062F26] mb-2 leading-tight">
          {property.title}
        </h1>

        <div className="flex items-start gap-1.5 mb-3 text-slate-500 text-xs font-medium">
          <p className="leading-relaxed">{property.location}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`} target="_blank" rel="noopener noreferrer" className="text-brand-teal font-bold ml-1 hover:underline inline-flex items-center gap-1">
            <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            View on Map
          </a>
        </div>

        <div className="mb-4">
          {propertyType === 'PG' ? (
            <div className="flex flex-col gap-2.5 mb-3">
              {pgRooms.map((room, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRoomIndex(idx)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg border transition-all duration-300 cursor-pointer ${selectedRoomIndex === idx
                    ? 'bg-[#EAF5F2]/50 border-brand-teal/40 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-brand-teal/20 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-4.5 h-4.5 rounded-full border-2 transition-colors ${selectedRoomIndex === idx ? 'border-brand-teal' : 'border-slate-300'
                      }`}>
                      {selectedRoomIndex === idx && <div className="w-2.5 h-2.5 rounded-full bg-brand-teal" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedRoomIndex === idx ? 'text-[#062F26]' : 'text-slate-600'}`}>
                      {room.title}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold ${selectedRoomIndex === idx ? 'text-brand-teal' : 'text-slate-600'}`}>
                      ₹{room.rent}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">/ mo</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-3xl font-bold text-[#062F26]">₹{property.price}</span>
                <span className="text-sm font-semibold text-slate-500">/ Month</span>
              </div>
              {property.maintenanceCharges && property.maintenanceCharges !== '0' && (
                <p className="text-xs font-semibold text-slate-500">
                  + ₹{property.maintenanceCharges} Maintenance
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-slate-100/60 bg-slate-50/50 rounded-lg p-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Security Deposit</p>
            <div className='flex items-center gap-1'>
              <p className="text-sm font-bold text-[#062F26]">₹{propertyType === 'PG' ? pgRooms[selectedRoomIndex].deposit : Math.floor(basePrice * 2).toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-semibold text-slate-400 ">(Refundable)</p>
            </div>
          </div>
          <div className="border border-slate-100/60 bg-slate-50/50 rounded-lg p-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Available From</p>
            <p className="text-sm font-bold text-[#062F26]">
              {property.availableDate
                ? new Date(property.availableDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : (propertyType === 'PG' ? 'Immediately' : 'Contact Owner')}
            </p>
          </div>
        </div>

        {propertyType === 'PG' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-3 border border-slate-100/60 bg-slate-50/50 rounded-lg p-2.5 transition-all hover:border-brand-teal/30 hover:bg-slate-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Icon icon="lucide:bed" className="w-4 h-4 text-brand-teal stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Beds</p>
                <p className="text-sm font-bold text-[#062F26] leading-none">{pgRooms[selectedRoomIndex].totalBeds}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-slate-100/60 bg-slate-50/50 rounded-lg p-2.5 transition-all hover:border-brand-teal/30 hover:bg-slate-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Icon icon="lucide:user-check" className="w-4 h-4 text-brand-teal stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Available Beds</p>
                <p className="text-sm font-bold text-[#062F26] leading-none">{pgRooms[selectedRoomIndex].available}</p>
              </div>
            </div>
          </div>
        )}

        {propertyType !== 'PG' && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-3 border border-slate-100/60 bg-slate-50/50 rounded-lg p-2.5 transition-all hover:border-brand-teal/30 hover:bg-slate-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Icon icon="lucide:scaling" className="w-4 h-4 text-brand-teal stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Built-up Area</p>
                <p className="text-sm font-bold text-[#062F26] leading-none">{property.builtUpArea ? `${property.builtUpArea} sq.ft.` : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-slate-100/60 bg-slate-50/50 rounded-lg p-2.5 transition-all hover:border-brand-teal/30 hover:bg-slate-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Icon icon="lucide:scaling" className="w-4 h-4 text-brand-teal stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Carpet Area</p>
                <p className="text-sm font-bold text-[#062F26] leading-none">{property.carpetArea ? `${property.carpetArea} sq.ft.` : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}



        {isTenantOrGuest && (
          <>
            <div className="flex flex-col gap-2.5">
              {/* PRIMARY BOOK NOW BUTTON */}
              <button
                onClick={() => {
                  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                  if (!isAuthenticated) {
                    toast.error('Login is required to book a property');
                    navigate('/login');
                    return;
                  }
                  if (setIsBookNowModalOpen) {
                    setIsBookNowModalOpen(true);
                  }
                }}
                className="w-full cursor-pointer bg-gradient-to-r from-[#062F26] via-[#08483B] to-[#0AA87D] hover:from-[#08483B] hover:to-[#098b68] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm tracking-wide transition-all duration-300 flex justify-center items-center gap-2.5 shadow-[0_8px_25px_rgba(10,168,125,0.25)] hover:shadow-[0_12px_30px_rgba(10,168,125,0.35)] transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Icon icon="lucide:zap" className="w-4.5 h-4.5 text-emerald-300" />
                Book Now {propertyType === 'PG' ? '• Reserve Bed' : '• Reserve Property'}
              </button>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full cursor-pointer bg-white hover:bg-slate-50 text-[#062F26] border-2 border-[#062F26] py-3 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 shadow-xs"
              >
                <Icon icon="lucide:calendar-check" className="w-4 h-4" />
                Schedule Visit
              </button>
              <a
                href={property?.owner?.phone ? `tel:${property.owner.phone}` : '#'}
                onClick={(e) => {
                  if (!property?.owner?.phone) {
                    e.preventDefault();
                    toast.error('Owner phone number not available');
                  }
                }}
                className="w-full cursor-pointer bg-[#062F26] hover:bg-[#0a473a] text-white py-3 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 shadow-sm"
              >
                <Icon icon="lucide:phone" className="w-4 h-4" />
                Contact Owner
              </a>
              <button
                onClick={() => {
                  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                  if (!isAuthenticated) {
                    toast.error('Login is required to send an lead');
                    navigate('/login');
                    return;
                  }
                  setIsLeadModalOpen(true);
                }}
                className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2"
              >
                <Icon icon="lucide:message-circle-question" className="w-4 h-4" />
                Send Lead
              </button>
            </div>

            {/* Report Section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Any concerns about this listing? <br />
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-red-600 font-bold hover:underline transition-colors mt-0.5 cursor-pointer inline-flex items-center gap-1"
                >
                  Report it to our team.
                </button>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PropertySidebarCard;
