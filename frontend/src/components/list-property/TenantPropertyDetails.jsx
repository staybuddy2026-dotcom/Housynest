import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

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
          className={`px-4 sm:px-7 py-2 sm:py-3 rounded-[12px] border text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center min-w-[70px] sm:min-w-[80px] ${value === opt
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
  const [newPlace, setNewPlace] = useState('');
  const [newDistance, setNewDistance] = useState('');

  const nearbyPlaces = watch('nearbyPlaces') || [];
  const numberOfVillas = watch('numberOfVillas');
  const bhkType = watch('bhkType');
  const bathrooms = watch('bathrooms');
  const balconies = watch('balconies');
  const furnishingStatus = watch('furnishingStatus');
  const ageOfProperty = watch('ageOfProperty');
  const propertyCategory = watch('propertyCategory');

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const handleAddPlace = (e) => {
    e.preventDefault();
    if (newPlace.trim() && newDistance.trim()) {
      setValue('nearbyPlaces', [...nearbyPlaces, { place: newPlace.trim(), distance: newDistance.trim() }], { shouldValidate: true });
      setNewPlace('');
      setNewDistance('');
    }
  };

  const handleRemovePlace = (index) => {
    setValue('nearbyPlaces', nearbyPlaces.filter((_, i) => i !== index), { shouldValidate: true });
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
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Property Details</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Make sure the address is correct, complete and precise</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">

        {/* Address Fields */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <InputField label="Address" required {...register('address')} error={errors.address?.message} placeholder="Enter Your Address" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <InputField label="Area / Locality" required {...register('locality')} error={errors.locality?.message} placeholder="e.g. Navarangpura, Satellite" />
            <InputField label="State" required {...register('state')} error={errors.state?.message} placeholder="e.g. Gujarat, Maharashtra" />
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

        {/* Nearby Places */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <label className="text-xs sm:text-sm font-bold text-[#062F26]">Nearby Places</label>
          <p className="text-[10px] text-slate-400 -mt-1.5 sm:-mt-2">Type a place and distance, press Add</p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-start">
            <div className="flex-1 flex gap-2 sm:gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  placeholder="e.g. Metro Station"
                  className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300"
                />
              </div>
              <div className="w-[100px] sm:w-[120px]">
                <input
                  type="text"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  placeholder="e.g. 500m"
                  className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300"
                />
              </div>
            </div>
            <button type="button" onClick={handleAddPlace} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-brand-teal text-white text-sm sm:text-sm font-bold rounded-lg hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20">
              Add
            </button>
          </div>

          {/* List of Nearby Places */}
          {nearbyPlaces?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {nearbyPlaces.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600">
                  <span>{item.place}</span>
                  <span className="text-brand-teal">{item.distance}</span>
                  <button type="button" onClick={() => handleRemovePlace(idx)} className="text-slate-400 hover:text-red-500 transition-colors ml-1">
                    <Icon icon="lucide:x" width="14" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <ButtonGroup
          label="No. of Villas in project/Society"
          options={['<50', '50-100', '>100']}
          value={numberOfVillas}
          onChange={val => handleUpdate('numberOfVillas', val)}
          error={errors.numberOfVillas?.message}
        />

        <ButtonGroup
          label="BHK (Bedrooms, Hall, Kitchen)" required
          options={['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK']}
          value={bhkType}
          onChange={val => handleUpdate('bhkType', val)}
          error={errors.bhkType?.message}
        />

        <ButtonGroup
          label="Bathroom"
          options={['All', '1+', '2+', '3+', '4+']}
          value={bathrooms}
          onChange={val => handleUpdate('bathrooms', val)}
          error={errors.bathrooms?.message}
        />

        <ButtonGroup
          label="Balcony(Optional)"
          options={['All', '1+', '2+', '3+', '4+']}
          value={balconies}
          onChange={val => handleUpdate('balconies', val)}
          error={errors.balconies?.message}
        />

        <ButtonGroup
          label="Furnishing"
          options={['Unfurnished', 'Semi-Furnished', 'Fully-Furnished']}
          value={furnishingStatus}
          onChange={val => handleUpdate('furnishingStatus', val)}
          error={errors.furnishingStatus?.message}
        />

        <ButtonGroup
          label="Age of Property"
          options={['0-1 Years', '1-5 Years', '5-10 Years', '10+ Years']}
          value={ageOfProperty}
          onChange={val => handleUpdate('ageOfProperty', val)}
          error={errors.ageOfProperty?.message}
        />

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
