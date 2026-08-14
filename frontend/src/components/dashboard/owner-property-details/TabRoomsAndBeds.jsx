import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const TabRoomsAndBeds = ({ property, bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleBedClick = (floor, floorIdx, room, roomIdx, bed, bedIdx) => {
    const rName = (room.roomName || `Room ${room.roomNumber || roomIdx + 1}`).toLowerCase().trim();
    const bName = (bed.bedName || `Bed ${bedIdx + 1}`).toLowerCase().trim();

    let booking = bookings?.find(b => {
      const bRoom = (b.roomDetails?.roomName || '').toLowerCase().trim();
      const bBed = (b.roomDetails?.bedName || '').toLowerCase().trim();
      return bRoom === rName && bBed === bName && ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active', 'Completed'].includes(b.status);
    });

    if (!booking) {
      // Fallback: try matching without status in case of weird data states
      booking = bookings?.find(b => {
        const bRoom = (b.roomDetails?.roomName || '').toLowerCase().trim();
        const bBed = (b.roomDetails?.bedName || '').toLowerCase().trim();
        return bRoom === rName && bBed === bName;
      });
    }

    if (booking) {
      setSelectedBooking(booking);
    }
  };
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
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                          <div 
                            key={bIdx} 
                            onClick={() => handleBedClick(floor, idx, room, rIdx, bed, bIdx)}
                            className={`flex items-center justify-between bg-slate-50 p-2 rounded transition-colors ${['Occupied', 'Reserved'].includes(getDynamicBedStatus(bed)) ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                            title={['Occupied', 'Reserved'].includes(getDynamicBedStatus(bed)) ? "Click to view tenant details" : ""}
                          >
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

      {/* Tenant Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[#062F26] flex items-center gap-2">
                <Icon icon="lucide:user" className="w-5 h-5 text-brand-teal" />
                Tenant Details
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-brand-teal/20 overflow-hidden shrink-0">
                  {selectedBooking.tenantId?.profilePic ? (
                    <img src={selectedBooking.tenantId.profilePic} alt="Tenant" className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="lucide:user" className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#062F26]">
                    {selectedBooking.personalInfo?.firstName ? `${selectedBooking.personalInfo.firstName} ${selectedBooking.personalInfo.lastName || ''}` : selectedBooking.tenantId?.fullName || 'Unknown Tenant'}
                  </h4>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedBooking.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : selectedBooking.status === 'Reserved' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:phone" className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedBooking.personalInfo?.mobileNumber || selectedBooking.tenantId?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:mail" className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Email Address</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{selectedBooking.personalInfo?.email || selectedBooking.tenantId?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:calendar-days" className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Move In Date</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedBooking.moveInDate ? new Date(selectedBooking.moveInDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBooking.emergencyContact?.name && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Emergency Contact</h5>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:heart-pulse" className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{selectedBooking.emergencyContact.name}</p>
                      <p className="text-[11px] font-medium text-slate-500">{selectedBooking.emergencyContact.relation} • {selectedBooking.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabRoomsAndBeds;
