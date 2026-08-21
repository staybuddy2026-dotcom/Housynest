import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Icon } from '@iconify/react';

const PgBankDetails = ({ onNext, onPrev, isSubmitting }) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062F26]">Bank Details</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              Secure
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
            Provide your bank account details for collecting rent and deposits securely. These details are kept private and are not shown to users.
          </p>
        </div>
        <div className="p-3 bg-brand-teal/10 rounded-full">
          <Icon icon="lucide:building-2" className="w-6 h-6 text-brand-teal" />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Holder Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('bankDetails.accountHolderName')}
              placeholder="e.g. John Doe"
              className={`w-full px-4 py-3 rounded-xl border ${errors.bankDetails?.accountHolderName ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-teal focus:ring-brand-teal/10'} focus:outline-none focus:ring-4 transition-all text-sm font-medium text-slate-700`}
            />
            {errors.bankDetails?.accountHolderName && <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"><Icon icon="lucide:alert-circle" /> {errors.bankDetails.accountHolderName.message}</p>}
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('bankDetails.accountNumber')}
              placeholder="e.g. 123456789012"
              className={`w-full px-4 py-3 rounded-xl border ${errors.bankDetails?.accountNumber ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-teal focus:ring-brand-teal/10'} focus:outline-none focus:ring-4 transition-all text-sm font-medium text-slate-700`}
            />
            {errors.bankDetails?.accountNumber && <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"><Icon icon="lucide:alert-circle" /> {errors.bankDetails.accountNumber.message}</p>}
          </div>

          {/* IFSC Code */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('bankDetails.ifscCode')}
              placeholder="e.g. HDFC0001234"
              className={`w-full px-4 py-3 rounded-xl border ${errors.bankDetails?.ifscCode ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-teal focus:ring-brand-teal/10'} focus:outline-none focus:ring-4 transition-all text-sm font-medium text-slate-700 uppercase`}
            />
            {errors.bankDetails?.ifscCode && <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"><Icon icon="lucide:alert-circle" /> {errors.bankDetails.ifscCode.message}</p>}
          </div>

          {/* Bank Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('bankDetails.bankName')}
              placeholder="e.g. HDFC Bank"
              className={`w-full px-4 py-3 rounded-xl border ${errors.bankDetails?.bankName ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-teal focus:ring-brand-teal/10'} focus:outline-none focus:ring-4 transition-all text-sm font-medium text-slate-700`}
            />
            {errors.bankDetails?.bankName && <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"><Icon icon="lucide:alert-circle" /> {errors.bankDetails.bankName.message}</p>}
          </div>
        </div>

        <div className="mt-6 bg-[#FFFDF0] border border-[#FBE38E] rounded-xl p-4 flex items-start gap-3">
          <Icon icon="lucide:shield-check" className="w-5 h-5 text-[#D4B22B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#A68A22] font-semibold leading-relaxed">
            Your bank details are encrypted and stored securely. We will never share this information with anyone without your consent. This is only used to transfer rent or deposits from tenants.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            Previous
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className={`ml-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 cursor-pointer ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#062F26] hover:-translate-y-0.5 active:scale-95'
            }`}
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className="animate-spin w-4.5 h-4.5" />
              Submitting Property...
            </>
          ) : (
            <>
              Submit Property
              <Icon icon="lucide:check" className="w-4.5 h-4.5" strokeWidth="2.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PgBankDetails;
