import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const actions = [
  { name: 'Add New Property', icon: 'lucide:plus-circle', path: '/list-property', color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
  { name: 'View All Listings', icon: 'lucide:building-2', path: '/owner/listings', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Manage Contracts', icon: 'lucide:file-text', path: '/owner/contracts', color: 'text-slate-500', bg: 'bg-slate-100' },
  { name: 'Help & Support', icon: 'lucide:headset', path: '/contact', color: 'text-slate-500', bg: 'bg-slate-100' },
];

const QuickActionsWidget = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">
      <div className="p-5 border-b border-transparent">
        <h3 className="text-[15px] font-bold text-[#062F26]">Quick Actions</h3>
      </div>
      <div className="flex flex-col px-4 pb-4 gap-2">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-brand-teal/30 hover:shadow-sm transition-all duration-200 group bg-white"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.bg}`}>
              <Icon icon={action.icon} className={`w-[18px] h-[18px] ${action.color}`} />
            </div>
            <span className="flex-1 text-sm font-bold text-[#062F26]">{action.name}</span>
            <Icon icon="lucide:chevron-right" className="w-4 h-4 text-slate-400 group-hover:text-brand-teal transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsWidget;
