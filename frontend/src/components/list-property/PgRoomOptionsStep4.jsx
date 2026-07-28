import React from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

export const Step4GlobalPricing = ({ onBack }) => {
  const { watch, register, setValue } = useFormContext();
  const floors = watch('floors') || [];
  
  const activeTypes = new Set();
  floors.forEach(f => {
    (f.rooms || []).forEach(r => {
      if (r.sharingType) {
        activeTypes.add(`${r.sharingType}_${r.isAC ? 'AC' : 'NonAC'}`);
      }
    });
  });
  
  const sharingOrder = { 'Single': 1, 'Double': 2, 'Triple': 3, 'Four': 4, 'Other': 5 };
  const uniqueTypes = Array.from(activeTypes).sort((a, b) => {
    const [typeA, acA] = a.split('_');
    const [typeB, acB] = b.split('_');
    if (sharingOrder[typeA] !== sharingOrder[typeB]) {
      return (sharingOrder[typeA] || 99) - (sharingOrder[typeB] || 99);
    }
    return acA === 'AC' ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button type="button" onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <Icon icon="lucide:arrow-left" width="20" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-[#062F26]">Pricing Configuration</h3>
          <p className="text-xs text-slate-500 font-medium">Set the monthly rent and security deposit based on sharing type and AC</p>
        </div>
      </div>

      {uniqueTypes.length === 0 ? (
        <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-xl border-dashed">
          <span className="text-slate-400 text-sm font-medium">No rooms added yet. Please add rooms first to configure pricing.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {uniqueTypes.map(type => {
            const [sharingType, isAC] = type.split('_');
            const displayTitle = `${sharingType} Sharing (${isAC === 'AC' ? 'AC' : 'Non-AC'})`;
            
            return (
              <div key={type} className={`p-4 bg-white border ${isAC === 'AC' ? 'border-brand-teal/20' : 'border-slate-200'} rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
                {isAC === 'AC' && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#EAF5F2] to-transparent -z-10 rounded-tr-xl"></div>
                )}
                <h4 className="text-sm font-bold text-[#062F26] mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${isAC === 'AC' ? 'bg-[#EAF5F2] text-brand-teal' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon icon="lucide:indian-rupee" />
                    </div>
                    {displayTitle}
                  </div>
                  {isAC === 'AC' && <Icon icon="lucide:snowflake" className="text-brand-teal w-4 h-4" />}
                </h4>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <label className="text-xs font-bold text-[#062F26] mb-1.5 block">Rent Per Bed / Month</label>
                    <span className="absolute left-3 bottom-3 text-slate-500 font-medium text-sm">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      {...register(`pgPricing.${type}.rentPerBed`)} 
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all" 
                      placeholder="Amount" 
                    />
                  </div>
                  <div className="flex-1 relative">
                    <label className="text-xs font-bold text-[#062F26] mb-1.5 block">Security Deposit Per Bed</label>
                    <span className="absolute left-3 bottom-3 text-slate-500 font-medium text-sm">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      {...register(`pgPricing.${type}.depositPerBed`)} 
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all" 
                      placeholder="Amount" 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
