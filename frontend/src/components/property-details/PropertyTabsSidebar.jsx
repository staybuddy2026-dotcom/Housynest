import { Icon } from '@iconify/react';

const PropertyTabsSidebar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-24">
      <div className="bg-white rounded-[24px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 p-2 sm:p-4 flex flex-row overflow-x-auto hide-scrollbar lg:flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`group flex items-center justify-between whitespace-nowrap px-4 lg:px-5 py-3 lg:py-3.5 text-left text-xs lg:text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab ? 'bg-[#EAF5F2] text-brand-teal shadow-[inset_0_-3px_0_0_#0aa87d] lg:shadow-[inset_3px_0_0_#0aa87d]' : 'text-slate-500 hover:bg-slate-50 hover:text-[#062F26] lg:hover:pl-6'}`}
          >
            {tab}
            <Icon
              icon="lucide:chevron-right"
              className={`hidden lg:block w-4 h-4 transition-all duration-300 ${activeTab === tab ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertyTabsSidebar;
