import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const TabNoticePeriods = ({ propertyId }) => {
  const [noticeBookings, setNoticeBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeActionId, setActiveActionId] = useState(null);
  const [deductions, setDeductions] = useState(0);

  const fetchNoticeBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const bkgRes = await fetch('/api/bookings/owner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bkgRes.ok) {
        const allBookings = await bkgRes.json();
        const propBookings = allBookings.filter(
          b => b.propertyId?._id === propertyId && b.moveOutRequest?.isRequested
        );
        setNoticeBookings(propBookings);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notice periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchNoticeBookings();
    }
  }, [propertyId]);

  const handleReject = async (bookingId) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/reject-move-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (res.ok) {
        toast.success('Move-out request rejected');
        fetchNoticeBookings();
      } else {
        toast.error('Failed to reject move-out');
      }
    } catch (err) {
      toast.error('Error rejecting move-out');
    }
  };

  const handleProcessCheckout = async (bookingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${bookingId}/process-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deductions: Number(deductions) })
      });

      if (res.ok) {
        toast.success('Checkout processed successfully');
        setActiveActionId(null);
        setDeductions(0);
        fetchNoticeBookings();
      } else {
        toast.error('Failed to process checkout');
      }
    } catch (err) {
      toast.error('Error processing checkout');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading notice periods...</div>;
  }

  if (noticeBookings.length === 0) {
    return (
      <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:calendar-clock" className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Notice Periods</h3>
        <p className="text-slate-500 text-sm">None of the tenants in this property have requested to move out.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {noticeBookings.map(b => {
        const deposit = (() => {
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
              return Number(String(pgPric.depositPerBed || '').replace(/\D/g, '') || 0);
            }
          }
          return Number(String(b.propertyId?.securityAmount || '').replace(/\D/g, '') || 0) || Number(b.paymentDetails?.securityDeposit || 0);
        })();

        return (
          <div key={b._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {b.tenantId?.profilePic ? (
                    <img src={b.tenantId.profilePic} alt="Tenant" className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="lucide:user" className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{b.tenantId?.fullName}</h4>
                  <p className="text-sm text-slate-500">
                    {b.roomDetails?.roomName ? `Room: ${b.roomDetails.roomName}` : 'Property Booking'} | {b.tenantId?.phone}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                b.moveOutRequest?.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                b.moveOutRequest?.status === 'Moved Out' ? 'bg-emerald-100 text-emerald-700' :
                'bg-red-100 text-red-700'
              }`}>
                {b.moveOutRequest?.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-100 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Requested On</p>
                <p className="text-sm font-bold text-slate-700">
                  {b.moveOutRequest?.requestedAt ? new Date(b.moveOutRequest.requestedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Intended Move Out</p>
                <p className="text-sm font-bold text-brand-teal">
                  {b.moveOutRequest?.intendedMoveOutDate ? new Date(b.moveOutRequest.intendedMoveOutDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Security Deposit</p>
                <p className="text-sm font-bold text-slate-700">
                  ₹{deposit.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Reason</p>
                <p className="text-sm text-slate-700 truncate" title={b.moveOutRequest?.reason}>
                  {b.moveOutRequest?.reason || 'Not specified'}
                </p>
              </div>
            </div>

            {b.moveOutRequest?.status === 'Pending' && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleReject(b._id)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => setActiveActionId(activeActionId === b._id ? null : b._id)}
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-bold hover:bg-[#062F26] transition-colors"
                >
                  Process Checkout
                </button>
              </div>
            )}
          </div>

          {/* Action Area: Process Checkout */}
          {activeActionId === b._id && b.moveOutRequest?.status === 'Pending' && (
            <div className="bg-slate-50 p-5 border-t border-slate-200">
              <h5 className="font-bold text-slate-800 mb-3 text-sm">Final Settlement & Checkout</h5>
              <div className="flex items-end gap-4">
                <div className="flex-1 max-w-xs">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security Deposit Deductions (₹)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
                    placeholder="Enter amount (e.g. for damages)"
                  />
                </div>
                <button
                  onClick={() => handleProcessCheckout(b._id)}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Confirm Checkout
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                This will mark the booking as Moved Out and release the bed/room. Make sure to check the Condition Reports before processing deductions.
              </p>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default TabNoticePeriods;
