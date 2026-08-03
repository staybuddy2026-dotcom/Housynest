import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { translateWithGoogleFreeApi } from '../../lib/translate';

const DEFAULT_ENGLISH_AGREEMENT = `RENTAL / LEAVE AND LICENSE AGREEMENT

This Leave and License Agreement ("Agreement") is entered into on [agreement_date], at [agreement_city].

PARTIES TO THE AGREEMENT

Licensor (Owner/Property Manager):
[property_name], having its premises at [property_address], [property_city]
(hereinafter referred to as the "Licensor")

Licensee (Tenant):
[tenant_full_name]
Contact: [tenant_mobile] | [tenant_email]
Date of Birth: [tenant_date_of_birth]
(hereinafter referred to as the "Licensee")

ACCOMMODATION DETAILS
Property: [property_name]
Address: [property_address], [property_locality], [property_city]
Room / Unit: [room_name]
Bed Number: [bed_number]

FINANCIAL TERMS
Monthly Rent: ₹[rent_amount]
Security Deposit: ₹[deposit_amount]
Commencement Date: [move_in_date]
Vacation Date: [move_out_date]
Booking Reference: [booking_reference]

TERMS AND CONDITIONS

1. Nature of Agreement
This Agreement is a Leave and License Agreement only. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes.

2. Monthly Rent and Payment
The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the due date communicated by the Licensor. Continued occupation of the premises is conditional on timely payment of rent and any applicable charges.

3. Security Deposit
A refundable security deposit of ₹[deposit_amount] has been or shall be collected prior to move-in. The deposit shall be refunded within a reasonable time after the Licensee vacates the premises, after adjusting any outstanding dues, unpaid rent, utility charges, or costs of repairing damages caused by the Licensee beyond normal wear and tear.

4. Utilities and Additional Charges
Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card communicated separately.

5. Maintenance and Care of Premises
The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The Licensee shall promptly report any damage or defect to the Licensor. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit.

6. Conduct and House Rules
The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents, staff, or neighbors. The Licensee shall abide by all house rules, facility timings, and guidelines communicated by the Licensor from time to time.

7. Guests and Visitors
Guests and visitors shall be permitted on the premises only as per the Licensor's guest and visitor policy communicated separately. Overnight stays of guests shall require prior permission from the Licensor.

8. Alterations
The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas without the prior written consent of the Licensor.

9. Prohibited Uses
The Licensee shall not use the premises for any illegal, commercial, or immoral activity. The Licensee shall not sublet the accommodation or any part thereof to any third party.

10. Notice Period and Termination
Either party may terminate this Agreement by giving advance notice as agreed at the time of move-in or as communicated in writing. The Licensor reserves the right to terminate this Agreement immediately in the event of breach of any term of this Agreement, non-payment of rent, or conduct detrimental to other residents.

11. Vacation of Premises
Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation on or before the agreed vacation date, remove all personal belongings, return all keys and access devices, and hand over the premises in the same condition as received, subject to normal wear and tear.

12. Liability
The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises. The Licensee is advised to arrange personal insurance coverage for their valuables if required.

13. Force Majeure
Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including natural disasters, government restrictions, or other force majeure events.

14. Governing Law and Jurisdiction
This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].

15. Entire Agreement
This Agreement, along with any house rules communicated separately, constitutes the entire understanding between the parties regarding the accommodation. Any modification to this Agreement shall be mutually agreed upon in writing.

EMERGENCY CONTACT
Name: [emergency_contact_name]
Phone: [emergency_contact_phone]
Relationship: [emergency_contact_relationship]

SIGNATURES
By proceeding with occupation of the premises, the Licensee acknowledges that they have read, understood, and agree to be bound by all the terms and conditions of this Agreement.

Licensee: [tenant_full_name]
Date: [agreement_date]`;

