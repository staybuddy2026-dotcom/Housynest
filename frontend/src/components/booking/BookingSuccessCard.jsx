import React from 'react';
import { Icon } from '@iconify/react';

const BookingSuccessCard = ({
  isPG,
  bookingRef,
  firstName,
  selectedBedName,
  propTitle,
  moveInDate,
  id,
  navigate
}) => {
  return (
    <div className="relative max-w-2xl mx-auto animate-in zoom-in-95 duration-500 fade-in">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#0AA87D]/20 via-[#062F26]/10 to-[#0AA87D]/20 rounded-[2rem] blur-xl opacity-70"></div>
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden">
        
        {/* Top Decorative accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0AA87D] to-[#062F26]"></div>

        {/* Animated Success Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-[#EAF5F2] rounded-full animate-ping opacity-60"></div>
          <div className="relative w-full h-full bg-gradient-to-tr from-[#0AA87D] to-[#0fdba4] rounded-full flex items-center justify-center shadow-lg shadow-[#0AA87D]/30 border-4 border-white">
            <Icon icon="lucide:check" className="w-12 h-12 text-white animate-in zoom-in spin-in-12 duration-700 delay-150" strokeWidth="3" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200 shadow-sm mb-4">
            <Icon icon="lucide:hash" className="w-3.5 h-3.5 text-[#0AA87D]" />
            {bookingRef}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#062F26] to-[#0AA87D] tracking-tight leading-tight">
            Booking Request Sent!
          </h2>
          <p className="text-[15px] text-slate-600 font-medium max-w-md mx-auto mt-4 leading-relaxed">
            Thank you, <span className="font-bold text-[#062F26]">{firstName}</span>! Your {isPG ? 'reservation for ' : 'booking for '}
            {isPG && <><span className="font-bold text-[#0AA87D] px-1 bg-[#EAF5F2] rounded mx-1">{selectedBedName || 'Bed'}</span> in </>}
            <span className="font-bold text-[#062F26]">{propTitle}</span> is successfully submitted.
          </p>
        </div>

        {/* Next Steps Container */}
        <div className="mt-8 bg-slate-50/50 rounded-2xl border border-slate-100 p-6 text-left">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5 text-sm uppercase tracking-wider">
            <Icon icon="lucide:sparkles" className="w-4 h-4 text-[#0AA87D]" />
            What happens next?
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Icon icon="lucide:clipboard-check" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Owner Review</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                  The property owner will review your request and confirm your Move-In date for <span className="font-bold text-slate-700">{moveInDate}</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Icon icon="lucide:message-square" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Direct Communication</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                  You can now message the owner directly from your Tenant Dashboard for any queries.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0AA87D] flex items-center justify-center shrink-0 border border-emerald-100">
                <Icon icon="lucide:file-signature" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Rental Agreement</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                  Once approved, your digital rental agreement will be prepared for online signature.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/tenant/bookings')}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-[#062F26] to-[#0a4236] hover:shadow-lg hover:shadow-[#062F26]/20 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
          >
            Go to My Bookings
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/properties/${id}`)}
            className="flex-1 py-4 px-6 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon icon="lucide:home" className="w-4 h-4" />
            Back to Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessCard;
