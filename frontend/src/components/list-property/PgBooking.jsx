import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext, Controller } from 'react-hook-form';
import CustomDropdown from './CustomDropdown';

const PgBooking = ({ onNext, onPrev }) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext();

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
