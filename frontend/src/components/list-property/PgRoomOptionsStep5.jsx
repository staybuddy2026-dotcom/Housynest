import React from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

export const Step5BuildingPreview = ({ onEditBuilding }) => {
  const { watch } = useFormContext();
  const buildingName = watch('buildingName') || 'My Building';
  const floors = watch('floors') || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold text-[#062F26]">Building Preview</h3>
        <p className="text-xs text-slate-500 font-medium">Review your building structure before continuing</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm shadow-inner">
        <div className="flex items-center gap-2 text-[#062F26] font-bold mb-3">
          <Icon icon="lucide:building-2" className="text-brand-teal w-5 h-5" />
          {buildingName}
        </div>
        
        <div className="ml-5 flex flex-col gap-3 relative border-l-2 border-slate-200 pl-4">
          {floors.map((floor, fIdx) => (
            <div key={fIdx}>
              <div className="flex items-center gap-2 font-bold text-slate-700 relative -left-4 py-1">
                <span className="w-4 h-0.5 bg-slate-200 absolute left-0 top-1/2"></span>
                <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-slate-400 ml-4 bg-slate-50 relative z-10" />
                <span className="relative z-10">{floor.floorName}</span>
              </div>
              
              <div className="ml-5 flex flex-col gap-1 border-l-2 border-slate-100 pl-4 py-1 mt-1">
                {(floor.rooms || []).length === 0 ? (
                  <div className="text-slate-400 text-xs italic relative -left-4">
                    <span className="w-4 h-px bg-slate-100 absolute left-0 top-1/2"></span>
                    <span className="ml-4 bg-slate-50 px-1 relative z-10">No rooms configured</span>
                  </div>
                ) : (
                  floor.rooms.map((room, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 text-slate-600 text-xs relative -left-4 group hover:bg-slate-100/50 rounded py-0.5 transition-colors">
                      <span className="w-4 h-px bg-slate-100 absolute left-0 top-1/2"></span>
                      <Icon icon="lucide:door-closed" className="w-3.5 h-3.5 text-brand-teal ml-4 bg-slate-50 group-hover:bg-transparent relative z-10" />
                      <span className="relative z-10 font-medium">{room.roomName} <span className="text-slate-400 ml-1">({room.beds?.length || 0} Beds)</span></span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button type="button" onClick={onEditBuilding} className="text-sm font-bold text-brand-teal hover:underline hover:text-[#062F26] transition-colors text-left flex items-center gap-1.5 w-fit">
        <Icon icon="lucide:pencil" width="14" />
        Make changes to building structure
      </button>
    </div>
  );
};
