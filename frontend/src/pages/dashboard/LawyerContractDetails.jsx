import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

const LawyerContractDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-10">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lawyer/contracts')}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-lg transition-colors"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back to Contracts
          </button>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
            <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
            Fully Executed
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">

        {/* OWNER SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Owner</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Khush Prajapati" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">Khush Prajapati</h3>
              <p className="text-xs text-slate-500">khushprajapati3107@gmail.com</p>
            </div>
          </div>
        </div>

        {/* TENANT DETAILS SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tenant Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tenant Name</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                nijal patel
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tenant Email</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                hedoniahotel2026@gmail.com
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tenant Phone</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                9995858698
              </div>
            </div>
          </div>
        </div>

        {/* PROPERTY & FINANCIALS SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Property & Financials</h4>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Property Address</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                #567, 12th Main, 7th Cross, Indiranagar
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monthly Rent (₹)</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-bold">
                  12,000
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Security Deposit (₹)</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-bold">
                  24,000
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lease Duration</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                  11 months
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notice Period</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                  1 month
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                  01 May 2026
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                  30 Apr 2027
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TERMS & CONDITIONS SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Terms & Conditions</h4>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Terms</label>
              <div className="h-40 overflow-y-auto w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 custom-scrollbar font-serif whitespace-pre-wrap">
                {`RENTAL AGREEMENT

This Rental Agreement is entered into between:

OWNER: Khush Prajapati
Email: khushprajapati3107@gmail.com
Phone: 9824970199

PROPERTY ADDRESS: #567, 12th Main, 7th Cross, Indiranagar

TERMS AND CONDITIONS:
1. The tenant agrees to pay the monthly rent on or before the 5th of each month.
2. The security deposit is refundable at the end of the lease, subject to deductions for damages.
3. The tenant shall not sublet the property without prior written consent from the owner.
4. The tenant shall maintain the property in good condition.
5. Any modifications to the property require written approval from the owner.
6. Utilities (electricity, water, gas) are the responsibility of the tenant unless otherwise agreed.
7. The tenant shall allow the owner reasonable access for inspections with prior notice.`}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Policies</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-serif whitespace-pre-wrap">
                {`POLICIES:
- No smoking inside the premises.
- Pets are not allowed without prior written consent.
- Noise levels must be kept reasonable, especially between 10 PM and 6 AM.
- Garbage disposal must follow local municipal guidelines.
- Parking (if applicable) is limited to designated areas only.`}
              </div>
            </div>
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold text-blue-900">Owner Signed — 5 May 2026</span>
            </div>
            <p className="text-xs text-blue-600 font-bold mb-2 flex items-center gap-1.5"><Icon icon="lucide:pen-tool" className="w-3.5 h-3.5" /> Owner's Signature</p>
            <div className="w-40 h-16 bg-white border border-blue-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              <span className="font-['Caveat'] text-3xl text-slate-700">Khush Prajapati</span>
            </div>
          </div>

          <div className="bg-[#EAF5F2] border border-brand-teal/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-[#062F26]">Tenant Signed — Contract Fully Executed — 5 May 2026</span>
            </div>
            <p className="text-xs text-emerald-700 font-bold mb-2 flex items-center gap-1.5"><Icon icon="lucide:pen-tool" className="w-3.5 h-3.5" /> Tenant's Signature</p>
            <div className="w-40 h-16 bg-white border border-brand-teal/20 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              <span className="font-['Caveat'] text-3xl text-[#062F26]">nijal patel</span>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default LawyerContractDetails;
