import React from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import { getSharingType } from './PgRoomOptionsUtils';

export const Step3AddBeds = ({ floorIndex, roomIndex, onBack }) => {
  const { watch, setValue } = useFormContext();
  const floors = watch('floors');
  const floor = floors[floorIndex];
  const room = floor?.rooms[roomIndex];

  if (!room) return null;

  const handleBedCountChange = (delta) => {
    const currentBeds = [...(room.beds || [])];
    const newCount = Math.max(1, currentBeds.length + delta); // min 1 bed
    
    if (newCount > currentBeds.length) {
      for(let i = currentBeds.length; i < newCount; i++) {
        currentBeds.push({ bedName: `Bed ${i + 1}`, status: 'Vacant' });
      }
    } else if (newCount < currentBeds.length) {
      currentBeds.pop();
    }
    
    const updatedFloors = [...floors];
    const updatedRooms = [...updatedFloors[floorIndex].rooms];
    updatedRooms[roomIndex] = { 
      ...room, 
      beds: currentBeds,
      sharingType: getSharingType(newCount)
    };
    updatedFloors[floorIndex] = { ...updatedFloors[floorIndex], rooms: updatedRooms };
    setValue('floors', updatedFloors);
  };

  const setBedStatus = (bIdx, status) => {
    const updatedFloors = [...floors];
    const updatedRooms = [...updatedFloors[floorIndex].rooms];
    const updatedBeds = [...updatedRooms[roomIndex].beds];
    
    updatedBeds[bIdx] = { ...updatedBeds[bIdx], status };
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], beds: updatedBeds };
    updatedFloors[floorIndex] = { ...updatedFloors[floorIndex], rooms: updatedRooms };
    
    setValue('floors', updatedFloors);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Occupied': return 'text-red-500 bg-red-50 border-red-200';
      case 'Vacant': return 'text-brand-teal bg-[#EAF5F2] border-brand-teal/30';
      case 'Reserved': return 'text-orange-500 bg-orange-50 border-orange-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button type="button" onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <Icon icon="lucide:arrow-left" width="20" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-[#062F26]">{room.roomName} - {room.sharingType}</h3>
          <p className="text-xs text-slate-500 font-medium">{floor.floorName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#062F26]">Number of Beds</label>
        <div className="flex items-center gap-4 border border-slate-200 rounded-lg p-1 bg-white w-32">
          <button type="button" onClick={() => handleBedCountChange(-1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"><Icon icon="lucide:minus" /></button>
          <span className="flex-1 text-center font-bold text-[#062F26]">{room.beds?.length || 0}</span>
          <button type="button" onClick={() => handleBedCountChange(1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"><Icon icon="lucide:plus" /></button>
        </div>
        <span className="text-xs text-slate-400 mt-1">{room.beds?.length || 0} beds will be created automatically.</span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-[#062F26] mb-3">Beds</h4>
        <div className="flex flex-col gap-3">
          {room.beds?.map((bed, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#EAF5F2] flex items-center justify-center text-brand-teal">
                  <Icon icon="lucide:bed" width="16" />
                </div>
                <span className="font-bold text-sm text-[#062F26]">{bed.bedName}</span>
              </div>
              <select
                value={bed.status}
                onChange={(e) => setBedStatus(idx, e.target.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-md border appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all ${getStatusColor(bed.status)}`}
                style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={() => handleBedCountChange(1)} className="w-full py-3 border border-slate-200 border-dashed rounded-lg text-sm font-bold text-slate-500 hover:text-brand-teal hover:bg-[#EAF5F2] hover:border-brand-teal/50 transition-all flex items-center justify-center gap-2 mt-2">
            <Icon icon="lucide:plus" /> Add Bed
          </button>
        </div>
      </div>
    </div>
  );
};
