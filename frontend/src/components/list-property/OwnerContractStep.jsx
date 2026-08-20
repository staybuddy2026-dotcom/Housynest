import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { translateWithGoogleFreeApi } from '../../lib/translate';

const DEFAULT_ENGLISH_AGREEMENT = `<h1>RENTAL / LEAVE AND LICENSE AGREEMENT</h1>
<p style="text-align: center; font-weight: bold;">(11-Month Rental Agreement)</p>

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

const OwnerContractStep = ({ onNext, onPrev, isSubmitting }) => {
  const { watch, setValue } = useFormContext();
  const textareaRef = useRef(null);

  // Contract Mode: always 'customize'
  const ownerContract = watch('ownerContract');
  const [contractMode, setContractMode] = useState('customize');

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

  const [terms, setTerms] = useState(
    ownerContract?.termsAndConditions?.length > 0
      ? ownerContract.termsAndConditions
      : DEFAULT_TERMS_AND_CONDITIONS
  );
  const [newTermTitle, setNewTermTitle] = useState('');
  const [newTermDesc, setNewTermDesc] = useState('');

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



  // Reset agreement text to default template
  const handleResetToDefault = () => {
    setContractTextEn(DEFAULT_ENGLISH_AGREEMENT);
    setContractTextGu('');
    setTerms(DEFAULT_TERMS_AND_CONDITIONS);
    setIsAgreementSaved(false);
    toast.success('Agreement reset to default template');
  };

  const handleAddTerm = async () => {
    if (!newTermTitle.trim() || !newTermDesc.trim()) {
      toast.error('Title and Description are required');
      return;
    }
    
    let titleGu = '';
    let descGu = '';
    
    try {
      toast.loading('Translating new term...', { id: 'term-trans' });
      titleGu = await translateWithGoogleFreeApi(newTermTitle, 'gu', 'en');
      descGu = await translateWithGoogleFreeApi(newTermDesc, 'gu', 'en');
      toast.success('Term added and translated', { id: 'term-trans' });
    } catch (error) {
      toast.error('Translation failed, term added in English', { id: 'term-trans' });
    }
    
    const newTerm = {
      titleEn: newTermTitle,
      descriptionEn: newTermDesc,
      titleGu: titleGu,
      descriptionGu: descGu
    };
    
    setTerms([...terms, newTerm]);
    setNewTermTitle('');
    setNewTermDesc('');
    setIsAgreementSaved(false);
  };
  
  const handleRemoveTerm = (index) => {
    const updated = [...terms];
    updated.splice(index, 1);
    setTerms(updated);
    setIsAgreementSaved(false);
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
      contractText: contractTextEn,
      termsAndConditions: terms
    };
    setValue('ownerContract', contractObj, { shouldValidate: true });
    setIsAgreementSaved(true);
    toast.success('Dynamic Agreement Saved & Applied in English & Gujarati!');
  };

  // Remove customized agreement
  const handleRemoveCustomAgreement = () => {
    setValue('ownerContract', {
      mode: 'customize',
      isCustomized: false,
      contractTextEn: '',
      contractTextGu: '',
      termsAndConditions: []
    });
    setContractTextEn(DEFAULT_ENGLISH_AGREEMENT);
    setContractTextGu('');
    setTerms(DEFAULT_TERMS_AND_CONDITIONS);
    setIsAgreementSaved(false);
    toast.success('Custom agreement removed');
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
                let textToRender = part;
                let isBold = false;
                if (part.startsWith('<b>') && part.endsWith('</b>')) {
                  isBold = true;
                  textToRender = part.slice(3, -4);
                }

                // Now parse placeholders within textToRender
                const subParts = textToRender.split(/(\[[a-z_]+\])/g);
                const renderedSubParts = subParts.map((subPart, j) => {
                  if (subPart.startsWith('[') && subPart.endsWith(']')) {
                    return (
                      <span key={j} className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#EAF5F2] text-[#0AA87D] font-bold text-[11px] border border-[#0AA87D]/30 mx-0.5">
                        {subPart}
                      </span>
                    );
                  }
                  return subPart;
                });

                if (isBold) {
                  return <strong key={i} className="font-bold text-slate-800">{renderedSubParts}</strong>;
                }
                return <span key={i}>{renderedSubParts}</span>;
              })}
            </p>
          );
        })}

        {/* Append dynamic Terms and Conditions to preview */}
        {terms.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="font-bold text-[#062F26] uppercase text-[11px] tracking-wider pt-2 border-t border-slate-200/60 mt-3">
              TERMS AND CONDITIONS
            </div>
            {terms.map((term, idx) => (
              <p key={`term-${idx}`} className="leading-relaxed">
                <strong className="font-bold text-slate-800">
                  {idx + 1}. {contractLang === 'en' ? term.titleEn : (term.titleGu || term.titleEn)}
                </strong>
                <br />
                <span className="whitespace-pre-wrap">
                  {contractLang === 'en' ? term.descriptionEn : (term.descriptionGu || term.descriptionEn)}
                </span>
              </p>
            ))}
          </div>
        )}
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

      <div className="flex flex-col gap-6 flex-1">
        {/* FULLY CUSTOMIZABLE AGREEMENT TEXT EDITOR */}
        <div className="space-y-5">

            {/* SUB-TABS: EDIT VS LIVE PREVIEW & TWO-WAY TRANSLATE */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorSubTab('edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${editorSubTab === 'edit'
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${editorSubTab === 'preview'
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
                  <label className="block text-xs font-bold text-[#062F26] mb-1.5">
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
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${contractLang === 'en'
                            ? 'bg-[#062F26] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#062F26]'
                          }`}
                      >
                        🌐 English
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('gu')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${contractLang === 'gu'
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
                    rows={12}
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

                {/* TERMS AND CONDITIONS EDITOR */}
                <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#062F26] flex items-center gap-2">
                      <Icon icon="lucide:list-checks" className="w-4 h-4 text-[#0AA87D]" />
                      Terms and Conditions ({contractLang === 'gu' ? 'ગુજરાતી' : 'English'})
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {terms.length} Items
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent="true">
                    {terms.map((term, idx) => (
                      <div key={idx} className="group relative bg-white border border-slate-200 rounded-lg p-3 hover:border-[#0AA87D]/50 transition-colors">
                        <button
                          type="button"
                          onClick={() => handleRemoveTerm(idx)}
                          className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                          title="Remove Term"
                        >
                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                        </button>
                        <h4 className="text-xs font-bold text-[#062F26] mb-1 pr-8">
                          {idx + 1}. {contractLang === 'en' ? term.titleEn : (term.titleGu || term.titleEn)}
                        </h4>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed pr-8">
                          {contractLang === 'en' ? term.descriptionEn : (term.descriptionGu || term.descriptionEn)}
                        </p>
                      </div>
                    ))}

                    {terms.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs italic">
                        No terms and conditions added yet.
                      </div>
                    )}
                  </div>

                  {/* Add New Term */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-[#062F26]">Add Custom Term</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={newTermTitle}
                          onChange={(e) => setNewTermTitle(e.target.value)}
                          placeholder="Term Title (English)"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0AA87D] focus:ring-1 focus:ring-[#0AA87D]"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <textarea
                          value={newTermDesc}
                          onChange={(e) => setNewTermDesc(e.target.value)}
                          placeholder="Term Description (English)"
                          rows={1}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0AA87D] focus:ring-1 focus:ring-[#0AA87D]"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={handleAddTerm}
                          disabled={!newTermTitle.trim() || !newTermDesc.trim()}
                          className="w-full h-[34px] bg-[#0AA87D] text-white text-xs font-bold rounded-lg hover:bg-[#088c68] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      * Term will be automatically translated to Gujarati when added, if applicable.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* LIVE PREVIEW VIEW */}
            {editorSubTab === 'preview' && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-[#062F26] text-white p-3.5 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:file-check-2" className="w-4 h-4 text-[#0AA87D]" />
                    <h4 className="text-xs font-bold tracking-wide uppercase">
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
                  className={`px-6 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 ${isAgreementSaved
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
          className={`ml-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 cursor-pointer ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#062F26] hover:-translate-y-0.5 active:scale-95'
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
