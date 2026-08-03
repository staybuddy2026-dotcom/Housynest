import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BookNowModal = ({ isOpen, onClose, property }) => {
  const navigate = useNavigate();

  // State management
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedName, setSelectedBedName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const isPG = property?.type === 'PG' || property?.propertyType === 'PG';

  // ----------------------------------------------------
  // Build Room & Bed Data Structure
  // ----------------------------------------------------
  let allRooms = [];
  if (isPG && property?.floors && property.floors.length > 0) {
    property.floors.forEach((floor, fIdx) => {
      if (floor.rooms && floor.rooms.length > 0) {
        floor.rooms.forEach((rm, rIdx) => {
          const roomName = rm.roomName || `Room ${fIdx + 1}0${rIdx + 1}`;
          const sharingType = rm.sharingType || 'Single';
          const isAC = rm.isAC || false;

          const pricingKey = `${sharingType}_${isAC ? 'AC' : 'NonAC'}`;
          let roomRent = 0;
          let roomDeposit = 0;
          if (property.pgPricing && property.pgPricing[pricingKey]) {
            roomRent = Number(property.pgPricing[pricingKey].rentPerBed) || 0;
            roomDeposit = Number(property.pgPricing[pricingKey].depositPerBed) || (roomRent * 2);
          }
          if (!roomRent) {
            const base = property.price ? parseInt(String(property.price).replace(/,/g, ''), 10) || 8500 : 8500;
            roomRent = sharingType === 'Single' ? base : sharingType === 'Double' ? Math.floor(base * 0.75) : Math.floor(base * 0.6);
            roomDeposit = roomRent * 2;
          }

          let beds = rm.beds || [];
          if (beds.length === 0) {
            const count = sharingType === 'Single' ? 1 : sharingType === 'Double' ? 2 : sharingType === 'Triple' ? 3 : 4;
            beds = Array.from({ length: count }, (_, i) => ({
              bedName: `Bed ${roomName}-${String.fromCharCode(65 + i)}`,
              status: i === 0 ? 'Vacant' : (i % 2 === 0 ? 'Occupied' : 'Vacant')
            }));
          } else {
            beds = beds.map((b, i) => ({
              bedName: b.bedName || `Bed ${roomName}-${String.fromCharCode(65 + i)}`,
              status: b.status || 'Vacant'
            }));
          }

          allRooms.push({
            id: `room-${fIdx}-${rIdx}`,
            floorName: floor.floorName || `Floor ${fIdx + 1}`,
            roomName: roomName,
            sharingType: `${sharingType} ${isAC ? '(AC)' : '(Non-AC)'}`,
            rent: roomRent,
            deposit: roomDeposit,
            beds: beds
          });
        });
      }
    });
  }

  // Fallback rooms if no room hierarchy in property.floors
  if (allRooms.length === 0 && isPG) {
    const baseRent = property?.price ? parseInt(String(property.price).replace(/,/g, ''), 10) || 9000 : 9000;
    allRooms = [
      {
        id: 'room-101',
        floorName: '1st Floor',
        roomName: 'Room 101',
        sharingType: 'Single Sharing (AC)',
        rent: baseRent,
        deposit: baseRent * 2,
        beds: [
          { bedName: 'Bed 101-A', status: 'Vacant' }
        ]
      },
      {
        id: 'room-102',
        floorName: '1st Floor',
        roomName: 'Room 102',
        sharingType: 'Double Sharing (AC)',
        rent: Math.floor(baseRent * 0.8),
        deposit: Math.floor(baseRent * 0.8) * 2,
        beds: [
          { bedName: 'Bed 102-A', status: 'Vacant' },
          { bedName: 'Bed 102-B', status: 'Occupied' }
        ]
      },
      {
        id: 'room-201',
        floorName: '2nd Floor',
        roomName: 'Room 201',
        sharingType: 'Triple Sharing (Non-AC)',
        rent: Math.floor(baseRent * 0.65),
        deposit: Math.floor(baseRent * 0.65) * 2,
        beds: [
          { bedName: 'Bed 201-A', status: 'Vacant' },
          { bedName: 'Bed 201-B', status: 'Vacant' },
          { bedName: 'Bed 201-C', status: 'Occupied' }
        ]
      },
      {
        id: 'room-202',
        floorName: '2nd Floor',
        roomName: 'Room 202',
        sharingType: 'Double Sharing (Non-AC)',
        rent: Math.floor(baseRent * 0.7),
        deposit: Math.floor(baseRent * 0.7) * 2,
        beds: [
          { bedName: 'Bed 202-A', status: 'Vacant' },
          { bedName: 'Bed 202-B', status: 'Vacant' }
        ]
      }
    ];
  }

  const currentRoom = allRooms.find(r => r.id === selectedRoomId) || allRooms[0];

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      const defaultRoom = allRooms[0];
      if (defaultRoom) {
        setSelectedRoomId(defaultRoom.id);
        const vacantBed = defaultRoom.beds.find(b => b.status === 'Vacant');
        setSelectedBedName(vacantBed ? vacantBed.bedName : (defaultRoom.beds[0]?.bedName || 'Bed 1'));
      }

      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setGuestName(user.fullName || user.name || '');
          setGuestPhone(user.phone || user.mobile || '');
          setGuestEmail(user.email || '');
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, [isOpen]);

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    const room = allRooms.find(r => r.id === roomId);
    if (room) {
      const vacantBed = room.beds.find(b => b.status === 'Vacant');
      setSelectedBedName(vacantBed ? vacantBed.bedName : (room.beds[0]?.bedName || 'Bed 1'));
    }
  };

  if (!isOpen || !property) return null;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please log in to complete your booking');
      navigate('/login');
      return;
    }

    if (isPG && !selectedBedName) {
      toast.error('Please select an available bed');
      return;
    }

    onClose();
    navigate(`/properties/${property.id || property._id}/book`, {
      state: {
        selectedRoom: currentRoom,
        selectedBedName: selectedBedName,
        property: property
      }
    });
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-9999 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Expanded Modal Container (max-w-4xl for extra space & professional layout) */}
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto overflow-hidden animate-fadeIn border border-slate-100/80 flex flex-col max-h-[92vh]">
        
        {/* Sleek Top Header */}
        <div className="bg-gradient-to-r from-[#062F26] via-[#08483B] to-[#0AA87D] px-6 sm:px-8 py-5 text-white flex items-center justify-between shrink-0 relative">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white backdrop-blur-xs shadow-xs">
                {isPG ? 'Instant PG Bed Reservation' : 'Property Booking'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
                <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-emerald-300" /> HousyNest Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate max-w-2xl">
              {property.title || 'Property'}
            </h2>
            <p className="text-xs text-emerald-100/90 font-medium truncate max-w-2xl mt-0.5 flex items-center gap-1">
              <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              {property.location || property.address || 'Prime Location'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
          >
            <Icon icon="lucide:x" width="20" />
          </button>
        </div>

        {!isSuccess ? (
          <form
            onSubmit={handleBookingSubmit}
            data-lenis-prevent
            className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-brand-teal/30 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {/* STEP 1: SELECT ROOM NUMBER (Compact Cards with Low Height) */}
            {isPG && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-extrabold text-[#062F26] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-teal text-white flex items-center justify-center text-[10px] font-bold shadow-xs">1</span>
                    Select Room Number
                  </label>
                  <span className="text-xs font-bold text-slate-400">
                    {allRooms.length} Rooms Available
                  </span>
                </div>

                {/* 4-column Grid with Compact Low-Height Cards (h-12) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {allRooms.map((room) => {
                    const isSelected = room.id === currentRoom?.id;
                    const vacantCount = room.beds.filter(b => b.status === 'Vacant').length;
                    return (
                      <div
                        key={room.id}
                        onClick={() => handleRoomSelect(room.id)}
                        className={`h-13 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                          isSelected
                            ? 'border-brand-teal bg-[#EAF5F2] shadow-sm ring-2 ring-brand-teal/10'
                            : 'border-slate-200/80 bg-slate-50/50 hover:border-brand-teal/40 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-brand-teal text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                            <Icon icon="lucide:door-open" width="15" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#062F26] truncate leading-tight">{room.roomName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">{room.sharingType}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pl-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${vacantCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                            <span className={`w-1 h-1 rounded-full ${vacantCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {vacantCount} Vacant
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: SELECT AVAILABLE BED (Spacious Professional 3-column Grid) */}
            {isPG && currentRoom && (
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#062F26] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-teal text-white flex items-center justify-center text-[10px] font-bold shadow-xs">2</span>
                    Select Available Bed in {currentRoom.roomName} ({currentRoom.sharingType})
                  </label>
                  <span className="text-xs font-bold text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1 rounded-lg">
                    ₹{currentRoom.rent.toLocaleString('en-IN')}<span className="text-[10px] font-semibold text-slate-500">/mo</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentRoom.beds.map((bed, idx) => {
                    const isVacant = bed.status === 'Vacant';
                    const isBedSelected = selectedBedName === bed.bedName;

                    return (
                      <div
                        key={idx}
                        onClick={() => isVacant && setSelectedBedName(bed.bedName)}
                        className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${
                          !isVacant
                            ? 'bg-slate-100/70 border-slate-200/80 opacity-60 cursor-not-allowed'
                            : isBedSelected
                            ? 'bg-gradient-to-br from-white to-[#EAF5F2]/60 border-brand-teal shadow-md ring-2 ring-brand-teal/15 cursor-pointer scale-[1.02]'
                            : 'bg-white border-slate-200 hover:border-brand-teal/40 hover:shadow-sm cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isBedSelected ? 'bg-brand-teal text-white shadow-md' : isVacant ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-200 text-slate-400'}`}>
                            <Icon icon="lucide:bed" width="20" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#062F26]">{bed.bedName}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {isVacant ? 'Ready for Move-in' : 'Occupied'}
                            </p>
                          </div>
                        </div>

                        {/* Select Badge */}
                        {isVacant ? (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isBedSelected ? 'border-brand-teal bg-brand-teal text-white' : 'border-slate-300'}`}>
                            {isBedSelected && <Icon icon="lucide:check" width="12" strokeWidth="3" />}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md">
                            Full
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Sticky Action Area */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0">
                  <Icon icon="lucide:bookmark-check" width="20" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#062F26]">
                    {isPG ? `Reserved: ${currentRoom?.roomName} (${selectedBedName || 'Bed'})` : property.title}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Rent: <span className="font-bold text-slate-800">₹{currentRoom?.rent?.toLocaleString('en-IN') || property.price}/mo</span> • Token (40%): <span className="font-bold text-[#0AA87D]">₹{Math.round((currentRoom?.rent || (property.price ? parseInt(String(property.price).replace(/,/g, ''), 10) : 12000)) * 0.40).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#062F26] via-[#08483B] to-[#0AA87D] text-white font-extrabold text-xs sm:text-sm tracking-wide hover:shadow-[0_8px_25px_rgba(10,168,125,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-4.5 h-4.5 animate-spin" />
                    Reserving {selectedBedName || 'Bed'}...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:zap" className="w-4.5 h-4.5 text-emerald-300" />
                    Confirm & Reserve {selectedBedName ? `(${selectedBedName})` : 'Bed'}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Professional Success Confirmation Screen */
          <div className="p-8 sm:p-12 text-center space-y-6 animate-fadeIn my-auto">
            <div className="w-20 h-20 rounded-full bg-[#EAF5F2] text-brand-teal flex items-center justify-center mx-auto shadow-inner">
              <Icon icon="lucide:check-circle-2" className="w-12 h-12" strokeWidth="2.5" />
            </div>
            <div>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                Booking Reference: {bookingId}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#062F26] mt-3">
                Bed Reserved Successfully!
              </h3>
              <p className="text-sm text-slate-600 font-medium max-w-lg mx-auto mt-2 leading-relaxed">
                Thank you, <span className="font-bold text-[#062F26]">{guestName}</span>! Your reservation for <span className="font-bold text-brand-teal">{selectedBedName}</span> in <span className="font-bold text-[#062F26]">{currentRoom?.roomName}</span> is locked.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 max-w-lg mx-auto text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2 font-bold text-[#062F26]">
                <Icon icon="lucide:info" className="w-4 h-4 text-brand-teal" />
                What happens next?
              </div>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
                <li>Our HousyNest property representative will contact you within 2 hours.</li>
                <li>Your digital rental contract will be generated for e-signing.</li>
                <li>You can track your booking status anytime in your dashboard.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/dashboard/inquiries');
                }}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#062F26] text-white font-bold text-xs hover:bg-brand-teal transition-all shadow-md cursor-pointer"
              >
                Track in Dashboard
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookNowModal;
