import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { translateWithGoogleFreeApi } from '../../lib/translate';

export const DEFAULT_CONTRACT_TEXT = `<h1>RENTAL / LEAVE AND LICENSE AGREEMENT</h1>
<p style="text-align: center; font-weight: bold;">(11-Month Rental Agreement)</p>

This Leave and License Agreement ("Agreement") is entered into on [agreement_date], at [agreement_city].

<h3>ACCOMMODATION DETAILS</h3>
<b>Property:</b> [property_name]
<b>Address:</b> [property_address], [property_locality], [property_city]
<b>Room / Unit:</b> [room_name]
<b>Bed Number:</b> [bed_number]

<h3>FINANCIAL TERMS</h3>
<b>Monthly Rent:</b> ₹[rent_amount]
<b>Security Deposit:</b> ₹[deposit_amount]
<b>Commencement Date:</b> [move_in_date]
<b>Vacation Date:</b> [move_out_date]
<b>Booking Reference:</b> [booking_reference]

<h3>EMERGENCY CONTACT</h3>
<b>Name:</b> [emergency_contact_name]
<b>Phone:</b> [emergency_contact_phone]
<b>Relationship:</b> [emergency_contact_relationship]

<h3>SIGNATURES</h3>
By proceeding with occupation of the premises, the Licensee acknowledges that they have read, understood, and agree to be bound by all the terms and conditions of this Agreement.

<b>Licensee:</b> [tenant_full_name]
<b>Date:</b> [agreement_date]`;

const DEFAULT_TERMS_AND_CONDITIONS = [
  {
    titleEn: "Nature and Duration of Agreement",
    descriptionEn: "This Agreement is a Leave and License Agreement granted for a period of 11 (eleven) months from the Commencement Date. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Monthly Rent and Payment",
    descriptionEn: "The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the 5th day of every calendar month. Continued occupation of the premises is conditional on timely payment of rent. A late fee may be charged for delayed payments as per the Licensor's policy.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Security Deposit and Lock-in Period",
    descriptionEn: "A refundable security deposit of ₹[deposit_amount] is collected prior to move-in. The Licensee agrees to a minimum lock-in period of 3 months. If the Licensee vacates the premises before the lock-in period expires, the security deposit shall be forfeited. The deposit shall be refunded upon vacating the premises after adjusting any outstanding dues, unpaid rent, utility charges, or damages.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Utilities and Additional Charges",
    descriptionEn: "Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Maintenance and Care of Premises",
    descriptionEn: "The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "House Rules and Prohibited Activities",
    descriptionEn: "a) Smoking, consumption of alcohol, and use of illegal substances are strictly prohibited within the premises.\nb) The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents or neighbors.\nc) Cooking in rooms is strictly prohibited unless a designated kitchen area is provided.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Guests and Visitors",
    descriptionEn: "Guests and visitors are permitted only in the designated common areas during visiting hours. Overnight stays of guests are strictly prohibited without prior written permission from the Licensor and may incur additional charges.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Alterations",
    descriptionEn: "The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Notice Period and Termination",
    descriptionEn: "After the lock-in period, either party may terminate this Agreement by giving a 30-day advance notice in writing. The Licensor reserves the right to terminate this Agreement immediately and evict the Licensee in the event of breach of any term, non-payment of rent, or misconduct.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Vacation of Premises",
    descriptionEn: "Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation, remove all personal belongings, return all keys, and hand over the premises in the same condition as received, subject to normal wear and tear.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Liability",
    descriptionEn: "The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Governing Law and Jurisdiction",
    descriptionEn: "This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Entire Agreement",
    descriptionEn: "This Agreement constitutes the entire understanding between the parties regarding the accommodation.",
    titleGu: "", descriptionGu: ""
  }
];

