// Rent / deposit / maintenance for a booking: the booked room's sharing type and AC decide the PG price.
// Shared by the Pay Rent page and the Rent Payments page so both always show the same amounts.
export const getBookingPricing = (booking) => {
  if (booking?.propertyId?.propertyType === 'PG' && booking.roomDetails?.sharingType) {
    const floor = booking.propertyId.floors?.find(f => f.floorName === booking.roomDetails.floorName);
    const room = floor?.rooms?.find(r => r.roomName === booking.roomDetails.roomName);
    let baseType;
    let isAC;

    if (room) {
      baseType = room.sharingType || 'Single';
      isAC = room.isAC;
    } else {
      const st = booking.roomDetails.sharingType;
      baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
      isAC = st.includes('(AC)');
    }
    const pricing = booking.propertyId.pgPricing?.[`${baseType}_${isAC ? 'AC' : 'NonAC'}`];
    if (pricing) {
      return {
        rent: Number(pricing.rentPerBed?.replace(/\D/g, '') || 0),
        deposit: Number(pricing.depositPerBed?.replace(/\D/g, '') || 0),
        maintenance: 0
      };
    }
  }
  return {
    rent: Number(booking?.propertyId?.monthlyRent?.replace(/\D/g, '') || 0),
    deposit: Number(booking?.propertyId?.securityAmount?.replace(/\D/g, '') || 0),
    maintenance: Number(booking?.propertyId?.maintenanceCharges?.replace(/\D/g, '') || 0)
  };
};

// ₹300 stamp duty + ₹500 agreement fee, charged with the first (move-in) payment.
export const STAMP_FEES = 800;
