import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { sendGenericEmail } from '../utils/emailService.js';
import { getIo } from '../socket.js';

const updateBedStatus = async (propertyId, roomName, bedName) => {
  if (!roomName || !bedName) return;
  const property = await Property.findById(propertyId);
  if (!property || property.propertyType !== 'PG') return;

  // Find all active/pending bookings for this property and bed
  const activeBookings = await Booking.find({
    propertyId,
    'roomDetails.roomName': roomName,
    'roomDetails.bedName': bedName,
    status: { $in: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
  });

  let bedStatus = 'Vacant';
  const hasOccupied = activeBookings.some(b => ['Confirmed', 'Active'].includes(b.status));
  const hasReserved = activeBookings.some(b => ['Pending Request', 'Pending Payment', 'Reserved'].includes(b.status));

  if (hasOccupied) {
    bedStatus = 'Occupied';
  } else if (hasReserved) {
    bedStatus = 'Reserved';
  }

  let bedFound = false;
  for (const floor of property.floors) {
    if (bedFound) break;
    const room = floor.rooms.find(r => r.roomName === roomName);
    if (room) {
      const bed = room.beds.find(b => b.bedName === bedName);
      if (bed) {
        if (bed.status !== 'Maintenance') {
          bed.status = bedStatus;
        }
        bedFound = true;
      }
    }
  }

  if (bedFound) {
    await property.save();
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Tenant)
export const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      moveInDate,
      expectedMoveOutDate,
      personalInfo,
      emergencyContact,
      roomDetails,
      paymentDetails
    } = req.body;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Determine status based on bookingType
    // If property.bookingType is 'Direct Booking', booking is Confirmed automatically
    // Otherwise, it requires owner approval (Pending Request)
    const status = property.bookingType === 'Direct Booking' ? 'Confirmed' : 'Pending Request';

    const booking = new Booking({
      propertyId,
      ownerId: property.owner,
      tenantId: req.user._id,
      propertyType: property.propertyType,
      status,
      moveInDate,
      expectedMoveOutDate,
      personalInfo,
      emergencyContact,
      roomDetails,
      paymentDetails
    });

    const savedBooking = await booking.save();

    // Update bed status based on the initial booking status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    if (status === 'Pending Request') {
      try {
        const io = getIo();
        if (io) {
          io.to(`user_${property.owner.toString()}`).emit('newBookingRequest', { bookingId: savedBooking._id });
        }
      } catch (err) {
        console.error('Socket error on createBooking:', err);
      }
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

// @desc    Get owner's bookings
// @route   GET /api/bookings/owner
// @access  Private (Owner)
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName propertyCategory propertyType images locality city monthlyRent securityAmount maintenanceCharges bookingType pgPricing floors')
      .populate('tenantId', 'fullName email phone profilePic')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    console.error('Fetch owner bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Get tenant's bookings
// @route   GET /api/bookings/tenant
// @access  Private (Tenant)
export const getTenantBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantId: req.user._id })
      .populate('propertyId', 'pgName propertyCategory propertyType images locality city monthlyRent securityAmount maintenanceCharges bookingType pgPricing floors')
      .populate('ownerId', 'fullName email phone profilePic')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    console.error('Fetch tenant bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Update booking status (Approve/Reject/Cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active', 'Rejected', 'Cancelled', 'Completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    // Owner can approve(Confirmed) or reject(Rejected)
    // Tenant can cancel(Cancelled)
    if (booking.ownerId.toString() !== req.user._id.toString() && booking.tenantId.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const previousStatus = booking.status;
    booking.status = status;
    const updatedBooking = await booking.save();

    // Update bed status when booking status changes
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send email if it's being approved for payment
    if (status === 'Pending Payment' && previousStatus !== 'Pending Payment') {
      const tenant = await User.findById(booking.tenantId);
      const property = await Property.findById(booking.propertyId);
      if (tenant && tenant.email && property) {
        const isToken = booking.paymentDetails?.paymentMethod === 'Token Amount' || booking.paymentDetails?.paymentMethod === 'Token (40%)';
        const subject = isToken ? 'Reservation Request Approved - Action Required' : 'Booking Confirmation Approved - Action Required';
        
        const actionText = isToken 
          ? 'pay the Token amount to reserve your bed.' 
          : 'pay the Full amount to confirm your booking.';

        const content = `
          Hello ${tenant.fullName},

          Great news! Your request for ${property.pgName || property.propertyCategory} has been approved by the owner.
          
          To secure this, please log in to your Housynest dashboard and ${actionText}
          
          Booking Details:
          - Property: ${property.pgName || property.propertyCategory}
          - Room: ${booking.roomDetails?.roomName || 'N/A'}
          - Bed: ${booking.roomDetails?.bedName || 'N/A'}
          - Move In Date: ${new Date(booking.moveInDate).toDateString()}

          Thank you for choosing Housynest!
        `;
        await sendGenericEmail(tenant.email, subject, content, null);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

// @desc    Process payment for a booking
// @route   PUT /api/bookings/:id/pay
// @access  Private
export const processPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    // Update payment details and status
    booking.paymentDetails.status = 'Paid';
    booking.paymentDetails.paidAt = new Date();
    const isTokenPayment = booking.paymentDetails.paymentMethod === 'Token Amount' || booking.paymentDetails.paymentMethod === 'Token (40%)';
    booking.status = isTokenPayment ? 'Reserved' : 'Confirmed';

    const updatedBooking = await booking.save();

    // Update bed status when booking status changes via payment
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send confirmation email
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);
    
    if (tenant && tenant.email && property) {
      const isToken = booking.paymentDetails.paymentMethod === 'Token Amount' || booking.paymentDetails.paymentMethod === 'Token (40%)';
      const subject = isToken ? 'Bed Reserved Successfully!' : 'Room Booked Successfully!';
      const content = `
        Hello ${tenant.fullName},

        Congratulations! Your payment of ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')} was successful.
        ${isToken ? 'Your bed is now successfully reserved.' : 'Your room is now successfully booked.'}
        
        Booking Details:
        - Property: ${property.pgName || property.propertyCategory}
        - Room: ${booking.roomDetails?.roomName || 'N/A'}
        - Bed: ${booking.roomDetails?.bedName || 'N/A'}
        - Move In Date: ${new Date(booking.moveInDate).toDateString()}
        - Payment Status: Paid (${booking.paymentDetails.paymentMethod})

        Thank you for choosing Housynest!
      `;
      await sendGenericEmail(tenant.email, subject, content, null);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error processing payment' });
  }
};

// @desc    Process remaining balance payment for a reserved booking
// @route   PUT /api/bookings/:id/pay-balance
// @access  Private
export const payBalance = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    if (booking.status !== 'Reserved') {
      return res.status(400).json({ message: 'Only Reserved bookings can have a balance paid' });
    }

    const remainingAmount = req.body.amount || 0;

    // Update payment details and status
    booking.paymentDetails.amount = Number(booking.paymentDetails.amount) + Number(remainingAmount);
    booking.paymentDetails.paymentMethod = 'Full Payment';
    booking.paymentDetails.paidAt = new Date();
    booking.status = 'Confirmed';

    const updatedBooking = await booking.save();

    // Update bed status when booking status changes via balance payment
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send confirmation email
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);
    
    if (tenant && tenant.email && property) {
      const subject = 'Full Balance Paid - Room Confirmed!';
      const content = `
        Hello ${tenant.fullName},

        Congratulations! Your payment of ₹${remainingAmount.toLocaleString('en-IN')} for the remaining balance was successful.
        Your room is now fully booked and confirmed.
        
        Booking Details:
        - Property: ${property.pgName || property.propertyCategory}
        - Room: ${booking.roomDetails?.roomName || 'N/A'}
        - Bed: ${booking.roomDetails?.bedName || 'N/A'}
        - Move In Date: ${new Date(booking.moveInDate).toDateString()}
        - Total Paid: ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')}
        - Payment Status: Paid (Full Payment)

        Thank you for choosing Housynest!
      `;
      await sendGenericEmail(tenant.email, subject, content, null);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Process balance payment error:', error);
    res.status(500).json({ message: 'Server error processing balance payment' });
  }
};

