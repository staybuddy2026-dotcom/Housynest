import React, { useRef } from 'react';
import { Icon } from '@iconify/react';
import { availableTags } from './OwnerContractConstants';

const OwnerContractEditor = ({
  contractLang,
  activeContractText,
  setActiveContractText,
  handleSelectLanguage,
  handleResetToDefault
}) => {
  const textareaRef = useRef(null);

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

  return (
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
    </div>
  );
};

export default OwnerContractEditor;
