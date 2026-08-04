import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

const InputField = ({ label, required, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
      {...props}
    />
    {error && <span className="text-red-500 text-[10px] sm:text-xs">{error}</span>}
  </div>
);

const PgPropertyDetails = ({ onNext, onPrev }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const [dragActive, setDragActive] = useState(false);
  const verificationDocs = watch('verificationDocs') || [];
  const existingDocs = watch('existingDocs') || [];
  const removeDocsList = watch('removeDocs') || [];

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

  const removeExistingDoc = (public_id) => {
    setValue('removeDocs', [...removeDocsList, public_id]);
    setValue('existingDocs', existingDocs.filter(doc => doc.public_id !== public_id), { shouldValidate: true });
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth="2.5" />
          </button>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Property Details</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Make sure the address is correct, complete and precise</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 flex-1">

        <h3 className="text-sm sm:text-sm font-bold text-[#062F26]">Enter Your PG Address</h3>

        <InputField
          label="Address"
          required
          {...register('address')}
          error={errors.address?.message}
          placeholder="Enter Your Address"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <InputField label="Area / Locality" required {...register('locality')} error={errors.locality?.message} placeholder="e.g. Navarangpura, Satellite" />
          <InputField label="City" required {...register('city')} error={errors.city?.message} placeholder="e.g. Ahmedabad, Bangalore" />
          <InputField label="State" required {...register('state')} error={errors.state?.message} placeholder="e.g. Gujarat, Maharashtra" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <InputField label="Pincode" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('pincode')} error={errors.pincode?.message} placeholder="380001" />
          <InputField label="Landmark" required {...register('landmark')} error={errors.landmark?.message} placeholder="Enter Your Landmark" />
        </div>

        {/* Google Maps Link */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <label className="text-xs sm:text-sm font-bold text-[#062F26]">
            Google Maps Direct Link <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('mapLink')}
            placeholder="Paste Google Maps Share Link here"
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${errors.mapLink ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
          />
          {errors.mapLink && <span className="text-red-500 text-[10px] sm:text-xs">{errors.mapLink.message}</span>}
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 sm:mt-1 italic">
            Open Google Maps, search your location, click 'Share', and copy the link.
          </p>
        </div>

      </div>

      {/* Verification Documents Section (Mandatory) */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h3 className="text-sm sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3 flex gap-1.5 items-center">
          Verification Documents <span className="text-red-500">*</span>
        </h3>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-relaxed mb-4">
          Upload documents to get a verified badge on your listing. This builds trust with potential tenants.<br />
          Accepted: electricity bill, property tax receipt, ownership deed, or any government-issued property ID proof.
        </p>

        <div
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${errors.verificationDocs ? 'border-red-500 bg-red-50' : (dragActive ? 'border-brand-teal bg-[#EAF5F2] scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:border-brand-teal/50 hover:bg-slate-50/50')
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
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm flex items-center justify-center mb-3 sm:mb-4 transition-colors ${errors.verificationDocs ? 'bg-red-500 text-white' : (dragActive ? 'bg-brand-teal text-white' : 'bg-white text-slate-400')}`}>
            <Icon icon="lucide:shield-check" className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth="2" />
          </div>
          <p className={`text-sm sm:text-sm font-bold mb-1 ${errors.verificationDocs ? 'text-red-600' : 'text-[#062F26]'}`}>Click to upload verification documents</p>
          <p className="text-xs sm:text-xs text-slate-400 font-medium">JPG, PNG, PDF accepted • Max 5 files</p>
          {errors.verificationDocs && <span className="text-red-500 text-[10px] sm:text-xs mt-2 block">{errors.verificationDocs.message || 'Please upload verification documents'}</span>}
        </div>

        {/* Uploaded Files Preview */}
        {(verificationDocs.length > 0 || existingDocs.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Existing Docs */}
            {existingDocs.map((doc, idx) => (
              <div key={doc.public_id || `exist-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-[#EAF5F2]/30 aspect-square shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center p-4 hover:bg-white/50 transition-colors">
                    <Icon icon="lucide:file-check" width="32" className="text-brand-teal mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">Existing Document</span>
                  </a>
                <button
                  type="button"
                  onClick={() => removeExistingDoc(doc.public_id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-red-50 shadow-sm"
                >
                  <Icon icon="lucide:trash-2" width="14" />
                </button>
              </div>
            ))}

            {/* New Uploaded Docs */}
            {verificationDocs.map((doc, idx) => (
              <div key={doc.id || idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-colors">
                    <Icon icon="lucide:file-text" width="32" className="text-brand-teal mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">{doc.label || `Document ${idx + 1}`}</span>
                  </a>
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

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default PgPropertyDetails;
