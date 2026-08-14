import React from 'react';
import { Icon } from '@iconify/react';

const TabOverview = ({ property, status, currentImageIndex, setCurrentImageIndex }) => {
  const isPG = property.propertyType === 'PG';

  // Calculate Beds
  let totalBeds = 0;
  let availableBeds = 0;
  if (property.propertyType === 'PG' && property.floors) {
    property.floors.forEach(floor => {
      if (floor.rooms) {
        floor.rooms.forEach(room => {
          if (room.beds) {
            totalBeds += room.beds.length;
            availableBeds += room.beds.filter(b => b.status === 'Vacant').length;
          }
        });
      }
    });
  } else if (property.propertyType !== 'PG') {
    totalBeds = property.bhkType ? parseInt(property.bhkType) : 1;
    availableBeds = status === 'Active' ? totalBeds : 0;
  }

  const occupiedBeds = totalBeds - availableBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Calculate Rent
  let displayRent = 'N/A';
  let pgPricesList = [];

  if (property.propertyType === 'PG' && property.pgPricing) {
    Object.entries(property.pgPricing).forEach(([key, value]) => {
      const price = Number(value.rentPerBed);
      if (!isNaN(price) && price > 0) {
        pgPricesList.push({
          type: key.replace('_', ' '),
          price: `₹${price.toLocaleString('en-IN')}`
        });
      }
    });

    if (pgPricesList.length > 0) {
      const prices = pgPricesList.map(p => Number(p.price.replace(/[^0-9]/g, '')));
      displayRent = `₹${Math.min(...prices).toLocaleString('en-IN')}`;
    }
  } else if (property.monthlyRent) {
    displayRent = `₹${Number(property.monthlyRent).toLocaleString('en-IN')}`;
  }

  const views = property.views || 0;
  const leadsGenerated = property.leads || 0;

  let estimatedRevenue = 0;
  if (property.propertyType === 'PG' && property.pgPricing) {
    const avgRent = Object.values(property.pgPricing).reduce((acc, p) => acc + (Number(p.rentPerBed) || 0), 0) / (Object.values(property.pgPricing).length || 1);
    estimatedRevenue = occupiedBeds * avgRent;
  } else if (property.monthlyRent && occupiedBeds > 0) {
    estimatedRevenue = Number(property.monthlyRent);
  }

  const formatRevenue = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const images = property.images || [];
  const mainImage = images.length > 0 ? images[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Row */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${isPG ? 'lg:grid-cols-7' : 'lg:grid-cols-5'} gap-3`}>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <span className="text-2xl font-bold text-[#062F26]">1</span>
            <Icon icon="lucide:building-2" className="w-5 h-5 text-brand-teal opacity-50" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Active Listings</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <span className="text-2xl font-bold text-[#062F26]">{views}</span>
            <Icon icon="lucide:eye" className="w-5 h-5 text-blue-500 opacity-50" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Total Views</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <span className="text-2xl font-bold text-[#062F26]">{leadsGenerated}</span>
            <Icon icon="lucide:users" className="w-5 h-5 text-orange-500 opacity-50" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Leads Generated</p>
        </div>

        {isPG && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                <span className="text-2xl font-bold text-[#062F26]">{totalBeds}</span>
                <Icon icon="lucide:bed" className="w-5 h-5 text-red-500 opacity-50" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Total Beds</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                <span className="text-2xl font-bold text-[#062F26]">{availableBeds}</span>
                <Icon icon="lucide:bed-double" className="w-5 h-5 text-brand-teal opacity-50" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Available Beds</p>
            </div>
          </>
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <span className="text-2xl font-bold text-[#062F26]">{isPG ? `${occupancyRate}%` : status}</span>
            <Icon icon="lucide:pie-chart" className="w-5 h-5 text-purple-500 opacity-50" />
          </div>
          <p className="text-xs font-semibold text-slate-500">{isPG ? 'Occupancy Rate' : 'Property Status'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <span className="text-2xl font-bold text-[#062F26]">{formatRevenue(estimatedRevenue)}</span>
            <Icon icon="lucide:indian-rupee" className="w-5 h-5 text-pink-500 opacity-50" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Monthly Revenue</p>
        </div>
      </div>

      {/* Property Details Grid - SINGLE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Media Section */}
          <div className="relative w-full h-[260px] sm:h-[400px] lg:h-[550px] bg-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0">
            {images.length > 0 ? (
              <>
                <img src={images[currentImageIndex].url || images[currentImageIndex]} alt="Property" className="w-full h-full object-cover transition-opacity duration-300" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all z-10 cursor-pointer"
                    >
                      <Icon icon="lucide:chevron-left" className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all z-10 cursor-pointer"
                    >
                      <Icon icon="lucide:chevron-right" className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center max-w-[90%] gap-1.5 z-10 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer shrink-0 ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80 w-2'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <img src={mainImage} alt="Property fallback" className="w-full h-full object-cover" />
            )}
          </div>

          {/* About Property (Description + USPs) */}
          {(property.description || property.uspText || property.usps?.length > 0 || property.customUsps?.length > 0) && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#062F26] mb-4">About Property</h3>
              {property.description && (
                <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">{property.description}</p>
              )}

              {/* What Makes This Property Unique */}
              {((property.usps && property.usps.length > 0) || (property.customUsps && property.customUsps.length > 0) || property.uspText) && (
                <>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon icon="lucide:star" className="w-4 h-4 text-brand-yellow" />
                    What Makes This Property Unique
                  </h4>
                  {property.uspText && <p className="text-sm text-slate-600 mb-3">{property.uspText}</p>}
                  <div className="flex flex-wrap gap-2">
                    {property.usps?.map((usp, i) => (
                      <span key={`usp-${i}`} className="bg-brand-yellow/10 text-brand-yellow px-3 py-1.5 rounded-lg text-xs font-bold">{usp}</span>
                    ))}
                    {property.customUsps?.map((cusp, i) => (
                      <span key={`cusp-${i}`} className="bg-brand-yellow/10 text-brand-yellow px-3 py-1.5 rounded-lg text-xs font-bold">{cusp}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Food Details (if PG) */}
          {property.propertyType === 'PG' && property.foodProvided && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#062F26] mb-4 flex items-center gap-2">
                <Icon icon="lucide:utensils" className="w-5 h-5 text-orange-500" />
                Food & Meals
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.vegNonVeg && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Food Type</p>
                    <p className="text-sm font-bold text-slate-700">{property.vegNonVeg}</p>
                  </div>
                )}
                {property.foodCharges && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Food Charges</p>
                    <p className="text-sm font-bold text-slate-700">{property.foodCharges}</p>
                  </div>
                )}
                {property.meals && property.meals.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-slate-400 mb-1">Meals Provided</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {property.meals.map((meal, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">{meal}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Amenities & Services for PG, or Society Amenities for others */}
          {property.propertyType === 'PG' ? (
            <>
              {/* Amenities */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-[#062F26] mb-4 shrink-0">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]" data-lenis-prevent="true">
                  {property.commonAmenities?.length > 0 ? property.commonAmenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 truncate">{amenity}</span>
                    </div>
                  )) : <p className="text-sm text-slate-500 col-span-2">No specific amenities listed.</p>}
                </div>
              </div>

              {/* Services */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-[#062F26] mb-4 shrink-0">Services & Facilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]" data-lenis-prevent="true">
                  {property.services?.length > 0 ? property.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:zap" className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 truncate">{service}</span>
                    </div>
                  )) : <p className="text-sm text-slate-500 col-span-2">No specific services listed.</p>}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Society Amenities */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-[#062F26] mb-4 shrink-0 flex items-center gap-2">
                  <Icon icon="lucide:trees" className="w-5 h-5 text-emerald-500" />
                  Society Amenities
                </h3>
                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]" data-lenis-prevent="true">
                  {property.societyAmenities?.length > 0 ? property.societyAmenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:check" className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{amenity}</span>
                    </div>
                  )) : <p className="text-sm text-slate-500">No society amenities listed.</p>}
                </div>
              </div>
            </>
          )}

          {/* Nearby Places */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-[#062F26] mb-4 shrink-0 flex items-center gap-2">
              <Icon icon="lucide:map-pin" className="w-5 h-5 text-blue-500" />
              Nearby Places
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]" data-lenis-prevent="true">
              {property.nearbyPlaces?.filter(p => p.place && p.distance).length > 0 ? (
                property.nearbyPlaces.filter(p => p.place && p.distance).map((place, idx) => (
                  <div key={idx} className="flex justify-between items-start sm:items-center gap-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <Icon icon="lucide:navigation" className="w-4 h-4 shrink-0" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 break-words">{place.place}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-md shrink-0 mt-1 sm:mt-0">{place.distance}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No nearby places added.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TabOverview;
