import { useState } from 'react';
import { Icon } from '@iconify/react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  const num = Number(String(amount).replace(/\D/g, ''));
  if (isNaN(num) || num === 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

const AdminPropertyViewModal = ({ property, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!property) return null;

  const isPg = property.propertyType === 'PG';

  // Extract active PG Pricing options
  const activePgPricing = isPg && property.pgPricing
    ? Object.entries(property.pgPricing).filter(([_, val]) => val && val.rentPerBed && Number(String(val.rentPerBed).replace(/\D/g, '')) > 0)
    : [];

  // Filter valid nearby places
  const validNearbyPlaces = property.nearbyPlaces
    ? property.nearbyPlaces.filter(p => p && (p.place || p.name || typeof p === 'string'))
    : [];

  // Combine services and amenities
  const allServices = [...(property.services || []), ...(property.extraServices || [])];
  const allCommonAmenities = [...(property.commonAmenities || []), ...(property.extraCommonAmenities || [])];
  const allRules = [...(property.pgRules || []), ...(property.extraRules || [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPg ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}>
              {property.propertyType}
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-[#062F26] leading-tight">
                {property.pgName || property.societyName || property.propertyCategory || 'Property Details'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
                <span>ID: {property._id}</span>
                <span>•</span>
                <span>Posted by {property.postingAs || 'Owner'}</span>
                <span>•</span>
                <span>{new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {property.isVerified ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                <Icon icon="lucide:shield-check" className="w-4 h-4 text-emerald-600" />
                Verified Listing
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold inline-flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-4 h-4 text-amber-500" />
                Unverified
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <Icon icon="lucide:x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-2 pb-3 border-b border-slate-100 bg-white relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'overview', label: 'Overview & Location', icon: 'lucide:map-pin' },
              { id: 'details', label: isPg ? 'PG Pricing & Rooms' : 'Property Specs & Rent', icon: isPg ? 'lucide:bed' : 'lucide:building' },
              { id: 'amenities', label: 'Food, Amenities & Rules', icon: 'lucide:sparkles' },
              { id: 'media', label: `Media & Docs (${(property.images?.length || 0) + (property.verificationDocs?.length || 0)})`, icon: 'lucide:image' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer border ${activeTab === tab.id
                  ? 'bg-emerald-50 border-emerald-200 text-[#062F26] shadow-sm ring-1 ring-emerald-500/10'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                <Icon icon={tab.icon} className={`w-4 h-4 transition-colors ${activeTab === tab.id ? 'text-[#0AA87D]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">

          {/* TAB 1: OVERVIEW & LOCATION */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Landlord Profile */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Icon icon="lucide:user-check" className="w-4 h-4 text-brand-teal" />
                  Landlord / Owner Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-xs">Full Name</span>
                    <span className="font-bold text-slate-800 text-sm">{property.owner?.fullName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-xs">Phone Number</span>
                    <a href={`tel:${property.owner?.phone}`} className="font-bold text-brand-teal text-sm hover:underline flex items-center gap-1">
                      <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                      {property.owner?.phone || 'N/A'}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-xs">Email Address</span>
                    <a href={`mailto:${property.owner?.email}`} className="font-semibold text-slate-700 text-sm hover:underline flex items-center gap-1">
                      <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-slate-400" />
                      {property.owner?.email || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              {/* General Info */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Icon icon="lucide:home" className="w-4 h-4 text-brand-teal" />
                  General Listing Info
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Property Type</span>
                    <span className="font-semibold text-slate-800 text-sm">{property.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Category</span>
                    <span className="font-semibold text-slate-800 text-sm">{property.propertyCategory || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Posting As</span>
                    <span className="font-semibold text-slate-800 text-sm">{property.postingAs || 'Owner'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Current Status</span>
                    <span className="font-semibold text-brand-teal text-sm">{property.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Total Views</span>
                    <span className="font-semibold text-slate-800">{property.views || 0} views</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Total Leads</span>
                    <span className="font-semibold text-slate-800">{property.leads || 0} leads</span>
                  </div>
                </div>
              </div>

              {/* Location & Nearby Places */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Icon icon="lucide:map-pin" className="w-4 h-4 text-brand-teal" />
                  Address & Nearby Places
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">City</span>
                    <span className="font-semibold text-slate-800">{property.city || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Locality</span>
                    <span className="font-semibold text-slate-800">{property.locality || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">State & Pincode</span>
                    <span className="font-semibold text-slate-800">{property.state || ''} {property.pincode ? `(${property.pincode})` : ''}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Full Address</span>
                    <span className="font-semibold text-slate-800">{property.address || 'N/A'}</span>
                  </div>
                  {property.landmark && (
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-semibold">Landmark</span>
                      <span className="font-semibold text-slate-700">{property.landmark}</span>
                    </div>
                  )}
                </div>

                {/* NEARBY PLACES SECTION */}
                {validNearbyPlaces.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-slate-400 block text-xs uppercase font-bold flex items-center gap-1.5">
                      <Icon icon="lucide:navigation" className="w-3.5 h-3.5 text-blue-500" />
                      Nearby Landmarks & Transit
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {validNearbyPlaces.map((np, idx) => {
                        const placeName = typeof np === 'string' ? np : (np.place || np.name || 'Nearby Place');
                        const distance = typeof np === 'object' && np.distance ? np.distance : '';
                        return (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                            <Icon icon="lucide:map-pin" className="w-4 h-4 text-brand-teal shrink-0" />
                            <span className="font-semibold text-slate-700 truncate">{placeName}</span>
                            {distance && <span className="text-[11px] font-semibold text-slate-400 ml-auto whitespace-nowrap">{distance}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {property.mapLink && (
                  <div className="pt-2">
                    <a
                      href={property.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors shadow-xs"
                    >
                      <Icon icon="lucide:map" className="w-4 h-4" />
                      Open Google Maps Location
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-white text-sm rounded-xl p-5 border border-slate-100 shadow-xs space-y-2">
                  <h3 className="font-semibold text-slate-400 uppercase tracking-wider">Property Description</h3>
                  <p className="font-medium text-slate-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PG PRICING & ROOMS / TENANT DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {isPg ? (
                <>
                  {/* PG Basic Info */}
                  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">PG Name</span>
                      <span className="font-bold text-[#062F26] text-sm">{property.pgName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">PG Present In</span>
                      <span className="font-bold text-slate-800 text-sm">{property.pgPresentIn || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Operational Since</span>
                      <span className="font-bold text-slate-800 text-sm">{property.operationalSince || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Total Floors</span>
                      <span className="font-bold text-slate-800 text-sm">{property.totalFloorsCount || property.floors?.length || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Booking Configuration */}
                  {(property.paymentModel || property.rentalPeriod || property.bookingType) && (
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Icon icon="lucide:calendar-check" className="w-4 h-4 text-brand-teal" />
                        Booking & Rental Terms
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        {property.paymentModel && (
                          <div>
                            <span className="text-slate-400 block text-[11px] uppercase font-bold">Payment Model</span>
                            <span className="font-bold text-slate-800 text-sm">{property.paymentModel}</span>
                          </div>
                        )}
                        {property.rentalPeriod && (
                          <div>
                            <span className="text-slate-400 block text-[11px] uppercase font-bold">Rental Period</span>
                            <span className="font-bold text-slate-800 text-sm">{property.rentalPeriod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PG Pricing Grid */}
                  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-purple-600" />
                      PG Sharing & Pricing Rates (per Bed)
                    </h3>

                    {activePgPricing.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activePgPricing.map(([type, pricing]) => {
                          const label = type.replace('_AC', ' (AC)').replace('_NonAC', ' (Non-AC)').replace('_', ' ');
                          return (
                            <div key={type} className="bg-purple-50/40 p-4 rounded-xl border border-purple-100 flex flex-col justify-between">
                              <span className="text-sm font-bold text-purple-900">{label}</span>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs text-slate-500 font-medium">Rent:</span>
                                  <span className="text-base font-semibold text-brand-teal">{formatCurrency(pricing.rentPerBed)}<span className="text-[10px] text-slate-400">/mo</span></span>
                                </div>
                                {pricing.depositPerBed && (
                                  <div className="flex items-baseline justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Deposit:</span>
                                    <span className="font-bold text-slate-700">{formatCurrency(pricing.depositPerBed)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific PG pricing rates added in pgPricing.</p>
                    )}
                  </div>

                  {/* Floors & Rooms Hierarchy */}
                  {property.floors && property.floors.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Icon icon="lucide:layers" className="w-4 h-4 text-brand-teal" />
                        Floors & Rooms Hierarchy ({property.floors.length} Floors)
                      </h3>

                      <div className="space-y-4">
                        {property.floors.map((floor, fIdx) => (
                          <div key={fIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                            <h4 className="text-xs font-bold text-[#062F26] uppercase tracking-wide flex items-center gap-2">
                              <Icon icon="lucide:building" className="w-3.5 h-3.5 text-slate-500" />
                              {floor.floorName || `Floor ${fIdx + 1}`}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {floor.rooms?.map((room, rIdx) => (
                                <div key={rIdx} className="bg-white p-3 rounded-lg border border-slate-200 text-sm space-y-2">
                                  <div className="flex items-center justify-between font-bold text-slate-800">
                                    <span>{room.roomName || `Room ${rIdx + 1}`} ({room.sharingType})</span>
                                    <span className={`px-2 py-0.5 rounded text-[11px] ${room.isAC ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                      {room.isAC ? 'AC' : 'Non-AC'}
                                    </span>
                                  </div>

                                  {room.beds && room.beds.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {room.beds.map((bed, bIdx) => (
                                        <span
                                          key={bIdx}
                                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${bed.status === 'Occupied'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : bed.status === 'Reserved'
                                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}
                                        >
                                          {bed.bedName}: {bed.status}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* TENANT PROPERTY DETAILS */
                <div className="space-y-6">
                  {/* Property Specifications */}
                  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Icon icon="lucide:building-2" className="w-4 h-4 text-brand-teal" />
                      Flat & House Specifications
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">BHK Type</span>
                        <span className="font-extrabold text-[#062F26] text-sm">{property.bhkType || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Furnishing Status</span>
                        <span className="font-bold text-slate-800 text-sm">{property.furnishingStatus || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Bathrooms</span>
                        <span className="font-bold text-slate-800">{property.bathrooms || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Balconies</span>
                        <span className="font-bold text-slate-800">{property.balconies || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Built-up Area</span>
                        <span className="font-bold text-slate-800">{property.builtUpArea ? `${property.builtUpArea} sq.ft` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Carpet Area</span>
                        <span className="font-bold text-slate-800">{property.carpetArea ? `${property.carpetArea} sq.ft` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Floor Position</span>
                        <span className="font-bold text-slate-800">{property.propertyOnFloor ? `Floor ${property.propertyOnFloor} of ${property.totalFloors || 'N/A'}` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Age of Property</span>
                        <span className="font-bold text-slate-800">{property.ageOfProperty || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Facing Direction</span>
                        <span className="font-bold text-slate-800">{property.facing || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Additional Rooms & Overlooking */}
                    {(property.additionalRooms?.length > 0 || property.overlooking?.length > 0) && (
                      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {property.additionalRooms?.length > 0 && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Additional Rooms</span>
                            <div className="flex flex-wrap gap-1">
                              {property.additionalRooms.map((room, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
                                  {room}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {property.overlooking?.length > 0 && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Overlooking View</span>
                            <div className="flex flex-wrap gap-1">
                              {property.overlooking.map((view, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                                  {view}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Financial & Lease Details */}
                  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-brand-teal" />
                      Rent & Financial Details
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Rent</span>
                        <span className="font-extrabold text-brand-teal text-base">{formatCurrency(property.monthlyRent)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Deposit</span>
                        <span className="font-bold text-slate-800 text-sm">{formatCurrency(property.securityAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Maintenance</span>
                        <span className="font-bold text-slate-800">{property.maintenanceCharges ? `${formatCurrency(property.maintenanceCharges)} / ${property.maintenancePeriod || 'mo'}` : 'Included'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Available From</span>
                        <span className="font-bold text-slate-800">{property.availableFromType === 'Immediate' ? 'Immediate' : (property.availableDate || 'N/A')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Occupants</span>
                        <span className="font-bold text-slate-800">{property.maxPeople ? `${property.maxPeople} Persons` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FOOD, AMENITIES & RULES */}
          {activeTab === 'amenities' && (
            <div className="space-y-6">

              {/* FOOD & DINING SECTION (Especially for PG) */}
              {(isPg || property.foodProvided) && (
                <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200/60 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2 border-b border-amber-200/60 pb-2">
                    <Icon icon="lucide:utensils" className="w-4 h-4 text-amber-600" />
                    Food & Meal Offerings
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Food Provided</span>
                      <span className="font-bold text-slate-800 text-sm">{property.foodProvided ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Category</span>
                      <span className="font-bold text-slate-800 text-sm">{property.vegNonVeg || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Food Charges</span>
                      <span className="font-bold text-slate-800 text-sm">{property.foodCharges || 'Included in Rent'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Meals Served</span>
                      <span className="font-bold text-slate-800 text-sm">{property.meals?.length > 0 ? property.meals.join(', ') : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICES OFFERED */}
              {allServices.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Icon icon="lucide:concierge-bell" className="w-4 h-4 text-brand-teal" />
                    Services Offered
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {allServices.map((svc, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                        <Icon icon="lucide:check" className="w-3.5 h-3.5 text-emerald-600" />
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AMENITIES & FACILITIES */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Icon icon="lucide:sparkles" className="w-4 h-4 text-brand-teal" />
                  Amenities & Facilities
                </h3>

                <div className="space-y-4 text-xs">
                  {allCommonAmenities.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[11px] uppercase mb-2">Common / Room Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {allCommonAmenities.map((am, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.societyAmenities && property.societyAmenities.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[11px] uppercase mb-2">Society Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {property.societyAmenities.map((am, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-100">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.parking && property.parking.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[11px] uppercase mb-2">Parking Facilities</span>
                      <div className="flex flex-wrap gap-2">
                        {property.parking.map((p, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 font-semibold rounded-lg border border-purple-100">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* HOUSE RULES & POLICIES */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Icon icon="lucide:clipboard-check" className="w-4 h-4 text-brand-teal" />
                  House Rules & Tenant Preferences
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-3">
                  {property.preferredGender && (
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Preferred Gender</span>
                      <span className="font-bold text-slate-800 text-sm">{property.preferredGender}</span>
                    </div>
                  )}
                  {property.tenantPreference && (
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Tenant Preference</span>
                      <span className="font-bold text-slate-800 text-sm">{property.tenantPreference}</span>
                    </div>
                  )}
                  {property.noticePeriod && (
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Notice Period</span>
                      <span className="font-bold text-slate-800 text-sm">{property.noticePeriod}</span>
                    </div>
                  )}
                  {property.preferredTenants && property.preferredTenants.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">Preferred Tenants</span>
                      <span className="font-bold text-slate-800 text-sm">{property.preferredTenants.join(', ')}</span>
                    </div>
                  )}
                </div>

                {allRules.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-bold block text-[11px] uppercase mb-2">Rules & Policies</span>
                    <div className="flex flex-wrap gap-2">
                      {allRules.map((rule, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-rose-50 text-rose-800 text-sm font-semibold rounded-lg border border-rose-200 inline-flex items-center gap-1.5">
                          <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 text-rose-500" />
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: MEDIA & VERIFICATION */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Verification Docs */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Icon icon="lucide:shield-check" className="w-4 h-4 text-emerald-600" />
                  Verification Documents ({property.verificationDocs?.length || 0})
                </h3>

                {property.verificationDocs && property.verificationDocs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {property.verificationDocs.map((doc, idx) => {
                      const isPdf = doc.url?.toLowerCase().includes('.pdf');
                      return (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Icon icon={isPdf ? "lucide:file-text" : "lucide:image"} className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 block truncate">Document {idx + 1}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Click to open</span>
                          </div>
                          <Icon icon="lucide:external-link" className="w-4 h-4 text-slate-400 ml-auto group-hover:text-emerald-600" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No verification documents uploaded.</p>
                )}
              </div>

              {/* Property Photos */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Icon icon="lucide:image" className="w-4 h-4 text-brand-teal" />
                  Uploaded Photos ({property.images?.length || 0})
                </h3>

                {property.images && property.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {property.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity shadow-xs group relative"
                      >
                        <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Icon icon="lucide:external-link" className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No photos uploaded.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#062F26] text-white text-xs font-bold rounded-lg hover:bg-[#062F26]/90 transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyViewModal;
