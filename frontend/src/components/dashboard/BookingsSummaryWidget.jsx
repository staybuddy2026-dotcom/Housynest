import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const BookingsSummaryWidget = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch('/api/bookings/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const completed = bookings.filter(b => b.status === 'Completed').length;
  const upcoming = bookings.filter(b => ['Confirmed', 'Reserved'].includes(b.status)).length;
  const cancelled = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length;

  const { tomorrowDue, totalRent } = (() => {
    let tDue = 0;
    let tRent = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeBookings = bookings.filter(b => ['Active', 'Confirmed'].includes(b.status));

    activeBookings.forEach(b => {
      let rent = 0;
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
        const pricing = b.propertyId.pgPricing?.[typeStr];
        if (pricing) {
          rent = Number(pricing.rentPerBed?.replace(/\D/g, '') || 0);
        }
      } else {
        rent = Number(b.propertyId?.monthlyRent?.replace(/\D/g, '') || 0);
      }

      tRent += rent;

      const moveInDate = b.moveInDate ? new Date(b.moveInDate) : new Date(b.createdAt);
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());
      
      if (nextDueDate < today) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      // Check if due tomorrow
      if (nextDueDate.getTime() === tomorrow.getTime()) {
        tDue += rent;
      } else if (nextDueDate <= today) {
        // Already due, count it as well if needed? The prompt says "Tomorrow due rent". 
        // We'll count what is due exactly tomorrow.
      }
    });

    return { tomorrowDue: tDue, totalRent: tRent };
  })();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 relative group cursor-default hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
      <h3 className="text-[18px] font-bold text-[#062F26] mb-4">Bookings Summary</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Completed */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">{loading ? '-' : completed}</span>
          <span className="text-[11px] font-bold text-brand-teal">Completed</span>
        </div>
        
        {/* Upcoming */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">{loading ? '-' : upcoming}</span>
          <span className="text-[11px] font-bold text-blue-500">Upcoming</span>
        </div>
        
        {/* Cancelled */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">{loading ? '-' : cancelled}</span>
          <span className="text-[11px] font-bold text-red-500">Cancelled</span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[16px] font-bold text-[#062F26]">Total Bookings</h4>
          <span className="text-[16px] font-extrabold text-brand-teal">{loading ? '-' : bookings.length}</span>
        </div>
        
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-medium text-slate-500">Tomorrow due rent</span>
          <span className="text-[14px] font-bold text-[#062F26]">₹ {tomorrowDue.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center gap-1 text-brand-teal text-[13px] font-bold">
          <Icon icon="lucide:arrow-up" className="w-3.5 h-3.5 stroke-[3]" />
          {totalRent.toLocaleString()} (Total Rent Potential)
        </div>
      </div>
    </div>
  );
};

export default BookingsSummaryWidget;
