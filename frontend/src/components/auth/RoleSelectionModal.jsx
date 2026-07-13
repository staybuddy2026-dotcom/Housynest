import { useState } from 'react';
import { Icon } from '@iconify/react';

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState('tenant');

  const roles = [
    { id: 'owner', title: 'Owner', subtitle: 'List & Manage', icon: 'lucide:home' },
    { id: 'tenant', title: 'Tenant', subtitle: 'Find Homes', icon: 'lucide:user' }
  ];

  const handleContinue = () => {
    onSelectRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-[#062F26]">Choose Your Role</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Icon icon="lucide:x" className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-6">Please select how you want to use HousyNest before continuing with Google.</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setSelectedRole(r.id)} type="button" className={`group cursor-pointer relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-[1.5px] transition-all duration-300 ${selectedRole === r.id ? 'border-[#062F26] bg-[#062F26]/5 shadow-md transform -translate-y-1' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5'}`}>
                <Icon icon={r.icon} className={`w-6 h-6 transition-colors duration-300 ${selectedRole === r.id ? 'text-[#062F26]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <div className="text-center">
                  <div className={`text-sm font-semibold transition-colors duration-300 ${selectedRole === r.id ? 'text-[#062F26]' : 'text-slate-700 group-hover:text-slate-900'}`}>{r.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">{r.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          <button onClick={handleContinue} className="w-full bg-[#062F26] hover:bg-[#04201a] cursor-pointer text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            Continue with Google
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
