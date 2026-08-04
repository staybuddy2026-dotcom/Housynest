import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import Chart from 'react-apexcharts';

const DEFAULT_ENGLISH_AGREEMENT = `<h1>RENTAL / LEAVE AND LICENSE AGREEMENT</h1>

This Leave and License Agreement ("Agreement") is entered into on [agreement_date], at [agreement_city].

<h3>PARTIES TO THE AGREEMENT</h3>

<b>Licensor (Owner/Property Manager):</b>
[property_name], having its premises at [property_address], [property_city]
(hereinafter referred to as the "Licensor")

<b>Licensee (Tenant):</b>
[tenant_full_name]
Contact: [tenant_mobile] | [tenant_email]
Date of Birth: [tenant_date_of_birth]
(hereinafter referred to as the "Licensee")

<h3>ACCOMMODATION DETAILS</h3>
<b>Property:</b> [property_name]
<b>Address:</b> [property_address], [property_locality], [property_city]
<b>Room / Unit:</b> [room_name]
<b>Bed Number:</b> [bed_number]

<h3>FINANCIAL TERMS</h3>
<b>Monthly Rent:</b> ₹[rent_amount]
<b>Security Deposit:</b> ₹[deposit_amount]
<b>Commencement Date:</b> [move_in_date]
<b>Vacation Date:</b> [move_out_date]
<b>Booking Reference:</b> [booking_reference]

<h3>TERMS AND CONDITIONS</h3>

<b>1. Nature of Agreement</b>
This Agreement is a Leave and License Agreement only. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes.

<b>2. Monthly Rent and Payment</b>
The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the due date communicated by the Licensor. Continued occupation of the premises is conditional on timely payment of rent and any applicable charges.

<b>3. Security Deposit</b>
A refundable security deposit of ₹[deposit_amount] has been or shall be collected prior to move-in. The deposit shall be refunded within a reasonable time after the Licensee vacates the premises, after adjusting any outstanding dues, unpaid rent, utility charges, or costs of repairing damages caused by the Licensee beyond normal wear and tear.

<b>4. Utilities and Additional Charges</b>
Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card communicated separately.

<b>5. Maintenance and Care of Premises</b>
The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The Licensee shall promptly report any damage or defect to the Licensor. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit.

<b>6. Conduct and House Rules</b>
The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents, staff, or neighbors. The Licensee shall abide by all house rules, facility timings, and guidelines communicated by the Licensor from time to time.

<b>7. Guests and Visitors</b>
Guests and visitors shall be permitted on the premises only as per the Licensor's guest and visitor policy communicated separately. Overnight stays of guests shall require prior permission from the Licensor.

<b>8. Alterations</b>
The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas without the prior written consent of the Licensor.

<b>9. Prohibited Uses</b>
The Licensee shall not use the premises for any illegal, commercial, or immoral activity. The Licensee shall not sublet the accommodation or any part thereof to any third party.

<b>10. Notice Period and Termination</b>
Either party may terminate this Agreement by giving advance notice as agreed at the time of move-in or as communicated in writing. The Licensor reserves the right to terminate this Agreement immediately in the event of breach of any term of this Agreement, non-payment of rent, or conduct detrimental to other residents.

<b>11. Vacation of Premises</b>
Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation on or before the agreed vacation date, remove all personal belongings, return all keys and access devices, and hand over the premises in the same condition as received, subject to normal wear and tear.

<b>12. Liability</b>
The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises. The Licensee is advised to arrange personal insurance coverage for their valuables if required.

<b>13. Force Majeure</b>
Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including natural disasters, government restrictions, or other force majeure events.

<b>14. Governing Law and Jurisdiction</b>
This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].

<b>15. Entire Agreement</b>
This Agreement, along with any house rules communicated separately, constitutes the entire understanding between the parties regarding the accommodation. Any modification to this Agreement shall be mutually agreed upon in writing.

<h3>EMERGENCY CONTACT</h3>
<b>Name:</b> [emergency_contact_name]
<b>Phone:</b> [emergency_contact_phone]
<b>Relationship:</b> [emergency_contact_relationship]

<h3>SIGNATURES</h3>
By proceeding with occupation of the premises, the Licensee acknowledges that they have read, understood, and agree to be bound by all the terms and conditions of this Agreement.

<b>Licensee:</b> [tenant_full_name]
<b>Date:</b> [agreement_date]`;

