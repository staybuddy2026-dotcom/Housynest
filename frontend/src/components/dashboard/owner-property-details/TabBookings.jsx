import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { ReactLenis } from 'lenis/react';

const TabBookings = ({ bookings, loadingBookings, setBookings }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
    const handleAcceptRequest = async (bookingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/accept-request`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Pending Payment' } : b));
        toast.success('Booking request accepted! Tenant notified.');
      } else {
        toast.error('Failed to accept request');
      }
    } catch (err) {
      toast.error('Error accepting request');
    }
  };

  const handleRejectRequest = async (bookingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/reject-request`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Rejected' } : b));
        toast.success('Booking request rejected.');
      } else {
        toast.error('Failed to reject request');
      }
    } catch (err) {
      toast.error('Error rejecting request');
    }
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden animate-fadeIn">
      <div className="flex-1 bg-white relative">
        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">#</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Room / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move-in Date</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking, index) => {
              const tenantName = booking.tenantId?.fullName || 'Unknown Tenant';
              const tenantInitials = tenantName.charAt(0).toUpperCase();
              const moveInDate = new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const roomType = booking.propertyId?.propertyType === 'Tenant' ? 'Full Property' : booking.roomDetails?.roomName || 'N/A';
              const bedType = booking.propertyId?.propertyType === 'Tenant' ? '-' : booking.roomDetails?.bedName || 'N/A';
              
              const getPricing = (b) => {
                if (b.propertyId?.propertyType === 'PG' && b.roomDetails?.sharingType) {
                  const floor = b.propertyId.floors?.find(f => f.floorName === b.roomDetails.floorName);
                  const room = floor?.rooms?.find(r => r.roomName === b.roomDetails.roomName);
                  let baseType = 'Single';
                  let isAC = false;

                  if (room) {
                    baseType = room.sharingType || 'Single';
                    isAC = room.isAC;
                  } else if (b.roomDetails?.sharingType) {
                    const st = b.roomDetails.sharingType;
                    baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
                    isAC = st.includes('(AC)');
                  }

                  const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
                  const pgPric = b.propertyId.pgPricing?.[typeStr];
                  if (pgPric) {
                    return {
                      rent: Number(pgPric.rentPerBed?.replace(/\D/g, '') || 0),
                      deposit: Number(pgPric.depositPerBed?.replace(/\D/g, '') || 0)
                    };
                  }
                }
                return {
                  rent: Number(b.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
                  deposit: Number(b.propertyId?.securityAmount?.replace(/\D/g, '') || 0)
                };
              };
              
              const pricing = getPricing(booking);
              const rentAmount = pricing.rent;
              const paidAmount = booking.paymentDetails?.amount || 0;
              const paymentStatus = booking.paymentDetails?.status || 'Pending';
              const isFullPaid = paymentStatus === 'Paid';
              const isTokenPaid = paymentStatus === 'Partial';
              
              // Calculate total expected amount based on booking or pricing
              let totalExpected = 0;
              if (booking.paymentDetails?.rentAmount || booking.paymentDetails?.securityDeposit) {
                totalExpected = (booking.paymentDetails.rentAmount || 0) + (booking.paymentDetails.securityDeposit || 0) + (booking.paymentDetails.extraCharges || 0);
              } else {
                totalExpected = rentAmount + (pricing.deposit || 0) + 800; // default stamp fee
              }
              const dueAmount = isFullPaid ? 0 : Math.max(totalExpected - paidAmount, 0);
              const paymentMethod = booking.paymentDetails?.paymentMethod || '-';

              return (
                <tr 
                  key={booking._id} 
                  className={`hover:bg-[#F8F9FA] transition-colors group cursor-pointer ${selectedBooking?.raw?._id === booking._id ? 'bg-[#F8F9FA]' : ''}`}
                  onClick={() => setSelectedBooking({
                    raw: booking,
                    tenant: tenantName,
                    property: booking.propertyId?.pgName || booking.propertyId?.societyName || booking.propertyId?.propertyCategory || 'Property',
                    bed: bedType
                  })}
                >
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{index + 1}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                        {booking.tenantId?.profilePic ? (
                          <img src={booking.tenantId.profilePic} alt={tenantName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          tenantInitials
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{tenantName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{roomType}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{bedType}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-semibold text-slate-700">{moveInDate}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    {isFullPaid ? (
                      <>
                        <div className="font-bold text-slate-800 text-sm">Full Paid: ₹{paidAmount.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-sm inline-block">Paid</div>
                      </>
                    ) : isTokenPaid ? (
                      <>
                        <div className="font-bold text-slate-800 text-sm">Token Paid: ₹{paidAmount.toLocaleString()}</div>
                        <div className="text-xs font-bold text-rose-600 mt-1 mb-1">Due: ₹{dueAmount.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-sm inline-block">Pending Full Payment</div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-800 text-sm">Rent: ₹{rentAmount.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-rose-600 mt-1 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-sm inline-block">Unpaid</div>
                      </>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        ['Confirmed', 'Active', 'Completed'].includes(booking.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        ['Pending Request', 'Pending Payment'].includes(booking.status) ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        booking.status === 'Reserved' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {booking.status === 'Pending Request' && (
                        <>
                          <button onClick={() => handleAcceptRequest(booking._id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors">Approve</button>
                          <button onClick={() => handleRejectRequest(booking._id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">Reject</button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedBooking({
                          raw: booking,
                          tenant: tenantName,
                          property: booking.propertyId?.pgName || booking.propertyId?.societyName || booking.propertyId?.propertyCategory || 'Property',
                          bed: bedType
                        })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-teal transition-colors"
                        title="View Details"
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/50">
          {bookings.map((booking, index) => {
            const tenantName = booking.tenantId?.fullName || 'Unknown Tenant';
            const tenantInitials = tenantName.charAt(0).toUpperCase();
            const moveInDate = new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const roomType = booking.propertyId?.propertyType === 'Tenant' ? 'Full Property' : booking.roomDetails?.roomName || 'N/A';
            const bedType = booking.propertyId?.propertyType === 'Tenant' ? '-' : booking.roomDetails?.bedName || 'N/A';
            
            const getPricing = (b) => {
              if (b.propertyId?.propertyType === 'PG' && b.roomDetails?.sharingType) {
                const floor = b.propertyId.floors?.find(f => f.floorName === b.roomDetails.floorName);
                const room = floor?.rooms?.find(r => r.roomName === b.roomDetails.roomName);
                let baseType = 'Single';
                let isAC = false;
                if (room) {
                  baseType = room.sharingType || 'Single';
                  isAC = room.isAC;
                } else if (b.roomDetails?.sharingType) {
                  const st = b.roomDetails.sharingType;
                  baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
                  isAC = st.includes('(AC)');
                }
                const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
                const pgPric = b.propertyId.pgPricing?.[typeStr];
                if (pgPric) {
                  return {
                    rent: Number(pgPric.rentPerBed?.replace(/\D/g, '') || 0),
                    deposit: Number(pgPric.depositPerBed?.replace(/\D/g, '') || 0)
                  };
                }
              }
              return {
                rent: Number(b.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
                deposit: Number(b.propertyId?.securityAmount?.replace(/\D/g, '') || 0)
              };
            };
            
            const pricing = getPricing(booking);
            const rentAmount = pricing.rent;
            const paidAmount = booking.paymentDetails?.amount || 0;
            const dueAmount = Math.max(rentAmount - paidAmount, 0);
            const isTokenPaid = paidAmount > 0 && paidAmount < rentAmount;
            const isFullPaid = paidAmount > 0 && paidAmount >= rentAmount;
            
            return (
              <div 
                key={booking._id} 
                className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
                onClick={() => setSelectedBooking({
                  raw: booking,
                  tenant: tenantName,
                  property: booking.propertyId?.pgName || booking.propertyId?.societyName || booking.propertyId?.propertyCategory || 'Property',
                  bed: bedType
                })}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                      {booking.tenantId?.profilePic ? (
                        <img src={booking.tenantId.profilePic} alt={tenantName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        tenantInitials
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#062F26] text-sm">{tenantName}</h3>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{roomType} • {bedType}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      ['Confirmed', 'Active', 'Completed'].includes(booking.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      ['Pending Request', 'Pending Payment'].includes(booking.status) ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      booking.status === 'Reserved' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                      'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rent</p>
                    <p className="text-sm font-bold text-slate-700">₹{rentAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Move In</p>
                    <p className="text-sm font-bold text-slate-700">{moveInDate}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment Status</p>
                      <p className="text-sm font-bold text-slate-700">
                        {isFullPaid ? 'Fully Paid' : isTokenPaid ? `₹${paidAmount.toLocaleString()} Paid` : 'Unpaid'}
                      </p>
                    </div>
                    {!isFullPaid && (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">Due</p>
                        <p className="text-sm font-bold text-rose-600">₹{isTokenPaid ? dueAmount.toLocaleString() : rentAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {booking.status === 'Pending Request' && (
                  <div className="flex gap-2 mt-2 border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleAcceptRequest(booking._id)} className="flex-1 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors">Approve</button>
                    <button onClick={() => handleRejectRequest(booking._id)} className="flex-1 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Drawer Overlay */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setSelectedBooking(null)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-[480px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out transform flex flex-col ${selectedBooking ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {selectedBooking && (
          <>
            {/* Drawer Header */}
            <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-start justify-between z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal font-bold flex items-center justify-center text-lg shadow-inner">
                  {selectedBooking.tenant.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#062F26]">{selectedBooking.tenant}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedBooking.property} - {selectedBooking.bed}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <ReactLenis
              className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50"
              options={{ smoothTouch: true }}
            >
              <div className="p-6 pb-24 sm:pb-6 space-y-6">


                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Phone</span>
                      <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.personalInfo?.mobileNumber || selectedBooking.raw.tenantId?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Email</span>
                      <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{selectedBooking.raw.personalInfo?.email || selectedBooking.raw.tenantId?.email || 'N/A'}</span>
                    </div>
                    {selectedBooking.raw.personalInfo?.dob && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                        <span className="text-sm font-bold text-slate-800">{new Date(selectedBooking.raw.personalInfo.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedBooking.raw.personalInfo?.gender && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Gender</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.personalInfo.gender}</span>
                      </div>
                    )}
                    {selectedBooking.raw.personalInfo?.institutionName && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Institution</span>
                        <span className="text-sm font-bold text-slate-800 text-right">{selectedBooking.raw.personalInfo.institutionName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedBooking.raw.emergencyContact?.name && (
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h4 className="text-sm font-bold text-[#062F26] mb-4">Emergency Contact</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Name</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Relationship</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.emergencyContact.relation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Phone</span>
                        <span className="text-sm font-bold text-slate-800">{selectedBooking.raw.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </ReactLenis>
          </>
        )}
      </div>

    </div>
  );
};

export default TabBookings;
