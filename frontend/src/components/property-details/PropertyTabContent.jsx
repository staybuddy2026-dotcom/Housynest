import { Icon } from '@iconify/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const PropertyTabContent = ({
  activeTab,
  property,
  propertyType,
  pgRooms,
  selectedRoomIndex,
  setSelectedRoomIndex
}) => {
  const [selectedFilterTab, setSelectedFilterTab] = useState('All Rooms');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('All Floors');
  const [expandedFloors, setExpandedFloors] = useState({});
  const [selectedRoomModal, setSelectedRoomModal] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);
  const [waitlistAlerts, setWaitlistAlerts] = useState({});

  const handleSubscribeWaitlist = async (roomId, sharingType, bedKey) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to receive availability email alerts.');
        return;
      }
      const res = await fetch('http://localhost:5000/api/waitlist/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property?._id,
          roomId: roomId || null,
          sharingType: sharingType || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Subscribed for instant availability alert!');
        if (bedKey) {
          setWaitlistAlerts(prev => ({ ...prev, [bedKey]: true }));
        }
      } else {
        toast.error(data.message || 'Failed to subscribe');
      }
    } catch {
      toast.error('Error connecting to server');
    }
  };

  return (
    <div className="w-full flex-1 bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 p-4 sm:p-6 lg:p-8 min-h-100">

      {activeTab === 'Overview' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#062F26]">About Property</h3>
          </div>
          <p className="text-sm text-slate-600 leading-[1.7] font-medium mb-8 whitespace-pre-line">
            {property.description || (propertyType === 'PG' ? (
              <>{property.title} offers a comfortable and secure living experience with well-furnished rooms, modern amenities and hygienic food. Located in the heart of {property.location.split(',').slice(-2)[0] || property.location.split(',')[0]}, it is ideal for students and working professionals.</>
            ) : (
              <>{property.title} offers a premium living experience with excellent ventilation, modern amenities, and easy access to local markets and transport. Ideal for families and working professionals seeking a comfortable home.</>
            ))}
          </p>

          <div className="bg-[#F4F9F8] rounded-xl p-5 flex gap-4 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-brand-teal/20">
            <div className="text-brand-teal shrink-0 mt-0.5">
              <Icon icon="lucide:award" className="w-5.5 h-5.5 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h4 className="font-bold text-[#062F26] text-sm mb-1">What Makes This Property Unique</h4>
              <p className="text-sm text-slate-600 font-medium leading-[1.6]">
                {property.uspText || (propertyType === 'PG'
                  ? `Prime location in ${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} with excellent connectivity, modern amenities, hygienic food and a peaceful environment.`
                  : `Prime location in ${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} with excellent connectivity, spacious interiors, dedicated parking, and a peaceful environment.`)}
              </p>
            </div>
          </div>



          {propertyType !== 'PG' && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h4 className="text-base font-bold text-[#062F26] mb-3">Locality Description</h4>
              <p className="text-sm text-slate-600 leading-[1.7] font-medium whitespace-pre-line">
                {property.localityDescription || `${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} is one of the most prominent neighborhoods, known for its vibrant atmosphere and tree-lined streets. It offers a perfect blend of residential tranquility and commercial energy. The area is highly sought after by students and young professionals due to its proximity to major IT parks, top-tier educational institutions, and an abundance of cafes, restaurants, and entertainment options. With excellent connectivity to other parts of the city, living in ${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} provides unmatched convenience and lifestyle benefits.`}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Rooms & Beds' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#062F26]">Rooms & Beds</h3>
            <button
              onClick={() => setViewMode(prev => prev === 'list' ? 'plan' : 'list')}
              className="px-5 py-2 text-sm font-bold text-brand-teal border-2 border-brand-teal/20 rounded-xl hover:bg-[#EAF5F2] hover:border-brand-teal/40 transition-all flex items-center gap-2"
            >
              <Icon icon={viewMode === 'list' ? "lucide:map" : "lucide:list"} className="w-4 h-4" />
              {viewMode === 'list' ? 'View Floor Plan' : 'View Rooms List'}
            </button>
          </div>

          {viewMode === 'plan' ? (
            <div className="animate-in fade-in duration-300 bg-white border border-slate-100 rounded-3xl p-2 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-10">
                {property.floors && property.floors.length > 0 ? (
                  property.floors.filter(f => selectedFloorFilter === 'All Floors' || f.floorName === selectedFloorFilter).map((floor, fIdx) => (
                    <div key={fIdx} className="bg-slate-900 rounded-2xl p-5 md:p-6 shadow-inner overflow-x-auto relative border-[6px] border-slate-800 group/floor transition-all">
                      <div className="absolute top-0 left-0 bg-brand-teal text-white text-[10px] font-bold px-3 py-1.5 rounded-br-xl uppercase tracking-widest z-20 shadow-sm">
                        {floor.floorName}
                      </div>
                      <div className="flex gap-4 min-w-max mt-6 items-center justify-center">
                        {floor.rooms?.map((room, rIdx) => {
                          const isAC = room.isAC;
                          const isSingle = (room.sharingType || '').includes('Single');
                          const sharingTypeDisplay = room.sharingType?.replace('_AC', '').replace('_NonAC', '') || 'Single';

                          let rent = property.pgPricing?.[`${room.sharingType}${isAC ? '_AC' : '_NonAC'}`]?.rentPerBed;
                          if (!rent || rent === '0') {
                            const fallbackKey = Object.keys(property.pgPricing || {}).find(k => k.startsWith(room.sharingType + '_'));
                            rent = fallbackKey ? property.pgPricing[fallbackKey]?.rentPerBed : property.price;
                          }

                          return (
                            <div
                              key={rIdx}
                              onClick={() => setSelectedRoomModal({ room, floorName: floor.floorName, rent, sharingTypeDisplay, isSingle })}
                              className="group relative w-36 h-48 border-[2px] border-slate-600 hover:border-brand-teal/80 bg-slate-800/40 hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-between p-3 shadow-md hover:-translate-y-1 hover:shadow-brand-teal/20"
                            >
                              {/* Door arc representation */}
                              <div className="absolute -bottom-[2px] right-4 w-8 h-8 border-t-[2px] border-l-[2px] border-slate-500 rounded-tl-full opacity-50 group-hover:border-brand-teal transition-colors"></div>

                              <div className="text-center mt-1 relative z-10">
                                <p className="text-slate-200 font-mono text-sm font-bold tracking-wide group-hover:text-white transition-colors">{room.roomName || `R-${rIdx + 1}`}</p>
                                <p className="text-slate-500 text-[9px] font-bold uppercase mt-0.5 tracking-wider group-hover:text-brand-teal/80 transition-colors">{sharingTypeDisplay} {isAC ? '• AC' : ''}</p>
                              </div>

                              <div className="flex flex-wrap justify-center gap-2 mt-auto z-10 mb-1">
                                {room.beds?.map((bed, bIdx) => (
                                  <div key={bIdx} className={`group/bed relative w-6 h-10 border-[1.5px] rounded flex items-end justify-center pb-1 shadow-sm transition-transform group-hover:scale-110 ${bed.status === 'Occupied' ? 'border-red-500/60 bg-red-500/10' : bed.status === 'Reserved' || bed.status === 'Notice' ? 'border-orange-500/60 bg-orange-500/10' : 'border-[#0AA87D]/60 bg-[#0AA87D]/10'}`}>
                                    <div className={`w-3.5 h-3 rounded-sm shadow-inner ${bed.status === 'Occupied' ? 'bg-red-500/70' : bed.status === 'Reserved' || bed.status === 'Notice' ? 'bg-orange-500/70' : 'bg-[#0AA87D]/70'}`}></div>

                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover/bed:flex flex-col items-center z-50 pointer-events-none">
                                      <div className="bg-[#062F26] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-brand-teal/20 flex items-center gap-1.5">
                                        <span>Bed {bIdx + 1}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                        <span className={`${bed.status === 'Occupied' ? 'text-red-400' : bed.status === 'Reserved' || bed.status === 'Notice' ? 'text-orange-400' : 'text-[#0AA87D]'}`}>{bed.status}</span>
                                      </div>
                                      <div className="w-2 h-2 bg-[#062F26] border-b border-r border-brand-teal/20 rotate-45 -mt-1.5 z-[-1]"></div>
                                    </div>
                                  </div>
                                ))}
                                {(!room.beds || room.beds.length === 0) && (
                                  <div className="w-6 h-10 border-[1.5px] border-slate-500/50 rounded flex items-end justify-center pb-1 shadow-sm">
                                    <div className="w-3.5 h-3 rounded-sm bg-slate-500/50 shadow-inner"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center bg-[#F4F9F8] border-2 border-dashed border-brand-teal/20 rounded-3xl">
                    <Icon icon="lucide:map" className="w-16 h-16 text-brand-teal/40 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-[#062F26] mb-2">Floor Plan Not Available</h4>
                    <p className="text-slate-500 font-medium">There is no layout data available for this property.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Filter Tabs & Floor Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto hide-scrollbar w-full sm:w-auto">
                  {['All Rooms', 'Single', 'Double', 'Triple', 'Four Sharing'].map(tab => {
                    let count = 0;
                    if (property.floors && property.floors.length > 0) {
                      property.floors.forEach(f => {
                        f.rooms?.forEach(r => {
                          if (tab === 'All Rooms' || r.sharingType?.includes(tab.split(' ')[0])) {
                            count++;
                          }
                        });
                      });
                    } else {
                      count = pgRooms.filter(r => tab === 'All Rooms' || r.title?.includes(tab.split(' ')[0])).length;
                    }

                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedFilterTab(tab)}
                        className={`pb-3 sm:pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${selectedFilterTab === tab ? 'text-brand-teal' : 'text-slate-500 hover:text-[#062F26]'}`}
                      >
                        {tab} ({count})
                        {selectedFilterTab === tab && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] sm:h-[3px] bg-brand-teal rounded-t-full translate-y-[1px]"></span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="relative shrink-0 w-full sm:w-48 mb-3 sm:mb-2 z-20">
                  <div
                    onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
                    className="appearance-none pl-5 pr-5 py-3 border border-slate-200 rounded-xl text-[13.5px] font-bold text-[#062F26] bg-white cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:border-brand-teal/40 hover:shadow-md transition-all w-full flex items-center justify-between group"
                  >
                    {selectedFloorFilter}
                    <Icon icon="lucide:chevron-down" className={`w-4 h-4 text-brand-teal transition-transform duration-300 group-hover:scale-110 ${isFloorDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isFloorDropdownOpen && (
                    <>
                      {/* Overlay to close when clicking outside */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsFloorDropdownOpen(false)}></div>

                      <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div
                          onClick={() => { setSelectedFloorFilter("All Floors"); setIsFloorDropdownOpen(false); }}
                          className={`px-5 py-3 text-[13.5px] font-bold cursor-pointer transition-colors flex items-center justify-between ${selectedFloorFilter === "All Floors" ? 'bg-[#062F26] text-white' : 'text-slate-600 hover:bg-[#F4F9F8] hover:text-[#062F26]'}`}
                        >
                          All Floors
                          {selectedFloorFilter === "All Floors" && <Icon icon="lucide:check" className="w-4 h-4 text-white" />}
                        </div>
                        {property.floors?.map((f, i) => (
                          <div
                            key={i}
                            onClick={() => { setSelectedFloorFilter(f.floorName); setIsFloorDropdownOpen(false); }}
                            className={`px-5 py-3 text-[13.5px] font-bold cursor-pointer transition-colors flex items-center justify-between ${selectedFloorFilter === f.floorName ? 'bg-[#062F26] text-white' : 'text-slate-600 hover:bg-[#F4F9F8] hover:text-[#062F26]'}`}
                          >
                            {f.floorName}
                            {selectedFloorFilter === f.floorName && <Icon icon="lucide:check" className="w-4 h-4 text-white" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {propertyType === 'PG' && (
                <div className="flex flex-col gap-4">
                  {property.floors && property.floors.length > 0 ? (
                    property.floors.filter(f => selectedFloorFilter === 'All Floors' || f.floorName === selectedFloorFilter).map((floor, floorIdx) => {
                      const floorRooms = (floor.rooms || []).filter(r => selectedFilterTab === 'All Rooms' || r.sharingType?.includes(selectedFilterTab.split(' ')[0]));

                      if (floorRooms.length === 0) return null;

                      const totalBeds = floorRooms.reduce((sum, r) => sum + (r.beds?.length || 0), 0);
                      const availableBeds = floorRooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Vacant').length || 0), 0);
                      const isExpanded = expandedFloors[floorIdx] !== undefined ? expandedFloors[floorIdx] : true;

                      return (
                        <div key={floorIdx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <div
                            onClick={() => setExpandedFloors(prev => ({ ...prev, [floorIdx]: !isExpanded }))}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50 transition-colors gap-4 sm:gap-0"
                          >
                            <div className="flex items-center justify-between w-full sm:w-auto">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EAF5F2] flex items-center justify-center text-brand-teal shrink-0">
                                  <Icon icon="lucide:building-2" className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-[15px] font-bold text-[#062F26] leading-none mb-1.5">{floor.floorName}</h4>
                                  <p className="text-xs font-bold text-slate-500 leading-none">{floorRooms.length} Rooms</p>
                                </div>
                              </div>
                              <Icon icon="lucide:chevron-down" className={`sm:hidden w-5 h-5 text-[#062F26] transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>

                            <div className="flex items-center gap-5 sm:gap-8 justify-between sm:justify-start w-full sm:w-auto">
                              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                    <Icon icon="lucide:bed-double" className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col justify-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Beds</span>
                                    <span className="text-[15px] font-bold text-[#062F26] leading-none">{totalBeds}</span>
                                  </div>
                                </div>

                                <div className="hidden sm:block h-6 w-px bg-slate-100"></div>

                                <div className="flex items-center gap-2.5">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${availableBeds > 0 ? 'bg-[#EAF5F2] text-brand-teal' : 'bg-red-50 text-red-500'}`}>
                                    <Icon icon={availableBeds > 0 ? "lucide:door-open" : "lucide:door-closed"} className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col justify-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Available</span>
                                    <span className={`text-[15px] font-bold leading-none ${availableBeds > 0 ? 'text-brand-teal' : 'text-red-500'}`}>{availableBeds}</span>
                                  </div>
                                </div>
                              </div>
                              <Icon icon="lucide:chevron-down" className={`hidden sm:block w-5 h-5 text-[#062F26] transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-[#FAFAFA]/50">
                                <div className="flex overflow-x-auto gap-4 pb-2 pt-4 hide-scrollbar">
                                  {floorRooms.map((room, roomIdx) => {
                                    const occupied = room.beds?.filter(b => b.status === 'Occupied').length || 0;
                                    const vacant = room.beds?.filter(b => b.status === 'Vacant').length || 0;

                                    let statusText = 'Vacant';
                                    let statusColor = 'text-[#062F26]';
                                    let dotColor = 'bg-[#0AA87D]';

                                    if (vacant === 0) {
                                      statusText = 'Full';
                                      statusColor = 'text-red-500';
                                      dotColor = 'bg-red-500';
                                    } else if (vacant === 1 && occupied > 0) {
                                      statusText = 'Only 1 Bed Left';
                                      statusColor = 'text-orange-500';
                                      dotColor = 'bg-orange-500';
                                    } else if (occupied > 0) {
                                      statusText = `${occupied} Occupied • ${vacant} Vacant`;
                                      statusColor = 'text-[#0AA87D]';
                                    } else {
                                      statusText = 'Vacant';
                                      statusColor = 'text-[#0AA87D]';
                                    }

                                    const acSuffix = room.isAC ? '_AC' : '_NonAC';
                                    const pricingKey = `${room.sharingType}${acSuffix}`;
                                    let rent = property.pgPricing?.[pricingKey]?.rentPerBed;
                                    if (!rent || rent === '0') {
                                      const fallbackKey = Object.keys(property.pgPricing || {}).find(k => k.startsWith(room.sharingType + '_'));
                                      rent = fallbackKey ? property.pgPricing[fallbackKey]?.rentPerBed : 'N/A';
                                    }
                                    if (!rent || rent === 'N/A') rent = property.price;

                                    const sharingTypeDisplay = room.sharingType?.replace('_AC', '').replace('_NonAC', '') || 'Single';
                                    const isSingle = sharingTypeDisplay.includes('Single');

                                    return (
                                      <div
                                        key={roomIdx}
                                        onClick={() => setSelectedRoomModal({ room, floorName: floor.floorName, rent, sharingTypeDisplay, isSingle })}
                                        className="group min-w-[220px] flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-brand-teal/60 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                                      >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-teal/5 rounded-bl-[40px] z-0 group-hover:bg-brand-teal/10 transition-colors"></div>

                                        <div className="relative z-10">
                                          <div className="flex justify-between items-start mb-2 gap-2">
                                            <h4 className="text-[17px] font-bold text-[#062F26]">{room.roomName || `Room ${roomIdx + 1}`}</h4>
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md shrink-0 ${vacant === 0 ? 'bg-red-50' : occupied > 0 ? 'bg-orange-50' : 'bg-[#EAF5F2]'}`}>
                                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                                              <span className={`text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>{statusText}</span>
                                            </div>
                                          </div>
                                          <p className="text-xs font-bold text-slate-500 mb-4">{sharingTypeDisplay} {isSingle ? 'Room' : 'Sharing'} • {room.beds?.length || 1} Bed{room.beds?.length > 1 ? 's' : ''}</p>
                                        </div>

                                        <div className="flex items-end justify-between mt-1 pt-3 border-t border-slate-100 border-dashed relative z-10">
                                          <div>
                                            <div className="flex items-baseline">
                                              <span className="text-[20px] leading-none font-bold text-[#062F26]">₹{Number(rent).toLocaleString('en-IN')}</span>
                                              <span className="text-[10px] text-slate-500 font-bold ml-1">/{isSingle ? 'mo' : 'bed'}</span>
                                            </div>
                                          </div>
                                          <div className="w-7 h-7 rounded-full bg-[#EAF5F2] flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white text-brand-teal transition-all group-hover:scale-110">
                                            <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {pgRooms.map((room, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedRoomIndex(idx)}
                          className={`cursor-pointer rounded-2xl border p-6 transition-all duration-300 transform hover:-translate-y-1 ${selectedRoomIndex === idx
                            ? 'bg-white border-brand-teal shadow-[0_10px_30px_rgba(10,168,125,0.12)] ring-2 ring-brand-teal/10'
                            : 'bg-white border-slate-200 shadow-sm hover:border-brand-teal/40 hover:shadow-[0_10px_30px_rgba(10,168,125,0.08)]'
                            } group`}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <h4 className={`text-lg font-bold transition-colors ${selectedRoomIndex === idx ? 'text-brand-teal' : 'text-[#062F26] group-hover:text-brand-teal'}`}>{room.title}</h4>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${selectedRoomIndex === idx ? 'bg-brand-teal text-white' : 'bg-[#EAF5F2] text-brand-teal group-hover:bg-brand-teal group-hover:text-white'}`}>{room.available} available</span>
                          </div>

                          <div className="flex flex-col gap-3 mb-5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-500">Total Sharing</span>
                              <span className="text-sm font-bold text-[#062F26]">{room.totalBeds}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-500">Monthly Rent</span>
                              <span className={`text-sm font-bold transition-colors ${selectedRoomIndex === idx ? 'text-brand-teal' : 'text-[#062F26]'}`}>₹ {room.rent}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-500">Security Deposit</span>
                              <span className="text-sm font-bold text-[#062F26]">₹ {room.deposit}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-5 flex flex-wrap gap-2">
                            {room.amenities.map((amenity, i) => (
                              <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border ${selectedRoomIndex === idx ? 'bg-[#EAF5F2] border-brand-teal/30 text-brand-teal' : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-[#EAF5F2] group-hover:border-brand-teal/20 group-hover:text-brand-teal'}`}>{amenity}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'Property Details' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            {(propertyType === 'PG' ? [
              { icon: 'lucide:users', label: 'Category', value: property.category },
              { icon: 'lucide:building-2', label: 'Present In', value: property.pgPresentIn },
              { icon: 'lucide:clock', label: 'Operational Since', value: property.operationalSince },
              { icon: 'lucide:parking-circle', label: 'Parking Available', value: (property.parking && property.parking.length > 0) ? property.parking.join(', ') : null }
            ].filter(detail => detail.value) : [
              { icon: 'lucide:home', label: 'Type', value: property.category },
              { icon: 'lucide:bed-double', label: 'Bedrooms', value: property.bhkType },
              { icon: 'lucide:bath', label: 'Bathrooms', value: property.bathrooms },
              { icon: 'lucide:layout-template', label: 'Balcony', value: property.balconies },
              { icon: 'lucide:sofa', label: 'Furnishing', value: property.furnishingStatus },
              { icon: 'lucide:compass', label: 'Facing', value: property.facing },
              { icon: 'lucide:clock', label: 'Maintenance Charges', value: property.maintenanceCharges },
              { icon: 'lucide:scaling', label: 'Built Up Area', value: property.builtUpArea ? `${property.builtUpArea} sq.ft.` : null },
              { icon: 'lucide:scaling', label: 'Carpet Area', value: property.carpetArea ? `${property.carpetArea} sq.ft.` : null },
              { icon: 'lucide:layers', label: 'Total Floors', value: property.totalFloors },
              { icon: 'lucide:arrow-up-to-line', label: 'Property on Floor', value: property.propertyOnFloor },
              { icon: 'lucide:calendar-clock', label: 'Age of Property', value: property.ageOfProperty },
              { icon: 'lucide:building-2', label: 'Society', value: property.societyName },
              { icon: 'lucide:shield', label: 'Security Deposit', value: property.securityAmount ? `₹${property.securityAmount}` : null },
              { icon: 'lucide:plus-square', label: 'Additional Rooms', value: (property.additionalRooms && property.additionalRooms.length > 0) ? property.additionalRooms.join(', ') : null },
              { icon: 'lucide:eye', label: 'Overlooking', value: (property.overlooking && property.overlooking.length > 0) ? property.overlooking.join(', ') : null }
            ].filter(detail => detail.value)).map((detail, idx) => (
              <div key={idx} className="group flex items-start gap-3 p-2 -ml-2 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="shrink-0 mt-0.5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300"><Icon icon={detail.icon} className="w-4.5 h-4.5 text-brand-teal stroke-2" /></div>
                <div className="flex-1 flex flex-col sm:grid sm:grid-cols-[140px_1fr] items-start">
                  <p className="text-sm font-medium text-slate-500">{detail.label}</p>
                  <p className="text-sm font-bold text-[#062F26] leading-snug">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Amenities & Services' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Amenities & Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4">
            {property.amenities.map((amenityName, idx) => (
              <div key={idx} className="group flex items-center gap-3 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <span className="w-2 h-2 rounded-full bg-brand-teal/40 group-hover:bg-brand-teal transition-colors"></span>
                <span className="text-sm font-bold text-[#062F26]">{amenityName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Food Details' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Food Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center shrink-0 transition-colors duration-300">
                <Icon icon="lucide:utensils-crossed" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Food Provided</p>
                <p className="text-sm font-bold text-[#062F26]">{property.foodProvided ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center shrink-0 transition-colors duration-300">
                <Icon icon="lucide:coffee" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Meals</p>
                <p className="text-sm font-bold text-[#062F26] leading-snug">{(property.meals && property.meals.length > 0) ? property.meals.join(', ') : 'Not Specified'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center shrink-0 transition-colors duration-300">
                <Icon icon="lucide:salad" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Veg / Non-Veg</p>
                <p className="text-sm font-bold text-[#062F26]">{property.vegNonVeg || 'Both'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center shrink-0 transition-colors duration-300">
                <Icon icon="lucide:receipt" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Food Charges</p>
                <p className="text-sm font-bold text-[#062F26]">{property.foodCharges || 'Included in Rent'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Rules & Policies' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Rules & Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {propertyType === 'PG' && (
              <>
                <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <Icon icon="lucide:users" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Visitors Allowed</p>
                    <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Visitors') ? 'No' : 'Yes'}</p>
                  </div>
                </div>
              </>
            )}
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:calendar-x" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Notice Period</p>
                <p className="text-sm font-bold text-[#062F26]">{property.noticePeriod || (propertyType === 'PG' ? '30 Days' : '2 Months')}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:cigarette-off" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Smoking</p>
                <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Smoking') ? 'Not Allowed' : 'Allowed'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:wine-off" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Drinking</p>
                <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Drinking') ? 'Not Allowed' : 'Allowed'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:dog" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Pets</p>
                <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Pets') ? 'Not Allowed' : (propertyType === 'PG' ? 'Not Allowed' : 'Allowed')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Nearby Places' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Nearby Places</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(property.nearbyPlaces && property.nearbyPlaces.length > 0 ? property.nearbyPlaces.map(p => ({ icon: 'lucide:map-pin', name: p.place, dist: p.distance })) : [
              { icon: 'lucide:map-pin', name: 'Koramangala Police Station', dist: '1.2 km' },
              { icon: 'lucide:map-pin', name: 'Forum Mall Koramangala', dist: '1.8 km' },
              { icon: 'lucide:map-pin', name: 'St. John\'s Hospital', dist: '2.3 km' },
              { icon: 'lucide:map-pin', name: 'Ejipura Metro Station', dist: '3.1 km' },
              { icon: 'lucide:map-pin', name: 'HSR Layout', dist: '3.5 km' },
            ]).map((place, idx) => (
              <div key={idx} className="group flex items-start gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center shrink-0 transition-colors duration-300">
                  <Icon icon={place.icon} className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#062F26] leading-snug mb-1">{place.name}</p>
                  <p className="text-xs font-bold text-slate-500">{place.dist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {selectedRoomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-[#062F26]">{selectedRoomModal.room.roomName || 'Room'}</h3>
                <p className="text-sm font-medium text-slate-500">{selectedRoomModal.floorName} • {selectedRoomModal.sharingTypeDisplay} {selectedRoomModal.isSingle ? 'Room' : 'Sharing'}</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedRoomModal.room.beds && selectedRoomModal.room.beds.length > 0 && !selectedRoomModal.room.beds.some(b => b.status === 'Vacant') && (
                  <button
                    type="button"
                    onClick={() => handleSubscribeWaitlist(selectedRoomModal.room.roomName, selectedRoomModal.sharingTypeDisplay, 'room_' + selectedRoomModal.room.roomName)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${waitlistAlerts['room_' + selectedRoomModal.room.roomName]
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200/80'
                      }`}
                    title="Receive instant email when this room opens up"
                  >
                    <Icon icon={waitlistAlerts['room_' + selectedRoomModal.room.roomName] ? "lucide:check-circle-2" : "lucide:bell-ring"} className="w-4 h-4" />
                    {waitlistAlerts['room_' + selectedRoomModal.room.roomName] ? 'Alert Active' : 'Notify Me'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedRoomModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <Icon icon="lucide:x" className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Info row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F4F9F8] p-4 rounded-2xl">
                  <p className="text-xs font-bold text-brand-teal mb-1">Monthly Rent</p>
                  <p className="text-lg font-bold text-[#062F26]">₹{Number(selectedRoomModal.rent).toLocaleString('en-IN')}<span className="text-xs text-slate-500 font-medium">/{selectedRoomModal.isSingle ? 'month' : 'bed'}</span></p>
                </div>
                <div className="bg-[#F4F9F8] p-4 rounded-2xl">
                  <p className="text-xs font-bold text-brand-teal mb-1">AC Status</p>
                  <div className="flex items-center gap-2">
                    <Icon icon={selectedRoomModal.room.isAC ? "lucide:snowflake" : "lucide:wind"} className="w-4 h-4 text-[#062F26]" />
                    <p className="text-sm font-bold text-[#062F26]">{selectedRoomModal.room.isAC ? 'AC Room' : 'Non-AC'}</p>
                  </div>
                </div>
              </div>

              {/* Beds */}
              <h4 className="text-base font-bold text-[#062F26] mb-4 flex items-center gap-2">
                <Icon icon="lucide:bed-double" className="w-5 h-5 text-brand-teal" />
                Bed Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {selectedRoomModal.room.beds?.map((bed, bIdx) => {
                  let statusBg = 'bg-[#0AA87D]/10';
                  let statusText = 'text-[#0AA87D]';
                  let statusDot = 'bg-[#0AA87D]';

                  if (bed.status === 'Occupied') {
                    statusBg = 'bg-red-500/10';
                    statusText = 'text-red-500';
                    statusDot = 'bg-red-500';
                  } else if (bed.status === 'Reserved' || bed.status === 'Notice') {
                    statusBg = 'bg-orange-500/10';
                    statusText = 'text-orange-500';
                    statusDot = 'bg-orange-500';
                  }

                  const isOccupied = bed.status === 'Occupied' || bed.status === 'Reserved' || bed.status === 'Notice';
                  const bedKey = `${selectedRoomModal.room.roomName || 'room'}_bed_${bIdx}`;

                  return (
                    <div key={bIdx} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white shadow-xs hover:border-slate-200 transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-[#062F26]">Bed {bIdx + 1}</span>
                        <span className="text-xs font-bold text-slate-500">₹{Number(selectedRoomModal.rent).toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400"> /bed</span></span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${statusText}`}>{bed.status || 'Vacant'}</span>
                      </div>
                    </div>
                  );
                })}
                {(!selectedRoomModal.room.beds || selectedRoomModal.room.beds.length === 0) && (
                  <div className="col-span-full text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No bed data available</div>
                )}
              </div>

              {/* Facilities */}
              {((selectedRoomModal.room.facilities && selectedRoomModal.room.facilities.length > 0) || (selectedRoomModal.room.extraFacilities && selectedRoomModal.room.extraFacilities.length > 0)) && (
                <div>
                  <h4 className="text-base font-bold text-[#062F26] mb-3">Room Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoomModal.room.facilities?.map((fac, fIdx) => (
                      <span key={fIdx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                        {fac}
                      </span>
                    ))}
                    {selectedRoomModal.room.extraFacilities?.map((fac, fIdx) => (
                      <span key={`ext-${fIdx}`} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              {selectedRoomModal.room.beds && selectedRoomModal.room.beds.length > 0 && !selectedRoomModal.room.beds.some(b => b.status === 'Vacant') ? (
                <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl w-full sm:w-auto">
                  <Icon icon="lucide:bell-ring" className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This room is currently full. Click <strong>Notify Me</strong> to get instant email alerts when available.</span>
                </div>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedRoomModal(null)}
                className="px-5 py-2.5 bg-[#062F26] hover:bg-[#05261e] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyTabContent;