const OwnerPropertyDetails = ({ propertyId, onClose, onEdit }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsFetched, setLeadsFetched] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsFetched, setBookingsFetched] = useState(false);



  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/properties/${propertyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProperty(data);
        } else {
          toast.error('Failed to load property details');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/inquiries/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter leads specifically for this property
          const propertyLeads = data.filter(inq => inq.propertyId && inq.propertyId._id === propertyId);
          setLeads(propertyLeads);
          setLeadsFetched(true);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };

    if (activeTab === 'Leads' && !leadsFetched) {
      fetchLeads();
    }
  }, [activeTab, propertyId, leadsFetched]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/bookings/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const propertyBookings = data.filter(b => b.propertyId && b.propertyId._id === propertyId);
          setBookings(propertyBookings);
          setBookingsFetched(true);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (activeTab === 'Bookings' && !bookingsFetched) {
      fetchBookings();
    }
  }, [activeTab, propertyId, bookingsFetched]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
        <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading property details...</p>
      </div>
    );
  }

  if (!property) return null;

  const title = property.pgName || property.propertyCategory || 'Property';
  const location = property.locality ? `${property.locality}, ${property.city || ''}` : (property.address || 'Location Unknown');
  const status = property.status || 'Pending';
  const isPG = property.propertyType === 'PG';

  const tabs = [
    'Overview',
    ...(isPG ? ['Rooms & Beds'] : ['Property Details']),
    'Leads',
    'Bookings',
    'Tenants',
    'Rent Collection',
    'Rules & Regulations',
    'Contract Agreement',
    'Reports'
  ];

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

    // Fallback displayRent just in case
    if (pgPricesList.length > 0) {
      const prices = pgPricesList.map(p => Number(p.price.replace(/[^0-9]/g, '')));
      displayRent = `₹${Math.min(...prices).toLocaleString('en-IN')}`;
    }
  } else if (property.monthlyRent) {
    displayRent = `₹${Number(property.monthlyRent).toLocaleString('en-IN')}`;
  }

  const views = property.views || 0;
  const leadsGenerated = property.inquiries || 0;

  // Dummy revenue based on occupied beds
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

  const renderOverview = () => (
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
          <div className="relative w-full h-[350px] sm:h-[400px] lg:h-[550px] bg-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0">
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

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
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
                  <div key={idx} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:navigation" className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{place.place}</span>
                    </div>
                    <span className="text-xs font-bold text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-md shrink-0">{place.distance}</span>
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

  const renderContract = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Contract Agreement Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm w-full">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-[#EAF5F2] text-brand-teal rounded-xl flex items-center justify-center shrink-0">
            <Icon icon="lucide:file-text" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#062F26]">Contract Agreement</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Review the property's terms and conditions</p>
          </div>
        </div>
        
        {property.ownerContract?.isCustomized || property.ownerContract?.url ? (
          <>
            <p className="text-sm text-slate-500 font-medium mb-4">
              Official customized owner contract stored in Cloudinary
            </p>
            <div className="bg-[#EAF5F2]/50 border border-brand-teal/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold shrink-0">
                  <Icon icon="lucide:file-type-2" width="22" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#062F26] truncate max-w-[200px] sm:max-w-md">
                    {property.ownerContract?.fileName || 'Owner Contract Agreement.pdf'}
                  </p>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Icon icon="lucide:cloud-check" width="12" className="text-brand-teal" /> Stored in Cloudinary
                  </span>
                </div>
              </div>
              {property.ownerContract?.url && (
                <a
                  href={property.ownerContract.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-[#062F26] text-white hover:bg-brand-teal transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  <Icon icon="lucide:external-link" width="16" />
                  Open in New Tab
                </a>
              )}
            </div>

            {/* Embedded PDF Viewer */}
            {property.ownerContract?.url && (
              <div className="mt-6 w-full h-[600px] md:h-[700px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <iframe 
                  src={`${property.ownerContract.url}#view=FitH`} 
                  title="Contract Agreement" 
                  className="w-full h-full"
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#FAF6F0] border border-[#F3EFE9] rounded-xl p-5 md:p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold shrink-0">
                <Icon icon="lucide:shield-check" width="24" />
              </div>
              <div>
                <p className="text-base font-bold text-[#062F26]">
                  {property.ownerContract?.isCustomized ? 'Customized Agreement' : 'Standard Agreement'}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {property.ownerContract?.isCustomized ? 'Using customized contract text' : 'Using Housynest\'s default standardized contract'}
                </p>
              </div>
            </div>

            {/* Embedded Text Viewer */}
            <div className="w-full h-[600px] md:h-[700px] rounded-xl overflow-y-auto custom-scrollbar border border-slate-200 bg-white p-6 md:p-8" data-lenis-prevent="true">
              <div 
                className="prose prose-sm md:prose-base max-w-none text-slate-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: property.ownerContract?.isCustomized && property.ownerContract?.contractTextEn
                    ? property.ownerContract.contractTextEn 
                    : DEFAULT_ENGLISH_AGREEMENT 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRules = () => {
    const defaultRules = [
      { title: 'No Drinking', desc: 'Alcohol is strictly prohibited on the premises to ensure a safe and respectful environment for everyone.' },
      { title: 'No Smoking', desc: 'Smoking is not allowed inside rooms or common areas to maintain hygiene and avoid fire hazards.' },
      { title: 'No Guests', desc: 'Guests are not allowed inside the property. This helps keep the premises secure for all residents.' }
    ];

    const rulesList = property.pgRules?.length > 0
      ? property.pgRules.map(r => ({ title: r, desc: `Please adhere to the ${r.toLowerCase()} rule to maintain a peaceful environment for everyone.` }))
      : defaultRules;

    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:shield-alert" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#062F26]">Property Rules & Regulations</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Strictly enforced guidelines for all tenants</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rulesList.map((rule, idx) => (
            <div key={idx} className="bg-[#FAF6F0] border border-[#F3EFE9] p-5 rounded-xl hover:border-red-200 transition-colors group">
              <div className="flex gap-4">
                <div className="mt-1 w-2 h-2 bg-red-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:scale-125 transition-transform"></div>
                <div>
                  <h4 className="text-base font-bold text-[#062F26] mb-2">{rule.title}</h4>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRoomsAndBeds = () => {
    if (property.propertyType !== 'PG') {
      return (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center animate-fadeIn">
          <Icon icon="lucide:home" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#062F26]">Property Details</h3>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-md mx-auto">
            This is a {property.bhkType} property. Room and bed management is specifically for PG accommodations.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#062F26] mb-4">Floor & Room Layout</h3>
          {property.floors?.length > 0 ? (
            <div className="space-y-6">
              {property.floors.map((floor, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-[#062F26]">{floor.floorName || `Floor ${floor.floorNumber || idx + 1}`}</h4>
                    <span className="text-xs font-semibold text-slate-500">{floor.rooms?.length || 0} Rooms</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {floor.rooms?.map((room, rIdx) => (
                      <div key={rIdx} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-[#062F26]">{room.roomName || `Room ${room.roomNumber || rIdx + 1}`}</span>
                          <span className="text-[10px] font-bold px-2 py-1 bg-brand-teal/10 text-brand-teal rounded uppercase tracking-wider">
                            {room.sharingType} {room.isAC ? 'AC' : 'Non-AC'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {room.beds?.map((bed, bIdx) => (
                            <div key={bIdx} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <Icon icon="lucide:bed" className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-700">{bed.bedName || `Bed ${bIdx + 1}`}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bed.status === 'Vacant' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                {bed.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No floor details available. Please update the property info.</p>
          )}
        </div>
      </div>
    );
  }

  const renderTenantDetails = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-[#062F26] mb-5 flex items-center gap-2">
          <Icon icon="lucide:info" className="w-5 h-5 text-brand-teal" />
          Property Configuration & Details
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4 mb-6">
          {property.bhkType && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Configuration</p>
              <p className="text-sm font-bold text-slate-700">{property.bhkType}</p>
            </div>
          )}
          {property.furnishingStatus && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Furnishing</p>
              <p className="text-sm font-bold text-slate-700">{property.furnishingStatus}</p>
            </div>
          )}
          {property.bathrooms && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Bathrooms</p>
              <p className="text-sm font-bold text-slate-700">{property.bathrooms}</p>
            </div>
          )}
          {property.balconies && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Balconies</p>
              <p className="text-sm font-bold text-slate-700">{property.balconies}</p>
            </div>
          )}
          {property.builtUpArea && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Built-up Area</p>
              <p className="text-sm font-bold text-slate-700">{property.builtUpArea} sq.ft</p>
            </div>
          )}
          {property.carpetArea && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Carpet Area</p>
              <p className="text-sm font-bold text-slate-700">{property.carpetArea} sq.ft</p>
            </div>
          )}
          {property.propertyOnFloor && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Floor No.</p>
              <p className="text-sm font-bold text-slate-700">{property.propertyOnFloor} / {property.totalFloors || '?'}</p>
            </div>
          )}
          {property.facing && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Facing</p>
              <p className="text-sm font-bold text-slate-700">{property.facing}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9]">
            <h4 className="text-sm font-bold text-[#062F26] mb-3 flex items-center gap-2">
              <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-brand-teal" />
              Rental & Financials
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</span>
                <span className="text-sm font-black text-[#062F26]">₹{Number(property.monthlyRent || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Deposit</span>
                <span className="text-sm font-bold text-slate-700">{property.securityAmount ? `₹${Number(property.securityAmount).toLocaleString('en-IN')}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maintenance</span>
                <span className="text-sm font-bold text-slate-700">{property.maintenanceCharges && property.maintenanceCharges !== '0' ? `₹${Number(property.maintenanceCharges).toLocaleString('en-IN')} / ${property.maintenancePeriod || 'month'}` : 'Included'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9]">
            <h4 className="text-sm font-bold text-[#062F26] mb-3 flex items-center gap-2">
              <Icon icon="lucide:users" className="w-4 h-4 text-blue-500" />
              Tenant Preferences
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Tenants</span>
                <span className="text-sm font-bold text-slate-700">{property.preferredTenants?.length > 0 ? property.preferredTenants.join(', ') : 'Anyone'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max People</span>
                <span className="text-sm font-bold text-slate-700">{property.maxPeople || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available From</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">{property.availableFromType === 'Immediate' ? 'Immediate' : (property.availableDate || 'N/A')}</span>
              </div>
            </div>
          </div>
        </div>



        {property.localityDescription && (
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9] mt-4">
            <h4 className="text-sm font-bold text-[#062F26] mb-2 flex items-center gap-2">
              <Icon icon="lucide:map" className="w-4 h-4 text-purple-500" />
              Locality Description
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.localityDescription}
            </p>
          </div>
        )}

      </div>
    </div>
  );

  const renderEmptyTab = (tabName) => (
    <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
      <Icon icon="lucide:construction" className="w-12 h-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-[#062F26] mb-2">{tabName} Data Not Found</h3>
      <p className="text-sm font-medium text-slate-500 max-w-sm">
        The {tabName.toLowerCase()} information for this property is not available or is currently under development.
      </p>
    </div>
  );

  const renderTenants = () => {
    const tenants = [];

    if (property.propertyType === 'PG' && property.floors) {
      let tenantCount = 1;
      property.floors.forEach(floor => {
        if (floor.rooms) {
          floor.rooms.forEach((room, rIdx) => {
            if (room.beds) {
              room.beds.forEach((bed, bIdx) => {
                if (bed.status === 'Occupied') {
                  const sharingKey = `${room.sharingType}_${room.isAC ? 'AC' : 'NonAC'}`;
                  const pgRent = property.pgPricing?.[sharingKey]?.rentPerBed;
                  const pgDeposit = property.pgPricing?.[sharingKey]?.depositPerBed;
                  const displayRent = pgRent ? `₹${Number(pgRent).toLocaleString()}` : (property.monthlyRent ? `₹${property.monthlyRent}` : '₹10,000');
                  const displayDeposit = pgDeposit ? `Deposit: ₹${Number(pgDeposit).toLocaleString()}` : 'Deposit: ₹20,000';

                  tenants.push({
                    id: `TN-${tenantCount}`,
                    name: 'Tenant Details Pending',
                    initials: 'T',
                    email: 'Not provided in database',
                    phone: 'Not provided',
                    room: room.roomName || `Room ${rIdx + 1}`,
                    roomNumber: room.roomName || rIdx + 1,
                    bedNumber: bed.bedName || bIdx + 1,
                    bed: bed.bedName || `Bed ${bIdx + 1}`,
                    rent: displayRent,
                    deposit: displayDeposit,
                    payment: 'N/A',
                    moveIn: 'N/A',
                    moveInIso: '',
                    kyc: 'N/A',
                    bookingId: 'N/A',
                    leaseDuration: 'N/A',
                    monthlyRentNum: displayRent,
                    securityDepositNum: displayDeposit.replace('Deposit: ', ''),
                  });
                  tenantCount++;
                }
              });
            }
          });
        }
      });
    } else if (property.propertyType === 'Tenant' && (property.status === 'Active' || property.status === 'Occupied')) {
      // Mock a tenant for a flat if it's considered active/occupied
      tenants.push({
        id: 'TN-1',
        name: 'Tenant Details Pending',
        initials: 'T',
        email: 'Not provided in database',
        phone: 'Not provided',
        room: 'Full Property',
        roomNumber: '-',
        bedNumber: '-',
        bed: '-',
        rent: property.monthlyRent ? `₹${Number(property.monthlyRent).toLocaleString()}` : '₹15,000',
        deposit: property.securityAmount ? `Deposit: ₹${Number(property.securityAmount).toLocaleString()}` : 'Deposit: N/A',
        payment: 'N/A',
        moveIn: 'N/A',
        moveInIso: '',
        kyc: 'N/A',
        bookingId: 'N/A',
        leaseDuration: 'N/A',
        monthlyRentNum: property.monthlyRent ? `₹${property.monthlyRent}` : '₹15,000',
        securityDepositNum: property.securityAmount ? `₹${property.securityAmount}` : 'N/A',
      });
    }

    const getPaymentStyle = (status) => {
      if (status === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (status === 'DUE') return 'bg-amber-100 text-amber-700 border-amber-200';
      return 'bg-slate-100 text-slate-500 border-slate-200';
    };
    const getKycStyle = (status) => {
      if (status === 'VERIFIED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (status === 'KYC PENDING') return 'bg-amber-100 text-amber-700 border-amber-200';
      return 'bg-slate-100 text-slate-500 border-slate-200';
    };

    const filteredTenants = tenants.filter(t =>
      t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
      t.room.toLowerCase().includes(tenantSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden animate-fadeIn">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative w-full sm:w-96 group">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input
              type="text"
              placeholder="Search tenants by name, email, or room..."
              value={tenantSearchQuery}
              onChange={(e) => setTenantSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar bg-white">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Room / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move-in</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">KYC</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{t.name}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{t.email}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.room}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{t.bed}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{t.rent}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide">{t.deposit}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getPaymentStyle(t.payment)} shadow-sm`}>
                      {t.payment}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-semibold text-slate-700">{t.moveIn}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getKycStyle(t.kyc)} shadow-sm`}>
                      {t.kyc}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      {t.payment === 'DUE' && (
                        <button className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md transition-colors uppercase tracking-wide">
                          Remind Now
                        </button>
                      )}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No tenants found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRentCollection = () => {
    const rentItems = [];
    const today = new Date();

    const activeBookings = bookings.filter(b => ['Active', 'Confirmed', 'Completed', 'Reserved'].includes(b.status));

    activeBookings.forEach(booking => {
      let rentAmount = 14500;
      if (property.propertyType === 'PG') {
        if (property.pgPricing && booking.roomDetails && booking.roomDetails.sharingType) {
          const baseType = booking.roomDetails.sharingType.includes('Single') ? 'Single' : booking.roomDetails.sharingType.includes('Double') ? 'Double' : booking.roomDetails.sharingType.includes('Triple') ? 'Triple' : booking.roomDetails.sharingType.includes('Four') ? 'Four' : 'Other';
          const typeStr = `${baseType}_${property.isAC ? 'AC' : 'NonAC'}`;
          if (property.pgPricing[typeStr]?.rentPerBed) {
            rentAmount = Number(property.pgPricing[typeStr].rentPerBed.replace(/\D/g, ''));
          }
        }
      } else if (property.monthlyRent) {
        rentAmount = Number(property.monthlyRent.replace(/\D/g, ''));
      }

      const moveInDate = booking.moveInDate ? new Date(booking.moveInDate) : new Date(booking.createdAt);
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());
      
      if (nextDueDate < today) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      const diffMs = nextDueDate - today;
      const daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      let status = 'Paid';
      if (daysDue <= 7 && daysDue > 0) {
        status = 'Reminder sent';
      } else if (nextDueDate < today) {
        status = 'Overdue';
      }

      const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const name = booking.tenantId ? booking.tenantId.fullName : (booking.personalInfo?.firstName + ' ' + booking.personalInfo?.lastName);

      rentItems.push({
        id: booking._id,
        name: name,
        initials: name.charAt(0).toUpperCase(),
        rent: `₹${rentAmount.toLocaleString('en-IN')}`,
        dueDate: `Due ${formatDate(nextDueDate)}`,
        rawDate: nextDueDate,
        method: status === 'Paid' ? 'UPI' : '—',
        status: status,
      });
    });

    rentItems.sort((a, b) => a.rawDate - b.rawDate);

    if (rentItems.length === 0) {
      return renderEmptyTab('Rent Collection');
    }

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'Reminder sent': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-slate-50 text-slate-500 border-slate-200';
      }
    };

    return (
      <div className="flex flex-col gap-3 animate-fadeIn">
        {rentItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow hover:border-brand-teal/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F8F9FA] text-[#062F26] font-bold text-sm flex items-center justify-center shadow-inner">
                {item.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#062F26] text-sm mb-0.5">{item.name}</span>
                <div className="flex items-center text-[11px] font-semibold text-slate-400">
                  <span className="text-brand-teal font-bold">{item.rent}</span>
                  <span className="mx-2 text-slate-200">•</span>
                  <span>Expected Rent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <span className="px-2.5 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Occupied
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded border border-slate-100 bg-white text-slate-400 hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/5 flex items-center justify-center transition-all shadow-sm">
                  <Icon icon="lucide:eye" className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded border border-slate-100 bg-white text-slate-400 hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/5 flex items-center justify-center transition-all shadow-sm">
                  <Icon icon="lucide:message-square" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReports = () => {
    // Generate some somewhat realistic base revenue based on the property rent
    const baseRent = property.monthlyRent
      ? parseInt(property.monthlyRent.replace(/[^0-9]/g, ''), 10)
      : (property.propertyType === 'PG' ? 8500 : 15000);

    // Assuming maybe 4 occupied beds on average for PGs, or just 1 for a Tenant flat
    const multiplier = property.propertyType === 'PG' ? 4 : 1;
    const baseRevenue = baseRent * multiplier;

    // Simulate 12 months of data around this base revenue
    const mockData = Array.from({ length: 12 }, (_, i) => {
      const variation = 1 - 0.1 + (Math.random() * 0.2); // Random +- 10%
      // Trending up slightly over the year
      const trend = 1 + (i * 0.02);
      return Math.floor(baseRevenue * variation * trend);
    });

    const chartOptions = {
      chart: {
        type: 'area',
        toolbar: { show: false },
        parentHeightOffset: 0,
        zoom: { enabled: false },
        dropShadow: {
          enabled: true,
          top: 4,
          left: 0,
          blur: 4,
          color: '#0aa87d',
          opacity: 0.15
        }
      },
      colors: ['#0aa87d'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 0,
        colors: ['#fff'],
        strokeColors: '#0aa87d',
        strokeWidth: 3,
        hover: { size: 6, sizeOffset: 3 }
      },
      legend: { show: false },
      xaxis: {
        categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 } },
        tooltip: { enabled: false },
        crosshairs: {
          show: true,
          stroke: { color: '#cbd5e1', width: 1, dashArray: 4 }
        }
      },
      yaxis: {
        show: true,
        labels: {
          style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 500 },
          formatter: (value) => `₹${(value / 1000).toFixed(1)}k`
        }
      },
      grid: {
        show: true,
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const value = series[seriesIndex][dataPointIndex].toLocaleString();
          const month = w.globals.labels[dataPointIndex];
          return `
            <div class="px-4 py-3 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col gap-0.5 min-w-[120px]">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${month} Revenue</span>
              <span class="text-base font-bold text-[#062F26]">₹${value}</span>
            </div>
          `;
        }
      },
    };

    const chartSeries = [{
      name: 'Revenue',
      data: mockData
    }];

    const totalRevenue = mockData.reduce((acc, curr) => acc + curr, 0);

    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#062F26]">Property Revenue Report</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Financial performance over the last 12 months</p>
          </div>
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9] text-right min-w-[200px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total 12m Revenue</span>
            <span className="text-2xl font-black text-brand-teal">₹{totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
        </div>
      </div>
    );
  };

  const renderLeads = () => {
    if (loadingLeads) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
          <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading leads...</p>
        </div>
      );
    }

    if (leads.length === 0) {
      return (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="lucide:inbox" className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-[#062F26] mb-2">No Leads Yet</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
            There are no inquiries for this property yet. New leads will appear here.
          </p>
        </div>
      );
    }

    const columns = [
      { id: 'New', title: 'New', color: 'bg-slate-50 border-slate-100', headerBg: 'bg-slate-100', badgeColor: 'bg-[#062F26] text-white', icon: 'lucide:sparkles' },
      { id: 'Contacted', title: 'Contacted', color: 'bg-blue-50/30 border-blue-100', headerBg: 'bg-blue-50', badgeColor: 'bg-[#062F26] text-white', icon: 'lucide:phone-call' },
      { id: 'In Discussion', title: 'Site Visit', color: 'bg-amber-50/30 border-amber-100', headerBg: 'bg-amber-50', badgeColor: 'bg-amber-500 text-white', icon: 'lucide:users' },
      { id: 'Closed', title: 'Booked', color: 'bg-emerald-50/30 border-emerald-100', headerBg: 'bg-emerald-50', badgeColor: 'bg-emerald-600 text-white', icon: 'lucide:check-circle-2' },
      { id: 'Cancelled', title: 'Cancelled', color: 'bg-rose-50/30 border-rose-100', headerBg: 'bg-rose-50', badgeColor: 'bg-rose-500 text-white', icon: 'lucide:x-circle' },
    ];

    const handleDragStart = (e, leadId) => {
      e.dataTransfer.setData('leadId', leadId);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
      e.preventDefault();
      const leadId = e.dataTransfer.getData('leadId');
      if (!leadId) return;

      const lead = leads.find(l => l._id === leadId);
      if (lead && lead.status !== newStatus) {
        const originalLeads = [...leads];
        setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));

        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`/api/inquiries/${leadId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) {
            setLeads(originalLeads);
            toast.error('Failed to update status');
          } else {
            toast.success(`Lead moved to ${newStatus}`);
          }
        } catch (err) {
          setLeads(originalLeads);
          toast.error('Failed to update status');
        }
      }
    };

    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#062F26]">Property Leads Kanban <span className="text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md text-sm ml-2">{leads.length}</span></h3>
          <p className="text-sm font-medium text-slate-500">Drag and drop cards to update status</p>
        </div>

        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 min-h-[500px]">
          {columns.map(col => {
            const columnLeads = leads.filter(l => (l.status || 'New') === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col min-w-[280px] w-full max-w-[320px] rounded-2xl border ${col.color} transition-colors`}
              >
                <div className={`p-4 rounded-t-2xl border-b border-inherit flex items-center justify-between ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <Icon icon={col.icon} className="w-4 h-4 text-[#062F26]" />
                    <h4 className="font-bold text-[#062F26]">{col.title}</h4>
                  </div>
                  <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${col.badgeColor}`}>
                    {columnLeads.length}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col gap-3">
                  {columnLeads.map(lead => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead._id)}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md cursor-grab active:cursor-grabbing hover:border-brand-teal/40 transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${lead.senderId?.profilePic ? 'bg-transparent' : 'bg-[#062F26] text-white'
                            }`}>
                            {lead.senderId?.profilePic ? (
                              <img src={lead.senderId.profilePic} alt={lead.senderId.fullName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              lead.senderId?.fullName ? lead.senderId.fullName.charAt(0).toUpperCase() : 'U'
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#062F26] text-sm group-hover:text-brand-teal transition-colors line-clamp-1">
                              {lead.senderId?.fullName || 'Unknown User'}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                              <Icon icon="lucide:phone" className="w-3 h-3" />
                              <span className="text-[11px] font-semibold tracking-wide">{lead.senderId?.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                          <Icon icon="lucide:calendar-clock" className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <span className="text-sm font-bold text-[#062F26]">
                          {property.monthlyRent ? `₹${property.monthlyRent}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200/50 rounded-xl text-slate-400 gap-2">
                      <p className="text-xs font-semibold">Drop leads here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        toast.success(`Booking ${newStatus === 'Confirmed' ? 'Approved' : newStatus}`);
      } else {
        toast.error('Failed to update booking status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating booking status');
    }
  };

  const renderBookings = () => {
    if (loadingBookings) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
          <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading bookings...</p>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="lucide:calendar" className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-[#062F26] mb-2">No Bookings Yet</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
            You don't have any bookings for this property yet.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn p-6">
        <h3 className="text-lg font-bold text-[#062F26] mb-6">Property Bookings</h3>
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking._id} className="border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#062F26] text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {booking.tenantId?.profilePic ? (
                    <img src={booking.tenantId.profilePic} alt={booking.tenantId.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    booking.tenantId?.fullName?.charAt(0).toUpperCase() || 'T'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#062F26]">{booking.tenantId?.fullName || 'Unknown Tenant'}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Icon icon="lucide:calendar" className="w-3.5 h-3.5" /> Move-in: {new Date(booking.moveInDate).toLocaleDateString('en-GB')}</span>
                    {booking.roomDetails?.roomName && (
                      <span className="flex items-center gap-1"><Icon icon="lucide:bed" className="w-3.5 h-3.5" /> {booking.roomDetails.roomName} ({booking.roomDetails.bedName})</span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-brand-teal">₹{booking.paymentDetails?.amount?.toLocaleString()} ({booking.paymentDetails?.paymentMethod})</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 min-w-[120px]">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  booking.status === 'Pending Request' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {booking.status}
                </span>
                {booking.status === 'Pending Request' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateBookingStatus(booking._id, 'Confirmed')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">Approve</button>
                    <button onClick={() => updateBookingStatus(booking._id, 'Rejected')} className="px-3 py-1.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-200 transition-colors">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FAF6F0] min-h-[calc(100vh-80px)] -m-4 sm:-m-6 p-4 sm:p-6 font-sans text-slate-800 animate-fadeIn">
      {/* Header Area */}
      <div className="mb-6">
        <div className="flex items-center text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
          <button onClick={onClose} className="hover:text-brand-teal transition-colors flex items-center gap-1 cursor-pointer">
            <Icon icon="lucide:home" className="w-3.5 h-3.5" /> Home
          </button>
          <Icon icon="lucide:chevron-right" className="mx-2 w-3 h-3" />
          <button onClick={onClose} className="hover:text-brand-teal transition-colors cursor-pointer">Properties</button>
          <Icon icon="lucide:chevron-right" className="mx-2 w-3 h-3" />
          <span className="text-[#062F26]">{title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#062F26]">{title}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${property.propertyType === 'PG' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'}`}>
                {property.propertyType === 'PG' ? 'PG' : 'Tenant'}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${status === 'Active' || status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30'
                }`}>
                {status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <Icon icon="lucide:map-pin" className="w-4 h-4 text-slate-400" />
                {location}
              </div>
              <div className="flex items-center gap-1.5">
                <Icon icon="lucide:bed" className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-[#062F26]">{totalBeds} beds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon icon="lucide:users" className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-rose-500">{occupancyRate}%</span> occupied
              </div>
              {property.propertyType === 'PG' && pgPricesList.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {pgPricesList.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-brand-teal/5 border border-brand-teal/20 px-2 py-0.5 rounded text-[11px] font-bold text-[#062F26]">
                      <span className="text-brand-teal uppercase tracking-wider">{p.type}</span>
                      <span>{p.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#062F26]">{displayRent}</span><span className="text-xs text-slate-400">/month</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={onEdit} className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm">
              <Icon icon="lucide:edit-3" className="w-4 h-4" />
              Edit Info
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative cursor-pointer ${activeTab === tab
                ? 'text-[#062F26]'
                : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#062F26] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Rooms & Beds' && renderRoomsAndBeds()}
        {activeTab === 'Property Details' && renderTenantDetails()}
        {activeTab === 'Tenants' && renderTenants()}
        {activeTab === 'Rent Collection' && renderRentCollection()}
        {activeTab === 'Leads' && renderLeads()}
        {activeTab === 'Bookings' && renderBookings()}
        {activeTab === 'Rules & Regulations' && renderRules()}
        {activeTab === 'Contract Agreement' && renderContract()}
        {activeTab === 'Reports' && renderReports()}
        {activeTab !== 'Overview' && activeTab !== 'Rooms & Beds' && activeTab !== 'Property Details' && activeTab !== 'Tenants' && activeTab !== 'Rent Collection' && activeTab !== 'Leads' && activeTab !== 'Bookings' && activeTab !== 'Rules & Regulations' && activeTab !== 'Contract Agreement' && activeTab !== 'Reports' && renderEmptyTab(activeTab)}
      </div>

    </div>
  );
};

export default OwnerPropertyDetails;
