import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { translateWithGoogleFreeApi } from '../../lib/translate';

export const DEFAULT_CONTRACT_TEXT = `<h1>RENTAL / LEAVE AND LICENSE AGREEMENT</h1>

This Leave and License Agreement ("Agreement") is entered into on [agreement_date], at [agreement_city].

<h3>PARTIES TO THE AGREEMENT</h3>

<b>Licensor (Owner/Property Manager):</b>
[property_name], having its premises at [property_address], [property_city]
(hereinafter referred to as the "Licensor")

<b>Licensee (Tenant):</b>
[tenant_full_name]
Contact: [tenant_mobile] | [tenant_email]
Date of Birth: [tenant_date_of_birth]
(hereinafter referred to as the "Licensee")

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

<h3>TERMS AND CONDITIONS</h3>

<b>1. Nature of Agreement</b>
This Agreement is a Leave and License Agreement only. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes.

<b>2. Monthly Rent and Payment</b>
The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the due date communicated by the Licensor. Continued occupation of the premises is conditional on timely payment of rent and any applicable charges.

<b>3. Security Deposit</b>
A refundable security deposit of ₹[deposit_amount] has been or shall be collected prior to move-in. The deposit shall be refunded within a reasonable time after the Licensee vacates the premises, after adjusting any outstanding dues, unpaid rent, utility charges, or costs of repairing damages caused by the Licensee beyond normal wear and tear.

<b>4. Utilities and Additional Charges</b>
Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card communicated separately.

<b>5. Maintenance and Care of Premises</b>
The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The Licensee shall promptly report any damage or defect to the Licensor. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit.

<b>6. Conduct and House Rules</b>
The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents, staff, or neighbors. The Licensee shall abide by all house rules, facility timings, and guidelines communicated by the Licensor from time to time.

<b>7. Guests and Visitors</b>
Guests and visitors shall be permitted on the premises only as per the Licensor's guest and visitor policy communicated separately. Overnight stays of guests shall require prior permission from the Licensor.

<b>8. Alterations</b>
The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas without the prior written consent of the Licensor.

<b>9. Prohibited Uses</b>
The Licensee shall not use the premises for any illegal, commercial, or immoral activity. The Licensee shall not sublet the accommodation or any part thereof to any third party.

<b>10. Notice Period and Termination</b>
Either party may terminate this Agreement by giving advance notice as agreed at the time of move-in or as communicated in writing. The Licensor reserves the right to terminate this Agreement immediately in the event of breach of any term of this Agreement, non-payment of rent, or conduct detrimental to other residents.

<b>11. Vacation of Premises</b>
Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation on or before the agreed vacation date, remove all personal belongings, return all keys and access devices, and hand over the premises in the same condition as received, subject to normal wear and tear.

<b>12. Liability</b>
The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises. The Licensee is advised to arrange personal insurance coverage for their valuables if required.

<b>13. Force Majeure</b>
Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including natural disasters, government restrictions, or other force majeure events.

<b>14. Governing Law and Jurisdiction</b>
This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].

<b>15. Entire Agreement</b>
This Agreement, along with any house rules communicated separately, constitutes the entire understanding between the parties regarding the accommodation. Any modification to this Agreement shall be mutually agreed upon in writing.

<h3>EMERGENCY CONTACT</h3>
<b>Name:</b> [emergency_contact_name]
<b>Phone:</b> [emergency_contact_phone]
<b>Relationship:</b> [emergency_contact_relationship]

<h3>SIGNATURES</h3>
By proceeding with occupation of the premises, the Licensee acknowledges that they have read, understood, and agree to be bound by all the terms and conditions of this Agreement.

<b>Licensee:</b> [tenant_full_name]
<b>Date:</b> [agreement_date]`;

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
  customContractTextGu = null
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

  // Sync agreedTerms with both checkboxes, esign presence, and stamp generation
  useEffect(() => {
    if (paymentType === 'token') {
      if (agreeDigitalSign && confirmAccurate) {
        setAgreedTerms(true);
      } else {
        setAgreedTerms(false);
      }
    } else {
      if (agreeDigitalSign && confirmAccurate && isEsignVerified && stampGenerated) {
        setAgreedTerms(true);
      } else {
        setAgreedTerms(false);
      }
    }
  }, [paymentType, agreeDigitalSign, confirmAccurate, isEsignVerified, stampGenerated, setAgreedTerms]);

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

  const handleSendEsignOtp = () => {
    setShowEsignOtp(true);
    toast.success('OTP sent for Aadhaar eSign');
  };

  const handleVerifyEsign = () => {
    if (esignOtp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifyingEsign(true);
    setTimeout(() => {
      setIsVerifyingEsign(false);
      setIsEsignVerified(true);
      toast.success('Document eSigned Successfully!');
    }, 2500);
  };

  const handleGenerateStamp = () => {
    setIsGeneratingStamp(true);
    setTimeout(() => {
      setIsGeneratingStamp(false);
      setStampGenerated(true);
      toast.success('e-Stamp Paper generated successfully!');
    }, 2000);
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

          {/* DIGITAL SIGNATURE SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#062F26] flex items-center gap-2">
                  <Icon icon="lucide:pen-tool" className="w-4 h-4 text-[#0AA87D]" />
                  Digital eSign <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please eSign below using your Aadhaar OTP to acknowledge and agree to the rental agreement terms.
                </p>
              </div>
              {isEsignVerified && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EAF5F2] text-[#0AA87D] border border-[#0AA87D]/30 flex items-center gap-1">
                  <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-[#0AA87D]" />
                  Document eSigned
                </span>
              )}
            </div>

            {!isEsignVerified ? (
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4 mt-2">
                {!showEsignOtp ? (
                  <button
                    type="button"
                    onClick={handleSendEsignOtp}
                    className="w-fit px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
                  >
                    <Icon icon="lucide:file-signature" className="w-4 h-4" />
                    Send OTP for eSign
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter 6-digit eSign OTP"
                      value={esignOtp}
                      onChange={(e) => setEsignOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEsign}
                      disabled={isVerifyingEsign || esignOtp.length < 6}
                      className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2 ${isVerifyingEsign || esignOtp.length < 6
                          ? 'bg-indigo-400 text-white cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                      {isVerifyingEsign ? (
                        <>
                          <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                          Affixing Signature...
                        </>
                      ) : (
                        <>
                          <Icon icon="lucide:file-signature" className="w-4 h-4" />
                          Verify & eSign
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:shield-check" className="w-6 h-6" />
                  <div>
                    <h4 className="font-bold text-sm">Successfully eSigned</h4>
                    <p className="text-xs opacity-90 mt-0.5">Your booking agreement has been digitally signed using Aadhaar eSign.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <style>{`
        @keyframes stamp-press {
          0% { transform: scale(1.8) rotate(-15deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-stamp-press {
          animation: stamp-press 1.5s ease-out forwards;
        }
      `}</style>

          {/* E-STAMP GENERATION SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#062F26] flex items-center gap-2">
                  <Icon icon="lucide:stamp" className="w-4 h-4 text-[#0AA87D]" />
                  Agreement e-Stamp <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate a legally binding e-Stamp paper for your rental agreement (₹300 stamp duty included in payment).
                </p>
              </div>
              {stampGenerated && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EAF5F2] text-[#0AA87D] border border-[#0AA87D]/30 flex items-center gap-1">
                  <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-[#0AA87D]" />
                  e-Stamp Ready
                </span>
              )}
            </div>

            {!stampGenerated ? (
              <div className={`border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 mt-2 transition-all min-h-[104px] ${isGeneratingStamp ? 'bg-emerald-50/50 justify-center' : 'bg-slate-50/50 justify-between'}`}>
                {isGeneratingStamp ? (
                  <div className="flex items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center animate-stamp-press border-2 border-emerald-500 text-emerald-600 shadow-sm shadow-emerald-200 shrink-0">
                      <Icon icon="lucide:stamp" className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-emerald-800">Affixing e-Stamp...</h4>
                      <p className="text-xs text-emerald-600 mt-0.5 animate-pulse">Please wait while the document is stamped</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <Icon icon="lucide:file-badge-2" className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#062F26]">Generate ₹300 e-Stamp</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Required before final confirmation</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateStamp}
                      disabled={!isEsignVerified}
                      className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2 ${!isEsignVerified
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                        }`}
                    >
                      <Icon icon="lucide:stamp" className="w-4 h-4" />
                      Generate e-Stamp
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-2 p-4 bg-[#FFFDF0] text-[#B45309] rounded-xl border border-[#FCD34D] shadow-sm flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#FCD34D]">
                    <Icon icon="lucide:stamp" className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">e-Stamp Paper Attached</h4>
                    <p className="text-xs opacity-90 mt-0.5">A legal ₹300 e-Stamp has been affixed to your signed agreement.</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1 cursor-pointer">
                  <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                  Preview
                </button>
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
            {paymentType === 'token'
              ? 'I agree to the Terms and Conditions and Privacy Policy'
              : 'I agree to sign the rental agreement digitally and accept the Terms and Conditions'} <span className="text-red-500">*</span>
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
            if (paymentType === 'full') {
              if (!isEsignVerified) {
                toast.error('Please eSign the agreement using Aadhaar OTP before confirming');
                return;
              }
              if (!stampGenerated) {
                toast.error('Please generate the e-Stamp paper before confirming your booking');
                return;
              }
            }
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
