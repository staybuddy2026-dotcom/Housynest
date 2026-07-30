import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import CustomDropdown from './CustomDropdown';

const InputField = ({ label, required, subtitle, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {subtitle && <p className="text-xs sm:text-xs text-slate-500 mb-1">{subtitle}</p>}
    <input
      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
      {...props}
    />
    {error && <span className="text-red-500 text-[10px] sm:text-xs mt-1">{error}</span>}
  </div>
);

const ButtonGroup = ({ label, required, options, value, onChange, error }) => (
  <div className="flex flex-col gap-2 sm:gap-2.5">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 sm:px-7 py-2 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center min-w-17.5 sm:min-w-20 ${value === opt
            ? 'bg-[#EAF5F2] border-brand-teal text-[#062F26] shadow-sm'
            : 'bg-white border-slate-200 text-[#062F26] hover:border-brand-teal/30 hover:bg-slate-50'
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
    {error && <span className="text-red-500 text-[10px] sm:text-xs">{error}</span>}
  </div>
);

const TenantPropertyDetails = ({ onNext, onPrev }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const numberOfVillas = watch('numberOfVillas');
  const bhkType = watch('bhkType');
  const bathrooms = watch('bathrooms');
  const balconies = watch('balconies');
  const furnishingStatus = watch('furnishingStatus');

  const propertyCategory = watch('propertyCategory');

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

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

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">

        {/* Address Fields */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <InputField label="Address" required {...register('address')} error={errors.address?.message} placeholder="Enter Your Address" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <InputField label="Area / Locality" required {...register('locality')} error={errors.locality?.message} placeholder="e.g. Navarangpura, Satellite" />
            <InputField label="City" required {...register('city')} error={errors.city?.message} placeholder="e.g. Ahmedabad, Bangalore" />
            <InputField label="State" required {...register('state')} error={errors.state?.message} placeholder="e.g. Gujarat, Maharashtra" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <InputField label="Pincode" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('pincode')} error={errors.pincode?.message} placeholder="380001" />
            <InputField label="Landmark" required {...register('landmark')} error={errors.landmark?.message} placeholder="Enter Your Landmark" />
          </div>
        </div>

        {/* Google Map Link */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <label className="text-xs sm:text-sm font-bold text-[#062F26]">
            Google Maps Direct Link (Optional)
          </label>
          <input
            type="text"
            {...register('mapLink')}
            placeholder="Paste Google Maps Share Link here"
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${errors.mapLink ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
          />
          {errors.mapLink && <span className="text-red-500 text-[10px] sm:text-xs">{errors.mapLink.message}</span>}
          <p className="text-[10px] text-slate-400 font-medium mt-1 italic">
            Open Google Maps, search your location, click 'Share', and copy the link.
          </p>
        </div>


        {/* Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <CustomDropdown
            label="No. of Villas in project/Society"
            options={['<50', '50-100', '>100']}
            value={numberOfVillas}
            onChange={val => handleUpdate('numberOfVillas', val)}
            error={errors.numberOfVillas?.message}
          />
          <CustomDropdown
            label="BHK (Bedrooms, Hall, Kitchen)" required
            options={['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK']}
            value={bhkType}
            onChange={val => handleUpdate('bhkType', val)}
            error={errors.bhkType?.message}
            placeholder="Select BHK"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <CustomDropdown
            label="Bathroom"
            options={['All', '1+', '2+', '3+', '4+']}
            value={bathrooms}
            onChange={val => handleUpdate('bathrooms', val)}
            error={errors.bathrooms?.message}
          />
          <CustomDropdown
            label="Balcony(Optional)"
            options={['All', '1+', '2+', '3+', '4+']}
            value={balconies}
            onChange={val => handleUpdate('balconies', val)}
            error={errors.balconies?.message}
          />
          <CustomDropdown
            label="Furnishing"
            options={['Unfurnished', 'Semi-Furnished', 'Fully-Furnished']}
            value={furnishingStatus}
            onChange={val => handleUpdate('furnishingStatus', val)}
            error={errors.furnishingStatus?.message}
          />
        </div>


        {/* Floors (Only for Flat) */}
        {propertyCategory === 'Flat' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField label="Total Floors" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('totalFloors')} error={errors.totalFloors?.message} placeholder="e.g. 10" />
            <InputField label="Property on Floor" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('propertyOnFloor')} error={errors.propertyOnFloor?.message} placeholder="e.g. 4" />
          </div>
        )}

        {/* Area */}
        <div>
          <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3 block">Area (sq.ft)</label>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField label="Built-up Area" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('builtUpArea')} error={errors.builtUpArea?.message} placeholder="e.g. 1200" />
            <InputField label="Carpet Area" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('carpetArea')} error={errors.carpetArea?.message} placeholder="e.g. 900" />
          </div>
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

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 sm:py-3.5 rounded-xl bg-brand-teal text-white font-bold text-sm sm:text-[15px] hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 text-center"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default TenantPropertyDetails;