const BookingStepPayment = ({
  isPG,
  paymentType,
  propTitle,
  propLocation,
  moveInDate,
  moveOutDate,
  selectedBedName,
  selectedRoom,
  firstName,
  lastName,
  mobileNumber,
  email,
  dob,
  emergencyName,
  emergencyPhone,
  emergencyRelationship,
  baseRent = 12000,
  deposit = 12000,
  agreedTerms,
  setAgreedTerms,
  setCurrentStep,
  handleContinue,
  isStep3Valid,
  isSubmitting,
  customContractText = null,
  customContractTextGu = null,
  property = null
}) => {
  const [isAgreementCollapsed, setIsAgreementCollapsed] = useState(false);
  const [agreementLanguage, setAgreementLanguage] = useState('en'); // 'en' or 'gu'
  const [translatedGujaratiText, setTranslatedGujaratiText] = useState(customContractTextGu || '');
  const [isTranslatingText, setIsTranslatingText] = useState(false);
  const [agreeDigitalSign, setAgreeDigitalSign] = useState(false);
  const [confirmAccurate, setConfirmAccurate] = useState(false);

  const [showEsignOtp, setShowEsignOtp] = useState(false);
  const [esignOtp, setEsignOtp] = useState('');
  const [isEsignVerified, setIsEsignVerified] = useState(false);
  const [isVerifyingEsign, setIsVerifyingEsign] = useState(false);

  const [stampGenerated, setStampGenerated] = useState(false);
  const [isGeneratingStamp, setIsGeneratingStamp] = useState(false);

  // Sync agreedTerms with both checkboxes
  useEffect(() => {
    if (agreeDigitalSign && confirmAccurate) {
      setAgreedTerms(true);
    } else {
      setAgreedTerms(false);
    }
  }, [agreeDigitalSign, confirmAccurate, setAgreedTerms]);

  // Handle Gujarati Translation using Free Google Translate API
  const handleSelectLanguage = async (targetLang) => {
    setAgreementLanguage(targetLang);
    if (targetLang === 'gu' && !translatedGujaratiText) {
      setIsTranslatingText(true);
      const rawTextToTranslate = customContractText || DEFAULT_CONTRACT_TEXT;
      const translated = await translateWithGoogleFreeApi(rawTextToTranslate, 'gu');
      setTranslatedGujaratiText(translated);
      setIsTranslatingText(false);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const cityStr = propLocation ? propLocation.split(',').pop().trim() : 'Mumbai';
  const tenantFullName = `${firstName || 'Tenant'} ${lastName || ''}`.trim();
  const roomNameStr = selectedRoom?.roomName || 'Room 101';
  const bedNameStr = selectedBedName || 'Bed 1';
  const refCodeStr = 'HN-REF-' + Math.floor(100000 + Math.random() * 900000);

  // Substitute dynamic tenant & property values into raw agreement text
  const injectDynamicValuesIntoText = (rawText) => {
    if (!rawText) return '';
    return rawText
      .replace(/\[agreement_date\]/g, todayDateStr)
      .replace(/\[agreement_city\]/g, cityStr)
      .replace(/\[property_name\]/g, propTitle || 'HousyNest Property')
      .replace(/\[property_address\]/g, propLocation || 'Address')
      .replace(/\[property_locality\]/g, propLocation || 'Locality')
      .replace(/\[property_city\]/g, cityStr)
      .replace(/\[tenant_full_name\]/g, tenantFullName)
      .replace(/\[tenant_mobile\]/g, mobileNumber || 'N/A')
      .replace(/\[tenant_email\]/g, email || 'N/A')
      .replace(/\[tenant_date_of_birth\]/g, dob || 'N/A')
      .replace(/\[room_name\]/g, roomNameStr)
      .replace(/\[bed_number\]/g, bedNameStr)
      .replace(/\[rent_amount\]/g, Number(baseRent).toLocaleString('en-IN'))
      .replace(/\[deposit_amount\]/g, Number(deposit).toLocaleString('en-IN'))
      .replace(/\[move_in_date\]/g, moveInDate || 'Move-In')
      .replace(/\[move_out_date\]/g, moveOutDate || 'Vacation')
      .replace(/\[booking_reference\]/g, refCodeStr)
      .replace(/\[emergency_contact_name\]/g, emergencyName || 'N/A')
      .replace(/\[emergency_contact_phone\]/g, emergencyPhone || 'N/A')
      .replace(/\[emergency_contact_relationship\]/g, emergencyRelationship || 'N/A');
  };

  // Render formatted contract lines with HTML tags parsed correctly
  const renderFormattedContractLines = (rawText) => {
    const substituted = injectDynamicValuesIntoText(rawText);
    const lines = substituted.split('\n');

    const termsToUse = property?.ownerContract?.termsAndConditions?.length > 0 
      ? property.ownerContract.termsAndConditions 
      : DEFAULT_TERMS_AND_CONDITIONS;

    return (
      <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-700">
        {lines.map((line, index) => {
          let trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-1"></div>;

          if (trimmed.startsWith('<h1>') && trimmed.endsWith('</h1>')) {
            return (
              <div key={index} className="text-center font-bold text-sm text-[#062F26] border-b border-slate-200 pb-3 my-2 tracking-wide">
                {trimmed.replace(/<\/?h1>/g, '')}
              </div>
            );
          }

          if (trimmed.startsWith('<h3>') && trimmed.endsWith('</h3>')) {
            return (
              <div key={index} className="font-bold text-[#062F26] uppercase text-[11px] tracking-wider pt-2 border-t border-slate-200/60 mt-3">
                {trimmed.replace(/<\/?h3>/g, '')}
              </div>
            );
          }

          // Parse <b> tags
          const parts = trimmed.split(/(<b>.*?<\/b>)/g);

          return (
            <p key={index} className="leading-relaxed">
              {parts.map((part, i) => {
                if (part.startsWith('<b>') && part.endsWith('</b>')) {
                  return <strong key={i} className="font-bold text-slate-800">{part.slice(3, -4)}</strong>;
                }
                return part;
              })}
            </p>
          );
        })}

        {/* Dynamic Terms and Conditions */}
        {termsToUse.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="font-bold text-[#062F26] uppercase text-[11px] tracking-wider pt-2 border-t border-slate-200/60 mt-3">
              TERMS AND CONDITIONS
            </div>
            {termsToUse.map((term, idx) => (
              <p key={`term-${idx}`} className="leading-relaxed">
                <strong className="font-bold text-slate-800">
                  {idx + 1}. {agreementLanguage === 'en' ? injectDynamicValuesIntoText(term.titleEn) : injectDynamicValuesIntoText(term.titleGu || term.titleEn)}
                </strong>
                <br />
                <span className="whitespace-pre-wrap">
                  {agreementLanguage === 'en' ? injectDynamicValuesIntoText(term.descriptionEn) : injectDynamicValuesIntoText(term.descriptionGu || term.descriptionEn)}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-6 animate-fadeIn">

      {/* HEADER SECTION */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#062F26]">
            {paymentType === 'token' ? 'Terms & Conditions' : 'Agreement & Payment'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {paymentType === 'token'
              ? 'Please review and accept the terms to proceed with token payment'
              : 'Review the rental agreement and complete the payment'}
          </p>
        </div>

        {/* DYNAMIC LANGUAGE SWITCHER BADGES */}
        {paymentType === 'full' && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${agreementLanguage === 'en'
                  ? 'bg-[#062F26] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#062F26]'
                }`}
            >
              🌐 English
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('gu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${agreementLanguage === 'gu'
                  ? 'bg-[#0AA87D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#062F26]'
                }`}
            >
              🌐 ગુજરાતી (Google Translate)
            </button>
          </div>
        )}
      </div>

      {/* RENTAL AGREEMENT BOX */}
      {paymentType === 'full' && (
        <>
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">

            {/* Accordion Header */}
            <div
              onClick={() => setIsAgreementCollapsed(!isAgreementCollapsed)}
              className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EAF5F2] text-[#0AA87D] flex items-center justify-center shrink-0">
                  <Icon icon="lucide:file-text" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#062F26]">
                    {agreementLanguage === 'gu' ? 'મકાન ભાડા કરાર (Google Translate)' : 'Leave & License Agreement'}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {agreementLanguage === 'gu' ? 'ગુજરાતી અનુવાદ' : 'Owner Customized Contract Text'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#062F26]"
              >
                <Icon icon={isAgreementCollapsed ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-4 h-4" />
                <span>{isAgreementCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </div>

            {/* Scrollable Agreement Text Body */}
            {!isAgreementCollapsed && (
              <div
                data-lenis-prevent="true"
                className="p-5 max-h-80 overflow-y-auto overscroll-contain bg-white text-xs text-slate-700 leading-relaxed font-sans space-y-4 scroll-smooth border-t border-slate-100"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#0AA87D #EAF5F2'
                }}
              >
                {agreementLanguage === 'en' ? (
                  /* DYNAMIC ENGLISH CONTRACT */
                  renderFormattedContractLines(customContractText || DEFAULT_CONTRACT_TEXT)
                ) : (
                  /* DYNAMIC GUJARATI TRANSLATION OF OWNER'S CUSTOMIZED CONTRACT */
                  isTranslatingText ? (
                    <div className="flex items-center justify-center py-8 text-slate-500 gap-2 font-semibold">
                      <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin text-[#0AA87D]" />
                      <span>Translating agreement into Gujarati via Google Translate...</span>
                    </div>
                  ) : (
                    renderFormattedContractLines(translatedGujaratiText || customContractTextGu || DEFAULT_CONTRACT_TEXT)
                  )
                )}
              </div>
            )}

          </div>
        </>
      )}

      {/* CHECKBOXES SECTION */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <input
            type="checkbox"
            checked={agreeDigitalSign}
            onChange={(e) => setAgreeDigitalSign(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-[#0AA87D] rounded border-slate-300 focus:ring-[#0AA87D]"
          />
          <span className="text-xs text-slate-700 font-semibold leading-relaxed">
            I provide my digital consent to generate an e-Stamp and eSign the rental agreement post-payment. <span className="text-red-500">*</span>
          </span>
        </label>

        <label className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <input
            type="checkbox"
            checked={confirmAccurate}
            onChange={(e) => setConfirmAccurate(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-[#0AA87D] rounded border-slate-300 focus:ring-[#0AA87D]"
          />
          <span className="text-xs text-slate-700 font-semibold leading-relaxed">
            I confirm that all the information provided is accurate and I understand the rental agreement terms <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* HOW PAYMENTS WORK NOTICE BOX */}
      <div className="bg-[#FFFDF0] border border-[#FCD34D] rounded-2xl p-5 shadow-xs flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
          <Icon icon="lucide:clock" className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 text-xs leading-relaxed">
          <h4 className="font-bold text-[#B45309] text-sm">How payments work</h4>
          {isPG && (
            <p className="text-[#92400E]">
              <span className="font-bold">Pay Token:</span> Reserve your bed with a fully refundable token. Your booking request goes to the owner for approval. Once approved, you can pay the remaining amount later from your Stay Requests section.
            </p>
          )}
          <p className="text-[#92400E]">
            <span className="font-bold">Pay Full Amount:</span> Pay the complete amount now to instantly confirm your stay. There&apos;s no separate approval step. If the bed is unavailable, your payment is refunded as per BedR&apos;s policy.
          </p>
        </div>
      </div>

      {/* STEP 3 FORM BOTTOM ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          <span>Back to Verification</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!agreeDigitalSign || !confirmAccurate) {
              toast.error('Please accept both agreement checkboxes to confirm your booking');
              return;
            }
            handleContinue();
          }}
          disabled={!isStep3Valid || isSubmitting}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${isStep3Valid && !isSubmitting
              ? 'bg-[#0B4F48] hover:bg-[#083D37] text-white shadow-md hover:shadow-lg active:scale-98'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
            }`}
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className="w-4.5 h-4.5 animate-spin text-[#0AA87D]" />
              <span>Processing Request...</span>
            </>
          ) : (
            <span>Confirm & Submit Booking</span>
          )}
        </button>
      </div>

    </div>
  );
};

export default BookingStepPayment;
