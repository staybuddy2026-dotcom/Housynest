import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

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
            const stampFees = 300;
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

  const propertyName = booking.propertyId?.pgName || booking.propertyId?.title || 'Property';
  const location = `${booking.propertyId?.locality || ''}, ${booking.propertyId?.city || ''}`;
  const room = booking.roomDetails?.roomName || 'Room';
  const bed = booking.roomDetails?.bedName || 'Bed';
  const floor = booking.roomDetails?.floor || '1st Floor';
  const sharingType = booking.roomDetails?.sharingType || 'Single Sharing';
  const image = booking.propertyId?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

  const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatMonth = (d) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  // Calculate Time Remaining for Pending Invoice
  let diffMs = 0;
  let daysDue = 0;
  let hoursDue = 0;
  let minsDue = 0;
  
  if (pendingInvoice) {
    const nextDueDate = new Date(pendingInvoice.dueDate);
    const today = new Date();
    diffMs = nextDueDate - today;
    daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    hoursDue = Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24));
    minsDue = Math.max(0, Math.floor((diffMs / (1000 * 60)) % 60));
  }

  // Get paid invoices for history
  const pastInvoices = invoices.filter(inv => inv.status === 'Paid');

  // Inject the initial booking payment as the first month's history
  if (booking.paymentDetails?.status === 'Paid' && booking.moveInDate) {
    const moveIn = new Date(booking.moveInDate);
    const endOfFirstMonth = new Date(moveIn);
    endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() + 1);
    
    pastInvoices.push({
      _id: 'initial_booking_payment',
      billingPeriodStart: moveIn.toISOString(),
      billingPeriodEnd: endOfFirstMonth.toISOString(),
      amount: booking.paymentDetails.amount || rentAmount,
      dueDate: moveIn.toISOString(),
      paidAt: booking.paymentDetails.paidAt || booking.createdAt,
      status: 'Paid'
    });
  }

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

      {/* Property Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col sm:flex-row gap-6 items-start relative">
        <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-emerald-100">
          Active
        </div>
        <img src={image} alt={propertyName} className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-xl shrink-0" />

        <div className="flex-1 space-y-4 w-full">
          <div>
            <h1 className="text-xl font-extrabold text-[#062F26]">{propertyName}</h1>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
              {location}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Room</p>
              <p className="text-sm font-bold text-slate-800">{room}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Bed</p>
              <p className="text-sm font-bold text-slate-800">{bed}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Floor</p>
              <p className="text-sm font-bold text-slate-800">{floor}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Room Type</p>
              <p className="text-sm font-bold text-slate-800">{sharingType}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">

          <h2 className="text-lg font-bold text-[#062F26]">Pay Rent</h2>

          {/* Pay Rent Details Card */}
          {pendingInvoice ? (
            <div className="bg-[#FAFAF9] rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                  <Icon icon="lucide:calendar-clock" className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Next Rent Due On</p>
                  <p className="text-base font-extrabold text-[#062F26]">{formatDate(new Date(pendingInvoice.dueDate))}</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-0.5">Rent Period</p>
                <p className="text-sm font-bold text-slate-800">{formatDate(new Date(pendingInvoice.billingPeriodStart))} - {formatDate(new Date(pendingInvoice.billingPeriodEnd))}</p>
              </div>

              <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-medium mb-1">Due In</p>
                  <div className="flex gap-1.5 text-center">
                    <div className="bg-white px-2 py-1.5 rounded border border-slate-200 shadow-sm min-w-[36px]">
                      <span className="block text-sm font-bold text-[#062F26]">{daysDue}</span>
                      <span className="block text-[8px] text-slate-400 font-medium uppercase mt-0.5">Days</span>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-slate-200 shadow-sm min-w-[36px]">
                      <span className="block text-sm font-bold text-[#062F26]">{hoursDue}</span>
                      <span className="block text-[8px] text-slate-400 font-medium uppercase mt-0.5">Hours</span>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-slate-200 shadow-sm min-w-[36px]">
                      <span className="block text-sm font-bold text-[#062F26]">{minsDue}</span>
                      <span className="block text-[8px] text-slate-400 font-medium uppercase mt-0.5">Mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col items-center justify-center text-center">
              <Icon icon="lucide:check-circle-2" className="w-12 h-12 text-emerald-500 mb-3" />
              <h3 className="text-lg font-bold text-[#062F26]">All Dues Cleared!</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">You don't have any pending rent invoices for this booking.</p>
            </div>
          )}

          <h2 className="text-lg font-bold text-[#062F26] pt-2">Rent Payment History</h2>
          {/* History Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4 font-bold">Month</th>
                    <th className="p-4 font-bold">Rent Period</th>
                    <th className="p-4 font-bold">Amount</th>
                    <th className="p-4 font-bold">Due Date</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                  {pastInvoices.length > 0 ? (
                    pastInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold">{formatMonth(new Date(inv.billingPeriodStart))}</td>
                        <td className="p-4 text-slate-500">{formatDate(new Date(inv.billingPeriodStart))} - {formatDate(new Date(inv.billingPeriodEnd))}</td>
                        <td className="p-4 font-bold text-[#062F26]">₹{inv.amount.toLocaleString()}</td>
                        <td className="p-4 text-slate-500">{formatDate(new Date(inv.dueDate))}</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-100">Paid</span></td>
                        <td className="p-4 text-right">
                          <button className="text-[#0AA87D] hover:text-[#062F26] font-bold text-[11px] flex items-center justify-end gap-1.5 transition-colors ml-auto cursor-pointer">
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
          <div className="bg-white rounded-2xl border border-[#FCD34D] shadow-sm overflow-hidden mt-4">
            <div className="bg-[#FFFDF0] px-5 py-3 border-b border-[#FDE68A] flex items-center justify-between">
              <h3 className="font-bold text-[#B45309] text-sm flex items-center gap-2">
                Set Auto Pay <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] px-2 py-0.5 rounded-full border border-[#FDE68A]">(Recommended)</span>
              </h3>
              <p className="text-[11px] font-semibold text-[#B45309] hidden sm:block">Save time, never miss a payment</p>
            </div>
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0 mt-1">
                  <Icon icon="lucide:refresh-cw" className="w-5 h-5 text-[#0AA87D]" />
                </div>
                <div className="space-y-2.5">
                  <p className="text-sm font-bold text-slate-700">Enable auto pay to pay rent automatically on due date.</p>
                  <ul className="text-xs font-semibold text-slate-500 space-y-1.5">
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
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="text-base font-bold text-[#062F26] mb-4 border-b border-slate-100 pb-3">Payment Summary</h3>
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
                    <span className="text-xl font-extrabold text-[#0AA87D]">₹{pendingInvoice.amount.toLocaleString()}</span>
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
                    <span className="text-xl font-extrabold text-[#0AA87D]">₹{pendingInvoice ? pendingInvoice.amount.toLocaleString() : 0}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handlePayRent}
              disabled={!pendingInvoice || processingId === pendingInvoice._id}
              className="w-full py-4 mt-6 bg-[#0AA87D] hover:bg-[#062F26] text-white rounded-xl font-bold transition-all shadow-[0_4px_10px_rgba(10,168,125,0.2)] hover:shadow-[0_4px_15px_rgba(6,47,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingId ? (
                <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
              ) : (
                'Pay Now'
              )}
            </button>
            <div className="mt-5 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 text-emerald-700 text-[11px] font-bold">
              <Icon icon="lucide:shield-check" className="w-4 h-4" /> Your payment is secure and encrypted
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-5 flex flex-col items-start gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                <Icon icon="lucide:info" className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Need help?</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 max-w-[200px]">Contact our support team and we'll be happy to assist you.</p>
              </div>
            </div>
            <button className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Icon icon="lucide:headphones" className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>



        </div>
      </div>
    </div>
  );
};

export default TenantRentPayment;
