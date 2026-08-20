import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const MockPaymentModal = ({ isOpen, onClose, amount, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate Razorpay/Stripe network delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess('Paid');
    }, 2000);
  };

  const handleFail = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.error('Payment Failed. Please try again.');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-[#062F26] p-6 text-white text-center relative">
          <button 
            onClick={!isProcessing ? onClose : undefined}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Icon icon="lucide:credit-card" className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold">Secure Payment gateway (Mock)</h2>
          <p className="text-white/70 text-sm mt-1">Complete your transaction to proceed</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-600 font-semibold text-sm">Amount to Pay</span>
            <span className="text-2xl font-bold text-[#062F26]">₹{amount?.toLocaleString('en-IN')}</span>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-[#0AA87D] hover:bg-[#088A66] text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Icon icon="lucide:check-circle" className="w-5 h-5" />
                  Simulate Successful Payment
                </>
              )}
            </button>

            <button
              onClick={handleFail}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Icon icon="lucide:x-circle" className="w-5 h-5" />
              Simulate Failed Payment
            </button>
          </div>
          
          <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
            <Icon icon="lucide:lock" className="w-3 h-3" />
            End-to-End Encrypted Test Environment
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;
