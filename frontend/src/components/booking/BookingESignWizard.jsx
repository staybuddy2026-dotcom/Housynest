import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const BookingESignWizard = ({
  isPG,
  bookingRef,
  bookingId,
  firstName,
  selectedBedName,
  propTitle,
  moveInDate,
  navigate
}) => {
  // Wizard steps:
  // 1: Payment Success Screen
  // 2: Agreement & eStamp Generation
  // 3: Aadhar eSign Initiation
  // 4: Aadhar OTP Verification
  // 5: Final Celebration
  const [step, setStep] = useState(1);

  const [eStampStatus, setEStampStatus] = useState('generating'); // 'generating', 'completed'
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-simulate eStamp generation when reaching Step 2
  useEffect(() => {
    if (step === 2 && eStampStatus === 'generating') {
      const timer = setTimeout(() => {
        setEStampStatus('completed');
        toast.success('e-Stamp generated successfully!');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, eStampStatus]);

  const handleSendOtp = () => {
    if (aadharNumber.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhar Number');
      return;
    }
    toast.success('OTP sent to your Aadhar-linked mobile number');
    setStep(4);
  };

  const handleVerifySign = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (token && bookingId) {
        // Attempt to call the backend endpoint to verify consent
        await fetch(`/api/bookings/${bookingId}/consent`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      // We proceed to final step regardless of local token existence for demo purposes
      toast.success('Agreement successfully e-Signed!');
      setStep(5);
    } catch (err) {
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 sm:p-10 max-w-3xl mx-auto shadow-xl border border-slate-100 animate-fadeIn">

      {/* Progress Indicators */}
      <div className="flex justify-between items-center mb-10 relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#0AA87D] -translate-y-1/2 z-0 hidden sm:block transition-all duration-500"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        ></div>

        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${s < step ? 'bg-[#0AA87D] text-white' :
                s === step ? 'bg-[#062F26] text-white ring-4 ring-[#0AA87D]/20' :
                  'bg-white text-slate-400 border-2 border-slate-200'
              }`}>
              {s < step ? <Icon icon="lucide:check" className="w-5 h-5" /> : s}
            </div>
            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider absolute -bottom-6 w-max hidden sm:block ${s <= step ? 'text-[#062F26]' : 'text-slate-400'
              }`}>
              {s === 1 && 'Success'}
              {s === 2 && 'e-Stamp'}
              {s === 3 && 'Aadhar'}
              {s === 4 && 'Verify'}
              {s === 5 && 'Done'}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Payment Success */}
      {step === 1 && (
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-[#EAF5F2] text-[#0AA87D] flex items-center justify-center mx-auto shadow-inner">
            <Icon icon="lucide:check-circle-2" className="w-14 h-14" strokeWidth="2.5" />
          </div>

          <div>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#EAF5F2] text-[#0AA87D] border border-[#0AA87D]/20">
              Ref: {bookingRef}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062F26] mt-4">
              Payment Successful!
            </h2>
            <p className="text-base text-slate-600 font-medium max-w-md mx-auto mt-3 leading-relaxed">
              Your room is confirmed. Let's complete the legally binding digital agreement to finalize your move-in.
            </p>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full sm:w-auto px-10 py-4 mt-4 rounded-xl bg-[#062F26] hover:bg-[#0AA87D] text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            Proceed to Digital Agreement
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Agreement & eStamp */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#062F26]">Agreement Generation</h2>
            <p className="text-sm text-slate-600 mt-2">Please review your rental agreement.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
            {/* Mock PDF Header / Stamp Area */}
            <div className="h-48 bg-slate-50 border-b border-slate-200 flex flex-col items-center justify-center p-6 relative">
              {eStampStatus === 'generating' ? (
                <div className="flex flex-col items-center gap-3">
                  <Icon icon="lucide:loader-2" className="w-8 h-8 text-[#0AA87D] animate-spin" />
                  <p className="text-sm font-bold text-slate-600">Fetching Government e-Stamp...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 animate-fadeIn bg-amber-50 p-4 border border-amber-200 rounded-lg w-full max-w-sm">
                  <Icon icon="lucide:stamp" className="w-10 h-10 text-amber-600" />
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest text-center">
                    e-Stamp Certificate<br />
                    <span className="text-[10px] text-amber-700 font-medium">IN-MH{Math.floor(Math.random() * 100000000)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Mock Document Content */}
            <div className="p-6 space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => setStep(3)}
              disabled={eStampStatus === 'generating'}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#062F26] hover:bg-[#0AA87D] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Acknowledge & Proceed to eSign
              <Icon icon="lucide:check" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Aadhar Initiation */}
      {step === 3 && (
        <div className="text-center space-y-6 animate-fadeIn max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Icon icon="lucide:fingerprint" className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#062F26]">Aadhar eSign</h2>
            <p className="text-sm text-slate-600 mt-2">
              Enter your Aadhar number to digitally sign the agreement via NSDL/CDAC gateway.
            </p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-[#062F26] uppercase">Aadhar Number</label>
            <input
              type="text"
              maxLength="12"
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="XXXX XXXX XXXX"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0AA87D] focus:border-transparent text-center font-mono text-lg tracking-widest placeholder:text-slate-300 transition-all shadow-sm"
            />
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-left">
            <Icon icon="lucide:shield-alert" className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              By clicking "Send OTP", you agree to the terms mentioned in the e-Stamped agreement and consent to Aadhaar authentication.
            </p>
          </div>

          <button
            onClick={handleSendOtp}
            className="w-full py-4 rounded-xl bg-[#062F26] hover:bg-[#0AA87D] text-white font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            Send OTP
            <Icon icon="lucide:send" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: OTP Verification */}
      {step === 4 && (
        <div className="text-center space-y-6 animate-fadeIn max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Icon icon="lucide:smartphone" className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#062F26]">Verify OTP</h2>
            <p className="text-sm text-slate-600 mt-2">
              Enter the 6-digit OTP sent to your Aadhar-linked mobile number.
            </p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-[#062F26] uppercase text-center block">One Time Password</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0AA87D] focus:border-transparent text-center font-mono text-2xl tracking-[0.5em] placeholder:text-slate-300 transition-all shadow-sm"
            />
          </div>

          <button
            onClick={handleVerifySign}
            disabled={isVerifying}
            className="w-full py-4 rounded-xl bg-[#062F26] hover:bg-[#0AA87D] disabled:bg-slate-400 text-white font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify & Sign
                <Icon icon="lucide:file-signature" className="w-4 h-4" />
              </>
            )}
          </button>

          <button onClick={() => setStep(3)} className="text-xs text-slate-500 hover:text-[#0AA87D] font-bold mt-4 underline cursor-pointer">
            Resend OTP / Change Aadhar Number
          </button>
        </div>
      )}

      {/* STEP 5: Final Celebration */}
      {step === 5 && (
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-[#0AA87D] opacity-20 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-[#0AA87D] opacity-40 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full rounded-full bg-[#EAF5F2] text-[#0AA87D] flex items-center justify-center mx-auto border-4 border-white shadow-xl z-10">
              <Icon icon="lucide:award" className="w-14 h-14" strokeWidth="2" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#062F26] mt-4">
              Agreement Successfully Signed! 🎉
            </h2>
            <p className="text-base text-slate-600 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
              Congratulations, <span className="font-bold text-[#062F26]">{firstName}</span>! You have successfully signed the rent agreement.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl max-w-lg mx-auto flex items-start text-left gap-3 mt-4">
              <Icon icon="lucide:info" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800">
                The agreement has now been sent to the property owner for their e-Signature. Once the owner signs it, the final legally-binding document will be available to download directly from your dashboard.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl max-w-sm mx-auto flex items-center justify-center gap-3">
            <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">Booking & Move-in Confirmed</p>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/tenant/bookings')}
              className="py-4 px-10 rounded-xl bg-[#062F26] hover:bg-[#0AA87D] text-white font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <Icon icon="lucide:layout-dashboard" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingESignWizard;
