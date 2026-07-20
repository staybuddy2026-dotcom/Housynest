import { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const CompleteProfileModal = ({ isOpen, token, onComplete }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone })
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to update profile');
        return;
      }

      toast.success('Profile completed successfully!');
      onComplete(result); // Pass updated user back
    } catch {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-brand-teal to-[#062F26]"></div>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#EAF5F2] text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-[#EAF5F2]/50">
              <Icon icon="lucide:phone" className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">One Last Step!</h2>
            <p className="text-sm text-slate-500 font-medium">Please provide your phone number to complete your profile setup.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Icon icon="lucide:phone" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#062F26] hover:bg-brand-teal text-white font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
              ) : null}
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
