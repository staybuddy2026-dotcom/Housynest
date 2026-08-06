import React from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const TabBookings = ({ bookings, loadingBookings, setBookings }) => {
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
                  {booking.propertyId?.propertyType === 'Tenant' ? (
                     <span className="flex items-center gap-1"><Icon icon="lucide:home" className="w-3.5 h-3.5" /> Full Property</span>
                  ) : booking.roomDetails?.roomName && (
                    <span className="flex items-center gap-1"><Icon icon="lucide:bed" className="w-3.5 h-3.5" /> {booking.roomDetails.roomName} ({booking.roomDetails.bedName})</span>
                  )}
                  <span className="flex items-center gap-1 font-semibold text-brand-teal">₹{booking.paymentDetails?.amount?.toLocaleString()} ({booking.paymentDetails?.paymentMethod})</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
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

export default TabBookings;
