import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext, useFieldArray } from 'react-hook-form';

const InputField = ({ label, required, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5 flex-1">
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

const PriceField = ({ label, required, error, ...props }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5 flex-1">
    <label className="text-xs sm:text-sm font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative flex items-center">
      <span className="absolute left-3 sm:left-4 text-slate-500 font-medium text-sm sm:text-sm">₹</span>
      <input
        type="number"
        className={`w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
        {...props}
      />
    </div>
    {error && <span className="text-red-500 text-[10px] sm:text-xs">{error}</span>}
  </div>
);

const ALL_FACILITIES = ['Bed', 'Cupboard', 'TV', 'Mattress', 'Attached Washroom', 'Table', 'Wi-Fi', 'Air Cooler'];

const RoomForm = ({ index, remove }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [extraFacInput, setExtraFacInput] = useState('');

  const room = watch(`rooms.${index}`);
  const roomErrors = errors.rooms?.[index] || {};

  const toggleFacility = (fac) => {
    const facilities = room?.facilities || [];
    const updatedFacilities = facilities.includes(fac)
      ? facilities.filter(f => f !== fac)
      : [...facilities, fac];
    setValue(`rooms.${index}.facilities`, updatedFacilities, { shouldValidate: true });
  };

  const handleAddExtraFacility = (e) => {
    e.preventDefault();
    const extraFacs = room?.extraFacilities || [];
    if (extraFacInput.trim() && !extraFacs.includes(extraFacInput.trim())) {
      setValue(`rooms.${index}.extraFacilities`, [...extraFacs, extraFacInput.trim()], { shouldValidate: true });
      setExtraFacInput('');
    }
  };

  const handleRemoveExtraFacility = (facToRemove) => {
    const extraFacs = room?.extraFacilities || [];
    setValue(`rooms.${index}.extraFacilities`, extraFacs.filter(f => f !== facToRemove), { shouldValidate: true });
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/50">
      {/* Remove Button */}
      {index > 0 && (
        <button
          type="button"
          onClick={() => remove(index)}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-md p-1 shadow-sm"
        >
          <Icon icon="lucide:trash-2" width="16" />
        </button>
      )}

      {/* Sharing Type Selector */}
      <div className="mb-4 sm:mb-6">
        <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3 block">Room Categories in your PG / Sharing Type</label>
        <div className="flex flex-wrap sm:flex-nowrap w-full gap-2 sm:gap-3">
          {['Single', 'Double', 'Triple', 'Four', 'Other'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setValue(`rooms.${index}.sharingType`, type, { shouldValidate: true })}
              className={`flex-1 min-w-[30%] sm:min-w-0 py-2 sm:py-2.5 px-2 rounded-lg border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${room?.sharingType === type
                ? 'bg-[#EAF5F2] border-brand-teal text-[#062F26]'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {room?.sharingType === type && <Icon icon="lucide:check" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#062F26]" strokeWidth="2.5" />}
              {type}
            </button>
          ))}
        </div>
      </div>

      <h4 className="text-sm sm:text-sm font-bold text-[#062F26] mb-3 sm:mb-4">Room Details For {room?.sharingType || 'Selected'} Room</h4>

      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <InputField label="Total Beds" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register(`rooms.${index}.totalBeds`)} error={roomErrors.totalBeds?.message} placeholder="Enter total beds" type="number" />
          <InputField label="Available Beds" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register(`rooms.${index}.availableBeds`)} error={roomErrors.availableBeds?.message} placeholder="Enter available beds" type="number" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <PriceField label="Monthly Rent Per Bed" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register(`rooms.${index}.rentPerBed`)} error={roomErrors.rentPerBed?.message} placeholder="Enter Amount" />
          <PriceField label="Security Deposit Per Bed" required onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} {...register(`rooms.${index}.depositPerBed`)} error={roomErrors.depositPerBed?.message} placeholder="Enter Amount" />
        </div>

        {/* Room Facilities */}
        <div>
          <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3 block">Room Facilities</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {ALL_FACILITIES.map(fac => (
              <label key={fac} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${(room?.facilities || []).includes(fac) ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:border-brand-teal/30 hover:bg-slate-50 hover:shadow-sm'
                }`}>
                <span className={`text-xs sm:text-sm font-semibold ${(room?.facilities || []).includes(fac) ? 'text-[#062F26]' : 'text-slate-700'}`}>{fac}</span>
                <input
                  type="checkbox"
                  checked={(room?.facilities || []).includes(fac)}
                  onChange={() => toggleFacility(fac)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal rounded border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Extra Facilities */}
        <div>
          <label className="text-xs sm:text-sm font-bold text-[#062F26] mb-1.5 sm:mb-2 block">Add extra facilities</label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={extraFacInput}
              onChange={(e) => setExtraFacInput(e.target.value)}
              placeholder="e.g. Study table, Balcony access"
              className="flex-1 w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all duration-200 focus:shadow-sm hover:border-slate-300"
            />
            <button type="button" onClick={handleAddExtraFacility} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-brand-teal text-white text-sm sm:text-sm font-bold rounded-lg hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20">
              Add
            </button>
          </div>
          {(room?.extraFacilities?.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {room.extraFacilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-200/50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
                  {fac}
                  <button type="button" onClick={() => handleRemoveExtraFacility(fac)} className="hover:text-red-500 transition-colors">
                    <Icon icon="lucide:x" width="12" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const PgRoomOptions = ({ onNext, onPrev }) => {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms'
  });

  const handleAddRoom = () => {
    append({
      sharingType: 'Single',
      totalBeds: '',
      availableBeds: '',
      rentPerBed: '',
      depositPerBed: '',
      facilities: [],
      extraFacilities: []
    });
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
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Room Options</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Add room categories available in your PG</p>
        </div>
      </div>

      {errors.rooms?.root && <span className="text-red-500 text-sm mb-4">{errors.rooms.root.message}</span>}

      <div className="flex flex-col gap-4 sm:gap-6 flex-1">
        {fields.map((field, index) => (
          <RoomForm
            key={field.id}
            index={index}
            remove={remove}
          />
        ))}

        <button
          type="button"
          onClick={handleAddRoom}
          className="w-full py-4 rounded-xl border-2 border-dashed border-brand-teal/30 text-brand-teal font-bold text-sm hover:bg-[#EAF5F2] hover:border-brand-teal flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] shadow-sm hover:shadow-md"
        >
          <Icon icon="lucide:plus-circle" width="18" />
          Add Another Room Type
        </button>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 text-center"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default PgRoomOptions;
