import React from 'react';
import { Icon } from '@iconify/react';

const BookingsSummaryWidget = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 relative group cursor-default hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
      <h3 className="text-[18px] font-bold text-[#062F26] mb-4">Bookings Summary</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Completed */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">72</span>
          <span className="text-[11px] font-bold text-brand-teal">Completed</span>
        </div>
        
        {/* Upcoming */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">14</span>
          <span className="text-[11px] font-bold text-blue-500">Upcoming</span>
        </div>
        
        {/* Cancelled */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-bold text-[#062F26] mb-1.5">05</span>
          <span className="text-[11px] font-bold text-red-500">Cancelled</span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
        <h4 className="text-[16px] font-bold text-[#062F26] mb-3">Total Bookings</h4>
        
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-medium text-slate-500">Tomorrow due rent</span>
          <span className="text-[14px] font-bold text-[#062F26]">₹ 12,250</span>
        </div>
        
        <div className="flex items-center gap-1 text-brand-teal text-[13px] font-bold">
          <Icon icon="lucide:arrow-up" className="w-3.5 h-3.5 stroke-[3]" />
          14,250
        </div>
      </div>
    </div>
  );
};

export default BookingsSummaryWidget;
