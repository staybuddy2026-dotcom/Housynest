import React from 'react';
import { Icon } from '@iconify/react';
import CustomSelect from './CustomSelect';

const BookingStepProfile = ({
  moveInDate,
  setMoveInDate,
  moveOutDate,
  setMoveOutDate,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dob,
  setDob,
  gender,
  setGender,
  mobileNumber,
  setMobileNumber,
  whatsappNumber,
  setWhatsappNumber,
  email,
  setEmail,
  institutionName,
  setInstitutionName,
  emergencyName,
  setEmergencyName,
  emergencyPhone,
  setEmergencyPhone,
  emergencyRelationship,
  setEmergencyRelationship,
  genderOptions,
  relationshipOptions,
  tokenAmount,
  isStep1Valid,
  handleContinue
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* CARD 1: BOOKING INFORMATION */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0AA87D] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
            1
          </div>
          <h2 className="text-xl font-bold text-[#062F26]">Booking Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          {/* Move-In Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1E293B]">
                Move-In Date <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[#0AA87D] font-bold">Earliest Available</span>
            </div>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* Expected Move Out Date */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              Expected Move Out Date
            </label>
            <input
              type="date"
              value={moveOutDate}
              placeholder="DD/MM/YYYY"
              onChange={(e) => setMoveOutDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: PERSONAL INFORMATION & EMERGENCY CONTACT */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0AA87D] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
            2
          </div>
          <h2 className="text-xl font-bold text-[#062F26]">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* First Name */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Khush"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Prajapati"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* CUSTOM GENDER SELECT DROPDOWN */}
          <CustomSelect
            label="Gender"
            required={true}
            value={gender}
            onChange={setGender}
            options={genderOptions}
            placeholder="Select Gender"
          />

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="9824970199"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="9824970199"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all"
            />
          </div>

          {/* Institution Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
              Institution Name <span className="text-slate-400 font-medium">(Optional)</span>
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Enter your college/company name"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* SUB-SECTION: EMERGENCY CONTACT */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-[#062F26]">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Enter emergency contact name"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Enter 10 digit phone number"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 outline-none text-sm font-semibold text-[#062F26] bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* CUSTOM RELATIONSHIP SELECT DROPDOWN */}
            <div className="sm:col-span-2">
              <CustomSelect
                label="Relationship"
                required={true}
                value={emergencyRelationship}
                onChange={setEmergencyRelationship}
                options={relationshipOptions}
                placeholder="Select Relationship"
              />
            </div>
          </div>
        </div>
      </div>

      {/* HOW PAYMENTS WORK NOTICE BOX */}
      <div className="bg-[#FFFDF0] border border-[#FCD34D] rounded-2xl p-5 shadow-xs flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
          <Icon icon="lucide:clock" className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 text-xs leading-relaxed">
          <h4 className="font-extrabold text-[#B45309] text-sm">How payments work</h4>
          <p className="text-[#92400E]">
            <span className="font-bold">Pay Token (40% of Rent - 100% Refundable):</span> Reserve your bed with a token equal to 40% of monthly rent (₹{tokenAmount.toLocaleString('en-IN')}). Your booking request goes to the owner for approval. Once approved, you can pay the remaining balance at Move-In.
          </p>
          <p className="text-[#92400E]">
            <span className="font-bold">Pay Full Amount:</span> Pay the complete amount now to instantly confirm your stay. There's no separate approval step.
          </p>
        </div>
      </div>

      {/* STEP 1 FORM BOTTOM ACTION BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isStep1Valid}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${
            isStep1Valid
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

export default BookingStepProfile;