const OwnerContractStep = ({ onNext, onPrev, isSubmitting }) => {
  const { watch, setValue } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const textareaRef = useRef(null);

  // Contract Mode: 'upload' or 'customize'
  const ownerContract = watch('ownerContract');
  const initialMode = ownerContract?.isCustomized || ownerContract?.mode === 'customized' ? 'customize' : 'upload';
  const [contractMode, setContractMode] = useState(initialMode);

  // Language Selection for Customization: 'en' or 'gu'
  const [contractLang, setContractLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Sub-tab under Customize mode: 'edit' or 'preview'
  const [editorSubTab, setEditorSubTab] = useState('edit');

  // Form values for dynamic placeholders
  const propertyName = watch('pgName') || watch('societyName') || watch('bhkType') || 'HousyNest Property';
  const propertyAddress = watch('address') || '123 Main Street';
  const propertyLocality = watch('locality') || 'Locality';
  const propertyCity = watch('city') || 'Mumbai';
  const monthlyRent = watch('monthlyRent') || watch('pgPricing.Single_AC.rentPerBed') || '12000';
  const securityDeposit = watch('securityAmount') || watch('pgPricing.Single_AC.depositPerBed') || monthlyRent;

  // Fully Editable Agreement Text for both languages
  const [contractTextEn, setContractTextEn] = useState(
    ownerContract?.contractTextEn || ownerContract?.contractText || DEFAULT_ENGLISH_AGREEMENT
  );
  const [contractTextGu, setContractTextGu] = useState(
    ownerContract?.contractTextGu || ''
  );

  const [isAgreementSaved, setIsAgreementSaved] = useState(Boolean(ownerContract?.isCustomized));

  // Active text based on selected language tab
  const activeContractText = contractLang === 'en' ? contractTextEn : contractTextGu;

  const setActiveContractText = (newVal) => {
    if (contractLang === 'en') {
      setContractTextEn(newVal);
    } else {
      setContractTextGu(newVal);
    }
    setIsAgreementSaved(false);
  };

  // Perform translation using Free Google Translate API with chunking
  const performAutoTranslation = async (sourceText, targetLang, sourceLang) => {
    if (!sourceText || !sourceText.trim()) return;
    setIsTranslating(true);
    const targetLabel = targetLang === 'gu' ? 'Gujarati' : 'English';
    toast.loading(`Translating contract to ${targetLabel}...`, { id: 'trans-toast' });
    try {
      const translated = await translateWithGoogleFreeApi(sourceText, targetLang, sourceLang);
      if (targetLang === 'gu') {
        setContractTextGu(translated);
      } else {
        setContractTextEn(translated);
      }
      toast.success(`Successfully translated contract into ${targetLabel}!`, { id: 'trans-toast' });
    } catch (err) {
      toast.error('Translation failed', { id: 'trans-toast' });
    } finally {
      setIsTranslating(false);
    }
  };

  // Two-Way Switch Language Tab: Always translates active edits between languages!
  const handleSelectLanguage = async (targetLang) => {
    if (targetLang === contractLang) return;

    if (targetLang === 'gu') {
      // Translate current English text to Gujarati
      await performAutoTranslation(contractTextEn, 'gu', 'en');
    } else if (targetLang === 'en') {
      // Translate current Gujarati text to English
      await performAutoTranslation(contractTextGu, 'en', 'gu');
    }
    setContractLang(targetLang);
  };

  // Variable tags for quick insertion
  const availableTags = [
    { tag: '[agreement_date]', label: 'Agreement Date' },
    { tag: '[agreement_city]', label: 'Agreement City' },
    { tag: '[property_name]', label: 'Property Name' },
    { tag: '[property_address]', label: 'Address' },
    { tag: '[property_locality]', label: 'Locality' },
    { tag: '[property_city]', label: 'City' },
    { tag: '[rent_amount]', label: 'Monthly Rent' },
    { tag: '[deposit_amount]', label: 'Security Deposit' },
    { tag: '[tenant_full_name]', label: 'Tenant Name' },
    { tag: '[tenant_mobile]', label: 'Tenant Mobile' },
    { tag: '[tenant_email]', label: 'Tenant Email' },
    { tag: '[room_name]', label: 'Room Name' },
    { tag: '[bed_number]', label: 'Bed Number' },
    { tag: '[move_in_date]', label: 'Move-In Date' }
  ];

  // Insert variable tag into textarea at cursor position
  const insertTagAtCursor = (tagText) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setActiveContractText(activeContractText + ' ' + tagText);
      return;
    }
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    const updated = activeContractText.substring(0, startPos) + tagText + activeContractText.substring(endPos);
    setActiveContractText(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + tagText.length, startPos + tagText.length);
    }, 50);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF document.');
      return;
    }
    const fileObj = {
      mode: 'upload',
      isCustomized: false,
      file: file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      previewUrl: URL.createObjectURL(file)
    };
    setValue('ownerContract', fileObj, { shouldValidate: true });
    setIsAgreementSaved(false);
    toast.success('PDF Contract uploaded successfully');
  };

  const removeContract = () => {
    setValue('ownerContract', null, { shouldValidate: true });
    setIsAgreementSaved(false);
    toast.success('Contract removed');
  };

  // Reset agreement text to default template
  const handleResetToDefault = () => {
    setContractTextEn(DEFAULT_ENGLISH_AGREEMENT);
    setContractTextGu('');
    setIsAgreementSaved(false);
    toast.success('Agreement reset to default template');
  };

  // Auto Translate button action
  const handleAutoTranslateAction = async () => {
    if (contractLang === 'en') {
      await performAutoTranslation(contractTextEn, 'gu', 'en');
    } else {
      await performAutoTranslation(contractTextGu, 'en', 'gu');
    }
  };

  // Save full customized contract to react-hook-form
  const handleSaveCustomAgreement = async () => {
    if (!contractTextEn.trim()) {
      toast.error('Contract text cannot be empty');
      return;
    }

    let finalGu = contractTextGu;
    if (!finalGu || !finalGu.trim()) {
      finalGu = await translateWithGoogleFreeApi(contractTextEn, 'gu', 'en');
      setContractTextGu(finalGu);
    }

    const contractObj = {
      mode: 'customize',
      isCustomized: true,
      name: 'Bilingual Dynamic Leave & License Agreement',
      contractTextEn: contractTextEn,
      contractTextGu: finalGu,
      contractText: contractTextEn
    };
    setValue('ownerContract', contractObj, { shouldValidate: true });
    setIsAgreementSaved(true);
    toast.success('Dynamic Agreement Saved & Applied in English & Gujarati!');
  };

  // Remove customized agreement
  const handleRemoveCustomAgreement = () => {
    setValue('ownerContract', null, { shouldValidate: true });
    setIsAgreementSaved(false);
    toast.success('Customized Agreement removed');
  };

  // Substitute dynamic placeholders & format sections for live preview
  const renderFormattedContractPreview = (rawText) => {
    if (!rawText) return null;

    const todayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    
    // Replace property values
    const substituted = rawText
      .replace(/\[agreement_date\]/g, todayDateStr)
      .replace(/\[agreement_city\]/g, propertyCity || 'Mumbai')
      .replace(/\[property_name\]/g, propertyName || 'HousyNest Property')
      .replace(/\[property_address\]/g, propertyAddress || '123 Main Street')
      .replace(/\[property_locality\]/g, propertyLocality || 'Locality')
      .replace(/\[property_city\]/g, propertyCity || 'Mumbai')
      .replace(/\[rent_amount\]/g, Number(monthlyRent).toLocaleString('en-IN'))
      .replace(/\[deposit_amount\]/g, Number(securityDeposit).toLocaleString('en-IN'));

    // Split text into lines
    const lines = substituted.split('\n');

    return (
      <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-700">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-1"></div>;

          // Main Header
          if (trimmed.includes('RENTAL / LEAVE AND LICENSE AGREEMENT') || trimmed.includes('મકાન ભાડા કરાર')) {
            return (
              <div key={index} className="text-center font-extrabold text-sm text-[#062F26] border-b border-slate-200 pb-3 my-2 tracking-wide">
                {trimmed}
              </div>
            );
          }

          // Section Headers
          const isSectionHeader = [
            'PARTIES TO THE AGREEMENT',
            'ACCOMMODATION DETAILS',
            'FINANCIAL TERMS',
            'TERMS AND CONDITIONS',
            'EMERGENCY CONTACT',
            'SIGNATURES',
            'કરારના પક્ષકારો',
            'મિલકત વિગતો',
            'નાણાકીય શરતો',
            'નિયમો અને શરતો',
            'ઈમરજન્સી સંપર્ક',
            'સહીઓ'
          ].some(h => trimmed.toUpperCase().includes(h));

          if (isSectionHeader) {
            return (
              <div key={index} className="font-extrabold text-[#062F26] uppercase text-[11px] tracking-wider pt-2 border-t border-slate-200/60 mt-3">
                {trimmed}
              </div>
            );
          }

          // Check if line contains un-replaced tenant placeholders
          const parts = line.split(/(\[[a-z_]+\])/g);

          return (
            <p key={index} className="leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith('[') && part.endsWith(']')) {
                  return (
                    <span key={pIdx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#EAF5F2] text-[#0AA87D] font-bold text-[11px] border border-[#0AA87D]/30 mx-0.5">
                      {part}
                    </span>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3 sm:gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-0.5 w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Icon icon="lucide:arrow-left" className="w-4.5 h-4.5" strokeWidth="2.5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062F26]">Owner Rental Agreement</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              Two-Way Auto Translation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
            Edit contract text in English or Gujarati. Switching tabs automatically translates your edits in both directions!
          </p>
        </div>
      </div>

      {/* MODE SWITCHER TABS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setContractMode('upload')}
          className={`p-3.5 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            contractMode === 'upload'
              ? 'border-[#0AA87D] bg-[#EAF5F2] text-[#062F26] shadow-sm'
              : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Icon icon="lucide:file-up" className="w-4.5 h-4.5 text-[#0AA87D]" />
          <span>Upload PDF Agreement</span>
        </button>

        <button
          type="button"
          onClick={() => setContractMode('customize')}
          className={`p-3.5 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            contractMode === 'customize'
              ? 'border-[#0AA87D] bg-[#EAF5F2] text-[#062F26] shadow-sm'
              : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Icon icon="lucide:edit-3" className="w-4.5 h-4.5 text-[#0AA87D]" />
          <span>Customize Entire Agreement</span>
        </button>
      </div>

      <div className="flex flex-col gap-6 flex-1">

        {/* TAB 1: UPLOAD PDF CONTRACT MODE */}
        {contractMode === 'upload' && (
          <>
            {/* Information Banner */}
            <div className="bg-linear-to-r from-[#EAF5F2] to-[#F2F9F7] border border-brand-teal/20 rounded-xl p-4 flex gap-3.5 items-start shadow-xs">
              <div className="mt-0.5 text-brand-teal shrink-0 bg-white p-2 rounded-lg shadow-xs">
                <Icon icon="lucide:file-text" className="w-5 h-5" strokeWidth="2.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#062F26] mb-1">Contract PDF Storage</h4>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Uploading your signed owner contract builds trust and provides verified compliance for your property. All uploaded PDFs are encrypted and saved securely.
                </p>
              </div>
            </div>

            {/* Existing Contract (if url present in data) */}
            {ownerContract?.url && !ownerContract?.file && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Icon icon="lucide:file-type-2" width="22" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#062F26]">{ownerContract.fileName || 'Uploaded Owner Contract PDF'}</p>
                    <span className="text-[11px] text-slate-400 font-medium">Stored in Cloudinary</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={ownerContract.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Icon icon="lucide:external-link" width="14" />
                    View PDF
                  </a>
                  <button
                    type="button"
                    onClick={removeContract}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove contract"
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </button>
                </div>
              </div>
            )}

            {/* Selected File Preview */}
            {ownerContract?.file && (
              <div className="bg-[#EAF5F2]/60 border border-brand-teal/30 rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                    <Icon icon="lucide:file-text" width="24" strokeWidth="2.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#062F26] truncate max-w-[200px] sm:max-w-md">{ownerContract.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-slate-500">{ownerContract.size}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-xs font-bold text-brand-teal flex items-center gap-1">
                        <Icon icon="lucide:check-circle-2" width="12" /> Ready to upload
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeContract}
                  className="w-8 h-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Remove file"
                >
                  <Icon icon="lucide:x" width="18" />
                </button>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            {(!ownerContract || (!ownerContract.file && !ownerContract.url && !ownerContract.isCustomized)) && (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-brand-teal bg-[#EAF5F2] scale-[1.01] shadow-lg shadow-brand-teal/10'
                    : 'border-slate-200 bg-slate-50/50 hover:border-brand-teal/50 hover:bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-4 transition-all duration-300 ${
                    dragActive ? 'bg-brand-teal text-white scale-110' : 'bg-white text-brand-teal border border-slate-150'
                  }`}
                >
                  <Icon icon="lucide:upload-cloud" className="w-7 h-7" strokeWidth="2" />
                </div>
                <h3 className="text-base font-bold text-[#062F26] mb-1">
                  Click to upload or drag & drop PDF contract
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm">
                  Official owner agreement PDF document (PDF format only, up to 10MB)
                </p>
              </div>
            )}
          </>
        )}

        {/* TAB 2: FULLY CUSTOMIZABLE AGREEMENT TEXT EDITOR (REORGANIZED LAYOUT) */}
        {contractMode === 'customize' && (
          <div className="space-y-5">
            
            {/* SUB-TABS: EDIT VS LIVE PREVIEW & TWO-WAY TRANSLATE */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorSubTab('edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editorSubTab === 'edit'
                      ? 'bg-[#062F26] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                  Contract Editor ({contractLang.toUpperCase()})
                </button>

                <button
                  type="button"
                  onClick={() => setEditorSubTab('preview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editorSubTab === 'preview'
                      ? 'bg-[#0AA87D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              </div>

              <button
                type="button"
                onClick={handleAutoTranslateAction}
                disabled={isTranslating}
                className="px-3.5 py-2 bg-[#EAF5F2] hover:bg-[#0AA87D] text-[#062F26] hover:text-white rounded-xl text-xs font-bold border border-[#0AA87D]/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
                title="Translate between English and Gujarati bi-directionally"
              >
                <Icon icon={isTranslating ? "lucide:loader-2" : "lucide:languages"} className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                {isTranslating ? 'Translating...' : contractLang === 'en' ? 'Translate to Gujarati' : 'Translate to English'}
              </button>
            </div>

            {/* EDITOR VIEW */}
            {editorSubTab === 'edit' && (
              <div className="space-y-4">
                
                {/* QUICK VARIABLE TAG BADGES */}
                <div>
                  <label className="block text-xs font-extrabold text-[#062F26] mb-1.5">
                    Click to insert dynamic variable tag into {contractLang === 'gu' ? 'Gujarati' : 'English'} contract text:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => insertTagAtCursor(item.tag)}
                        className="px-2.5 py-1 bg-[#EAF5F2] hover:bg-[#0AA87D] text-[#062F26] hover:text-white rounded-lg text-[11px] font-bold border border-[#0AA87D]/30 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>+ {item.label}</span>
                        <span className="text-[9px] opacity-75 font-mono">({item.tag})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEXTAREA HEADER BAR WITH MOVED LANGUAGE SWITCHER & RESET BUTTON */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                  
                  {/* Left: Language Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#062F26] shrink-0">Agreement Language:</span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('en')}
                        className={`px-3 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                          contractLang === 'en'
                            ? 'bg-[#062F26] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#062F26]'
                        }`}
                      >
                        🌐 English
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('gu')}
                        className={`px-3 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                          contractLang === 'gu'
                            ? 'bg-[#0AA87D] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#062F26]'
                        }`}
                      >
                        🌐 ગુજરાતી (Gujarati)
                      </button>
                    </div>
                  </div>

                  {/* Right: Reset Template & Character Count */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-red-200 transition-colors shadow-2xs"
                      title="Reset text to default template"
                    >
                      <Icon icon="lucide:rotate-ccw" className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reset</span>
                    </button>

                    <span className="text-[10px] text-slate-400 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {activeContractText.length} characters
                    </span>
                  </div>

                </div>

                {/* EDITABLE TEXTAREA */}
                <div>
                  <textarea
                    ref={textareaRef}
                    data-lenis-prevent="true"
                    rows={16}
                    value={activeContractText}
                    onChange={(e) => setActiveContractText(e.target.value)}
                    placeholder={contractLang === 'gu' && !activeContractText ? 'Click "Translate to Gujarati" or type in Gujarati...' : ''}
                    className="w-full p-4 rounded-xl border border-slate-300 focus:border-[#0AA87D] focus:ring-3 focus:ring-[#0AA87D]/10 text-xs font-mono text-slate-800 bg-slate-50/50 leading-relaxed outline-none transition-all scroll-smooth overscroll-contain shadow-inner"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#0AA87D #EAF5F2'
                    }}
                  />
                </div>

              </div>
            )}

            {/* LIVE PREVIEW VIEW */}
            {editorSubTab === 'preview' && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-[#062F26] text-white p-3.5 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:file-check-2" className="w-4 h-4 text-[#0AA87D]" />
                    <h4 className="text-xs font-extrabold tracking-wide uppercase">
                      Live Rendered Agreement ({contractLang === 'gu' ? 'ગુજરાતી' : 'English'})
                    </h4>
                  </div>
                  <span className="text-[10px] bg-[#0AA87D] text-white px-2.5 py-0.5 rounded-full font-bold">
                    Tenant View Simulation
                  </span>
                </div>

                <div
                  data-lenis-prevent="true"
                  className="p-6 max-h-96 overflow-y-auto overscroll-contain bg-white text-xs text-slate-700 leading-relaxed font-sans space-y-3 scroll-smooth"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#0AA87D #EAF5F2'
                  }}
                >
                  {renderFormattedContractPreview(activeContractText)}
                </div>
              </div>
            )}

            {/* SAVE & APPLY / REMOVE AGREEMENT ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                {isAgreementSaved ? '✓ Customized agreement is active & applied to listing' : 'Unsaved changes in contract editor'}
              </span>
              
              <div className="flex items-center gap-2">
                {isAgreementSaved && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomAgreement}
                    className="px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Icon icon="lucide:trash-2" className="w-4 h-4 text-red-500" />
                    <span>Remove Agreement</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveCustomAgreement}
                  className={`px-6 py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                    isAgreementSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#062F26] text-white hover:bg-[#08483B]'
                  }`}
                >
                  <Icon icon={isAgreementSaved ? "lucide:check-circle-2" : "lucide:save"} className="w-4 h-4" />
                  {isAgreementSaved ? 'Agreement Saved & Applied ✓' : 'Save & Apply Agreement'}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            Previous
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (contractMode === 'customize' && !isAgreementSaved) {
              handleSaveCustomAgreement();
            }
            onNext();
          }}
          disabled={isSubmitting}
          className={`ml-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 cursor-pointer ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#062F26] hover:-translate-y-0.5 active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className="animate-spin w-4.5 h-4.5" />
              Submitting Property...
            </>
          ) : (
            <>
              Submit Property
              <Icon icon="lucide:check" className="w-4.5 h-4.5" strokeWidth="2.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OwnerContractStep;
