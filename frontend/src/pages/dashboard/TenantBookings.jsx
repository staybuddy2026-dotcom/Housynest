import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AgreementModal from '../../components/booking/AgreementModal';

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

  const handlePayment = async (bookingId) => {
    setProcessingPaymentId(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Payment successful! Your booking is confirmed.');
        fetchBookings();
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('An error occurred during payment.');
    } finally {
      setProcessingPaymentId(null);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26]">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your active stay and booking details</p>
        </div>
      </div>

      {/* Main Layout - Map over bookings */}
      {!selectedBooking ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-semibold">Property</th>
                  <th className="p-4 font-semibold">Booking ID</th>
                  <th className="p-4 font-semibold">Room</th>
                  <th className="p-4 font-semibold">Move In</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
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
                          <p className="font-bold text-[#062F26] text-sm line-clamp-1">{booking.propertyId?.pgName || 'Property'}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 font-medium mt-0.5">{booking.propertyId?.locality}, {booking.propertyId?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {booking._id.substring(booking._id.length - 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">{booking.roomDetails?.roomName || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-medium">{booking.roomDetails?.bedName || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${booking.status === 'Confirmed' || booking.status === 'Active' || booking.status === 'Reserved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : (booking.status === 'Pending Request' || booking.status === 'Pending Payment')
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/tenant/bookings/${booking._id}/pay-rent`); }}
                          className="text-white px-3 py-2 rounded-lg cursor-pointer bg-[#062F26] hover:bg-[#08483B] transition-colors flex items-center justify-center shadow-sm"
                        >
                          <Icon icon="lucide:wallet" className="w-4 h-4 mr-1.5" />
                          <span className="text-xs font-bold">Pay Rent</span>
                        </button>
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
        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
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
              { label: 'Room Type', value: booking.roomDetails?.roomName || 'N/A' },
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
                            <h2 className="text-xl font-bold text-[#062F26]">{booking.propertyId?.pgName || 'Property'}</h2>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                              <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
                              {booking.propertyId?.locality}, {booking.propertyId?.city}
                            </p>
                          </div>
                          <span className={`px-3 py-1 font-bold text-xs rounded-lg border ${booking.status === 'Confirmed' || booking.status === 'Active' || booking.status === 'Reserved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : (booking.status === 'Pending Request' || booking.status === 'Pending Payment')
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                          {propStats.map((stat, idx) => (
                            <div key={idx}>
                              <p className="text-[11px] text-slate-400 font-semibold mb-1">{stat.label}</p>
                              <p className="text-sm font-bold text-slate-800">{stat.value}</p>
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
                            <p className="text-[10px] text-slate-400 font-semibold">{stat.label}</p>
                            <p className="text-xs font-bold text-[#062F26]">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-bold text-[#062F26] mb-4">Quick Actions</h3>
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
                            <h4 className="font-bold text-[#062F26] text-sm mb-1">{action.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
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
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                {booking.status === 'Pending Payment' ? 'Action Required' : (isTokenPaid ? 'Pay Before Move-In' : 'Next Rent Due On')}
                              </p>
                              <p className="text-sm font-bold text-[#062F26]">
                                {booking.status === 'Pending Payment' ? (['Token Amount', 'Token (40%)'].includes(booking.paymentDetails?.paymentMethod) ? 'Complete Token Payment to Reserve Bed' : 'Complete Full Payment to Confirm Booking') : (isTokenPaid ? 'Complete Full Payment' : 'N/A')}
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:block w-px h-10 bg-emerald-200/50 shrink-0"></div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-6">
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">Amount Due</p>
                              <p className="text-sm font-bold text-[#062F26]">₹{booking.status === 'Pending Payment' ? (booking.paymentDetails?.amount?.toLocaleString() || booking.propertyId?.monthlyRent || 0) : (isTokenPaid ? remainingAmount.toLocaleString() : '0')}</p>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-emerald-200/50 shrink-0"></div>

                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${booking.status === 'Pending Payment' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
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
                            onClick={() => setShowAgreementModal({ bookingId: booking._id, amount: remainingAmount })}
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

                </div>

                {/* RIGHT COLUMN - Sidebar */}
                <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 space-y-4">

                  {/* Booking Summary Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#062F26] mb-6">Booking Summary</h3>

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
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#062F26] mb-2">Need Help?</h3>
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                      Our support team is here to help you.
                    </p>
                    <button className="w-full py-3 border border-[#0AA87D] text-[#0AA87D] font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
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
    </div>
  );
};

export default TenantBookings;
