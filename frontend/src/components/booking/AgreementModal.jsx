import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import { DEFAULT_CONTRACT_TEXT } from './BookingStepPayment';
import { translateWithGoogleFreeApi } from '../../lib/translate';

const AgreementModal = ({ isOpen, onClose, onSubmit, booking, isReadOnly = false }) => {
  const [isAgreementCollapsed, setIsAgreementCollapsed] = useState(false);
  const [agreementLanguage, setAgreementLanguage] = useState('en');
  const [translatedGujaratiText, setTranslatedGujaratiText] = useState('');
  const [isTranslatingText, setIsTranslatingText] = useState(false);

  const [showEsignOtp, setShowEsignOtp] = useState(false);
  const [esignOtp, setEsignOtp] = useState('');
  const [isVerifyingEsign, setIsVerifyingEsign] = useState(false);
  const [isEsignVerified, setIsEsignVerified] = useState(false);

  const [isGeneratingStamp, setIsGeneratingStamp] = useState(false);
  const [stampGenerated, setStampGenerated] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEmailing, setIsEmailing] = useState(false);

  const getFullHtmlForPDF = () => {
    const content = document.getElementById('agreement-content')?.innerHTML;
    if (!content) return null;

    return `
      <html>
        <head>
          <title>Rental Agreement - ${booking?.propertyId?.pgName || booking?.propertyId?.societyName || 'Housynest'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; font-size: 14px; }
            h1 { text-align: center; color: #062F26; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
            h3 { font-size: 15px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 16px; letter-spacing: 0.5px; }
            p { font-size: 13px; margin-bottom: 12px; text-align: justify; }
            strong { font-weight: bold; color: #0f172a; }
            .header-info { text-align: right; font-size: 12px; color: #64748b; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header-info">
            Generated on: ${new Date().toLocaleDateString('en-GB')}<br/>
            Ref: ${booking?._id ? booking._id.substring(booking._id.length - 8).toUpperCase() : 'HN-REF'}
          </div>
          ${content.replace(/class="[^"]*"/g, '')}
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    const htmlString = getFullHtmlForPDF();
    if (!htmlString) {
      toast.error('Could not generate PDF');
      return;
    }

    // Create a temporary element to hold the HTML
    const element = document.createElement('div');
    element.innerHTML = htmlString;

    const opt = {
      margin: 10,
      filename: `Agreement_${booking?._id ? booking._id.substring(booking._id.length - 8).toUpperCase() : 'Draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.loading('Generating PDF...', { id: 'pdf-toast' });
    html2pdf().from(element).set(opt).save().then(() => {
      toast.success('PDF downloaded!', { id: 'pdf-toast' });
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    });
  };

  const handleEmailPDF = async () => {
    const htmlString = getFullHtmlForPDF();
    if (!htmlString) {
      toast.error('Could not generate PDF content');
      return;
    }

    setIsEmailing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${booking._id}/email-agreement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ htmlContent: htmlString })
      });

      if (res.ok) {
        toast.success('Agreement PDF emailed successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to email agreement');
      }
    } catch (error) {
      console.error('Error emailing agreement:', error);
      toast.error('An error occurred while sending the email');
    } finally {
      setIsEmailing(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectLanguage = async (targetLang) => {
    setAgreementLanguage(targetLang);
    if (targetLang === 'gu' && !translatedGujaratiText) {
      setIsTranslatingText(true);
      const translated = await translateWithGoogleFreeApi(DEFAULT_CONTRACT_TEXT, 'gu');
      setTranslatedGujaratiText(translated);
      setIsTranslatingText(false);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const cityStr = booking?.propertyId?.city || 'Mumbai';
  const tenantFullName = booking?.personalInfo?.fullName || 'Tenant';
  const roomNameStr = booking?.roomDetails?.roomName || 'Room';
  const bedNameStr = booking?.roomDetails?.bedName || 'Bed';
  const refCodeStr = booking?._id ? booking._id.substring(booking._id.length - 8).toUpperCase() : 'HN-REF';

  const injectDynamicValuesIntoText = (rawText) => {
    if (!rawText) return '';
    return rawText
      .replace(/\[agreement_date\]/g, todayDateStr)
      .replace(/\[agreement_city\]/g, cityStr)
      .replace(/\[property_name\]/g, booking?.propertyId?.pgName || 'HousyNest Property')
      .replace(/\[property_address\]/g, booking?.propertyId?.locality || 'Address')
      .replace(/\[property_locality\]/g, booking?.propertyId?.locality || 'Locality')
      .replace(/\[property_city\]/g, cityStr)
      .replace(/\[tenant_full_name\]/g, tenantFullName)
      .replace(/\[tenant_mobile\]/g, booking?.personalInfo?.phone || 'N/A')
      .replace(/\[tenant_email\]/g, booking?.personalInfo?.email || 'N/A')
      .replace(/\[tenant_date_of_birth\]/g, booking?.personalInfo?.dob ? new Date(booking.personalInfo.dob).toLocaleDateString('en-GB') : 'N/A')
      .replace(/\[room_name\]/g, roomNameStr)
      .replace(/\[bed_number\]/g, bedNameStr)
      .replace(/\[rent_amount\]/g, Number(booking?.propertyId?.monthlyRent?.replace(/\D/g, '') || 12000).toLocaleString('en-IN'))
      .replace(/\[deposit_amount\]/g, Number(booking?.propertyId?.securityAmount?.replace(/\D/g, '') || 12000).toLocaleString('en-IN'))
      .replace(/\[move_in_date\]/g, booking?.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB') : 'Move-In')
      .replace(/\[move_out_date\]/g, booking?.expectedMoveOutDate ? new Date(booking.expectedMoveOutDate).toLocaleDateString('en-GB') : 'Vacation')
      .replace(/\[booking_reference\]/g, refCodeStr)
      .replace(/\[emergency_contact_name\]/g, booking?.emergencyContact?.name || 'N/A')
      .replace(/\[emergency_contact_phone\]/g, booking?.emergencyContact?.phone || 'N/A')
      .replace(/\[emergency_contact_relationship\]/g, booking?.emergencyContact?.relationship || 'N/A');
  };

  const renderFormattedContractLines = (rawText) => {
    const substituted = injectDynamicValuesIntoText(rawText);
    const lines = substituted.split('\n');
    return (
      <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-700">
        {lines.map((line, index) => {
          let trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-1"></div>;
          if (trimmed.startsWith('<h1>') && trimmed.endsWith('</h1>')) {
            return <div key={index} className="text-center font-bold text-sm text-[#062F26] border-b border-slate-200 pb-3 my-2 tracking-wide">{trimmed.replace(/<\/?h1>/g, '')}</div>;
          }
          if (trimmed.startsWith('<h3>') && trimmed.endsWith('</h3>')) {
            return <div key={index} className="font-bold text-[#062F26] uppercase text-[11px] tracking-wider pt-2 border-t border-slate-200/60 mt-3">{trimmed.replace(/<\/?h3>/g, '')}</div>;
          }
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

  const handleSendEsignOtp = () => {
    setShowEsignOtp(true);
    toast.success('OTP sent for Aadhaar eSign');
  };

  const handleVerifyEsign = () => {
    setIsVerifyingEsign(true);
    setTimeout(() => {
      setIsVerifyingEsign(false);
      setIsEsignVerified(true);
      toast.success('Successfully eSigned the agreement');
    }, 1500);
  };

  const handleGenerateStamp = () => {
    setIsGeneratingStamp(true);
    setTimeout(() => {
      setIsGeneratingStamp(false);
      setStampGenerated(true);
      toast.success('e-Stamp generated and affixed');
    }, 2000);
  };

  const isFormValid = isEsignVerified && stampGenerated;

  const handleSubmit = () => {
    if (!isFormValid) {
      toast.error('Please complete all agreement steps');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#062F26] flex items-center gap-3">
              <Icon icon="lucide:file-signature" className="w-6 h-6 sm:w-7 sm:h-7 text-[#0AA87D]" />
              {isReadOnly ? 'Rental Agreement' : 'Review & Sign Rental Agreement'}
            </h2>
            {!isReadOnly && <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Please review and digitally sign the agreement to proceed</p>}
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div data-lenis-prevent="true" className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* LANGUAGE SWITCHER */}
          <div className="flex justify-end">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${agreementLanguage === 'en' ? 'bg-[#062F26] text-white shadow-xs' : 'text-slate-600 hover:text-[#062F26]'
                  }`}
              >
                🌐 English
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('gu')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${agreementLanguage === 'gu' ? 'bg-[#0AA87D] text-white shadow-xs' : 'text-slate-600 hover:text-[#062F26]'
                  }`}
              >
                🌐 ગુજરાતી (Google Translate)
              </button>
            </div>
          </div>

          {/* RENTAL AGREEMENT BOX */}
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

              <button type="button" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#062F26]">
                <Icon icon={isAgreementCollapsed ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-4 h-4" />
                <span>{isAgreementCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </div>

            {/* Scrollable Agreement Text Body */}
            {!isAgreementCollapsed && (
              <div
                id="agreement-content"
                data-lenis-prevent="true"
                className="p-5 max-h-80 overflow-y-auto overscroll-contain bg-white text-xs text-slate-700 leading-relaxed font-sans space-y-4 scroll-smooth border-t border-slate-100"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#0AA87D #EAF5F2' }}
              >
                {agreementLanguage === 'en' ? (
                  renderFormattedContractLines(DEFAULT_CONTRACT_TEXT)
                ) : (
                  isTranslatingText ? (
                    <div className="flex items-center justify-center py-8 text-slate-500 gap-2 font-semibold">
                      <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin text-[#0AA87D]" />
                      <span>Translating agreement into Gujarati via Google Translate...</span>
                    </div>
                  ) : (
                    renderFormattedContractLines(translatedGujaratiText)
                  )
                )}
              </div>
            )}
          </div>

          {/* DIGITAL SIGNATURE SECTION */}
          {!isReadOnly && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#062F26] flex items-center gap-2">
                    <Icon icon="lucide:pen-tool" className="w-4 h-4 text-[#0AA87D]" />
                    Digital eSign <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please eSign below using your Aadhaar OTP.</p>
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
                    <button type="button" onClick={handleSendEsignOtp} className="w-fit px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2 cursor-pointer">
                      <Icon icon="lucide:file-signature" className="w-4 h-4" /> Send OTP for eSign
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" placeholder="Enter 6-digit eSign OTP" value={esignOtp} onChange={(e) => setEsignOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                      <button type="button" onClick={handleVerifyEsign} disabled={isVerifyingEsign || esignOtp.length < 6} className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2 ${isVerifyingEsign || esignOtp.length < 6 ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'}`}>
                        {isVerifyingEsign ? <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Affixing...</> : <><Icon icon="lucide:file-signature" className="w-4 h-4" /> Verify & eSign</>}
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
          )}

          <style>{`
            @keyframes stamp-press {
              0% { transform: scale(1.8) rotate(-15deg); opacity: 0; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            .animate-stamp-press { animation: stamp-press 1.5s ease-out forwards; }
          `}</style>

          {/* E-STAMP SECTION */}
          {!isReadOnly && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mt-3">
                <div>
                  <h3 className="text-sm font-bold text-[#062F26] flex items-center gap-2">
                    <Icon icon="lucide:stamp" className="w-4 h-4 text-[#0AA87D]" />
                    Agreement e-Stamp <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Generate a legally binding e-Stamp paper for your rental agreement.</p>
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
                          <p className="text-xs text-slate-500 mt-0.5">Required before final payment</p>
                        </div>
                      </div>
                      <button type="button" onClick={handleGenerateStamp} disabled={!isEsignVerified} className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2 ${!isEsignVerified ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70' : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'}`}>
                        <Icon icon="lucide:stamp" className="w-4 h-4" /> Generate e-Stamp
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-2 p-4 bg-[#FFFDF0] text-[#B45309] rounded-xl border border-[#FCD34D] shadow-sm flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#FCD34D]"><Icon icon="lucide:stamp" className="w-5 h-5 text-[#D97706]" /></div>
                    <div>
                      <h4 className="font-bold text-sm">e-Stamp Paper Attached</h4>
                      <p className="text-xs opacity-90 mt-0.5">A legal ₹300 e-Stamp has been affixed.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          {isReadOnly ? (
            <>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer">
                Close
              </button>
              <button onClick={handleEmailPDF} disabled={isEmailing} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
                {isEmailing ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:mail" className="w-4 h-4" />}
                {isEmailing ? 'Sending...' : 'Email PDF'}
              </button>
              <button onClick={handleDownloadPDF} className="px-8 py-2.5 rounded-xl font-bold text-sm bg-[#062F26] hover:bg-[#08483B] text-white shadow-md transition-all cursor-pointer flex items-center gap-2">
                <Icon icon="lucide:download" className="w-4 h-4" /> Download PDF
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${!isFormValid || isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-[#062F26] hover:bg-[#08483B] text-white shadow-md'}`}>
                {isSubmitting ? (
                  <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Icon icon="lucide:check-circle" className="w-4 h-4" /> Submit & Pay</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;
