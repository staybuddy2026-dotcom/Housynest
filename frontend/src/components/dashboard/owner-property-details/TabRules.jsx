import React from 'react';
import { Icon } from '@iconify/react';

const TabRules = ({ property }) => {
  const defaultRules = [
    { title: 'No Drinking', desc: 'Alcohol is strictly prohibited on the premises to ensure a safe and respectful environment for everyone.' },
    { title: 'No Smoking', desc: 'Smoking is not allowed inside rooms or common areas to maintain hygiene and avoid fire hazards.' },
    { title: 'No Guests', desc: 'Guests are not allowed inside the property. This helps keep the premises secure for all residents.' }
  ];

  const rulesList = property.pgRules?.length > 0
    ? property.pgRules.map(r => ({ title: r, desc: `Please adhere to the ${r.toLowerCase()} rule to maintain a peaceful environment for everyone.` }))
    : defaultRules;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
          <Icon icon="lucide:shield-alert" className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#062F26]">Property Rules & Regulations</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Strictly enforced guidelines for all tenants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rulesList.map((rule, idx) => (
          <div key={idx} className="bg-[#FAF6F0] border border-[#F3EFE9] p-5 rounded-xl hover:border-red-200 transition-colors group">
            <div className="flex gap-4">
              <div className="mt-1 w-2 h-2 bg-red-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:scale-125 transition-transform"></div>
              <div>
                <h4 className="text-base font-bold text-[#062F26] mb-2">{rule.title}</h4>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabRules;
