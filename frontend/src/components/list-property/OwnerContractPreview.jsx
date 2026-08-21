import React from 'react';
import { Icon } from '@iconify/react';

const OwnerContractPreview = ({
  activeContractText,
  terms,
  contractLang,
  propertyName,
  ownerName,
  propertyAddress,
  propertyLocality,
  propertyCity,
  monthlyRent,
  securityDeposit
}) => {

  const renderFormattedContractPreview = (rawText) => {
    if (!rawText) return null;

    const todayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    // Replace property values
    const substituted = rawText
      .replace(/\[agreement_date\]/g, todayDateStr)
      .replace(/\[agreement_city\]/g, propertyCity || 'Mumbai')
      .replace(/\[property_name\]/g, propertyName || 'HousyNest Property')
      .replace(/\[owner_name\]/g, ownerName)
      .replace(/\[property_address\]/g, propertyAddress || '123 Main Street')
      .replace(/\[property_locality\]/g, propertyLocality || 'Locality')
      .replace(/\[property_city\]/g, propertyCity || 'Mumbai')
      .replace(/\[rent_amount\]/g, Number(monthlyRent).toLocaleString('en-IN'))
      .replace(/\[deposit_amount\]/g, Number(securityDeposit).toLocaleString('en-IN'));

    const lines = substituted.split('\n');
    
    let lastH3Index = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('<h3>') && lines[i].trim().endsWith('</h3>')) {
        lastH3Index = i;
        break;
      }
    }
    
    if (lastH3Index === -1) {
      lastH3Index = lines.length;
    }

    const renderLines = (linesToRender, keyPrefix) => {
      return linesToRender.map((line, index) => {
        const uniqueKey = `${keyPrefix}-${index}`;
        let trimmed = line.trim();
        if (!trimmed) return <div key={uniqueKey} className="h-1"></div>;

        if (trimmed.startsWith('<h1>') && trimmed.endsWith('</h1>')) {
          return (
            <div key={uniqueKey} className="text-center font-bold text-sm text-[#062F26] border-b border-slate-200 pb-3 my-2 tracking-wide">
              {trimmed.replace(/<\/?h1>/g, '')}
            </div>
          );
        }

        if (trimmed.startsWith('<h3>') && trimmed.endsWith('</h3>')) {
          return (
            <div key={uniqueKey} className="font-bold text-[#062F26] uppercase text-[11px] tracking-wider pt-2 border-t border-slate-200/60 mt-3">
              {trimmed.replace(/<\/?h3>/g, '')}
            </div>
          );
        }

        // Parse <b> tags
        const parts = trimmed.split(/(<b>.*?<\/b>)/g);

        return (
          <p key={uniqueKey} className="leading-relaxed">
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
      });
    };

    const beforeSignatureLines = lines.slice(0, lastH3Index);
    const signatureLines = lines.slice(lastH3Index);

    return (
      <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-700">
        {renderLines(beforeSignatureLines, 'main')}

        {/* Append dynamic Terms and Conditions to preview before signatures */}
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
        
        {renderLines(signatureLines, 'sig')}
      </div>
    );
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="bg-[#062F26] text-white p-3.5 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:file-check-2" className="w-4 h-4 text-[#0AA87D]" />
          <h4 className="text-xs font-bold tracking-wide uppercase">
            Live Rendered Agreement ({contractLang === 'gu' ? 'ગુજરાતી' : 'English'})
          </h4>
        </div>
        <span className="text-[10px] bg-[#0AA87D] text-white px-2.5 py-0.5 rounded-full font-bold">
          {activeContractText.length} chars
        </span>
      </div>
      
      <div className="bg-white p-6 sm:p-8 min-h-[500px]">
        {renderFormattedContractPreview(activeContractText)}
      </div>
    </div>
  );
};

export default OwnerContractPreview;
