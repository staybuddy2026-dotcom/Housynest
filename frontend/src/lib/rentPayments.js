import { getBookingPricing, STAMP_FEES } from './rentPricing';

export const propertyNameOf = (property) =>
  property ? property.societyName || property.pgName || property.propertyCategory || 'Property' : 'Property';

export const roomLabelOf = (booking) => {
  if (booking?.propertyId?.propertyType === 'Tenant') return 'Entire Property';
  const room = booking?.roomDetails;
  if (!room?.roomName) return 'Entire Property';
  return room.bedName ? `${room.roomName} • ${room.bedName}` : room.roomName;
};

/**
 * Everything the tenant has paid or owes, built the same way as the app (and the Pay Rent page):
 * - every rent invoice whose booking still exists (the server also lists paid booking payments here);
 * - for a booking with no open invoice, the token/full payment owed once the owner approves it,
 *   or the balance owed after a token.
 */
export const buildPayments = (invoices, bookings) => {
  const bookingById = Object.fromEntries(bookings.map(b => [b._id, b]));
  const items = [];

  for (const inv of invoices) {
    const bookingId = inv.bookingId?._id || inv.bookingId;
    // An invoice whose booking was deleted can't be opened or paid from its booking page.
    if (!bookingId || inv.status === 'Cancelled') continue;
    const booking = bookingById[bookingId];
    const isBookingPayment = String(inv._id) === String(bookingId);
    items.push({
      id: inv._id,
      kind: 'invoice',
      bookingId,
      booking,
      invoice: inv,
      category: isBookingPayment && (inv.paymentMethod || '').includes('Token') ? 'token' : 'rent',
      title: propertyNameOf(booking?.propertyId || inv.propertyId),
      room: booking ? roomLabelOf(booking) : (inv.bookingId?.roomDetails?.roomName ? `${inv.bookingId.roomDetails.roomName} • ${inv.bookingId.roomDetails.bedName}` : 'Entire Property'),
      amount: inv.amount || 0,
      dueDate: inv.dueDate,
      paidAt: inv.paidAt,
      paymentMethod: inv.paymentMethod,
      status: inv.status,
      periodStart: inv.billingPeriodStart,
      periodEnd: inv.billingPeriodEnd,
      isBookingPayment
    });
  }

  for (const b of bookings) {
    if (b.status !== 'Pending Payment' && b.status !== 'Reserved') continue;
    const hasOpenInvoice = items.some(i => i.bookingId === b._id && !i.isBookingPayment && i.status !== 'Paid');
    if (hasOpenInvoice) continue;
    const pricing = getBookingPricing(b);
    const fullAmount = pricing.rent + pricing.deposit + pricing.maintenance + STAMP_FEES;
    const isToken = (b.paymentDetails?.paymentMethod || '').includes('Token');
    const moveIn = b.moveInDate || new Date().toISOString();
    // Like the Pay Rent page: a booking payment covers the first month from move-in.
    const firstPeriodEnd = new Date(moveIn);
    firstPeriodEnd.setMonth(firstPeriodEnd.getMonth() + 1);
    const period = { periodStart: moveIn, periodEnd: firstPeriodEnd.toISOString() };
    if (b.status === 'Pending Payment') {
      items.push({
        id: `initial:${b._id}`, kind: 'initial', bookingId: b._id, booking: b,
        category: isToken ? 'token' : 'rent', title: propertyNameOf(b.propertyId), room: roomLabelOf(b),
        amount: isToken ? Number(b.paymentDetails?.amount || 0) : fullAmount,
        dueDate: new Date().toISOString(), status: 'Pending', ...period
      });
    } else {
      const tokenPaid = Number(b.paymentDetails?.amount || 0);
      items.push({
        id: `balance:${b._id}`, kind: 'balance', bookingId: b._id, booking: b,
        category: 'rent', title: propertyNameOf(b.propertyId), room: roomLabelOf(b),
        amount: fullAmount > 0 ? fullAmount - tokenPaid : 0,
        dueDate: moveIn, status: new Date(moveIn) < new Date() ? 'Overdue' : 'Pending', ...period
      });
    }
  }

  return items.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
};
