import React from 'react';
import { Icon } from '@iconify/react';

const BookingSidebarCard = ({
  isPG,
  propTitle,
  propLocation,
  moveInDate,
  selectedRoom,
  selectedBedName,
  paymentType,
  setPaymentType,
  showBreakdown,
  setShowBreakdown,
  baseRent,
  deposit,
  maintenance,
  stampFees,
  tokenAmount,
  tokenPayableNow,
  fullPayableNow,
  payNowAmount,
  handleFinalBookingSubmit,
  isAllStepsValid,
  isSubmitting
}) => {
  return (
    <div className="lg:col-span-4 sticky top-6 space-y-4">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-200/80">

        {/* DARK BLUE/TEAL HEADER BLOCK */}
        <div className="bg-[#062F26] text-white p-5 space-y-2">
          <h3 className="font-bold text-base sm:text-lg leading-snug">
            {propTitle}
          </h3>
          <p className="text-xs text-slate-300 flex items-center gap-1 font-medium">
            <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-[#0AA87D]" />
            {propLocation}
          </p>

          {/* Badges row with Move-In Date, Sharing Type, Room & Bed */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold text-emerald-200 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-[#0AA87D]" />
              {new Date(moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon icon="lucide:users" className="w-3.5 h-3.5 text-[#0AA87D]" />
              {selectedRoom?.sharingType ? `${selectedRoom.sharingType} Sharing` : 'Two Sharing'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon icon="lucide:bed" className="w-3.5 h-3.5 text-[#0AA87D]" />
              {selectedRoom?.roomName
                ? `${selectedRoom.roomName} (${selectedBedName || 'Bed 1'})`
                : (selectedBedName ? `Bed ${selectedBedName}` : 'Room 101 (Bed 1)')}
            </span>
          </div>
        </div>

        {/* CARD BODY CONTENT */}
        <div className="p-5 space-y-5">

          {/* PAY TOKEN VS PAY FULL TOGGLE CARDS */}
          {isPG && (
            <div className="grid grid-cols-2 gap-2.5">
              {/* Pay Token Option Card (40% Token - 100% Refundable) */}
              <button
                type="button"
                onClick={() => setPaymentType('token')}
                className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${paymentType === 'token'
                    ? 'border-[#0AA87D] bg-[#EAF5F2] ring-2 ring-[#0AA87D]/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                {paymentType === 'token' && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#0AA87D] border-2 border-white shadow-xs"></div>
                )}
                <p className="text-xs font-bold text-[#062F26]">Pay Token (40%)</p>
                <p className="text-[10px] font-bold text-[#0AA87D]">Reserve Bed • 100% Refundable</p>
              </button>

              {/* Pay Full Option Card */}
              <button
                type="button"
                onClick={() => setPaymentType('full')}
                className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${paymentType === 'full'
                    ? 'border-[#062F26] bg-[#EAF5F2] ring-2 ring-[#062F26]/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                {paymentType === 'full' && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#062F26] border-2 border-white shadow-xs"></div>
                )}
                <p className="text-xs font-bold text-[#062F26]">Pay Full</p>
                <p className="text-[10px] font-semibold text-slate-500">Confirm Now</p>
              </button>
            </div>
          )}

          {/* PAY NOW DISPLAY BOX */}
          <div className="bg-[#FFFDF0] border border-[#FCD34D] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                  PAY NOW
                </span>
                {paymentType === 'token' && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EAF5F2] text-[#0AA87D] border border-[#0AA87D]/30">
                    100% Refundable
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-xs font-bold text-slate-500 hover:text-[#062F26] flex items-center gap-1 cursor-pointer"
              >
                Breakdown
                <Icon icon={showBreakdown ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#062F26]">
                ₹{payNowAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Expandable Breakdown Accordion */}
            {showBreakdown && (
              <div className="pt-3 border-t border-[#FCD34D]/60 space-y-2 text-xs text-slate-600 animate-fadeIn">
                <div className="flex justify-between font-medium">
                  <span>Monthly Rent:</span>
                  <span className="font-bold text-[#062F26]">₹{baseRent.toLocaleString('en-IN')}</span>
                </div>

                {paymentType === 'token' ? (
                  <>
                    <div className="flex justify-between font-medium">
                      <span className="flex items-center gap-1">
                        Token (40% of Rent)
                        <span className="text-[10px] font-bold text-[#0AA87D] bg-[#EAF5F2] px-1.5 py-0.5 rounded-md">100% Refundable</span>
                      </span>
                      <span className="font-bold text-[#062F26]">₹{tokenAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-medium text-[#062F26]">
                      <span>Stamp & Agreement Fees:</span>
                      <span className="font-bold">₹{stampFees.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#0AA87D] pt-1.5 border-t border-slate-200/80">
                      <span>Total Token Amount (Pay Now):</span>
                      <span>₹{tokenPayableNow.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium pt-1 border-t border-slate-100">
                      <span>Remaining Rent (Pay at Move-In):</span>
                      <span className="font-bold text-[#062F26]">₹{(baseRent - tokenAmount).toLocaleString('en-IN')}</span>
                    </div>
                    {deposit > 0 && (
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Security Deposit (Pay at Move-In):</span>
                        <span className="font-bold text-[#062F26]">₹{deposit.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {maintenance > 0 && (
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Maintenance (Pay at Move-In):</span>
                        <span className="font-bold text-[#062F26]">₹{maintenance.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-[#EF4444] pt-1.5 border-t border-slate-200/80">
                      <span>Total Remaining (Pay at Move-In):</span>
                      <span>₹{((baseRent - tokenAmount) + deposit + maintenance).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {deposit > 0 && (
                      <div className="flex justify-between font-medium">
                        <span>Refundable Security Deposit:</span>
                        <span className="font-bold text-[#062F26]">₹{deposit.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {maintenance > 0 && (
                      <div className="flex justify-between font-medium">
                        <span>Maintenance Charges:</span>
                        <span className="font-bold text-[#062F26]">₹{maintenance.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-[#062F26]">
                      <span>Stamp & Agreement Fees:</span>
                      <span className="font-bold">₹{stampFees.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#0AA87D] pt-1.5 border-t border-slate-200/80">
                      <span>Total Full Amount (Pay Now):</span>
                      <span>₹{fullPayableNow.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR CONTINUE BUTTON (Active ONLY when all step data across ALL STEPS is completely filled out) */}
          <button
            type="button"
            onClick={handleFinalBookingSubmit}
            disabled={!isAllStepsValid || isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md flex justify-center items-center active:scale-98 ${isAllStepsValid && !isSubmitting
                ? 'bg-[#0B4F48] hover:bg-[#083D37] text-white hover:shadow-lg cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
              }`}
          >
            {isSubmitting ? (
              <>
                <Icon icon="lucide:loader-2" className="w-4.5 h-4.5 animate-spin text-[#0AA87D] mr-2" />
                <span>Processing Request...</span>
              </>
            ) : (
              <span>{isPG && paymentType === 'token' ? 'Reserve Bed' : 'Book Room'}</span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default BookingSidebarCard;
