import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import Chart from 'react-apexcharts';

import TenantDetailsDrawer from './TenantDetailsDrawer';
import TabOverview from './owner-property-details/TabOverview';
import TabRoomsAndBeds from './owner-property-details/TabRoomsAndBeds';
import TabPropertyDetails from './owner-property-details/TabPropertyDetails';
import TabTenants from './owner-property-details/TabTenants';
import TabRentCollection from './owner-property-details/TabRentCollection';
import TabLeads from './owner-property-details/TabLeads';
import TabBookings from './owner-property-details/TabBookings';
import TabRules from './owner-property-details/TabRules';
import TabContract from './owner-property-details/TabContract';
import TabReports from './owner-property-details/TabReports';
import TabConditionReports from './owner-property-details/TabConditionReports';
import TabNoticePeriods from './owner-property-details/TabNoticePeriods';

const DEFAULT_ENGLISH_AGREEMENT = `<h1>RENTAL AGREEMENT</h1>

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
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
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
        const res = await fetch('/api/leads/owner', {
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
        const [bookingsRes, invoicesRes] = await Promise.all([
          fetch('/api/bookings/owner', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/invoices/owner', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (bookingsRes.ok && invoicesRes.ok) {
          const bookingsData = await bookingsRes.json();
          const invoicesData = await invoicesRes.json();
          const propertyBookings = bookingsData.filter(b => b.propertyId && b.propertyId._id === propertyId);
          setBookings(propertyBookings);
          setInvoices(invoicesData);
          setBookingsFetched(true);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (['Bookings', 'Rooms & Beds', 'Tenants', 'Rent Collection', 'Contract Agreement', 'Reports'].includes(activeTab) && !bookingsFetched) {
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

  const title = property.pgName || property.societyName || property.propertyCategory || 'Property';
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
    'Condition Reports',
    'Notice Periods',
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
  const leadsGenerated = property.leads || 0;

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

  const renderEmptyTab = (tabName) => (
    <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
      <Icon icon="lucide:construction" className="w-12 h-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-[#062F26] mb-2">{tabName} Data Not Found</h3>
      <p className="text-sm font-medium text-slate-500 max-w-sm">
        The {tabName.toLowerCase()} information for this property is not available or is currently under development.
      </p>
    </div>
  );

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

  return (
    <div className="bg-[#FAF6F0] min-h-[calc(100vh-80px)] -m-4 sm:-m-6 p-4 sm:p-6 font-sans text-slate-800 animate-fadeIn">
      {/* Header Area */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center text-[10px] sm:text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider gap-y-2">
          <button onClick={onClose} className="hover:text-brand-teal transition-colors flex items-center gap-1 cursor-pointer shrink-0">
            <Icon icon="lucide:home" className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Home
          </button>
          <Icon icon="lucide:chevron-right" className="mx-1.5 sm:mx-2 w-3 h-3 shrink-0" />
          <button onClick={onClose} className="hover:text-brand-teal transition-colors cursor-pointer shrink-0">Properties</button>
          <Icon icon="lucide:chevron-right" className="mx-1.5 sm:mx-2 w-3 h-3 shrink-0" />
          <span className="text-[#062F26] truncate max-w-[150px] sm:max-w-none">{title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#062F26] break-words">{title}</h1>
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${property.propertyType === 'PG' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'}`}>
                {property.propertyType === 'PG' ? 'PG' : 'Tenant'}
              </span>
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${status === 'Active' || status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30'
                }`}>
                {status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <Icon icon="lucide:map-pin" className="w-4 h-4 text-slate-400" />
                {location}
              </div>
              {isPG ? (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-1.5">
                    <Icon icon="lucide:bed" className="w-4 h-4 text-slate-400" />
                    <span className="text-[#062F26] font-bold">{totalBeds} beds</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-1.5">
                    <Icon icon="lucide:users" className="w-4 h-4 text-slate-400" />
                    <span className="text-rose-500 font-bold">{occupancyRate}%</span> occupied
                  </div>
                </>
              ) : (
                <>
                  {property.bhkType && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                      <div className="flex items-center gap-1.5">
                        <Icon icon="lucide:home" className="w-4 h-4 text-slate-400" />
                        <span className="text-[#062F26] font-bold">{property.bhkType}</span>
                      </div>
                    </>
                  )}
                  {property.monthlyRent && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                      <div className="flex items-center gap-1.5">
                        <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-slate-400" />
                        <span className="text-emerald-600 font-bold">{Number(property.monthlyRent).toLocaleString('en-IN')} / month</span>
                      </div>
                    </>
                  )}
                </>
              )}
              {isPG && pgPricesList.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {pgPricesList.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-brand-teal/5 border border-brand-teal/20 px-2 py-0.5 rounded text-[11px] font-bold text-[#062F26]">
                      <span className="text-brand-teal uppercase tracking-wider">{p.type}</span>
                      <span>{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
              {isPG && pgPricesList.length === 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#062F26]">{displayRent}</span><span className="text-xs text-slate-400">/month</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <button onClick={onEdit} className="w-full md:w-auto flex justify-center items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm">
              <Icon icon="lucide:edit-3" className="w-4 h-4 shrink-0" />
              Edit Info
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 sm:gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 pb-3 sm:pb-0 pt-1 sm:pt-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={(e) => {
              setActiveTab(tab);
              if (window.innerWidth < 640 && e.currentTarget) {
                e.currentTarget.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'center'
                });
              }
            }}
            className={`text-sm font-bold whitespace-nowrap transition-all relative cursor-pointer px-4 py-2 sm:px-0 sm:py-0 sm:pb-3 rounded-full sm:rounded-none ${activeTab === tab
              ? 'bg-[#062F26] text-white sm:bg-transparent sm:text-[#062F26] shadow-md sm:shadow-none border border-transparent'
              : 'bg-white text-slate-500 border border-slate-200 sm:border-transparent hover:bg-slate-50 sm:bg-transparent sm:text-slate-400 sm:hover:bg-transparent sm:hover:text-slate-600'
              }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="hidden sm:block absolute bottom-0 left-0 w-full h-1 bg-[#062F26] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'Overview' && <TabOverview property={property} status={status} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />}
        {activeTab === 'Rooms & Beds' && <TabRoomsAndBeds property={property} bookings={bookings} />}
        {activeTab === 'Property Details' && <TabPropertyDetails property={property} />}
        {activeTab === 'Tenants' && <TabTenants bookings={bookings} invoices={invoices} property={property} tenantSearchQuery={tenantSearchQuery} setSelectedTenant={setSelectedTenant} />}
        {activeTab === 'Rent Collection' && <TabRentCollection bookings={bookings} invoices={invoices} property={property} setSelectedTenant={setSelectedTenant} />}
        {activeTab === 'Condition Reports' && <TabConditionReports propertyId={propertyId} />}
        {activeTab === 'Notice Periods' && <TabNoticePeriods propertyId={propertyId} />}
        {activeTab === 'Leads' && <TabLeads leads={leads} loadingLeads={loadingLeads} setLeads={setLeads} property={property} />}
        {activeTab === 'Bookings' && <TabBookings bookings={bookings} loadingBookings={loadingBookings} setBookings={setBookings} />}
        {activeTab === 'Rules & Regulations' && <TabRules property={property} />}
        {activeTab === 'Contract Agreement' && <TabContract property={property} bookings={bookings} />}
        {activeTab === 'Reports' && <TabReports property={property} invoices={invoices} />}
      </div>

      <TenantDetailsDrawer
        selectedTenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        getPaymentStyle={(status) => {
          if (status === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          if (status === 'DUE') return 'bg-amber-100 text-amber-700 border-amber-200';
          return 'bg-slate-100 text-slate-500 border-slate-200';
        }}
      />
    </div>
  );
};

export default OwnerPropertyDetails;