// @desc    Get rent collection data for owner dashboard
// @route   GET /api/bookings/owner/rent-collection
// @access  Private
export const getOwnerRentCollection = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Fetch all active/completed bookings for the owner
    const bookings = await Booking.find({ 
      ownerId, 
      status: { $in: ['Active', 'Completed', 'Confirmed', 'Reserved'] }
    }).populate('propertyId').populate('tenantId', 'fullName email profileImage');

    let totalCollected = 0;
    let totalPending = 0;
    let onTimeCount = 0;
    let rentList = [];

    const today = new Date();

    bookings.forEach((booking, idx) => {
      // 1. Calculate Rent Amount
      let rentAmount = 14500;
      if (booking.propertyId) {
        if (booking.propertyId.pgPricing && booking.roomDetails && booking.roomDetails.sharingType) {
          const baseType = booking.roomDetails.sharingType.includes('Single') ? 'Single' : booking.roomDetails.sharingType.includes('Double') ? 'Double' : booking.roomDetails.sharingType.includes('Triple') ? 'Triple' : booking.roomDetails.sharingType.includes('Four') ? 'Four' : 'Other';
          const typeStr = `${baseType}_${booking.propertyId.isAC ? 'AC' : 'NonAC'}`;
          if (booking.propertyId.pgPricing[typeStr]?.rentPerBed) {
            rentAmount = Number(booking.propertyId.pgPricing[typeStr].rentPerBed.replace(/\D/g, ''));
          }
        } else if (booking.propertyId.monthlyRent) {
          rentAmount = Number(booking.propertyId.monthlyRent.replace(/\D/g, ''));
        }
      }

      // 2. Calculate Next Due Date
      const moveInDate = booking.moveInDate ? new Date(booking.moveInDate) : new Date(booking.createdAt);
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());
      
      // If due date has passed this month, the next one is next month
      if (nextDueDate < today) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      const diffMs = nextDueDate - today;
      const daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      // 3. Determine Status dynamically based on days due
      let status = 'Paid';
      let statusColor = 'bg-emerald-50 text-brand-teal border-emerald-100';
      
      // If due within 7 days, it's pending (they haven't paid yet for the upcoming cycle)
      // Since we simulate: if nextDueDate is very soon (<= 7 days), it's "Reminder sent" or "Pending"
      if (daysDue <= 7 && daysDue > 0) {
        status = 'Reminder sent';
        statusColor = 'bg-amber-50 text-amber-500 border-amber-100';
        totalPending += rentAmount;
      } else if (nextDueDate < today) {
        // Technically this branch won't be hit with the logic above, but for robustness
        status = 'Overdue';
        statusColor = 'bg-red-50 text-red-500 border-red-100';
        totalPending += rentAmount;
      } else {
        // If it's more than 7 days away, assume they paid this month's rent early or last month's rent on time
        status = 'Paid';
        statusColor = 'bg-emerald-50 text-brand-teal border-emerald-100';
        totalCollected += rentAmount;
        onTimeCount++;
      }

      const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      rentList.push({
        id: booking._id,
        propertyId: booking.propertyId ? booking.propertyId._id : null,
        name: booking.tenantId ? booking.tenantId.fullName : (booking.personalInfo?.firstName + ' ' + booking.personalInfo?.lastName),
        amount: `₹${rentAmount.toLocaleString('en-IN')}`,
        rawAmount: rentAmount,
        date: `Due ${formatDate(nextDueDate)}`,
        rawDate: nextDueDate,
        method: status === 'Paid' ? 'UPI' : '—', // Simulating payment method
        status,
        statusColor
      });
    });

    const totalExpected = totalCollected + totalPending;
    const onTimePercentage = bookings.length > 0 ? Math.round((onTimeCount / bookings.length) * 100) : 100;

    const summary = [
      { id: 1, title: `₹${(totalCollected / 100000).toFixed(1)}L`, subtitle: `Collected (of ₹${(totalExpected / 100000).toFixed(1)}L)`, icon: 'lucide:wallet', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${totalExpected > 0 ? (totalCollected/totalExpected)*100 : 0}%]`, progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-[#062F26] hover:border-[#062F26]', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-slate-300' },
      { id: 2, title: `${onTimePercentage}%`, subtitle: `On Time (${onTimeCount}/${bookings.length})`, icon: 'lucide:calendar-check', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${onTimePercentage}%]`, progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-brand-teal hover:border-brand-teal', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-emerald-50' },
      { id: 3, title: `₹${totalPending >= 100000 ? (totalPending/100000).toFixed(1) + 'L' : totalPending.toLocaleString('en-IN')}`, subtitle: `Pending (${bookings.length - onTimeCount} tenants)`, icon: 'lucide:clock', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${totalExpected > 0 ? (totalPending/totalExpected)*100 : 0}%]`, progressBg: 'bg-amber-500', hoverBg: 'hover:bg-amber-500 hover:border-amber-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-amber-100' },
      { id: 4, title: bookings.length > 0 ? '24' : '0', subtitle: 'AI Reminder Calls', icon: 'lucide:bot', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: 'w-[100%]', progressBg: 'bg-indigo-500', hoverBg: 'hover:bg-indigo-500 hover:border-indigo-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-indigo-100' },
    ];

    // Sort rentList by due date
    rentList.sort((a, b) => a.rawDate - b.rawDate);

    res.json({
      summaryData: summary,
      rentData: rentList
    });
  } catch (error) {
    console.error('Error fetching rent collection:', error);
    res.status(500).json({ message: 'Server error fetching rent collection' });
  }
};
