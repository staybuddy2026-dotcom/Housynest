import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const TenantRentPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [pendingInvoice, setPendingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [bookRes, invRes] = await Promise.all([
        fetch('/api/bookings/tenant', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/invoices/tenant', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (bookRes.ok && invRes.ok) {
        const bookData = await bookRes.json();
        const invData = await invRes.json();

        const currentBooking = bookData.find(b => b._id === id);
        if (currentBooking) {
          setBooking(currentBooking);
          const bookingInvoices = invData.filter(i =>
            i.bookingId === id || (i.bookingId && i.bookingId._id === id) || i.bookingId === currentBooking._id
          );
          setInvoices(bookingInvoices);
          let invoiceToPay = bookingInvoices.find(i => i.status === 'Pending' || i.status === 'Overdue');

          if (!invoiceToPay && (currentBooking.status === 'Pending Payment' || currentBooking.status === 'Reserved')) {
            const moveIn = new Date(currentBooking.moveInDate || new Date());
            const endOfFirstMonth = new Date(moveIn);
            endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() + 1);

            const getPricing = () => {
              if (currentBooking.propertyId?.propertyType === 'PG' && currentBooking.roomDetails?.sharingType) {
                const floor = currentBooking.propertyId.floors?.find(f => f.floorName === currentBooking.roomDetails.floorName);
                const room = floor?.rooms?.find(r => r.roomName === currentBooking.roomDetails.roomName);
                let baseType = 'Single';
                let isAC = false;

                if (room) {
                  baseType = room.sharingType || 'Single';
                  isAC = room.isAC;
                } else if (currentBooking.roomDetails?.sharingType) {
                  const st = currentBooking.roomDetails.sharingType;
                  baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
                  isAC = st.includes('(AC)');
                }
                const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
                const pricing = currentBooking.propertyId.pgPricing?.[typeStr];
                if (pricing) {
                  return {
                    rent: Number(pricing.rentPerBed?.replace(/\D/g, '') || 0),
                    deposit: Number(pricing.depositPerBed?.replace(/\D/g, '') || 0),
                    maintenance: 0
                  };
                }
              }
              return {
                rent: Number(currentBooking.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
                deposit: Number(currentBooking.propertyId?.securityAmount?.replace(/\D/g, '') || 0),
                maintenance: Number(currentBooking.propertyId?.maintenanceCharges?.replace(/\D/g, '') || 0)
              };
            };

            const pricing = getPricing();
            const stampFees = 800;
            const fullAmount = pricing.rent + pricing.deposit + pricing.maintenance + stampFees;
            const paymentMethod = currentBooking.paymentDetails?.paymentMethod || '';
            const isTokenMethod = paymentMethod.includes('Token');

            if (currentBooking.status === 'Pending Payment') {
              const amountDue = isTokenMethod ? Number(currentBooking.paymentDetails?.amount || 0) : fullAmount;
              invoiceToPay = {
                _id: 'initial_booking_payment',
                isInitialPayment: true,
                paymentStage: 'token_or_full',
                amount: amountDue,
                dueDate: new Date().toISOString(),
                billingPeriodStart: moveIn.toISOString(),
                billingPeriodEnd: endOfFirstMonth.toISOString(),
                status: 'Pending',
                breakdown: isTokenMethod ? { isTokenOnly: true } : {
                  rent: pricing.rent,
                  deposit: pricing.deposit,
                  maintenance: pricing.maintenance,
                  stampFees,
                  tokenPaid: 0
                }
              };
            } else if (currentBooking.status === 'Reserved') {
              const tokenPaid = Number(currentBooking.paymentDetails?.amount || 0);
              const remainingAmount = fullAmount > 0 ? fullAmount - tokenPaid : 0;
              invoiceToPay = {
                _id: 'balance_booking_payment',
                isInitialPayment: true,
                paymentStage: 'balance',
                amount: remainingAmount,
                dueDate: moveIn.toISOString(),
                billingPeriodStart: moveIn.toISOString(),
                billingPeriodEnd: endOfFirstMonth.toISOString(),
                status: 'Pending',
                breakdown: {
                  rent: pricing.rent,
                  deposit: pricing.deposit,
                  maintenance: pricing.maintenance,
                  stampFees,
                  tokenPaid
                }
              };
            }
          }

          setPendingInvoice(invoiceToPay);
        } else {
          toast.error('Booking not found');
          navigate('/tenant/bookings');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async () => {
    if (!pendingInvoice) return;
    setProcessingId(pendingInvoice._id);
    try {
      const token = localStorage.getItem('accessToken');
      let url = `/api/invoices/${pendingInvoice._id}/pay`;
      let reqOptions = { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } };

      if (pendingInvoice.paymentStage === 'token_or_full') {
        url = `/api/bookings/${booking._id}/pay`;
        reqOptions.method = 'PUT';
      } else if (pendingInvoice.paymentStage === 'balance') {
        url = `/api/bookings/${booking._id}/pay-balance`;
        reqOptions.method = 'PUT';
        reqOptions.headers['Content-Type'] = 'application/json';
        reqOptions.body = JSON.stringify({ amount: pendingInvoice.amount });
      }

      const res = await fetch(url, reqOptions);
      if (res.ok) {
        toast.success('Rent Paid Successfully!');
        fetchData();
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error processing payment.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!booking) return null;

  // Derive variables...
  let rentAmount = 10000;
  if (booking.propertyId) {
    if (booking.propertyId.pgPricing && booking.roomDetails && booking.roomDetails.sharingType) {
      const baseType = booking.roomDetails.sharingType.includes('Single') ? 'Single' : booking.roomDetails.sharingType.includes('Double') ? 'Double' : booking.roomDetails.sharingType.includes('Triple') ? 'Triple' : booking.roomDetails.sharingType.includes('Four') ? 'Four' : 'Other';
      const typeStr = `${baseType}_${booking.propertyId.isAC ? 'AC' : 'NonAC'}`;
      if (booking.propertyId.pgPricing[typeStr]?.rentPerBed) {
        rentAmount = Number(booking.propertyId.pgPricing[typeStr].rentPerBed.replace(/\D/g, ''));
      }
    } else if (booking.propertyId.monthlyRent) {
      rentAmount = Number(booking.propertyId.monthlyRent.replace(/\D/g, ''));
    }
  }

  const propertyName = booking.propertyId?.societyName || booking.propertyId?.pgName || booking.propertyId?.title || 'Property';
  const location = `${booking.propertyId?.locality || ''}, ${booking.propertyId?.city || ''}`;
  const room = booking.roomDetails?.roomName || 'N/A';
  const bed = booking.roomDetails?.bedName || 'N/A';
  const floor = booking.roomDetails?.floor || 'N/A';
  const sharingType = booking.roomDetails?.sharingType || 'N/A';
  const image = booking.propertyId?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

  const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatMonth = (d) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  const propertyType = booking.propertyId?.propertyType === 'Tenant'
    ? (booking.propertyId?.propertyCategory || 'Flat')
    : 'PG';
  const bookingDate = booking.createdAt ? formatDate(new Date(booking.createdAt)) : 'N/A';
  const moveInDateStr = booking.moveInDate ? formatDate(new Date(booking.moveInDate)) : 'N/A';

  const isTenant = booking.propertyId?.propertyType === 'Tenant';

  // Calculate Time Remaining for Pending Invoice
  let diffMs = 0;
  let daysDue = 0;
  let hoursDue = 0;
  let minsDue = 0;
  let isOverdue = false;

  if (pendingInvoice) {
    const nextDueDate = new Date(pendingInvoice.dueDate);
    const today = new Date();
    diffMs = nextDueDate - today;

    if (diffMs < 0) {
      isOverdue = true;
      const overDueMs = Math.abs(diffMs);
      daysDue = Math.floor(overDueMs / (1000 * 60 * 60 * 24));
      hoursDue = Math.floor((overDueMs / (1000 * 60 * 60)) % 24);
      minsDue = Math.floor((overDueMs / (1000 * 60)) % 60);
    } else {
      daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      hoursDue = Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24));
      minsDue = Math.max(0, Math.floor((diffMs / (1000 * 60)) % 60));
    }
  }

  // Get paid invoices for history
  const pastInvoices = invoices.filter(inv => inv.status === 'Paid');

  // Sort newest first
  pastInvoices.sort((a, b) => new Date(b.billingPeriodStart) - new Date(a.billingPeriodStart));

  return (
    <div className="mx-auto space-y-4 pb-20 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate('/tenant/bookings')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Icon icon="lucide:arrow-left" className="w-4 h-4" />
        Back to Bookings
      </button>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column */}
        <div className="flex-1 space-y-3">

          {/* Property Header Card */}
          <div className="bg-white rounded-xl p-4  shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col sm:flex-row gap-6 items-start relative">
            <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-emerald-100">
              Active
            </div>
            <img src={image} alt={propertyName} className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-lg shrink-0" />

            <div className="flex-1 space-y-4 w-full">
              <div>
                <h1 className="text-xl font-bold text-[#062F26]">{propertyName}</h1>
                <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
                  {location}
                </p>
              </div>

              <div className={`grid grid-cols-2 ${isTenant ? 'sm:grid-cols-3' : 'sm:grid-cols-5'} gap-4 pt-4 border-t border-slate-100`}>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-0.5">Property Type</p>
                  <p className="text-base font-bold text-slate-800">{propertyType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-0.5">Booking Date</p>
                  <p className="text-base font-bold text-slate-800">{bookingDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-0.5">Move In Date</p>
                  <p className="text-base font-bold text-slate-800">{moveInDateStr}</p>
                </div>
                {!isTenant && (
                  <>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Room & Bed</p>
                      <p className="text-sm font-bold text-slate-800">{room !== 'N/A' ? `${room} - ${bed}` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Room Type</p>
                      <p className="text-sm font-bold text-slate-800">{sharingType}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#062F26]">Pay Rent</h2>

          {/* Pay Rent Details Card */}
          {pendingInvoice ? (
            <div className="space-y-4">
              <div className="bg-[#FAFAF9] rounded-xl p-4 sm:p-5 border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center justify-between w-full lg:w-auto border-b border-slate-200 pb-4 lg:border-0 lg:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                      <Icon icon="lucide:calendar-clock" className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium mb-0.5">Next Rent Due On</p>
                      <p className="text-base font-bold text-[#062F26]">{formatDate(new Date(pendingInvoice.dueDate))}</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

                <div className="flex flex-row lg:flex-row items-center justify-between w-full lg:w-auto gap-4">
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium mb-0.5">Rent Period</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">{formatDate(new Date(pendingInvoice.billingPeriodStart))} - {formatDate(new Date(pendingInvoice.billingPeriodEnd))}</p>
                  </div>

                  <div className="hidden sm:block lg:hidden w-px h-10 bg-slate-200"></div>
                  <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

                  <div className="flex items-center gap-2">
                    <div className="text-right sm:text-center">
                      <p className={`text-[10px] ${isOverdue ? 'text-rose-600' : 'text-slate-500'} font-bold uppercase tracking-wider mb-1.5 text-center`}>
                        {isOverdue ? 'Overdue By' : 'Due In'}
                      </p>
                      <div className="flex gap-1 sm:gap-1.5 text-center">
                        <div className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded border shadow-sm min-w-[32px] sm:min-w-[36px] ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                          <span className={`block text-xs sm:text-sm font-bold ${isOverdue ? 'text-rose-700' : 'text-[#062F26]'}`}>{daysDue}</span>
                          <span className={`block text-[8px] font-medium uppercase mt-0.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>Days</span>
                        </div>
                        <div className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded border shadow-sm min-w-[32px] sm:min-w-[36px] ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                          <span className={`block text-xs sm:text-sm font-bold ${isOverdue ? 'text-rose-700' : 'text-[#062F26]'}`}>{hoursDue}</span>
                          <span className={`block text-[8px] font-medium uppercase mt-0.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>Hours</span>
                        </div>
                        <div className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded border shadow-sm min-w-[32px] sm:min-w-[36px] ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                          <span className={`block text-xs sm:text-sm font-bold ${isOverdue ? 'text-rose-700' : 'text-[#062F26]'}`}>{minsDue}</span>
                          <span className={`block text-[8px] font-medium uppercase mt-0.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>Mins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isOverdue && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
                  <Icon icon="lucide:alert-circle" className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-800">Payment Overdue</h4>
                    <p className="text-xs text-rose-600 mt-1 font-medium leading-relaxed">
                      Your rent payment is past the due date. Please clear your dues immediately to avoid late fees or disruption of services.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <Icon icon="lucide:check-circle-2" className="w-12 h-12 text-emerald-500 mb-3" />
                <h3 className="text-lg font-bold text-[#062F26]">All Dues Cleared!</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">You don't have any pending rent invoices for this booking.</p>
              </div>
            </div>
          )}

          <h2 className="text-lg font-bold text-[#062F26]">Rent Payment History</h2>
          {/* History Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    {['Month', 'Rent Period', 'Amount', 'Paid On', 'Status', 'Action'].map((header, idx) => (
                      <th key={idx} className={`p-4 font-bold ${header === 'Action' ? 'text-right' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs lg:text-sm font-medium text-slate-700 divide-y divide-slate-50">
                  {pastInvoices.length > 0 ? (
                    pastInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold">{formatMonth(new Date(inv.billingPeriodStart))}</td>
                        <td className="p-4 text-slate-500">{formatDate(new Date(inv.billingPeriodStart))} - {formatDate(new Date(inv.billingPeriodEnd))}</td>
                        <td className="p-4 font-bold text-[#062F26]">₹{inv.amount.toLocaleString()}</td>
                        <td className="p-4 text-slate-500">{formatDate(new Date(inv.paidAt || inv.dueDate))}</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-100">Paid</span></td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedReceipt(inv)}
                            className="text-[#0AA87D] hover:text-[#062F26] font-bold text-[11px] flex items-center justify-end gap-1.5 transition-colors ml-auto cursor-pointer"
                          >
                            <Icon icon="lucide:download" className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon="lucide:calendar-clock" className="w-10 h-10 text-slate-300 mb-2" />
                          <p>No past rent history found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Set Auto Pay Card */}
          <div className="bg-white rounded-xl border border-[#FCD34D] shadow-sm overflow-hidden mt-4">
            <div className="bg-[#FFFDF0] px-4 sm:px-5 py-3 border-b border-[#FDE68A] flex items-center justify-between">
              <h3 className="font-bold text-[#B45309] text-sm flex items-center gap-2">
                Set Auto Pay <span className="bg-[#FEF3C7] text-[#D97706] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#FDE68A] hidden sm:inline-block">(Recommended)</span>
              </h3>
              <p className="text-xs font-semibold text-[#B45309] hidden sm:block">Save time, never miss a payment</p>
            </div>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
              <div className="flex gap-4 items-start w-full sm:w-auto">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0 mt-1">
                  <Icon icon="lucide:refresh-cw" className="w-5 h-5 text-[#0AA87D]" />
                </div>
                <div className="space-y-2.5 pr-12 sm:pr-0 flex-1">
                  <p className="text-sm font-bold text-slate-700">Enable auto pay to pay rent automatically on due date.</p>
                  <ul className="text-xs font-semibold text-slate-500 space-y-2 sm:space-y-1.5 flex flex-wrap sm:block gap-x-4 gap-y-1 sm:gap-0">
                    <li className="flex items-center gap-2"><Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-[#0AA87D]" /> Never miss a payment</li>
                    <li className="flex items-center gap-2"><Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-[#0AA87D]" /> Hassle free experience</li>
                    <li className="flex items-center gap-2"><Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-[#0AA87D]" /> Cancel anytime</li>
                  </ul>
                </div>
              </div>
              <div className="absolute top-5 right-5 sm:static flex flex-col items-end gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoPayEnabled} onChange={() => setAutoPayEnabled(!autoPayEnabled)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AA87D]"></div>
                </label>
                <button className="hidden sm:block px-4 py-2 border border-[#0AA87D] text-[#0AA87D] font-bold text-xs rounded-lg hover:bg-emerald-50 transition-colors mt-4">
                  Set Up Auto Pay
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Payment Sidebar */}
        <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 space-y-4">

          {/* Payment Summary */}
          <div className="bg-white rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="text-base 3xl:text-lg font-bold text-[#062F26] mb-4 border-b border-slate-100 pb-3">Payment Summary</h3>
            <div className="space-y-4">
              {pendingInvoice && pendingInvoice.isInitialPayment && pendingInvoice.breakdown ? (
                <>
                  {pendingInvoice.breakdown.isTokenOnly ? (
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                      <span>Token Amount</span>
                      <span className="font-bold text-slate-800">₹{pendingInvoice.amount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                        <span>Monthly Rent</span>
                        <span className="font-bold text-slate-800">₹{pendingInvoice.breakdown.rent.toLocaleString()}</span>
                      </div>
                      {pendingInvoice.breakdown.deposit > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                          <span>Security Deposit</span>
                          <span className="font-bold text-slate-800">₹{pendingInvoice.breakdown.deposit.toLocaleString()}</span>
                        </div>
                      )}
                      {pendingInvoice.breakdown.maintenance > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                          <span>Maintenance</span>
                          <span className="font-bold text-slate-800">₹{pendingInvoice.breakdown.maintenance.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                        <span>Other Fees (Agreement)</span>
                        <span className="font-bold text-slate-800">₹{pendingInvoice.breakdown.stampFees.toLocaleString()}</span>
                      </div>
                      {pendingInvoice.breakdown.tokenPaid > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600 text-emerald-600">
                          <span>Token Paid</span>
                          <span className="font-bold">-₹{pendingInvoice.breakdown.tokenPaid.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center text-base pt-4 border-t border-dashed border-slate-200">
                    <span className="font-bold text-[#062F26]">{pendingInvoice.paymentStage === 'balance' ? 'Remaining Balance' : 'Total Due Amount'}</span>
                    <span className="text-xl font-bold text-[#0AA87D]">₹{pendingInvoice.amount.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                    <span>Monthly Rent</span>
                    <span className="font-bold text-slate-800">₹{pendingInvoice ? pendingInvoice.amount.toLocaleString() : rentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                    <span>Maintenance Charges</span>
                    <span className="font-bold text-slate-800">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 pb-4 border-b border-dashed border-slate-200">
                    <span>Late Fee</span>
                    <span className="font-bold text-slate-800">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-base">
                    <span className="font-bold text-[#062F26]">Total Amount</span>
                    <span className="text-xl font-bold text-[#0AA87D]">₹{pendingInvoice ? pendingInvoice.amount.toLocaleString() : 0}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handlePayRent}
              disabled={!pendingInvoice || processingId === pendingInvoice._id}
              className="w-full py-2.5 mt-4 bg-[#0AA87D] hover:bg-[#062F26] text-white rounded-lg font-bold transition-all shadow-[0_4px_10px_rgba(10,168,125,0.2)] hover:shadow-[0_4px_15px_rgba(6,47,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingId ? (
                <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
              ) : (
                'Pay Now'
              )}
            </button>
            <div className="mt-4 p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center gap-2 text-emerald-700 text-xs font-semibold">
              <Icon icon="lucide:shield-check" className="w-4 h-4" /> Your payment is secure and encrypted
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-5 flex flex-col items-start gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                <Icon icon="lucide:info" className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">Need help?</h4>
                <p className="text-xs font-medium text-slate-500 max-w-[200px]">Contact our support team and we'll be happy to assist you.</p>
              </div>
            </div>
            <button className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Icon icon="lucide:headphones" className="w-4 h-4" /> Contact Support
            </button>
          </div>



        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-lg font-bold text-[#062F26]">Payment Receipt</h2>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            
            {/* Receipt Content */}
            <div className="p-6 overflow-y-auto" id="receipt-content">
              <div className="flex justify-between items-start mb-8 relative">
                <div>
                  <img src="/src/assets/logo.png" alt="Housynest" className="h-8 object-contain mb-1" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center">
                  <h3 className="text-[#0AA87D] font-bold text-lg tracking-wider">PAYMENT RECEIPT</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Receipt #{selectedReceipt._id?.substring(0, 8).toUpperCase()}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Date: {formatDate(new Date(selectedReceipt.paidAt || selectedReceipt.updatedAt || Date.now()))}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paid To</p>
                  <p className="text-sm font-bold text-slate-800">{booking?.propertyId?.pgName || 'Property Owner'}</p>
                  <p className="text-xs font-semibold text-slate-500">{booking?.propertyId?.address || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                  <p className="text-sm font-bold text-slate-800">{booking?.tenantId?.fullName || JSON.parse(localStorage.getItem('user') || '{}')?.fullName || 'Tenant'}</p>
                  <p className="text-xs font-semibold text-slate-500">Room {booking?.roomDetails?.roomName}, {booking?.roomDetails?.bedName}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Booking ID: {booking?.bookingId || booking?._id?.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                    {(() => {
                      const finalRentAmt = booking?.paymentDetails?.rentAmount || booking?.roomDetails?.rentAmount || (typeof rentAmount !== 'undefined' ? rentAmount : 0);
                      let stamp = booking?.eStampFees || booking?.paymentDetails?.extraCharges || 0;
                      const maint = booking?.roomDetails?.maintenanceFees || 0;
                      let secDep = booking?.paymentDetails?.securityDeposit || booking?.roomDetails?.securityDeposit || 0;
                      
                      const sortedInvoices = [...invoices].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                      const isFirstInvoice = sortedInvoices.length > 0 && selectedReceipt && sortedInvoices[0]._id === selectedReceipt._id;
                      
                      let isMoveIn = false;
                      if (isFirstInvoice && selectedReceipt.amount > finalRentAmt + 500) {
                        isMoveIn = true;
                        if (stamp === 0) stamp = 800; // hardcode stamp for move-in
                        secDep = selectedReceipt.amount - finalRentAmt - maint - stamp;
                      } else if (secDep > 0 && selectedReceipt.amount > finalRentAmt + 10) {
                        isMoveIn = true;
                        if (stamp === 0) stamp = 800;
                        secDep = selectedReceipt.amount - finalRentAmt - maint - stamp;
                      }
                      
                      if (isMoveIn) {
                        return (
                          <>
                            <tr>
                              <td className="px-4 py-3">Rent ({formatDate(new Date(selectedReceipt.billingPeriodStart))} - {formatDate(new Date(selectedReceipt.billingPeriodEnd))})</td>
                              <td className="px-4 py-3 text-right">₹{finalRentAmt.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3">Security Deposit</td>
                              <td className="px-4 py-3 text-right">₹{secDep.toLocaleString()}</td>
                            </tr>
                            {maint > 0 && (
                              <tr>
                                <td className="px-4 py-3">Maintenance Charges</td>
                                <td className="px-4 py-3 text-right">₹{maint.toLocaleString()}</td>
                              </tr>
                            )}
                            {stamp > 0 && (
                              <tr>
                                <td className="px-4 py-3">Extra Charges (Stamp & Agreement)</td>
                                <td className="px-4 py-3 text-right">₹{stamp.toLocaleString()}</td>
                              </tr>
                            )}
                          </>
                        );
                      }
                      
                      return (
                        <>
                          <tr>
                            <td className="px-4 py-3">
                              Rent ({formatDate(new Date(selectedReceipt.billingPeriodStart))} - {formatDate(new Date(selectedReceipt.billingPeriodEnd))})
                            </td>
                            <td className="px-4 py-3 text-right">₹{selectedReceipt.amount.toLocaleString()}</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-800">Total Paid</td>
                      <td className="px-4 py-3 text-right font-black text-[#0AA87D] text-lg">₹{selectedReceipt.amount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                <Icon icon="lucide:check-circle-2" className="w-4 h-4 shrink-0" />
                This payment was successfully processed.
              </div>
            </div>
            
            {/* Footer / Actions */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl shrink-0">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={async () => {
                  try {
                    const doc = new jsPDF();
                    
                    // Helper to get image base64
                    const getLogoBase64 = async () => {
                      return new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.src = '/src/assets/logo.png';
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          canvas.width = img.width;
                          canvas.height = img.height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0);
                          resolve(canvas.toDataURL('image/png'));
                        };
                        img.onerror = () => resolve(null);
                      });
                    };

                    const logoBase64 = await getLogoBase64();
                    
                    // Header
                    if (logoBase64) {
                      // Add Logo (top left)
                      doc.addImage(logoBase64, 'PNG', 14, 12, 40, 12);
                    } else {
                      doc.setFontSize(22);
                      doc.setTextColor(10, 168, 125);
                      doc.setFont("helvetica", "bold");
                      doc.text("Housynest", 14, 20);
                    }
                    
                    // Centered Payment Receipt Title
                    doc.setFontSize(16);
                    doc.setTextColor(10, 168, 125);
                    doc.setFont("helvetica", "bold");
                    doc.text("PAYMENT RECEIPT", 105, 22, { align: 'center' });
                    doc.setFont("helvetica", "normal");
                    
                    doc.setFontSize(12);
                    doc.setTextColor(40, 40, 40);
                    doc.text(`Receipt #${selectedReceipt._id?.substring(0, 8).toUpperCase()}`, 196, 20, { align: 'right' });
                    doc.setFontSize(10);
                    doc.text(`Date: ${formatDate(new Date(selectedReceipt.paidAt || selectedReceipt.updatedAt || Date.now()))}`, 196, 26, { align: 'right' });
                    
                    doc.setDrawColor(230, 230, 230);
                    doc.line(14, 32, 196, 32);
                    
                    // Billed To / Paid To
                    doc.setFontSize(9);
                    doc.setTextColor(150, 150, 150);
                    doc.text("PAID TO", 14, 42);
                    doc.text("BILLED TO", 196, 42, { align: 'right' });
                    
                    doc.setFontSize(11);
                    doc.setTextColor(40, 40, 40);
                    doc.setFont("helvetica", "bold");
                    doc.text(booking?.propertyId?.pgName || 'Property Owner', 14, 48);
                    doc.text(booking?.tenantId?.fullName || JSON.parse(localStorage.getItem('user') || '{}')?.fullName || 'Tenant', 196, 48, { align: 'right' });
                    
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(100, 100, 100);
                    doc.text(booking?.propertyId?.address || 'N/A', 14, 54);
                    doc.text(`Room ${booking?.roomDetails?.roomName}, ${booking?.roomDetails?.bedName}`, 196, 54, { align: 'right' });
                    doc.text(`Booking ID: ${booking?.bookingId || booking?._id?.substring(0, 8).toUpperCase()}`, 196, 60, { align: 'right' });
                    
                    // Table Header
                    const startY = 70;
                    doc.setFillColor(248, 250, 252);
                    doc.rect(14, startY, 182, 10, 'F');
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(100, 100, 100);
                    doc.text("Description", 20, startY + 7);
                    doc.text("Amount", 188, startY + 7, { align: 'right' });
                    
                    // Table Content
                    doc.setTextColor(40, 40, 40);
                    doc.setFont("helvetica", "normal");
                    
                    const finalRentAmt = booking?.paymentDetails?.rentAmount || booking?.roomDetails?.rentAmount || (typeof rentAmount !== 'undefined' ? rentAmount : 0);
                    let stamp = booking?.eStampFees || booking?.paymentDetails?.extraCharges || 0;
                    const maint = booking?.roomDetails?.maintenanceFees || 0;
                    let secDep = booking?.paymentDetails?.securityDeposit || booking?.roomDetails?.securityDeposit || 0;
                    
                    const sortedInvoices = [...invoices].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    const isFirstInvoice = sortedInvoices.length > 0 && selectedReceipt && sortedInvoices[0]._id === selectedReceipt._id;
                    
                    let isMoveIn = false;
                    if (isFirstInvoice && selectedReceipt.amount > finalRentAmt + 500) {
                      isMoveIn = true;
                      if (stamp === 0) stamp = 800;
                      secDep = selectedReceipt.amount - finalRentAmt - maint - stamp;
                    } else if (secDep > 0 && selectedReceipt.amount > finalRentAmt + 10) {
                      isMoveIn = true;
                      if (stamp === 0) stamp = 800;
                      secDep = selectedReceipt.amount - finalRentAmt - maint - stamp;
                    }
                    
                    let currentY = startY + 10;
                    
                    if (isMoveIn) {
                      const items = [
                        { label: `Rent (${formatDate(new Date(selectedReceipt.billingPeriodStart))} - ${formatDate(new Date(selectedReceipt.billingPeriodEnd))})`, amount: finalRentAmt },
                        { label: 'Security Deposit', amount: secDep }
                      ];
                      if (maint > 0) items.push({ label: 'Maintenance Charges', amount: maint });
                      if (stamp > 0) items.push({ label: 'Extra Charges (Stamp & Agreement)', amount: stamp });
                      
                      items.forEach(item => {
                        doc.rect(14, currentY, 182, 12);
                        doc.text(item.label, 20, currentY + 8);
                        doc.text(`Rs. ${item.amount.toLocaleString('en-IN')}`, 188, currentY + 8, { align: 'right' });
                        currentY += 12;
                      });
                    } else {
                      doc.rect(14, currentY, 182, 16); 
                      doc.text(`Rent (${formatDate(new Date(selectedReceipt.billingPeriodStart))} - ${formatDate(new Date(selectedReceipt.billingPeriodEnd))})`, 20, currentY + 7);
                      doc.text(`Rs. ${selectedReceipt.amount.toLocaleString('en-IN')}`, 188, currentY + 7, { align: 'right' });
                      currentY += 16;
                    }
              
                    const finalY = currentY + 6;
              
                    // Total Summary
                    doc.setFillColor(248, 250, 252);
                    doc.rect(14, finalY, 182, 16, 'F');
                    doc.rect(14, finalY, 182, 16); 
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(40, 40, 40);
                    doc.text("Total Paid:", 20, finalY + 11);
                    doc.setTextColor(10, 168, 125);
                    doc.text(`Rs. ${selectedReceipt.amount.toLocaleString('en-IN')}`, 188, finalY + 11, { align: 'right' });
              
                    // Footer
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(120, 120, 120);
                    doc.text("This payment was successfully processed.", 105, 275, { align: "center" });
                    doc.text("Thank you for using Housynest!", 105, 282, { align: "center" });
              
                    // Add Watermark (center) over everything so it's not clipped
                    if (logoBase64) {
                      doc.setGState(new doc.GState({ opacity: 0.08 }));
                      doc.addImage(logoBase64, 'PNG', 45, 130, 120, 36);
                      doc.setGState(new doc.GState({ opacity: 1.0 }));
                    }

                    // Save
                    doc.save(`Receipt_${selectedReceipt._id.substring(selectedReceipt._id.length - 8).toUpperCase()}.pdf`);
                    toast.success('Receipt downloaded successfully!');
                  } catch (error) {
                    console.error("Error generating receipt:", error);
                    toast.error('Failed to generate receipt.');
                  }
                }}
                className="px-5 py-2 bg-[#062F26] text-white rounded-lg font-bold text-sm hover:bg-[#08483B] transition-colors flex items-center gap-2"
              >
                <Icon icon="lucide:download" className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TenantRentPayment;
