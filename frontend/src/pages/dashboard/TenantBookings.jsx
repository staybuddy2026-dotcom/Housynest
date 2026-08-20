import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AgreementModal from '../../components/booking/AgreementModal';
import MockPaymentModal from '../../components/booking/MockPaymentModal';

const quickActions = [
  { icon: 'lucide:wallet', title: 'Pay Rent', desc: 'View dues and make payment securely' },
  { icon: 'lucide:file-text', title: 'My Agreement', desc: 'View and download your rental agreement' },
  { icon: 'lucide:bell', title: 'Raise Complaint', desc: 'Report an issue or raise a complaint' },
  { icon: 'lucide:user', title: 'Contact Owner', desc: 'Get in touch with the property owner' }
];

const TenantBookings = () => {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [showAgreementModal, setShowAgreementModal] = useState(null);
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState(null); // { bookingId, amount }
  const [confirmingMoveInId, setConfirmingMoveInId] = useState(null);
  const [actionToFocus, setActionToFocus] = useState(null);

  useEffect(() => {
    if (selectedBooking && actionToFocus) {
      setTimeout(() => {
        const el = document.getElementById(`${actionToFocus}-section`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setActionToFocus(null);
      }, 100);
    }
  }, [selectedBooking, actionToFocus]);

  const [requestingMoveOutId, setRequestingMoveOutId] = useState(null);
  const [moveOutDateInput, setMoveOutDateInput] = useState('');
  const [moveOutReasonInput, setMoveOutReasonInput] = useState('');

  const [showEsignOtp, setShowEsignOtp] = useState(false);
  const [esignOtp, setEsignOtp] = useState('');
  const [isVerifyingEsign, setIsVerifyingEsign] = useState(false);

  const getBookingStatusBadge = (status, size = 'sm') => {
    const isSmall = size === 'sm';
    const textClass = isSmall ? 'text-[10px]' : 'text-xs';
    const pyClass = isSmall ? 'py-1' : 'py-1.5';
    const pxClass = isSmall ? 'px-2.5' : 'px-3';

    if (['Confirmed', 'Active'].includes(status)) {
      return (
        <div className={`inline-flex items-center gap-1.5 ${pxClass} ${pyClass} bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-colors`}>
          <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-emerald-500" />
          <span className={`${textClass} font-bold uppercase tracking-wider`}>{status}</span>
        </div>
      );
    } else if (status === 'Reserved') {
      return (
        <div className={`inline-flex items-center gap-1.5 ${pxClass} ${pyClass} bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm hover:bg-blue-100 transition-colors`}>
          <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-blue-500" />
          <span className={`${textClass} font-bold uppercase tracking-wider`}>{status}</span>
        </div>
      );
    } else if (['Pending Request', 'Pending Payment'].includes(status)) {
      return (
        <div className={`inline-flex items-center gap-1.5 ${pxClass} ${pyClass} bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm hover:bg-amber-100 transition-colors`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className={`${textClass} font-bold uppercase tracking-wider`}>{status}</span>
        </div>
      );
    } else {
      return (
        <div className={`inline-flex items-center gap-1.5 ${pxClass} ${pyClass} bg-red-50 text-red-700 border border-red-200 rounded-full shadow-sm hover:bg-red-100 transition-colors`}>
          <Icon icon="lucide:x-circle" className="w-3.5 h-3.5 text-red-500" />
          <span className={`${textClass} font-bold uppercase tracking-wider`}>{status}</span>
        </div>
      );
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/bookings/tenant', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching tenant bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) return;
    
    // Navigate to the property booking wizard to complete the rest of the flow
    navigate(`/properties/${booking.propertyId._id || booking.propertyId}/book`, {
      state: {
        bookingId: booking._id,
        property: booking.propertyId
      }
    });
  };

  const handlePayBalance = async (bookingId, amount) => {
    setProcessingPaymentId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/pay-balance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        toast.success('Remaining balance paid successfully! Room Confirmed.');
        // Update local state to reflect the new paid status
        setBookings(bookings.map(b => {
          if (b._id === bookingId) {
            return {
              ...b,
              status: 'Confirmed',
              paymentDetails: {
                ...b.paymentDetails,
                amount: Number(b.paymentDetails.amount) + Number(amount),
                paymentMethod: 'Full Payment',
                status: 'Paid',
                paidAt: new Date()
              }
            };
          }
          return b;
        }));

        // Notify sidebar to refresh counts
        window.dispatchEvent(new Event('refreshCounts'));
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing balance payment:', error);
      toast.error('An error occurred during balance payment.');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleConfirmMoveIn = async (bookingId) => {
    setConfirmingMoveInId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/confirm-move-in`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Move-in confirmed successfully! Escrow payout initiated.');
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, tenantConfirmedMoveIn: true, payoutStatus: 'Paid', status: 'Active' } : b));
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, tenantConfirmedMoveIn: true, payoutStatus: 'Paid', status: 'Active' });
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to confirm move-in.');
      }
    } catch (error) {
      console.error('Error confirming move-in:', error);
      toast.error('An error occurred while confirming move-in.');
    } finally {
      setConfirmingMoveInId(null);
    }
  };

  const handleRequestMoveOut = async (bookingId) => {
    if (!moveOutDateInput) {
      toast.error('Please select an intended move-out date.');
      return;
    }
    setRequestingMoveOutId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/request-move-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intendedMoveOutDate: moveOutDateInput,
          reason: moveOutReasonInput
        })
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        toast.success('Move-out requested successfully.');
        setBookings(bookings.map(b => b._id === bookingId ? updatedBooking : b));
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(updatedBooking);
        }
        setMoveOutDateInput('');
        setMoveOutReasonInput('');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to request move-out.');
      }
    } catch (error) {
      console.error('Error requesting move-out:', error);
      toast.error('An error occurred while requesting move-out.');
    } finally {
      setRequestingMoveOutId(null);
    }
  };

  const handleSendEsignOtp = () => {
    setShowEsignOtp(true);
    toast.success('OTP sent to your Aadhaar linked mobile number for eSign');
  };

  const handleVerifyEsign = async (bookingId) => {
    if (esignOtp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifyingEsign(true);
    try {
      // Simulate backend delay for eSign verification
      await new Promise(r => setTimeout(r, 2000));
      
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/consent`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success('Agreement E-Signed Successfully!');
        
        // Update local state
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, eSignStatus: 'Completed', tenantConsentStatus: 'Consented' } : b));
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, eSignStatus: 'Completed', tenantConsentStatus: 'Consented' });
        }
        setShowEsignOtp(false);
        setEsignOtp('');
      }
    } catch (error) {
      toast.error('Failed to verify eSign OTP');
    } finally {
      setIsVerifyingEsign(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center">
        <Icon icon="lucide:book-x" className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Bookings Found</h2>
        <p>You haven't made any bookings yet.</p>
      </div>
    );
  }
  return (
    <div className="pb-10 mx-auto space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm group cursor-pointer hover:bg-emerald-100 transition-colors">
            <Icon icon="lucide:calendar-check" className="w-5 h-5 text-emerald-600 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">My Bookings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your active stay and booking details</p>
          </div>
        </div>
      </div>

      {/* Main Layout - Map over bookings */}
      {!selectedBooking ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                  {['Property', 'Booking ID', 'Room', 'Move In', 'Status', 'Action'].map((header, idx) => (
                    <th key={idx} className={`p-4 font-semibold ${header === 'Action' ? 'text-right' : ''}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    onClick={() => setSelectedBooking(booking)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.propertyId?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop"}
                          alt="Property"
                          className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-[#062F26] text-sm line-clamp-1">{booking.propertyId?.societyName || booking.propertyId?.pgName || booking.propertyId?.propertyCategory || 'Property'}</p>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${booking.propertyId?.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : booking.propertyId?.propertyType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                              {booking.propertyId?.propertyType || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 font-medium mt-0.5">{booking.propertyId?.address ? `${booking.propertyId.address}, ` : ''}{booking.propertyId?.locality}, {booking.propertyId?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-block px-2.5 py-1 bg-brand-teal/10 text-brand-teal rounded-lg font-bold text-[13px] uppercase tracking-wide group-hover:bg-brand-teal group-hover:text-white transition-colors">
                        {booking._id.substring(booking._id.length - 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">
                        {booking.propertyId?.propertyType === 'Tenant' ? 'Entire Property' : (booking.roomDetails?.roomName || 'N/A')}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="p-4">
                      {getBookingStatusBadge(booking.status, 'sm')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {(() => {
                          const isTokenPaidRow = (booking.status === 'Reserved' || booking.status === 'Confirmed') && ['Token Amount', 'Token (40%)'].includes(booking.paymentDetails?.paymentMethod);
                          const needsConfirmationRow = (booking.status === 'Confirmed' || booking.status === 'Active') && booking.paymentDetails?.status === 'Paid' && !isTokenPaidRow && !booking.tenantConfirmedMoveIn;

                          if (needsConfirmationRow) {
                            return (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSelectedBooking(booking); 
                                  setActionToFocus('confirm-move-in');
                                }}
                                className="text-white px-3 py-2 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm whitespace-nowrap"
                              >
                                <Icon icon="lucide:home" className="w-4 h-4 mr-1.5" />
                                <span className="text-xs font-bold">Confirm Move-in</span>
                              </button>
                            );
                          } else if (booking.status === 'Pending Payment' || (isTokenPaidRow && booking.status === 'Reserved')) {
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                                className="text-white px-3 py-2 rounded-lg cursor-pointer bg-[#062F26] hover:bg-[#08483B] transition-colors flex items-center justify-center shadow-sm whitespace-nowrap"
                              >
                                <Icon icon="lucide:wallet" className="w-4 h-4 mr-1.5" />
                                <span className="text-xs font-bold">Pay Now</span>
                              </button>
                            );
                          } else {
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/tenant/bookings/${booking._id}/pay-rent`); }}
                                className="text-white px-3 py-2 rounded-lg cursor-pointer bg-[#062F26] hover:bg-[#08483B] transition-colors flex items-center justify-center shadow-sm whitespace-nowrap"
                              >
                                <Icon icon="lucide:wallet" className="w-4 h-4 mr-1.5" />
                                <span className="text-xs font-bold">Pay Rent</span>
                              </button>
                            );
                          }
                        })()}
                        <button className="text-brand-teal px-3 py-2 rounded-lg cursor-pointer bg-brand-teal/5 hover:bg-brand-teal/15 transition-colors flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold mr-1">View</span>
                          <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-500">
          <button
            onClick={() => setSelectedBooking(null)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#062F26] transition-colors w-max"
          >
            <Icon icon="lucide:arrow-left" className="w-4.5 h-4.5" /> Back to My Bookings
          </button>

          {(() => {
            const booking = selectedBooking;
            const moveInDate = new Date(booking.moveInDate);
            const bookingDate = new Date(booking.createdAt);
            const moveOutDate = booking.expectedMoveOutDate ? new Date(booking.expectedMoveOutDate) : null;

            let durationStr = 'N/A';
            if (moveOutDate) {
              const months = (moveOutDate.getFullYear() - moveInDate.getFullYear()) * 12 + moveOutDate.getMonth() - moveInDate.getMonth();
              durationStr = `${months} Months`;
            }

            const getPricing = () => {
              if (booking.propertyId?.propertyType === 'PG' && booking.roomDetails?.sharingType) {
                const floor = booking.propertyId.floors?.find(f => f.floorName === booking.roomDetails.floorName);
                const room = floor?.rooms?.find(r => r.roomName === booking.roomDetails.roomName);
                let baseType = 'Single';
                let isAC = false;

                if (room) {
                  baseType = room.sharingType || 'Single';
                  isAC = room.isAC;
                } else if (booking.roomDetails?.sharingType) {
                  const st = booking.roomDetails.sharingType;
                  baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
                  isAC = st.includes('(AC)');
                }

                const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
                const pricing = booking.propertyId.pgPricing?.[typeStr];
                if (pricing) {
                  return {
                    rent: Number(pricing.rentPerBed?.replace(/\D/g, '') || 0),
                    deposit: Number(pricing.depositPerBed?.replace(/\D/g, '') || 0),
                    maintenance: 0
                  };
                }
              }
              return {
                rent: Number(booking.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
                deposit: Number(booking.propertyId?.securityAmount?.replace(/\D/g, '') || 0),
                maintenance: Number(booking.propertyId?.maintenanceCharges?.replace(/\D/g, '') || 0)
              };
            };

            const pricing = getPricing();
            const stampFees = 300;
            const fullAmount = pricing.rent + pricing.deposit + pricing.maintenance + stampFees;
            const isTokenPaid = (booking.status === 'Reserved' || booking.status === 'Confirmed') && ['Token Amount', 'Token (40%)'].includes(booking.paymentDetails?.paymentMethod);
            const remainingAmount = Math.max(0, fullAmount - (booking.paymentDetails?.amount || 0));

            const propStats = [
              {
                label: booking.propertyId?.propertyType === 'Tenant' ? 'Property Type' : 'Room Type',
                value: booking.propertyId?.propertyType === 'Tenant'
                  ? (booking.propertyId?.propertyCategory || 'Flat')
                  : (booking.roomDetails?.roomName || 'N/A')
              },
              { label: 'Locality', value: booking.propertyId?.locality || 'N/A' },
              { label: 'Rent', value: pricing.rent > 0 ? `₹${pricing.rent.toLocaleString()}` : 'N/A' },
              { label: 'Status', value: booking.status }
            ];

            const btmStats = [
              { icon: 'lucide:calendar-clock', label: 'Move In Date', value: moveInDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { icon: 'lucide:calendar-days', label: 'Duration', value: durationStr },
              { icon: 'lucide:shield-check', label: 'Amount Paid', value: `₹${booking.paymentDetails?.amount?.toLocaleString() || 0}` },
              { icon: 'lucide:credit-card', label: 'Payment Type', value: booking.paymentDetails?.paymentMethod || 'N/A' }
            ];

            const summary = [
              { label: 'Booking ID', value: booking._id.substring(booking._id.length - 8).toUpperCase() },
              { label: 'Booking Date', value: bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { label: 'Room', value: booking.roomDetails?.roomName || 'N/A' },
              { label: 'Bed', value: booking.roomDetails?.bedName || 'N/A' },
              { label: 'Property Type', value: booking.propertyId?.propertyCategory || booking.propertyId?.propertyType || 'N/A' },
              { label: 'Payment Method', value: booking.paymentDetails?.paymentMethod || 'N/A', hasTopBorder: true },
              { label: 'Payment Status', value: <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">{booking.paymentDetails?.status || 'Paid'}</span> }
            ];

            return (
              <div key={booking._id} className="flex flex-col lg:flex-row gap-4">

                {/* LEFT COLUMN - Main Content */}
                <div className="flex-1 space-y-4">

                  {booking.status === 'Pending Payment' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                      <Icon icon="lucide:alert-triangle" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-amber-800 font-bold text-sm">Payment Pending!</h4>
                        <p className="text-amber-700 text-xs mt-1 leading-relaxed font-medium">
                          Complete your payment to confirm your booking. Your booking will <span className="font-bold">not be confirmed</span> until the payment is successfully completed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Property Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="p-5 flex flex-col sm:flex-row gap-6 relative">
                      {/* Image */}
                      <img
                        src={booking.propertyId?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop"}
                        alt="Property"
                        className="w-full sm:w-48 h-48 sm:h-auto object-cover rounded-xl shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold text-[#062F26]">{booking.propertyId?.societyName || booking.propertyId?.pgName || booking.propertyId?.propertyCategory || 'Property'}</h2>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                              <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
                              {booking.propertyId?.address ? `${booking.propertyId.address}, ` : ''}{booking.propertyId?.locality}, {booking.propertyId?.city}
                            </p>
                          </div>
                          {getBookingStatusBadge(booking.status, 'md')}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                          {propStats.map((stat, idx) => (
                            <div key={idx}>
                              <p className="text-xs text-slate-400 font-semibold">{stat.label}</p>
                              <p className="text-base font-bold text-slate-800">{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="bg-slate-50/50 border-t border-slate-100 p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 sm:gap-4 sm:divide-x sm:divide-slate-100">
                      {btmStats.map((stat, idx) => (
                        <div key={idx} className={`flex items-center gap-3 sm:pl-4 ${idx === 0 ? 'sm:pl-0' : ''}`}>
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <Icon icon={stat.icon} className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-semibold">{stat.label}</p>
                            <p className="text-base font-bold text-[#062F26]">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-bold text-[#062F26] mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {quickActions.map((action, idx) => (
                        <div key={idx} onClick={() => {
                          if (action.title === 'Pay Rent') {
                            navigate(`/tenant/bookings/${booking._id}/pay-rent`);
                          } else if (action.title === 'My Agreement') {
                            setShowAgreementModal({ bookingId: booking._id, isReadOnly: true });
                          }
                        }} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-[#062F26] group-hover:text-white transition-colors">
                              <Icon icon={action.icon} className="w-6 h-6" />
                            </div>
                            <Icon icon="lucide:chevron-right" className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#062F26] text-base">{action.title}</h4>
                            <p className="text-[13px] text-slate-500 leading-relaxed">{action.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment/Due Banner */}
                  {(booking.status === 'Active' || booking.status === 'Pending Payment' || booking.status === 'Reserved' || booking.status === 'Confirmed') && (
                    <div>
                      <h3 className="text-lg font-bold text-[#062F26] mb-4">
                        {booking.status === 'Pending Payment' ? (['Token Amount', 'Token (40%)'].includes(booking.paymentDetails?.paymentMethod) ? 'Pending Reservation Payment' : 'Pending Booking Payment') : (isTokenPaid ? 'Move-In Payment Due' : 'Upcoming Due')}
                      </h3>
                      <div className="bg-[#EAF5F2]/50 border border-emerald-100 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto flex-1">

                          <div className="flex items-center gap-4 w-full sm:w-auto pb-4 sm:pb-0 border-b border-emerald-100/50 sm:border-0">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                              <Icon icon="lucide:calendar" className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[13px] text-slate-500 font-medium mb-0.5">
                                {booking.status === 'Pending Payment' ? 'Action Required' : (isTokenPaid ? 'Pay Before Move-In' : 'Next Rent Due On')}
                              </p>
                              <p className="text-[15px] font-bold text-[#062F26]">
                                {booking.status === 'Pending Payment' ? (['Token Amount', 'Token (40%)'].includes(booking.paymentDetails?.paymentMethod) ? 'Complete Token Payment to Reserve Bed' : 'Complete Full Payment to Confirm Booking') : (isTokenPaid ? 'Complete Full Payment' : 'N/A')}
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:block w-px h-10 bg-emerald-200/50 shrink-0"></div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-6">
                            <div>
                              <p className="text-[13px] text-slate-500 font-medium mb-0.5">Amount Due</p>
                              <p className="text-[15px] font-bold text-[#062F26]">₹{booking.status === 'Pending Payment' ? (booking.paymentDetails?.amount?.toLocaleString() || booking.propertyId?.monthlyRent || 0) : (isTokenPaid ? remainingAmount.toLocaleString() : '0')}</p>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-emerald-200/50 shrink-0"></div>

                            <div>
                              <p className="text-[13px] text-slate-500 font-medium mb-1">Status</p>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded ${booking.status === 'Pending Payment' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {booking.status === 'Pending Payment' ? 'Pending Payment' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {booking.status === 'Pending Payment' && (
                          <button
                            onClick={() => handlePayment(booking._id)}
                            disabled={processingPaymentId === booking._id}
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#062F26] text-white font-bold text-sm rounded-lg cursor-pointer shadow-md hover:bg-[#08483B] disabled:bg-slate-400 transition-colors shrink-0 flex items-center justify-center min-w-[120px]"
                          >
                            {processingPaymentId === booking._id ? (
                              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                            ) : (
                              'Pay Now'
                            )}
                          </button>
                        )}

                        {isTokenPaid && remainingAmount > 0 && booking.status === 'Reserved' && (
                          <button
                            onClick={() => {
                              setPendingPaymentData({ bookingId: booking._id, amount: remainingAmount });
                              setShowMockPayment(true);
                            }}
                            disabled={processingPaymentId === booking._id}
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#062F26] text-white font-bold text-sm rounded-lg cursor-pointer shadow-md hover:bg-[#08483B] disabled:bg-slate-400 transition-colors shrink-0 flex items-center justify-center min-w-[200px]"
                          >
                            {processingPaymentId === booking._id ? (
                              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                            ) : (
                              'Pay Remaining Balance'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Move-in Confirmation Banner */}
                  {(booking.status === 'Confirmed' || booking.status === 'Active') && booking.paymentDetails?.status === 'Paid' && !isTokenPaid && booking.eSignStatus === 'Completed' && (
                    <div id="confirm-move-in-section" className="mt-6">
                      <h3 className="text-lg font-bold text-[#062F26] mb-4">Move-in Status</h3>
                      <div className={`border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${booking.tenantConfirmedMoveIn ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-200'}`}>
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${booking.tenantConfirmedMoveIn ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            <Icon icon={booking.tenantConfirmedMoveIn ? "lucide:check-circle" : "lucide:home"} className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${booking.tenantConfirmedMoveIn ? 'text-emerald-800' : 'text-indigo-900'}`}>
                              {booking.tenantConfirmedMoveIn ? 'Move-in Confirmed' : 'Confirm Your Move-in'}
                            </p>
                            <p className={`text-[13px] leading-relaxed ${booking.tenantConfirmedMoveIn ? 'text-emerald-600' : 'text-indigo-700/80'}`}>
                              {booking.tenantConfirmedMoveIn
                                ? 'You have successfully confirmed your move-in. Welcome to your new home!'
                                : 'Please confirm once you have successfully moved into the property. This will release the escrow payment to the owner.'}
                            </p>
                          </div>
                        </div>
                        {!booking.tenantConfirmedMoveIn && (
                          <button
                            onClick={() => handleConfirmMoveIn(booking._id)}
                            disabled={confirmingMoveInId === booking._id}
                            className="animate-periodic-vibrate w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shrink-0 whitespace-nowrap flex items-center justify-center min-w-[150px]"
                          >
                            {confirmingMoveInId === booking._id ? (
                              <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                            ) : (
                              'Confirm Move-in'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Move-out Banner */}
                  {booking.status === 'Active' && booking.tenantConfirmedMoveIn && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-[#062F26] mb-4">Move-out Request</h3>

                      {booking.moveOutRequest?.isRequested ? (
                        <div className={`border rounded-xl p-5 ${booking.moveOutRequest.status === 'Rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${booking.moveOutRequest.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              <Icon icon={booking.moveOutRequest.status === 'Rejected' ? 'lucide:x-circle' : 'lucide:clock'} className="w-6 h-6" />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${booking.moveOutRequest.status === 'Rejected' ? 'text-red-800' : 'text-amber-800'}`}>
                                {booking.moveOutRequest.status === 'Rejected' ? 'Move-out Request Rejected' : 'Move-out Request Pending'}
                              </p>
                              <p className={`text-xs mt-1 leading-relaxed ${booking.moveOutRequest.status === 'Rejected' ? 'text-red-600' : 'text-amber-700/80'}`}>
                                Intended Move-out Date: {new Date(booking.moveOutRequest.intendedMoveOutDate).toDateString()}
                              </p>
                              {booking.moveOutRequest.status === 'Rejected' && booking.moveOutRequest.rejectionReason && (
                                <p className="text-xs mt-2 text-red-700 font-medium bg-red-100/50 p-2 rounded">
                                  Reason: {booking.moveOutRequest.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                          <p className="text-sm text-slate-600 mb-4">Planning to leave? Submit a move-out request to notify the owner and start the checkout process.</p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="date"
                              value={moveOutDateInput}
                              onChange={(e) => setMoveOutDateInput(e.target.value)}
                              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent flex-1"
                            />
                            <input
                              type="text"
                              placeholder="Reason (Optional)"
                              value={moveOutReasonInput}
                              onChange={(e) => setMoveOutReasonInput(e.target.value)}
                              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent flex-1"
                            />
                            <button
                              onClick={() => handleRequestMoveOut(booking._id)}
                              disabled={requestingMoveOutId === booking._id}
                              className="px-6 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 transition-colors shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                            >
                              {requestingMoveOutId === booking._id ? (
                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                              ) : (
                                'Request Move-out'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN - Sidebar */}
                <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 space-y-4">

                  {/* Booking Summary Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-[#062F26] mb-5">Booking Summary</h3>

                    <div className="space-y-4">
                      {summary.map((item, idx) => (
                        <div key={idx} className={`flex justify-between items-${item.isRightAligned ? 'start' : 'center'} text-sm ${item.hasTopBorder ? 'pt-2 border-t border-slate-100' : ''}`}>
                          <span className="text-slate-500 font-medium">{item.label}</span>
                          <span className={`font-bold text-slate-800 ${item.isRightAligned ? 'text-right' : ''}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Need Help Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-[#062F26] mb-1">Need Help?</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                      Our support team is here to help you.
                    </p>
                    <button className="w-full py-2.5 border border-[#0AA87D] text-[#0AA87D] font-bold text-sm rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                      <Icon icon="lucide:headphones" className="w-4 h-4" />
                      Contact Support
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      <AgreementModal
        isOpen={!!showAgreementModal}
        onClose={() => setShowAgreementModal(null)}
        onSubmit={() => {
          if (showAgreementModal && !showAgreementModal.isReadOnly) {
            handlePayBalance(showAgreementModal.bookingId, showAgreementModal.amount);
            setShowAgreementModal(null);
          }
        }}
        booking={showAgreementModal ? bookings.find(b => b._id === showAgreementModal.bookingId) : null}
        isReadOnly={showAgreementModal?.isReadOnly || false}
      />

      {/* Mock Payment Modal */}
      {showMockPayment && pendingPaymentData && (
        <MockPaymentModal
          isOpen={true}
          amount={pendingPaymentData.amount}
          onClose={() => setShowMockPayment(false)}
          onSuccess={() => {
            setShowMockPayment(false);
            setShowAgreementModal({ bookingId: pendingPaymentData.bookingId, amount: pendingPaymentData.amount });
          }}
        />
      )}
    </div>
  );
};

export default TenantBookings;
