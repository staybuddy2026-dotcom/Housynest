import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext, Controller } from 'react-hook-form';
import CustomDropdown from './CustomDropdown';

const PgBooking = ({ onNext, onPrev }) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext();

  const bookingType = watch('bookingType');

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      {/* Header section with back button */}
      <div className="mb-6 flex items-start gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-1 w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Icon icon="lucide:arrow-left" className="w-4.5 h-4.5" strokeWidth="2.5" />
          </button>
        )}
        
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-[#EAF5F2] flex items-center justify-center text-brand-teal shadow-sm">
            <Icon icon="lucide:calendar-clock" className="w-6 h-6" strokeWidth="2.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#062F26] mb-1">Booking Configuration</h2>
            <p className="text-sm text-slate-500 font-medium">Set up your rental and booking rules</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-8">

        {/* Top Dropdowns */}
        <div className="flex flex-col gap-6">
          <Controller
            name="paymentModel"
            control={control}
            rules={{ required: 'Please select a payment model' }}
            render={({ field }) => (
              <CustomDropdown
                label="Payment Model"
                required
                subtitle="Choose how often tenants will pay rent"
                options={['Monthly', 'Quarterly', 'Half-Yearly', 'Annually']}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                error={errors.paymentModel?.message}
              />
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
            <div className="flex-1 min-w-0">
              <Controller
                name="rentalPeriod"
                control={control}
                rules={{ required: 'Please select a rental period' }}
                render={({ field }) => (
                  <CustomDropdown
                    label="Rental Period (Months)"
                    required
                    subtitle="Minimum lock-in period"
                    options={['1 Month', '3 Months', '6 Months', '11 Months', '12 Months']}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.rentalPeriod?.message}
                  />
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <Controller
                name="noticePeriod"
                control={control}
                rules={{ required: 'Please select a notice period' }}
                render={({ field }) => (
                  <CustomDropdown
                    label="Notice Period (Days)"
                    required
                    subtitle="Advance notice required"
                    options={['15 Days', '30 Days (1 month)', '45 Days', '60 Days (2 months)']}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.noticePeriod?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Configuration</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Booking Type */}
        <div>
          <label className="text-sm font-bold text-[#062F26] mb-3 block">Booking Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <label className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${bookingType === 'Request-Based' ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-100 bg-white hover:border-brand-teal/30 hover:shadow-sm'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${bookingType === 'Request-Based' ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon icon="lucide:clock" className="w-5 h-5" strokeWidth="2.5" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-1 ${bookingType === 'Request-Based' ? 'text-[#062F26]' : 'text-slate-700'}`}>Request-Based</h4>
                  <p className={`text-[12px] leading-relaxed ${bookingType === 'Request-Based' ? 'text-[#062F26]/70 font-medium' : 'text-slate-500'}`}>
                    Tenants send booking requests that you can approve or reject
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${bookingType === 'Request-Based' ? 'bg-brand-teal text-white' : 'border-2 border-slate-200'}`}>
                    {bookingType === 'Request-Based' && <Icon icon="lucide:check" className="w-3.5 h-3.5" strokeWidth="3" />}
                  </div>
                </div>
              </div>
              <input type="radio" name="bookingType" value="Request-Based" className="hidden" checked={bookingType === 'Request-Based'} onChange={() => setValue('bookingType', 'Request-Based', { shouldValidate: true })} />
            </label>

            <label className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${bookingType === 'Direct Booking' ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-100 bg-white hover:border-brand-teal/30 hover:shadow-sm'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${bookingType === 'Direct Booking' ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon icon="lucide:check-circle" className="w-5 h-5" strokeWidth="2.5" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-1 ${bookingType === 'Direct Booking' ? 'text-[#062F26]' : 'text-slate-700'}`}>Direct Booking</h4>
                  <p className={`text-[12px] leading-relaxed ${bookingType === 'Direct Booking' ? 'text-[#062F26]/70 font-medium' : 'text-slate-500'}`}>
                    Tenants can book instantly without approval
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${bookingType === 'Direct Booking' ? 'bg-brand-teal text-white' : 'border-2 border-slate-200'}`}>
                    {bookingType === 'Direct Booking' && <Icon icon="lucide:check" className="w-3.5 h-3.5" strokeWidth="3" />}
                  </div>
                </div>
              </div>
              <input type="radio" name="bookingType" value="Direct Booking" className="hidden" checked={bookingType === 'Direct Booking'} onChange={() => setValue('bookingType', 'Direct Booking', { shouldValidate: true })} />
            </label>

          </div>
          {errors.bookingType && <span className="text-red-500 text-[10px] sm:text-xs mt-2 block">{errors.bookingType.message}</span>}
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-8 pt-6 border-t border-slate-100">
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

export default PgBooking;
