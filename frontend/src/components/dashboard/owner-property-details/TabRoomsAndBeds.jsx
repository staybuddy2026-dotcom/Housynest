import React from 'react';
import { Icon } from '@iconify/react';

const TabRoomsAndBeds = ({ property, bookings }) => {
  const getDynamicBedStatus = (bed) => {
    if (bed.status === 'Occupied') return 'Occupied';
    if (bed.status === 'Reserved') return 'Reserved';
    if (bed.status === 'Maintenance') return 'Maintenance';
    return 'Vacant';
  };
  if (property.propertyType !== 'PG') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center animate-fadeIn">
        <Icon icon="lucide:home" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#062F26]">Property Details</h3>
        <p className="text-sm font-medium text-slate-500 mt-2 max-w-md mx-auto">
          This is a {property.bhkType} property. Room and bed management is specifically for PG accommodations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-[#062F26] mb-4">Floor & Room Layout (Total Bookings Passed: {bookings?.length || 0})</h3>
        {property.floors?.length > 0 ? (
          <div className="space-y-6">
            {property.floors.map((floor, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-[#062F26]">{floor.floorName || `Floor ${floor.floorNumber || idx + 1}`}</h4>
                  <span className="text-xs font-semibold text-slate-500">{floor.rooms?.length || 0} Rooms</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floor.rooms?.map((room, rIdx) => (
                    <div key={rIdx} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-[#062F26]">{room.roomName || `Room ${room.roomNumber || rIdx + 1}`}</span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-brand-teal/10 text-brand-teal rounded uppercase tracking-wider">
                          {room.sharingType} {room.isAC ? 'AC' : 'Non-AC'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {room.beds?.map((bed, bIdx) => (
                          <div key={bIdx} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <Icon icon="lucide:bed" className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-semibold text-slate-700">{bed.bedName || `Bed ${bIdx + 1}`}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getDynamicBedStatus(bed) === 'Vacant' ? 'bg-emerald-100 text-emerald-700' : getDynamicBedStatus(bed) === 'Reserved' ? 'bg-amber-100 text-amber-700' : getDynamicBedStatus(bed) === 'Maintenance' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'}`}>
                              {getDynamicBedStatus(bed)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No floor details available. Please update the property info.</p>
        )}
      </div>
    </div>
  );
};

export default TabRoomsAndBeds;
