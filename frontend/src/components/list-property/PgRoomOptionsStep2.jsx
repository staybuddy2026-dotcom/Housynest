import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';
import { useLenis } from 'lenis/react';
import { getSharingType, ALL_FACILITIES } from './PgRoomOptionsUtils';

export const Step2ConfigureFloor = ({ onEditRoomBeds, onBack }) => {
  const { watch, setValue } = useFormContext();
  const floors = watch('floors') || [];
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFloorIndex, setEditingFloorIndex] = useState(null);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  
  const [roomFormData, setRoomFormData] = useState({
    roomName: '',
    sharingType: 'Single',
    totalBeds: 1,
    isAC: false,
    facilities: [],
    extraFacilities: []
  });

  const lenis = useLenis();

  useEffect(() => {
    if (isEditModalOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = 'unset';
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen, lenis]);

  if (floors.length === 0) return null;

  const handleRoomCountChange = (fIndex, delta) => {
    const floor = floors[fIndex];
    const currentRooms = [...(floor.rooms || [])];
    const newCount = Math.max(0, currentRooms.length + delta);
    
    if (newCount > currentRooms.length) {
      for(let i = currentRooms.length; i < newCount; i++) {
        currentRooms.push({
          roomName: `Room ${fIndex + 1}0${i + 1}`,
          sharingType: 'Single',
          isAC: false,
          facilities: [],
          extraFacilities: [],
          beds: [{ bedName: 'Bed 1', status: 'Vacant' }]
        });
      }
    } else if (newCount < currentRooms.length) {
      currentRooms.pop(); // remove last
    }
    
    const updatedFloors = [...floors];
    updatedFloors[fIndex] = { ...floor, rooms: currentRooms };
    setValue('floors', updatedFloors);
  };

  const openAddRoom = (fIndex) => {
    const floor = floors[fIndex];
    setRoomFormData({
      roomName: `Room ${fIndex + 1}0${(floor.rooms?.length || 0) + 1}`,
      sharingType: 'Single',
      totalBeds: 1,
      isAC: false,
      facilities: [],
      extraFacilities: []
    });
    setEditingFloorIndex(fIndex);
    setEditingRoomIndex(null);
    setIsEditModalOpen(true);
  };

  const openEditRoom = (fIndex, rIndex) => {
    const floor = floors[fIndex];
    const r = floor.rooms[rIndex];
    setRoomFormData({
      roomName: r.roomName,
      sharingType: r.sharingType,
      totalBeds: r.beds?.length || 1,
      isAC: r.isAC || false,
      facilities: r.facilities || [],
      extraFacilities: r.extraFacilities || []
    });
    setEditingFloorIndex(fIndex);
    setEditingRoomIndex(rIndex);
    setIsEditModalOpen(true);
  };

  const saveRoomForm = () => {
    const updatedFloors = [...floors];
    const floor = floors[editingFloorIndex];
    const currentRooms = [...(floor.rooms || [])];
    
    let beds = [];
    if (editingRoomIndex !== null && currentRooms[editingRoomIndex]?.beds) {
      beds = [...currentRooms[editingRoomIndex].beds];
      if (roomFormData.totalBeds > beds.length) {
        for(let i=beds.length; i<roomFormData.totalBeds; i++) {
          beds.push({ bedName: `Bed ${i + 1}`, status: 'Vacant' });
        }
      } else {
        beds = beds.slice(0, roomFormData.totalBeds);
      }
    } else {
      for(let i=0; i<roomFormData.totalBeds; i++) {
        beds.push({ bedName: `Bed ${i + 1}`, status: 'Vacant' });
      }
    }

    const roomToSave = {
      ...roomFormData,
      beds,
      sharingType: getSharingType(roomFormData.totalBeds)
    };
    delete roomToSave.totalBeds; 

    if (editingRoomIndex !== null) {
      currentRooms[editingRoomIndex] = roomToSave;
    } else {
      currentRooms.push(roomToSave);
    }
    
    updatedFloors[editingFloorIndex] = { ...floor, rooms: currentRooms };
    setValue('floors', updatedFloors);
    setIsEditModalOpen(false);
  };

  const deleteRoom = (fIndex, rIndex) => {
    const updatedFloors = [...floors];
    const floor = floors[fIndex];
    const currentRooms = [...(floor.rooms || [])];
    currentRooms.splice(rIndex, 1);
    updatedFloors[fIndex] = { ...floor, rooms: currentRooms };
    setValue('floors', updatedFloors);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button type="button" onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
          <Icon icon="lucide:arrow-left" width="20" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-[#062F26]">Rooms Configuration</h3>
          <p className="text-xs text-slate-500 font-medium">Add and configure rooms for all floors</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {floors.map((floor, fIndex) => (
          <div key={fIndex} className="flex flex-col gap-4 border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="font-bold text-sm text-[#062F26]">Total Rooms on {floor.floorName}</span>
              <div className="flex items-center gap-4 border border-slate-200 rounded-lg p-1 bg-white shadow-sm">
                <button type="button" onClick={() => handleRoomCountChange(fIndex, -1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100"><Icon icon="lucide:minus" /></button>
                <span className="w-6 text-center font-bold text-[#062F26]">{floor.rooms?.length || 0}</span>
                <button type="button" onClick={() => handleRoomCountChange(fIndex, 1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100"><Icon icon="lucide:plus" /></button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#062F26]">Rooms on {floor.floorName}</h4>
                <button type="button" onClick={() => openAddRoom(fIndex)} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-teal rounded-md hover:bg-[#062F26] flex items-center gap-1.5 shadow-sm shadow-brand-teal/30 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95">
                  <Icon icon="lucide:plus" /> Add Room
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {(!floor.rooms || floor.rooms.length === 0) ? (
                  <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
                    <span className="text-slate-400 text-sm font-medium">No rooms added yet on this floor.</span>
                  </div>
                ) : (
                  floor.rooms.map((room, rIndex) => (
                    <div key={rIndex} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <span className="font-bold text-sm min-w-20 text-[#062F26]">{room.roomName}</span>
                        <span className="text-xs text-slate-500 min-w-16">{getSharingType(room.beds?.length || 0)}</span>
                        <span className="text-xs text-slate-500 min-w-12">{room.beds?.length || 0} Beds</span>
                        <div className="flex flex-wrap items-center gap-1.5 ml-2 lg:ml-6 flex-1">
                          {room.isAC && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap bg-[#EAF5F2] text-brand-teal border border-brand-teal/20 flex items-center gap-1">
                              <Icon icon="lucide:snowflake" className="w-3 h-3" /> AC
                            </span>
                          )}
                          {(() => {
                            const displayFacs = (room.facilities || []).filter(f => f !== 'AC');
                            return (
                              <>
                                {displayFacs.slice(0, 3).map((fac, i) => (
                                  <span key={i} className="px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
                                    {fac}
                                  </span>
                                ))}
                                {displayFacs.length > 3 && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full">
                                    +{displayFacs.length - 3} more
                                  </span>
                                )}
                                {!room.isAC && displayFacs.length === 0 && (
                                  <span className="text-[10px] text-slate-400 font-medium italic hidden sm:block">No amenities added</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onEditRoomBeds(fIndex, rIndex)} className="px-3 py-1.5 text-xs font-bold text-brand-teal bg-brand-teal/5 border border-brand-teal/20 rounded-md hover:bg-brand-teal hover:text-white transition-colors">
                          Configure Beds
                        </button>
                        <button type="button" onClick={() => openEditRoom(fIndex, rIndex)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                          Edit Details
                        </button>
                        <button type="button" onClick={() => deleteRoom(fIndex, rIndex)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                          <Icon icon="lucide:trash-2" width="16" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Room Modal overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-[#062F26]">{editingRoomIndex !== null ? 'Edit Room' : 'Add Room'}</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition-colors shadow-sm">
                <Icon icon="lucide:x" width="20" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#062F26] mb-1.5 block">Room Name</label>
                  <input type="text" value={roomFormData.roomName} onChange={e => setRoomFormData({...roomFormData, roomName: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#062F26] mb-1.5 block">Number of Beds</label>
                  <div className="flex items-center gap-4 border border-slate-200 rounded-lg p-1 bg-white">
                    <button type="button" onClick={() => setRoomFormData(p => {
                      const newBeds = Math.max(1, p.totalBeds - 1);
                      return { ...p, totalBeds: newBeds, sharingType: getSharingType(newBeds) };
                    })} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"><Icon icon="lucide:minus" /></button>
                    <span className="flex-1 text-center font-bold text-[#062F26]">{roomFormData.totalBeds}</span>
                    <button type="button" onClick={() => setRoomFormData(p => {
                      const newBeds = p.totalBeds + 1;
                      return { ...p, totalBeds: newBeds, sharingType: getSharingType(newBeds) };
                    })} className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"><Icon icon="lucide:plus" /></button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#062F26] mb-2 block">Sharing Type (Auto-calculated)</label>
                <div className="flex flex-wrap gap-2">
                  {['Single', 'Double', 'Triple', 'Four', 'Other'].map(type => {
                    const isActive = getSharingType(roomFormData.totalBeds) === type;
                    return (
                      <button key={type} type="button" disabled className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${isActive ? 'bg-[#EAF5F2] border-brand-teal text-[#062F26] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'}`}>
                        {isActive && <Icon icon="lucide:check" className="inline-block mr-1.5 mb-0.5 w-3.5 h-3.5" strokeWidth="3" />}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#062F26] mb-2 block">Room Configuration</label>
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="font-bold text-sm text-[#062F26] flex items-center gap-2">
                      <Icon icon="lucide:snowflake" className="text-brand-teal" /> Air Conditioning (AC)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Enable if this room has an AC unit</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={roomFormData.isAC}
                      onChange={(e) => setRoomFormData({...roomFormData, isAC: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#062F26] mb-2 block">Other Room Facilities</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_FACILITIES.map(fac => (
                    <label key={fac} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 ${roomFormData.facilities.includes(fac) ? 'border-brand-teal bg-[#EAF5F2] shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'}`}>
                      <span className={`text-xs font-semibold ${roomFormData.facilities.includes(fac) ? 'text-[#062F26]' : 'text-slate-700'}`}>{fac}</span>
                      <input 
                        type="checkbox" 
                        checked={roomFormData.facilities.includes(fac)} 
                        onChange={() => {
                          const newFacs = roomFormData.facilities.includes(fac) ? roomFormData.facilities.filter(f => f !== fac) : [...roomFormData.facilities, fac];
                          setRoomFormData({...roomFormData, facilities: newFacs});
                        }}
                        className="w-4 h-4 text-brand-teal rounded border-slate-300 focus:ring-brand-teal accent-brand-teal cursor-pointer" 
                      />
                    </label>
                  ))}
                </div>
              </div>

            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:scale-95">Cancel</button>
              <button type="button" onClick={saveRoomForm} className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-teal text-white hover:bg-[#062F26] transition-all hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand-teal/20 flex items-center gap-2">
                <Icon icon="lucide:save" width="16" /> Save Room Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
