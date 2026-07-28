import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

import { Step1BuildingStructure } from './PgRoomOptionsStep1';
import { Step2ConfigureFloor } from './PgRoomOptionsStep2';
import { Step3AddBeds } from './PgRoomOptionsStep3';
import { Step4GlobalPricing } from './PgRoomOptionsStep4';
import { Step5BuildingPreview } from './PgRoomOptionsStep5';

const PgRoomOptions = ({ onNext, onPrev }) => {
  const { formState: { errors }, getValues } = useFormContext();
  
  const savedStateStr = sessionStorage.getItem('pgRoomOptionsState');
  const savedState = savedStateStr ? JSON.parse(savedStateStr) : null;

  // Internal Step Management
  const [internalStep, setInternalStep] = useState(savedState?.internalStep || 1);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(savedState?.selectedFloorIndex ?? null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(savedState?.selectedRoomIndex ?? null);

  useEffect(() => {
    sessionStorage.setItem('pgRoomOptionsState', JSON.stringify({
      internalStep,
      selectedFloorIndex,
      selectedRoomIndex
    }));
  }, [internalStep, selectedFloorIndex, selectedRoomIndex]);

  const handleNext = () => {
    const floorsVal = getValues('floors') || [];
    
    if (internalStep === 1) {
      if (floorsVal.length > 0) {
        setSelectedFloorIndex(0);
        setInternalStep(2);
      } else {
        setInternalStep(5);
      }
    } else if (internalStep === 2) {
      setInternalStep(4);
    } else if (internalStep === 3) {
      setInternalStep(2);
    } else if (internalStep === 4) {
      setInternalStep(5);
    } else if (internalStep === 5) {
      onNext();
    }
  };

  const handleBack = () => {
    const floorsVal = getValues('floors') || [];
    
    if (internalStep === 1) {
      onPrev && onPrev();
    } else if (internalStep === 2) {
      setInternalStep(1);
    } else if (internalStep === 3) {
      setInternalStep(2);
    } else if (internalStep === 4) {
      if (floorsVal.length > 0) {
        setSelectedFloorIndex(floorsVal.length - 1);
        setInternalStep(2);
      } else {
        setInternalStep(1);
      }
    } else if (internalStep === 5) {
      setInternalStep(4);
    }
  };

  const handleConfigureFloor = (fIdx) => {
    setInternalStep(2);
  };

  const handleEditRoomBeds = (fIdx, rIdx) => {
    setSelectedFloorIndex(fIdx);
    setSelectedRoomIndex(rIdx);
    setInternalStep(3);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full min-h-[600px]">

      {/* Internal Stepper Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${internalStep === step ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/30 scale-110' : (internalStep > step ? 'bg-[#EAF5F2] text-brand-teal' : 'bg-slate-100 text-slate-400')}`}>
                {internalStep > step ? <Icon icon="lucide:check" width="14" strokeWidth="3" /> : step}
              </div>
              {step < 5 && <div className={`w-4 sm:w-8 h-0.5 mx-1.5 transition-all duration-300 ${internalStep > step ? 'bg-[#EAF5F2]' : 'bg-slate-100'}`}></div>}
            </div>
          ))}
        </div>
        <div className="text-xs font-bold text-slate-400 hidden sm:block">
          Step {internalStep} of 5
        </div>
      </div>

      {errors.floors && <span className="text-red-500 text-sm mb-4 block font-medium p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2"><Icon icon="lucide:alert-circle" /> Please ensure all rooms have valid names and details.</span>}
      {errors.pgPricing && <span className="text-red-500 text-sm mb-4 block font-medium p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2"><Icon icon="lucide:alert-circle" /> Please ensure you have set the pricing for all sharing types in Step 4.</span>}

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {internalStep === 1 && <Step1BuildingStructure onConfigureFloor={handleConfigureFloor} />}
        {internalStep === 2 && <Step2ConfigureFloor onEditRoomBeds={handleEditRoomBeds} onBack={() => setInternalStep(1)} />}
        {internalStep === 3 && <Step3AddBeds floorIndex={selectedFloorIndex} roomIndex={selectedRoomIndex} onBack={() => setInternalStep(2)} />}
        {internalStep === 4 && <Step4GlobalPricing onBack={() => {
          const floorsVal = getValues('floors') || [];
          if (floorsVal.length > 0) {
            setSelectedFloorIndex(floorsVal.length - 1);
            setInternalStep(2);
          } else {
            setInternalStep(1);
          }
        }} />}
        {internalStep === 5 && <Step5BuildingPreview onEditBuilding={() => setInternalStep(1)} />}
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center mt-auto pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm text-center flex items-center gap-2"
        >
          {internalStep === 1 ? 'Back' : <><Icon icon="lucide:arrow-left" width="16" /> Previous</>}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-8 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 text-center flex items-center gap-2"
        >
          {internalStep < 5 ? 'Next Step' : 'Continue'} {internalStep < 5 && <Icon icon="lucide:arrow-right" width="16" />}
        </button>
      </div>

    </div>
  );
};

export default PgRoomOptions;
