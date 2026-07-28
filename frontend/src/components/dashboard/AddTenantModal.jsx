import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';

const AddTenantModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState([{ id: 1, name: '', file: null }]);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const addDocument = () => {
    setDocuments([...documents, { id: Date.now(), name: '', file: null }]);
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const steps = [
    { id: 1, name: 'Personal', icon: 'lucide:user' },
    { id: 2, name: 'Stay & Financials', icon: 'lucide:bed' },
    { id: 3, name: 'Documents', icon: 'lucide:file-text' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-[#062F26]">Add Tenant</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <ReactLenis
          className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30"
          options={{ smoothTouch: true }}
        >
          <div className="p-5">
          
          {/* Step Indicator */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="flex items-center gap-4 sm:gap-12 relative">
              {/* Connecting line behind steps */}
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-200 -z-10 mx-8"></div>
              
              {steps.map((s, index) => (
                <div key={s.id} className="flex flex-col items-center gap-2 relative z-0">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-sm transition-colors duration-300 ${
                      step === s.id 
                        ? 'bg-[#062F26] text-white' 
                        : step > s.id 
                          ? 'bg-brand-teal text-white' 
                          : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {step > s.id ? (
                      <Icon icon="lucide:check" className="w-5 h-5" />
                    ) : (
                      <Icon icon={s.icon} className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs sm:text-[13px] font-bold ${
                    step === s.id ? 'text-[#062F26]' : step > s.id ? 'text-brand-teal' : 'text-slate-400'
                  }`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            
            {/* Step 1: Personal */}
            {step === 1 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
                    <input type="text" placeholder="John" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
                    <div className="relative">
                      <select className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium appearance-none bg-white text-slate-600">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <Icon icon="lucide:chevron-down" className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone</label>
                    <div className="flex gap-2">
                      <div className="relative w-24">
                        <select className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium appearance-none bg-white text-slate-600">
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                        </select>
                        <Icon icon="lucide:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative flex-1">
                        <Icon icon="lucide:phone" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="tel" placeholder="0000000000" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Icon icon="lucide:mail" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" placeholder="john.doe@email.com" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Student or Working Professional?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 group-hover:border-brand-teal flex items-center justify-center transition-colors">
                        <div className="w-2.5 h-2.5 bg-brand-teal rounded-full opacity-100"></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Student</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 group-hover:border-brand-teal flex items-center justify-center transition-colors">
                        {/* Not selected */}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Working Professional</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Emergency Contact</label>
                    <input type="text" placeholder="Alex Paul" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Emergency Contact Phone</label>
                    <div className="flex gap-2">
                      <div className="relative w-24">
                        <select className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium appearance-none bg-white text-slate-600">
                          <option value="+91">+91</option>
                        </select>
                        <Icon icon="lucide:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative flex-1">
                        <Icon icon="lucide:phone" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="tel" placeholder="0000000000" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Stay & Financials */}
            {step === 2 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Property</label>
                    <div className="relative">
                      <select className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium appearance-none bg-white text-slate-600">
                        <option value="">Sunshine PG</option>
                      </select>
                      <Icon icon="lucide:chevron-down" className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Room</label>
                    <input type="text" placeholder="Master Bedroom" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-brand-teal focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Bed</label>
                    <input type="text" placeholder="Bed 2" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Monthly Rent</label>
                    <div className="relative">
                      <Icon icon="lucide:indian-rupee" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="15,000" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Security Deposit</label>
                    <div className="relative">
                      <Icon icon="lucide:indian-rupee" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="20,000" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Move-in Date</label>
                    <div className="relative">
                      <Icon icon="lucide:calendar" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium text-slate-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Move-out Date</label>
                    <div className="relative">
                      <Icon icon="lucide:calendar" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#062F26]">Documents</h3>
                  <button 
                    onClick={addDocument}
                    className="flex items-center gap-1.5 text-brand-teal hover:text-brand-teal/80 font-bold text-sm transition-colors"
                  >
                    <Icon icon="lucide:plus" className="w-4 h-4" />
                    Add Document
                  </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 pb-2 border-b border-slate-100 px-3">
                  <div className="col-span-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name</div>
                  <div className="col-span-6 text-xs font-bold text-slate-400 uppercase tracking-wider">File</div>
                  <div className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</div>
                </div>

                {/* Document Rows */}
                <div className="space-y-3 pt-1">
                  {documents.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="col-span-5">
                        <input 
                          type="text" 
                          placeholder="e.g. Aadhaar" 
                          className="w-full px-3 py-2 text-sm rounded-md border border-brand-teal focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all font-medium bg-white" 
                        />
                      </div>
                      <div className="col-span-6">
                        <button className="w-full py-2 border border-dashed border-brand-teal/50 text-brand-teal bg-brand-teal/5 hover:bg-brand-teal/10 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2">
                          <Icon icon="lucide:upload-cloud" className="w-4 h-4" />
                          Click to Upload
                        </button>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={() => removeDocument(doc.id)}
                          className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {documents.length === 0 && (
                  <div className="text-center py-6 text-slate-400">
                    <Icon icon="lucide:file-text" className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-medium">No documents added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </ReactLenis>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button 
                onClick={handlePrev}
                className="px-5 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex gap-2.5">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={step === 3 ? onClose : handleNext}
              className="px-5 py-2.5 bg-[#062F26] text-white hover:bg-brand-teal rounded-lg font-bold transition-colors shadow-sm text-sm"
            >
              {step === 3 ? 'Save' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTenantModal;
