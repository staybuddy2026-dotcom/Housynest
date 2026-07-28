import React from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

export const Step1BuildingStructure = ({ onConfigureFloor }) => {
  const { register, watch, setValue, getValues } = useFormContext();
  const floors = watch('floors') || [];
  const totalFloors = watch('totalFloorsCount') || 0;

  const handleFloorChange = (delta) => {
    let newCount = Math.max(0, Number(totalFloors) + delta);
    setValue('totalFloorsCount', newCount);
    
    // adjust floors array
    let currentFloors = [...(getValues('floors') || [])];
    if (newCount > currentFloors.length) {
      // add missing
      for(let i = currentFloors.length; i < newCount; i++) {
        currentFloors.push({
          floorName: i === 0 ? 'Ground Floor' : `Floor ${i}`,
          rooms: []
        });
      }
    } else if (newCount < currentFloors.length) {
      // remove extra
      currentFloors = currentFloors.slice(0, newCount);
    }
    setValue('floors', currentFloors);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold text-[#062F26] mb-1">Building Structure</h3>
        <p className="text-xs text-slate-500 font-medium mb-4">Add floors in your building</p>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-bold text-[#062F26]">Total Floors</label>
            <div className="flex items-center gap-4 w-32 border border-slate-200 rounded-lg p-1 bg-white">
              <button type="button" onClick={() => handleFloorChange(-1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100"><Icon icon="lucide:minus" /></button>
              <span className="flex-1 text-center font-bold text-[#062F26]">{totalFloors}</span>
              <button type="button" onClick={() => handleFloorChange(1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100"><Icon icon="lucide:plus" /></button>
            </div>
          </div>
        </div>
      </div>

      {floors.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[#062F26] mb-3">Floors</h4>
          <div className="flex flex-col gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            {floors.map((floor, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-xs">
                    {idx === 0 ? 'GF' : idx}
                  </div>
                  <span className="font-bold text-sm text-[#062F26]">{floor.floorName}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => onConfigureFloor(idx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-teal bg-brand-teal/5 rounded-md hover:bg-brand-teal hover:text-white transition-colors"
                >
                  <Icon icon="lucide:hammer" /> Configure
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => handleFloorChange(1)}
              className="w-full py-3 mt-2 text-xs font-bold text-slate-500 hover:text-brand-teal flex items-center justify-center gap-2"
            >
              <Icon icon="lucide:plus" /> Add More Floors
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
