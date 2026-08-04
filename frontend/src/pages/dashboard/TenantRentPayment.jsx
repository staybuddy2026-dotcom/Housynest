import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const TenantRentPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/bookings/tenant', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const currentBooking = data.find(b => b._id === id);
          if (currentBooking) {
            setBooking(currentBooking);
          } else {
            toast.error('Booking not found');
            navigate('/tenant/bookings');
          }
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

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

  // Dynamic Date calculations based on MoveInDate
  const moveInDate = booking.moveInDate ? new Date(booking.moveInDate) : new Date();
  const today = new Date();
  
  // Calculate next due date (same date of month as moveInDate)
  let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());
  if (nextDueDate < today) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }
  
  const rentPeriodStart = new Date(nextDueDate);
  rentPeriodStart.setMonth(rentPeriodStart.getMonth() - 1);
  const rentPeriodEnd = new Date(nextDueDate);

  const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatMonth = (d) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  // Calculate Time Remaining
  const diffMs = nextDueDate - today;
  const daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursDue = Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24));
  const minsDue = Math.max(0, Math.floor((diffMs / (1000 * 60)) % 60));

  // Generate dynamic History (last 3 months max, respecting moveInDate)
  const pastMonths = [];
  for (let i = 1; i <= 3; i++) {
      const pastEnd = new Date(nextDueDate);
      pastEnd.setMonth(pastEnd.getMonth() - i);
      const pastStart = new Date(pastEnd);
      pastStart.setMonth(pastStart.getMonth() - 1);
      
      // Stop generating history before moveInDate
      if (pastEnd <= moveInDate) break;
      
      pastMonths.push({
          month: formatMonth(pastEnd),
          period: `${formatDate(pastStart)} - ${formatDate(pastEnd)}`,
          dueDate: formatDate(pastEnd),
          amount: rentAmount
      });
  }

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
          <div className="bg-[#FAFAF9] rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                <Icon icon="lucide:calendar-clock" className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-0.5">Next Rent Due On</p>
                <p className="text-base font-extrabold text-[#062F26]">{formatDate(nextDueDate)}</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-0.5">Rent Period</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(rentPeriodStart)} - {formatDate(rentPeriodEnd)}</p>
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
                  {pastMonths.length > 0 ? (
                    pastMonths.map((hist, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold">{hist.month}</td>
                        <td className="p-4 text-slate-500">{hist.period}</td>
                        <td className="p-4 font-bold text-[#062F26]">₹{hist.amount.toLocaleString()}</td>
                        <td className="p-4 text-slate-500">{hist.dueDate}</td>
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

          {/* Need Help Card */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                <Icon icon="lucide:info" className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Need help with payment?</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Contact our support team and we'll be happy to assist you.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 shrink-0 cursor-pointer">
              <Icon icon="lucide:headphones" className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>

        </div>

        {/* Right Column - Payment Sidebar */}
        <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 space-y-4">

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-6">
            <h3 className="text-base font-extrabold text-[#062F26] mb-5">Payment Summary</h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Monthly Rent</span>
                <span className="font-bold text-slate-800">₹{rentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Previous Dues</span>
                <span className="font-bold text-slate-800">₹0</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span className="flex items-center gap-1">Other Charges <Icon icon="lucide:info" className="w-3.5 h-3.5 text-slate-400" /></span>
                <span className="font-bold text-slate-800">₹0</span>
              </div>

              <div className="border-t border-slate-100 pt-3.5 mt-2 flex justify-between items-center">
                <span className="font-extrabold text-slate-800 text-base">Total Amount</span>
                <span className="font-extrabold text-[#0AA87D] text-xl">₹{rentAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 text-emerald-700 text-[11px] font-bold">
              <Icon icon="lucide:shield-check" className="w-4 h-4" /> Your payment is secure and encrypted
            </div>
          </div>

          {/* Select Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-6">
            <h3 className="text-base font-extrabold text-[#062F26] mb-4">Select Payment Method</h3>

            <div className="space-y-3">
              {[
                { id: 'UPI', title: 'UPI', desc: 'Pay using any UPI app', icon: null },
                { id: 'Card', title: 'Credit / Debit Card', desc: 'Pay using any card', icon: <div className="flex gap-1 items-center"><Icon icon="logos:visa" className="h-3" /><Icon icon="logos:mastercard" className="h-3" /></div> },
                { id: 'NetBanking', title: 'Net Banking', desc: 'Pay using your bank account', icon: null },
                { id: 'Wallet', title: 'Wallets', desc: 'Pay using wallet balance', icon: null }
              ].map((method) => (
                <label key={method.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedMethod === method.id ? 'border-[#0AA87D] bg-emerald-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value={method.id} checked={selectedMethod === method.id} onChange={(e) => setSelectedMethod(e.target.value)} className="w-4 h-4 text-[#0AA87D] border-slate-300 focus:ring-[#0AA87D]" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{method.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{method.desc}</p>
                    </div>
                  </div>
                  {method.icon && method.icon}
                </label>
              ))}
            </div>

            <button className="w-full mt-6 py-3.5 bg-[#062F26] hover:bg-[#08483B] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Icon icon="lucide:lock" className="w-4 h-4" /> Pay ₹{rentAmount.toLocaleString()}
            </button>
            <p className="text-center text-[10px] text-slate-500 font-semibold mt-3">
              By proceeding, you agree to our <a href="#" className="text-[#0AA87D] hover:underline">Terms & Conditions</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TenantRentPayment;
