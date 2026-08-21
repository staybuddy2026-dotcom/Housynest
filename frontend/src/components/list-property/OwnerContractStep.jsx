import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { translateWithGoogleFreeApi } from '../../lib/translate';

import { DEFAULT_ENGLISH_AGREEMENT, DEFAULT_TERMS_AND_CONDITIONS } from './OwnerContractConstants';
import OwnerContractEditor from './OwnerContractEditor';
import OwnerContractTerms from './OwnerContractTerms';
import OwnerContractPreview from './OwnerContractPreview';

const OwnerContractStep = ({ onNext, onPrev, isSubmitting }) => {
  const { watch, setValue } = useFormContext();

  // Contract Mode: always 'customize'
  const ownerContract = watch('ownerContract');
  const [contractMode, setContractMode] = useState('customize');

  // Language Selection for Customization: 'en' or 'gu'
  const [contractLang, setContractLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Sub-tab under Customize mode: 'edit' or 'preview'
  const [editorSubTab, setEditorSubTab] = useState('edit');

  // Form values for dynamic placeholders
  const authUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const authUser = authUserStr ? JSON.parse(authUserStr) : null;
  const propertyName = watch('pgName') || watch('societyName') || watch('bhkType') || 'HousyNest Property';
  const ownerName = watch('ownerName') || watch('owner.fullName') || authUser?.fullName || authUser?.name || 'Property Owner';
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
    toast.loading(`Translating contract and terms to ${targetLabel}...`, { id: 'trans-toast' });
    try {
      const translated = await translateWithGoogleFreeApi(sourceText, targetLang, sourceLang);
      if (targetLang === 'gu') {
        setContractTextGu(translated);
      } else {
        setContractTextEn(translated);
      }

      const updatedTerms = await Promise.all(terms.map(async (term) => {
        let updatedTerm = { ...term };
        if (targetLang === 'gu') {
          if (!updatedTerm.titleGu) {
            updatedTerm.titleGu = await translateWithGoogleFreeApi(term.titleEn, 'gu', 'en');
          }
          if (!updatedTerm.descriptionGu) {
            updatedTerm.descriptionGu = await translateWithGoogleFreeApi(term.descriptionEn, 'gu', 'en');
          }
        } else {
          if (!updatedTerm.titleEn) {
            updatedTerm.titleEn = await translateWithGoogleFreeApi(term.titleGu, 'en', 'gu');
          }
          if (!updatedTerm.descriptionEn) {
            updatedTerm.descriptionEn = await translateWithGoogleFreeApi(term.descriptionGu, 'en', 'gu');
          }
        }
        return updatedTerm;
      }));
      setTerms(updatedTerms);

      toast.success(`Successfully translated contract and terms into ${targetLabel}!`, { id: 'trans-toast' });
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

  // Reset agreement text to default template
  const handleResetToDefault = () => {
    setContractTextEn(DEFAULT_ENGLISH_AGREEMENT);
    setContractTextGu('');
    setTerms(DEFAULT_TERMS_AND_CONDITIONS);
    setIsAgreementSaved(false);
    toast.success('Agreement reset to default template');
  };

  // Save the customized agreement to the form state
  const handleSaveCustomAgreement = async () => {
    if (!contractTextEn.trim() && !contractTextGu.trim()) {
      toast.error("Please provide some contract text before saving.");
      return;
    }

    let finalContractTextGu = contractTextGu;
    let finalTerms = [...terms];

    toast.loading('Preparing agreement...', { id: 'save-agree' });

    // Auto-translate to Gujarati if missing
    if (!contractTextGu.trim() && contractTextEn.trim()) {
      toast.loading('Auto-translating to Gujarati before saving...', { id: 'save-agree' });
      try {
        finalContractTextGu = await translateWithGoogleFreeApi(contractTextEn, 'gu', 'en');

        finalTerms = await Promise.all(terms.map(async (term) => {
          let updatedTerm = { ...term };
          if (!updatedTerm.titleGu) {
            updatedTerm.titleGu = await translateWithGoogleFreeApi(term.titleEn, 'gu', 'en');
          }
          if (!updatedTerm.descriptionGu) {
            updatedTerm.descriptionGu = await translateWithGoogleFreeApi(term.descriptionEn, 'gu', 'en');
          }
          return updatedTerm;
        }));
        
        setContractTextGu(finalContractTextGu);
        setTerms(finalTerms);
        toast.success('Auto-translated successfully.', { id: 'save-agree' });
      } catch (error) {
        console.error("Auto-translation on save failed:", error);
        toast.error('Auto-translation failed. Saving only English version.', { id: 'save-agree' });
      }
    }

    const contractObj = {
      isCustomized: true,
      contractTextEn: contractTextEn.trim(),
      contractTextGu: finalContractTextGu.trim(),
      termsAndConditions: finalTerms,
      updatedAt: new Date().toISOString()
    };

    setValue('ownerContract', contractObj, { shouldValidate: true });
    setIsAgreementSaved(true);
    toast.success('Custom agreement saved and applied to your listing!', { id: 'save-agree' });
  };

  const handleRemoveCustomAgreement = () => {
    setValue('ownerContract', {
      isCustomized: false,
      contractTextEn: '',
      contractTextGu: '',
      termsAndConditions: [],
      url: null,
      file: null
    }, { shouldValidate: true });

    setContractTextEn(DEFAULT_ENGLISH_AGREEMENT);
    setContractTextGu('');
    setTerms(DEFAULT_TERMS_AND_CONDITIONS);
    setIsAgreementSaved(false);
    toast.success('Custom agreement removed');
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 pb-4 border-b border-slate-100">
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
          {/* SUB-TABS: EDIT VS LIVE PREVIEW */}
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
          </div>

          {/* EDITOR VIEW */}
          {editorSubTab === 'edit' && (
            <div className="space-y-4">
              <OwnerContractEditor
                contractLang={contractLang}
                activeContractText={activeContractText}
                setActiveContractText={setActiveContractText}
                handleSelectLanguage={handleSelectLanguage}
                handleResetToDefault={handleResetToDefault}
              />

              <OwnerContractTerms
                contractLang={contractLang}
                terms={terms}
                setTerms={setTerms}
                setIsAgreementSaved={setIsAgreementSaved}
              />
            </div>
          )}

          {/* LIVE PREVIEW VIEW */}
          {editorSubTab === 'preview' && (
            <OwnerContractPreview
              activeContractText={activeContractText}
              terms={terms}
              contractLang={contractLang}
              propertyName={propertyName}
              ownerName={ownerName}
              propertyAddress={propertyAddress}
              propertyLocality={propertyLocality}
              propertyCity={propertyCity}
              monthlyRent={monthlyRent}
              securityDeposit={securityDeposit}
            />
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
