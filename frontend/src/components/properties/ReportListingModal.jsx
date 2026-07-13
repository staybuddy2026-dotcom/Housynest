import { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const ReportListingModal = ({ isOpen, onClose, propertyId }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You must be logged in to report a listing.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId,
          reason,
          details
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit report');
      }

      toast.success('Report submitted successfully. Our team will review it.');
      setReason('');
      setDetails('');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit report. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const reportReasons = [
    'Inaccurate Information',
    'Fake Listing / Spam',
    'Offensive Content',
    'Property Already Rented/Sold',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600">
            <Icon icon="lucide:flag" className="w-5 h-5" />
            <h3 className="font-bold text-base">Report Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-slate-500 mb-5">
            Your report will be reviewed by our moderation team. False reporting may lead to account restrictions.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Reason for reporting <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a reason...</option>
                {reportReasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide more context about the issue..."
                rows="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Icon icon="eos-icons:loading" className="w-4 h-4" /> : null}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportListingModal;
