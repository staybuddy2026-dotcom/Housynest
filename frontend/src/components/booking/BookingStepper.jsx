import React from 'react';

const BookingStepper = ({ currentStep, handleStepClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {/* STEP 1 CHEVRON BLOCK */}
      <div
        onClick={() => handleStepClick(1)}
        style={{
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
        }}
        className={`py-3.5 px-4 sm:px-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center rounded-l-xl ${
          currentStep === 1
            ? 'bg-[#062F26] text-white shadow-md'
            : currentStep > 1
            ? 'bg-[#EAF5F2] text-[#062F26] hover:bg-[#d8ece6]'
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60 shadow-2xs'
        }`}
      >
        <span className="text-xs font-extrabold block mb-0.5">1</span>
        <p className="text-xs sm:text-sm font-extrabold leading-tight">Complete Profile</p>
        <p className={`text-[10px] font-semibold mt-0.5 truncate max-w-full ${currentStep === 1 ? 'text-slate-300' : 'text-slate-500'}`}>
          Personal & Emergency Contact
        </p>
      </div>

      {/* STEP 2 CHEVRON BLOCK */}
      <div
        onClick={() => handleStepClick(2)}
        style={{
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)'
        }}
        className={`py-3.5 px-4 sm:px-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center ${
          currentStep === 2
            ? 'bg-[#062F26] text-white shadow-md'
            : currentStep > 2
            ? 'bg-[#EAF5F2] text-[#062F26] hover:bg-[#d8ece6]'
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60 shadow-2xs'
        }`}
      >
        <span className="text-xs font-extrabold block mb-0.5">2</span>
        <p className="text-xs sm:text-sm font-extrabold leading-tight">Document Verification</p>
        <p className={`text-[10px] font-semibold mt-0.5 truncate max-w-full ${currentStep === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
          DigiLocker or Aadhaar Upload
        </p>
      </div>

      {/* STEP 3 CHEVRON BLOCK */}
      <div
        onClick={() => handleStepClick(3)}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)'
        }}
        className={`py-3.5 px-4 sm:px-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center rounded-r-xl ${
          currentStep === 3
            ? 'bg-[#062F26] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60 shadow-2xs'
        }`}
      >
        <span className="text-xs font-extrabold block mb-0.5">3</span>
        <p className="text-xs sm:text-sm font-extrabold leading-tight">Agreement & Payment</p>
        <p className={`text-[10px] font-semibold mt-0.5 truncate max-w-full ${currentStep === 3 ? 'text-slate-300' : 'text-slate-500'}`}>
          Sign Agreement
        </p>
      </div>
    </div>
  );
};

export default BookingStepper;
