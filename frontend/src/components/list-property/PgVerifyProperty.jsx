import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

const PgVerifyProperty = ({ onNext, onPrev, isSubmitting }) => {
  const { watch, setValue } = useFormContext();
  const [dragActive, setDragActive] = useState(false);

  const verificationDocs = watch('verificationDocs') || [];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newDocs = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      label: file.name.split('.')[0].substring(0, 15),
      file: file
    }));
    setValue('verificationDocs', [...verificationDocs, ...newDocs], { shouldValidate: true });
  };

  const removeDoc = (index) => {
    setValue('verificationDocs', verificationDocs.filter((_, i) => i !== index), { shouldValidate: true });
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth="2.5" />
          </button>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Verify Your Property</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium leading-relaxed mt-1 sm:mt-2">
            Upload documents to get a verified badge on your listing. This builds trust with potential tenants.<br />
            <span className="text-slate-400 mt-0.5 sm:mt-1 inline-block">Accepted: electricity bill, property tax receipt, ownership deed, or any government-issued property ID proof.</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6 flex-1">

        {/* Info Box */}
        <div className="bg-[#EAF5F2] border border-brand-teal/20 rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="mt-0.5 text-brand-teal">
            <Icon icon="lucide:shield-check" className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth="2.5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-sm font-bold text-[#062F26] mb-0.5 sm:mb-1">Why verify?</h4>
            <p className="text-xs sm:text-xs font-medium text-slate-600">Verified properties get a green Verified badge on the listing card, increasing visibility and tenant trust.</p>
          </div>
        </div>

        {/* Upload Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3">
            Verification Documents <span className="text-slate-400 font-medium text-xs sm:text-xs">(optional — skip to post without verification)</span>
          </h3>

          <div
            className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${dragActive ? 'border-brand-teal bg-[#EAF5F2] scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:border-brand-teal/50 hover:bg-slate-50/50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm flex items-center justify-center mb-3 sm:mb-4 transition-colors ${dragActive ? 'bg-brand-teal text-white' : 'bg-white text-slate-400'}`}>
              <Icon icon="lucide:shield-check" className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth="2" />
            </div>
            <p className="text-sm sm:text-sm font-bold text-[#062F26] mb-1">Click to upload verification documents</p>
            <p className="text-xs sm:text-xs text-slate-400 font-medium">JPG, PNG, PDF accepted • Max 5 files</p>
          </div>

          {/* Uploaded Files Preview */}
          {verificationDocs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              {verificationDocs.map((doc, idx) => (
                <div key={doc.id || idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <Icon icon="lucide:file-text" width="32" className="text-brand-teal mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">{doc.label || `Document ${idx + 1}`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoc(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-red-50 shadow-sm"
                  >
                    <Icon icon="lucide:trash-2" width="14" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#062F26] hover:-translate-y-0.5 active:scale-95'}`}
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className="animate-spin w-4 h-4" />
              Submitting...
            </>
          ) : (
            'Submit Property'
          )}
        </button>
      </div>

    </div>
  );
};

export default PgVerifyProperty;
