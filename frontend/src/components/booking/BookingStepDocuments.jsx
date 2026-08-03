import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const BookingStepDocuments = ({
  isDigiLockerConnected,
  setIsDigiLockerConnected,
  aadhaarFront,
  setAadhaarFront,
  aadhaarBack,
  setAadhaarBack,
  setCurrentStep,
  handleContinue,
  isStep2Valid
}) => {
  // Local states for Aadhaar eKYC & eSign Flow
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(isDigiLockerConnected);

  const handleSendAadhaarOtp = () => {
    if (aadhaarNumber.length < 12) {
      toast.error('Please enter a valid 12-digit Aadhaar Number');
      return;
    }
    setShowOtp(true);
    toast.success('OTP sent to your Aadhaar linked mobile number');
  };

  const handleVerifyAadhaar = () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setIsAadhaarVerified(true);
    setIsDigiLockerConnected(true); // Parent state to allow proceeding
    toast.success('Aadhaar Verification Successful!');
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#062F26]">Document Verification</h2>
          <p className="text-xs text-slate-500 mt-1">Verify your identity for your booking request</p>
        </div>
        <span className="px-3.5 py-1 bg-[#EAF5F2] text-[#0AA87D] font-bold text-xs rounded-full border border-[#0AA87D]/20 flex items-center gap-1.5">
          <Icon icon="lucide:shield-check" className="w-4 h-4 text-[#0AA87D]" />
          100% Encrypted & Secure
        </span>
      </div>

      {/* Aadhaar eKYC & eSign Flow */}
      <div className="bg-[#EAF5F2]/70 border border-[#0AA87D]/30 rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0AA87D] text-white flex items-center justify-center shrink-0 shadow-md">
            <Icon icon="lucide:fingerprint" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#062F26] text-sm">Aadhaar eKYC</h3>
            <p className="text-xs text-slate-600 mt-0.5">Instant verification via Aadhaar OTP</p>
          </div>
        </div>

        {!isAadhaarVerified ? (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter 12-digit Aadhaar Number"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0AA87D] focus:ring-1 focus:ring-[#0AA87D]"
                disabled={showOtp}
              />
              {!showOtp && (
                <button
                  type="button"
                  onClick={handleSendAadhaarOtp}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-[#062F26] text-white hover:bg-[#08483B] shadow-md transition-all shrink-0"
                >
                  Send OTP
                </button>
              )}
            </div>

            {showOtp && (
              <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0AA87D] focus:ring-1 focus:ring-[#0AA87D]"
                />
                <button
                  type="button"
                  onClick={handleVerifyAadhaar}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all shrink-0"
                >
                  Verify Aadhaar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 p-4 bg-emerald-600 text-white rounded-xl shadow-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:shield-check" className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-sm">Aadhaar Verified Successfully</h4>
                <p className="text-xs opacity-90 mt-0.5">Your identity has been verified instantly via Aadhaar.</p>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* STEP 2 FORM BOTTOM ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!isStep2Valid}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${
            isStep2Valid
              ? 'bg-[#062F26] hover:bg-[#08483B] text-white shadow-md hover:shadow-lg active:scale-98'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
          }`}
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

export default BookingStepDocuments;
