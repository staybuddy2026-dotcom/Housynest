import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { translateWithGoogleFreeApi } from '../../lib/translate';

const OwnerContractTerms = ({
  contractLang,
  terms,
  setTerms,
  setIsAgreementSaved
}) => {
  const [newTermTitle, setNewTermTitle] = useState('');
  const [newTermDesc, setNewTermDesc] = useState('');

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
    const updated = terms.filter((_, i) => i !== index);
    setTerms(updated);
    setIsAgreementSaved(false);
  };

  return (
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
  );
};

export default OwnerContractTerms;
