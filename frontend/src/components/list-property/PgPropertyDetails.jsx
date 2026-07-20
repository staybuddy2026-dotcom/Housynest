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
  const [newPlace, setNewPlace] = useState('');
  const [newDistance, setNewDistance] = useState('');

  const nearbyPlaces = watch('nearbyPlaces') || [];

  const handleAddNearby = (e) => {
    e.preventDefault();
    if (newPlace.trim() && newDistance.trim()) {
      setValue('nearbyPlaces', [...nearbyPlaces, { place: newPlace.trim(), distance: newDistance.trim() }], { shouldValidate: true });
      setNewPlace('');
      setNewDistance('');
    }
  };

  const handleRemoveNearby = (index) => {
    setValue('nearbyPlaces', nearbyPlaces.filter((_, i) => i !== index), { shouldValidate: true });
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <InputField label="Area / Locality" required {...register('locality')} error={errors.locality?.message} placeholder="e.g. Navarangpura, Satellite" />
          <InputField label="State" required {...register('state')} error={errors.state?.message} placeholder="e.g. Gujarat, Maharashtra" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <InputField label="Pincode" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register('pincode')} error={errors.pincode?.message} placeholder="380001" />
          <InputField label="Landmark" required {...register('landmark')} error={errors.landmark?.message} placeholder="Enter Your Landmark" />
        </div>

        {/* Google Maps Link */}
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
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 sm:mt-1 italic">
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
              <div className="w-25 sm:w-30">
                <input
                  type="text"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  placeholder="e.g. 500m"
                  className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300"
                />
              </div>
            </div>
            <button type="button" onClick={handleAddNearby} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-brand-teal text-white text-sm sm:text-sm font-bold rounded-lg hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20">
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
                  <button type="button" onClick={() => handleRemoveNearby(idx)} className="text-slate-400 hover:text-red-500 transition-colors ml-1">
                    <Icon icon="lucide:x" width="14" />
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
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default PgPropertyDetails;
