import React from 'react';
import { Icon } from '@iconify/react';

const BookingSuccessCard = ({
  bookingRef,
  firstName,
  selectedBedName,
  propTitle,
  moveInDate,
  id,
  navigate
}) => {
  return (
    <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl border border-slate-100 space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-[#EAF5F2] text-[#0AA87D] flex items-center justify-center mx-auto shadow-inner">
        <Icon icon="lucide:check-circle-2" className="w-12 h-12" strokeWidth="2.5" />
      </div>

      <div>
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#EAF5F2] text-[#0AA87D] border border-[#0AA87D]/20">
          Ref: {bookingRef}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062F26] mt-3">
          Booking Request Sent Successfully!
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mt-2 leading-relaxed">
          Thank you, <span className="font-bold text-[#062F26]">{firstName}</span>! Your reservation for <span className="font-bold text-[#0AA87D]">{selectedBedName || 'Bed'}</span> in <span className="font-bold text-[#062F26]">{propTitle}</span> is submitted.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2 font-bold text-[#062F26]">
          <Icon icon="lucide:info" className="w-4 h-4 text-[#0AA87D]" />
          Next Steps:
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>The property owner will review your booking request and Move-In date ({moveInDate}).</li>
          <li>You can message the owner directly from your Tenant Dashboard.</li>
          <li>Your rental agreement will be prepared for online signature.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/tenant/requests')}
          className="flex-1 py-3.5 px-5 rounded-xl bg-[#062F26] hover:bg-[#0AA87D] text-[#FAF6F0] font-bold text-xs transition-colors shadow-md cursor-pointer"
        >
          Go to Stay Requests Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate(`/properties/${id}`)}
          className="flex-1 py-3.5 px-5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          Back to Property
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessCard;
