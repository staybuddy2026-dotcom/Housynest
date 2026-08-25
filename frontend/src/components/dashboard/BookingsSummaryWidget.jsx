import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const BookingsSummaryWidget = () => {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        const [bookingsRes, propertiesRes] = await Promise.all([
          fetch('/api/bookings/owner', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/properties/owner', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (bookingsRes.ok) {
          setBookings(await bookingsRes.json());
        }
        if (propertiesRes.ok) {
          setProperties(await propertiesRes.json());
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completed = bookings.filter(b => ['Completed', 'Confirmed', 'Active'].includes(b.status)).length;
  const pending = bookings.filter(b => ['Reserved', 'Pending Payment', 'Pending Request'].includes(b.status)).length;
  const cancelled = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length;

  const { tomorrowDue, totalRentPotential } = (() => {
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

      const moveInDate = b.moveInDate ? new Date(b.moveInDate) : new Date(b.createdAt);
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());

      if (nextDueDate < today) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      // Check if due tomorrow
      if (nextDueDate.getTime() === tomorrow.getTime()) {
        tDue += rent;
      }
    });

    // Calculate True Rent Potential from properties
    properties.forEach(p => {
      // Exclude inactive or deleted properties from potential
      if (!['Active', 'Approved', 'Pending'].includes(p.status)) return;

      if (p.propertyType === 'PG') {
        p.floors?.forEach(floor => {
          floor.rooms?.forEach(room => {
            const numBeds = room.beds?.length || 0;
            if (numBeds > 0) {
              const baseType = room.sharingType || 'Single';
              const isAC = room.isAC;
              const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
              const pricing = p.pgPricing?.[typeStr];
              if (pricing) {
                const rentPerBed = Number(pricing.rentPerBed?.replace(/\D/g, '') || 0);
                tRent += (rentPerBed * numBeds);
              }
            }
          });
        });
      } else {
        tRent += Number(p.monthlyRent?.replace(/\D/g, '') || 0);
      }
    });

    return { tomorrowDue: tDue, totalRentPotential: tRent };
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

        {/* Pending */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">{loading ? '-' : pending}</span>
          <span className="text-[11px] font-bold text-amber-500">Pending</span>
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
          <span className="text-[16px] font-bold text-brand-teal">{loading ? '-' : bookings.length}</span>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-medium text-slate-500">Tomorrow due rent</span>
          <span className="text-[14px] font-bold text-[#062F26]">₹ {tomorrowDue.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1 text-brand-teal text-[13px] font-bold">
          <Icon icon="lucide:arrow-up" className="w-3.5 h-3.5 stroke-[3]" />
          {loading ? '-' : `₹ ${totalRentPotential.toLocaleString()}`} (Total Rent Potential)
        </div>
      </div>
    </div>
  );
};

export default BookingsSummaryWidget;
