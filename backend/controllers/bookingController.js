import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendGenericEmail } from '../utils/emailService.js';
import puppeteer from 'puppeteer';
import { getIo } from '../socket.js';
import { triggerRoomAvailabilityAlerts } from './waitlistController.js';

const updateBedStatus = async (propertyId, roomName, bedName) => {
  if (!roomName || !bedName) return;
  const property = await Property.findById(propertyId);
  if (!property || property.propertyType !== 'PG') return;

  // Find all active/pending bookings for this property and bed
  const activeBookings = await Booking.find({
    propertyId,
    'roomDetails.roomName': roomName,
    'roomDetails.bedName': bedName,
    status: { $in: ['Reserved', 'Confirmed', 'Active'] }
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
    if (bedStatus === 'Vacant') {
      triggerRoomAvailabilityAlerts(propertyId, roomName);
    }
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

    // Validate propertyId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID. This seems to be a mock property rather than a real one in the database.' });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for double bookings
    if (property.propertyType === 'PG' && roomDetails?.roomName && roomDetails?.bedName) {
      const activeBookings = await Booking.find({
        propertyId,
        'roomDetails.roomName': roomDetails.roomName,
        'roomDetails.bedName': roomDetails.bedName,
        status: { $in: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });

      if (activeBookings.length > 0) {
        return res.status(400).json({ message: 'This bed is already booked or reserved.' });
      }
    } else if (property.propertyType === 'Tenant') {
      const activeBookings = await Booking.find({
        propertyId,
        status: { $in: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });
      if (activeBookings.length > 0) {
        return res.status(400).json({ message: 'This property is already booked or reserved.' });
      }
    }

    // Determine status: all bookings now require owner approval (Pending Request) by default
    const status = 'Pending Request';

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
    const fs = await import('fs');
    fs.appendFileSync('booking_error.log', JSON.stringify({ body: req.body, error: error.message, stack: error.stack }) + '\n');
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Server error creating booking',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get owner's bookings
// @route   GET /api/bookings/owner
// @access  Private (Owner)
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName societyName propertyCategory propertyType address images locality city monthlyRent securityAmount maintenanceCharges pgPricing floors')
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
      .populate('propertyId', 'pgName societyName propertyCategory propertyType address images locality city monthlyRent securityAmount maintenanceCharges pgPricing floors')
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

          Great news! Your request for ${property.pgName || property.societyName || 'Property'} has been approved by the owner.
          
          To secure this, please log in to your Housynest dashboard and ${actionText}
          
          Booking Details:
          - Property: ${property.pgName || property.societyName || 'Property'}
          - Room: ${booking.roomDetails?.roomName || 'N/A'}
          - Bed: ${booking.roomDetails?.bedName || 'N/A'}
          - Move In Date: ${new Date(booking.moveInDate).toDateString()}

          Thank you for choosing Housynest!
        `;
        await sendGenericEmail(tenant.email, subject, content, null);
      }
    }

    try {
      const io = getIo();
      if (io) {
        // Emit to tenant
        io.to(`user_${booking.tenantId.toString()}`).emit('bookingStatusUpdated', { bookingId: updatedBooking._id, status: updatedBooking.status });
        // Emit to owner
        io.to(`user_${booking.ownerId.toString()}`).emit('bookingStatusUpdated', { bookingId: updatedBooking._id, status: updatedBooking.status });
      }
    } catch (err) {
      console.error('Socket error on updateBookingStatus:', err);
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
    const isTokenPayment = booking.paymentDetails.paymentMethod === 'Token Amount' || booking.paymentDetails.paymentMethod === 'Token (40%)';
    booking.paymentDetails.status = isTokenPayment ? 'Partial' : 'Paid';
    booking.paymentDetails.paidAt = new Date();
    booking.status = isTokenPayment ? 'Reserved' : 'Confirmed';

    // Trigger E-stamp simulation automatically when Confirmed
    if (booking.status === 'Confirmed') {
      booking.eStampStatus = 'Processing';
      booking.eSignStatus = 'Pending';
      // Simulate webhook delay for e-stamp generation
      setTimeout(async () => {
        try {
          const b = await import('../models/Booking.js').then(m => m.default).then(BookingModel => BookingModel.findById(booking._id));
          if (b) {
            b.eStampStatus = 'Completed';
            b.eStampId = 'ESTAMP-' + Date.now();
            await b.save();
          }
        } catch (e) {
          console.error('Error in e-stamp simulation:', e);
        }
      }, 5000);
    }

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
        - Property: ${property.pgName || property.societyName || 'Property'}
        - Room: ${booking.roomDetails?.roomName || 'N/A'}
        - Bed: ${booking.roomDetails?.bedName || 'N/A'}
        - Move In Date: ${new Date(booking.moveInDate).toDateString()}
        - Payment Status: Paid (${booking.paymentDetails.paymentMethod})

        Thank you for choosing Housynest!
      `;
      await sendGenericEmail(tenant.email, subject, content, null);

      // --- Notify Owner ---
      const owner = await User.findById(property.owner);
      if (owner && owner.email) {
        const ownerSubject = isToken ? 'New Bed Reservation!' : 'New Room Booking!';
        const ownerContent = `
          Hello ${owner.fullName},

          Great news! A new booking payment has been made for your property.
          
          Booking Details:
          - Property: ${property.pgName || property.societyName || 'Property'}
          - Room: ${booking.roomDetails?.roomName || 'N/A'}
          - Bed: ${booking.roomDetails?.bedName || 'N/A'}
          - Tenant Name: ${tenant.fullName}
          - Move In Date: ${new Date(booking.moveInDate).toDateString()}
          - Payment Received: ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')} (${booking.paymentDetails.paymentMethod})

          Please log in to your dashboard to view more details.
        `;
        await sendGenericEmail(owner.email, ownerSubject, ownerContent, null);
      }
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
    booking.paymentDetails.status = 'Paid';
    booking.paymentDetails.paidAt = new Date();
    booking.status = 'Confirmed';

    // Trigger E-stamp simulation automatically when Confirmed
    if (booking.status === 'Confirmed') {
      booking.eStampStatus = 'Processing';
      booking.eSignStatus = 'Pending';
      // Simulate webhook delay for e-stamp generation
      setTimeout(async () => {
        try {
          const b = await import('../models/Booking.js').then(m => m.default).then(BookingModel => BookingModel.findById(booking._id));
          if (b) {
            b.eStampStatus = 'Completed';
            b.eStampId = 'ESTAMP-' + Date.now();
            await b.save();
          }
        } catch (e) {
          console.error('Error in e-stamp simulation:', e);
        }
      }, 5000);
    }

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
        - Property: ${property.pgName || property.societyName || 'Property'}
        - Room: ${booking.roomDetails?.roomName || 'N/A'}
        - Bed: ${booking.roomDetails?.bedName || 'N/A'}
        - Move In Date: ${new Date(booking.moveInDate).toDateString()}
        - Total Paid: ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')}
        - Payment Status: Paid (Full Payment)

        Thank you for choosing Housynest!
      `;
      await sendGenericEmail(tenant.email, subject, content, null);

      // --- Notify Owner ---
      const owner = await User.findById(property.owner);
      if (owner && owner.email) {
        const ownerSubject = 'Full Balance Received for Booking!';
        const ownerContent = `
          Hello ${owner.fullName},

          Great news! The tenant ${tenant.fullName} has paid the remaining balance of ₹${remainingAmount.toLocaleString('en-IN')}.
          The booking is now fully confirmed.
          
          Booking Details:
          - Property: ${property.pgName || property.societyName || 'Property'}
          - Room: ${booking.roomDetails?.roomName || 'N/A'}
          - Bed: ${booking.roomDetails?.bedName || 'N/A'}
          - Total Paid: ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')}

          Please log in to your dashboard to view more details.
        `;
        await sendGenericEmail(owner.email, ownerSubject, ownerContent, null);
      }
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
      { id: 1, title: `₹${(totalCollected / 100000).toFixed(1)}L`, subtitle: `Collected (of ₹${(totalExpected / 100000).toFixed(1)}L)`, icon: 'lucide:wallet', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0}%]`, progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-[#062F26] hover:border-[#062F26]', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-slate-300' },
      { id: 2, title: `${onTimePercentage}%`, subtitle: `On Time (${onTimeCount}/${bookings.length})`, icon: 'lucide:calendar-check', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${onTimePercentage}%]`, progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-brand-teal hover:border-brand-teal', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-emerald-50' },
      { id: 3, title: `₹${totalPending >= 100000 ? (totalPending / 100000).toFixed(1) + 'L' : totalPending.toLocaleString('en-IN')}`, subtitle: `Pending (${bookings.length - onTimeCount} tenants)`, icon: 'lucide:clock', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${totalExpected > 0 ? (totalPending / totalExpected) * 100 : 0}%]`, progressBg: 'bg-amber-500', hoverBg: 'hover:bg-amber-500 hover:border-amber-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-amber-100' },
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

// @desc    Auto-activate bookings whose move-in date has arrived
// @route   N/A (Cron Job)
// @access  Internal
export const autoActivateBookings = async () => {
  try {
    const today = new Date();
    // Reset time to start of day for comparison
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      status: { $in: ['Confirmed', 'Reserved'] },
      moveInDate: { $lte: today }
    });

    for (const booking of bookings) {
      booking.status = 'Active';
      const updatedBooking = await booking.save();

      // Update bed status when booking status changes via auto-activation
      if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
        await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
      }
    }

    if (bookings.length > 0) {
      console.log(`[Cron] Auto-activated ${bookings.length} bookings successfully.`);
    }
  } catch (error) {
    console.error('[Cron] Error auto-activating bookings:', error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('propertyId', 'pgName societyName propertyCategory propertyType city locality address images price rent')
      .populate('tenantId', 'fullName email phone profilePic')
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin bookings', error: error.message });
  }
};

// @desc    Confirm move-in by tenant and trigger payout
// @route   PUT /api/bookings/:id/confirm-move-in
// @access  Private (Tenant)
export const confirmMoveIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tenantId')
      .populate('ownerId')
      .populate('propertyId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the tenant can confirm move-in' });
    }

    if (booking.tenantConfirmedMoveIn) {
      return res.status(400).json({ message: 'Move-in already confirmed' });
    }

    // Set confirmation and trigger payout
    booking.tenantConfirmedMoveIn = true;
    booking.moveInConfirmedAt = new Date();
    booking.payoutStatus = 'Paid'; // Escrow payout simulated as Paid immediately
    booking.status = 'Active'; // Change status to Active upon move-in confirmation

    const updatedBooking = await booking.save();

    // Send emails
    try {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';

      // Email to Owner
      if (booking.ownerId && booking.ownerId.email) {
        const ownerSubject = `Move-in Confirmed & Payout Initiated - ${propertyName}`;
        const ownerContent = `
          Hello ${booking.ownerId.fullName},

          Great news! Your tenant, ${booking.tenantId.fullName}, has successfully confirmed their move-in for ${propertyName}.
          
          The rent and security deposit collected by Housynest have now been released from Escrow and the payout has been initiated to your registered bank account.
          
          Booking Details:
          - Property: ${propertyName}
          - Tenant: ${booking.tenantId.fullName}
          - Move-in Date: ${new Date(booking.moveInDate).toDateString()}
          - Payout Status: Released

          Thank you for choosing Housynest!
        `;
        await sendGenericEmail(booking.ownerId.email, ownerSubject, ownerContent, null);
      }

      // Email to Tenant
      if (booking.tenantId && booking.tenantId.email) {
        const tenantSubject = `Move-in Confirmation Successful - ${propertyName}`;
        const tenantContent = `
          Hello ${booking.tenantId.fullName},

          Thank you for confirming your move-in at ${propertyName}.
          
          Your initial rent and security deposit have now been released from Escrow and transferred to the owner.
          We hope you have a wonderful stay!
          
          If you face any issues, feel free to contact Housynest support.

          Thank you for choosing Housynest!
        `;
        await sendGenericEmail(booking.tenantId.email, tenantSubject, tenantContent, null);
      }
    } catch (emailErr) {
      console.error('Error sending move-in confirmation emails:', emailErr);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Confirm move-in error:', error);
    res.status(500).json({ message: 'Server error confirming move-in' });
  }
};

// @desc    Request Move Out (Tenant)
// @route   POST /api/bookings/:id/request-move-out
// @access  Private (Tenant only)
export const requestMoveOut = async (req, res) => {
  try {
    const { intendedMoveOutDate, reason } = req.body;

    if (!intendedMoveOutDate) {
      return res.status(400).json({ message: 'Intended move-out date is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('ownerId', 'email fullName')
      .populate('tenantId', 'fullName email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the tenant can request a move-out' });
    }

    booking.moveOutRequest = {
      isRequested: true,
      requestedAt: new Date(),
      intendedMoveOutDate: new Date(intendedMoveOutDate),
      status: 'Pending',
      reason: reason || ''
    };

    const updatedBooking = await booking.save();

    // Send email to owner
    if (booking.ownerId && booking.ownerId.email) {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
      const ownerSubject = `Move-out Requested - ${propertyName}`;
      const ownerContent = `
        Hello ${booking.ownerId.fullName},

        Your tenant, ${booking.tenantId.fullName}, has requested to move out from ${propertyName}.
        Intended Move-out Date: ${new Date(intendedMoveOutDate).toDateString()}
        Reason: ${reason || 'Not specified'}

        Please log in to your dashboard to review this request and process the final checkout.

        Thank you!
      `;
      try {
        await sendGenericEmail(booking.ownerId.email, ownerSubject, ownerContent, null);
      } catch (e) {
        console.error('Error sending move-out request email:', e);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Request move out error:', error);
    res.status(500).json({ message: 'Server error requesting move out' });
  }
};

// @desc    Reject Move Out Request (Owner)
// @route   POST /api/bookings/:id/reject-move-out
// @access  Private (Owner only)
export const rejectMoveOut = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('tenantId', 'email fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can reject a move-out request' });
    }

    if (!booking.moveOutRequest || !booking.moveOutRequest.isRequested) {
      return res.status(400).json({ message: 'No move-out request found' });
    }

    booking.moveOutRequest.status = 'Rejected';
    booking.moveOutRequest.rejectionReason = rejectionReason;

    const updatedBooking = await booking.save();

    // Send email to tenant
    if (booking.tenantId && booking.tenantId.email) {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
      const tenantSubject = `Move-out Request Rejected - ${propertyName}`;
      const tenantContent = `
        Hello ${booking.tenantId.fullName},

        Your request to move out from ${propertyName} on ${new Date(booking.moveOutRequest.intendedMoveOutDate).toDateString()} has been rejected by the owner.
        
        Reason for rejection:
        ${rejectionReason}

        Please log in to your dashboard to clear any pending dues or contact the owner for more details.

        Thank you!
      `;
      try {
        await sendGenericEmail(booking.tenantId.email, tenantSubject, tenantContent, null);
      } catch (e) {
        console.error('Error sending rejection email:', e);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Reject move out error:', error);
    res.status(500).json({ message: 'Server error rejecting move out' });
  }
};

// @desc    Process Checkout (Owner)
// @route   POST /api/bookings/:id/process-checkout
// @access  Private (Owner only)
export const processCheckout = async (req, res) => {
  try {
    const { deductions } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('tenantId', 'email fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can process a checkout' });
    }

    if (!booking.moveOutRequest || !booking.moveOutRequest.isRequested) {
      // If the owner is checking them out without a formal request, we can auto-fill it
      booking.moveOutRequest = {
        isRequested: true,
        requestedAt: new Date(),
        intendedMoveOutDate: new Date(),
      };
    }

    booking.moveOutRequest.status = 'Completed';
    booking.moveOutRequest.deductions = deductions || 0;

    // Mark the entire booking as completed
    booking.status = 'Completed';
    booking.expectedMoveOutDate = new Date(); // Actual move out date

    const updatedBooking = await booking.save();

    // Update bed status
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send email to tenant
    if (booking.tenantId && booking.tenantId.email) {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
      const tenantSubject = `Checkout Completed - ${propertyName}`;
      const tenantContent = `
        Hello ${booking.tenantId.fullName},

        The owner has processed your final checkout for ${propertyName}.
        
        Final Settlement Details:
        - Security Deposit Deductions (Damages/Dues): ₹${deductions || 0}
        
        We hope you had a great stay!

        Thank you for choosing Housynest.
      `;
      try {
        await sendGenericEmail(booking.tenantId.email, tenantSubject, tenantContent, null);
      } catch (e) {
        console.error('Error sending checkout email:', e);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Process checkout error:', error);
    res.status(500).json({ message: 'Server error processing checkout' });
  }
};

// @desc    Email Agreement PDF
// @route   POST /api/bookings/:id/email-agreement
// @access  Private
export const emailAgreement = async (req, res) => {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ message: 'HTML content is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('tenantId', 'email fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the requester is either the tenant or the admin/owner
    if (booking.tenantId._id.toString() !== req.user._id.toString() && booking.ownerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to email this agreement' });
    }

    if (!booking.tenantId || !booking.tenantId.email) {
      return res.status(400).json({ message: 'Tenant email not found' });
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();

    const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
    const subject = `Your Rental Agreement - ${propertyName}`;
    const textContent = `
      Hello ${booking.tenantId.fullName},

      Please find attached the PDF copy of your rental agreement for ${propertyName}.

      Thank you for choosing Housynest!
    `;

    // Email attachment using the existing email service setup
    // Since sendGenericEmail might not support attachments easily out of the box, we will manually send via nodemailer 
    // or modify our sendGenericEmail if it supports it.
    // Let's check if we can pass attachments to sendGenericEmail. 
    // Usually it doesn't, so let's import nodemailer dynamically or assume sendGenericEmail handles it.
    // Wait, let's just use nodemailer directly here to be safe, as it's standard.

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: booking.tenantId.email,
      subject: subject,
      text: textContent,
      attachments: [
        {
          filename: 'Rental_Agreement.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Agreement PDF emailed successfully' });
  } catch (error) {
    console.error('Email agreement error:', error);
    res.status(500).json({ message: 'Server error sending agreement email' });
  }
};

// @desc    Update Consent Status (Aadhaar OTP verified by frontend)
// @route   PUT /api/bookings/:id/consent
// @access  Private
export const updateBookingConsent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tenantId')
      .populate('ownerId')
      .populate('propertyId');
      
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let isTenantConsenting = false;
    if (booking.tenantId._id.toString() === req.user._id.toString()) {
      booking.tenantConsentStatus = 'Consented';
      booking.eSignStatus = 'Completed';
      booking.eStampStatus = 'Completed';
      if (!booking.eStampId) {
         booking.eStampId = 'ESTAMP-' + Date.now();
      }
      isTenantConsenting = true;
    } else if (booking.ownerId && booking.ownerId._id.toString() === req.user._id.toString()) {
      booking.ownerConsentStatus = 'Consented';
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedBooking = await booking.save();

    // Automatically generate and send PDF if tenant just consented
    if (isTenantConsenting) {
      // Run asynchronously so we don't block the API response
      (async () => {
         try {
           const tenant = booking.tenantId;
           const property = booking.propertyId;
           const owner = booking.ownerId;
           
           if (!tenant || !property) return;
           
           const actualOwnerId = owner ? owner._id : property.owner;
           const actualOwner = owner ? owner : await User.findById(actualOwnerId);

           const htmlContent = `
            <html>
              <body style="font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6;">
                <h1 style="text-align: center; color: #0AA87D;">Rental Agreement</h1>
                <hr style="border: 1px solid #eee; margin-bottom: 20px;"/>
                <h3 style="color: #475569;">Property Details</h3>
                <p><strong>Property Name:</strong> ${property.pgName || property.societyName || 'N/A'}</p>
                <p><strong>Address:</strong> ${property.address || 'N/A'}</p>
                
                <h3 style="color: #475569; margin-top: 20px;">Tenant Details</h3>
                <p><strong>Name:</strong> ${tenant.fullName}</p>
                <p><strong>Email:</strong> ${tenant.email}</p>
                
                <h3 style="color: #475569; margin-top: 20px;">Booking Details</h3>
                <p><strong>Room:</strong> ${booking.roomDetails?.roomName || 'N/A'}</p>
                <p><strong>Bed:</strong> ${booking.roomDetails?.bedName || 'N/A'}</p>
                <p><strong>Move-in Date:</strong> ${new Date(booking.moveInDate).toDateString()}</p>
                <p><strong>Rent Amount:</strong> ₹${booking.paymentDetails?.amount?.toLocaleString('en-IN') || 'N/A'}</p>
                
                <br/><br/>
                <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0AA87D;">
                  <p style="margin: 0;"><em>This is a digitally signed agreement. (e-Sign Completed)</em></p>
                  <p style="margin: 5px 0 0 0;"><strong>e-Stamp ID:</strong> ${booking.eStampId || 'Pending'}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Date of Signature:</strong> ${new Date().toDateString()}</p>
                </div>
              </body>
            </html>
           `;
           
           const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
           const page = await browser.newPage();
           await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
           const pdfBuffer = await page.pdf({
             format: 'A4',
             printBackground: true,
             margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
           });
           await browser.close();

           const propertyName = property.pgName || property.societyName || 'Property';
           const subject = `Your Rental Agreement - ${propertyName}`;
           
           const textContentTenant = `
             Hello ${tenant.fullName},
       
             Congratulations on completing your e-Sign!
             Please find attached the PDF copy of your finalized rental agreement for ${propertyName}.
       
             Thank you for choosing Housynest!
           `;
           
           const textContentOwner = `
             Hello ${actualOwner.fullName},
       
             Great news! The tenant ${tenant.fullName} has successfully completed the e-Sign for ${propertyName}.
             Please find attached the PDF copy of the finalized rental agreement.
       
             Thank you for choosing Housynest!
           `;

           const attachments = [{
             filename: 'Rental_Agreement.pdf',
             content: pdfBuffer,
             contentType: 'application/pdf'
           }];

           // Send emails in parallel
           const emailPromises = [];
           if (tenant.email) {
             emailPromises.push(sendGenericEmail(tenant.email, subject, textContentTenant, null, attachments));
           }
           if (actualOwner && actualOwner.email) {
             emailPromises.push(sendGenericEmail(actualOwner.email, subject, textContentOwner, null, attachments));
           }
           
           await Promise.all(emailPromises);

         } catch (err) {
           console.error('Error generating/sending auto PDF agreement:', err);
         }
      })();
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking consent error:', error);
    res.status(500).json({ message: 'Server error updating consent' });
  }
};

// @desc    Trigger E-Stamp and E-Sign process (simulated)
// @route   PUT /api/bookings/:id/trigger-estamp
// @access  Private
export const triggerEStampAndSign = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // In a real scenario, this is triggered post-payment by a webhook.
    // We simulate API delays
    booking.eStampStatus = 'Processing';
    booking.eSignStatus = 'Processing';
    await booking.save();

    setTimeout(async () => {
      booking.eStampStatus = 'Completed';
      booking.eStampId = 'ESTAMP-' + Date.now();
      booking.eSignStatus = 'Completed';
      booking.finalDocumentUrl = 'https://example.com/signed-document.pdf';
      await booking.save();
    }, 5000); // 5 sec simulated delay

    res.json({ message: 'E-Stamp and E-Sign process initiated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error triggering e-stamp' });
  }
};

// @desc    Send a booking request (Phase 1)
// @route   POST /api/bookings/request
// @access  Private
export const requestBooking = async (req, res) => {
  try {
    const { propertyId, moveInDate, roomDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for double bookings if PG
    if (property.propertyType === 'PG' && roomDetails?.roomName && roomDetails?.bedName) {
      const activeBookings = await Booking.find({
        propertyId,
        'roomDetails.roomName': roomDetails.roomName,
        'roomDetails.bedName': roomDetails.bedName,
        status: { $in: ['Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });
      if (activeBookings.length > 0) {
        return res.status(400).json({ message: 'This bed is already booked or reserved.' });
      }
    }

    const bookingId = `BKG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newBooking = new Booking({
      bookingId,
      propertyId,
      ownerId: property.owner,
      tenantId: req.user._id,
      status: 'Pending Request',
      propertyType: property.propertyType,
      moveInDate,
      roomDetails: roomDetails || {},
      personalInfo: {}, // To be filled later
      emergencyContact: {}, // To be filled later
      paymentDetails: {
        amount: 0,
        status: 'Pending'
      }
    });

    const savedBooking = await newBooking.save();

    // Update bed status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    // Send email to owner
    const owner = await User.findById(property.owner);
    const tenant = req.user;
    const propName = property.societyName || property.pgName || property.propertyCategory || 'Property';
    
    if (owner && owner.email) {
      const ownerSubject = `New Booking Request for ${propName}`;
      const ownerContent = `Hello ${owner.name},\n\nYou have a new booking request for ${propName} from ${tenant.name}. Move-in date is requested for ${new Date(moveInDate).toDateString()}.\n\nPlease log in to your dashboard to review and accept this request.\n\nThanks,\nHousynest Team`;
      await sendGenericEmail(owner.email, ownerSubject, ownerContent, null).catch(err => console.error("Email error:", err));
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating booking request' });
  }
};

// @desc    Accept a booking request (Phase 2)
// @route   PUT /api/bookings/:id/accept-request
// @access  Private (Owner)
export const acceptBookingRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'Pending Payment';
    const savedBooking = await booking.save();

    // Update bed status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    // Send email to tenant
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);
    const propName = property?.societyName || property?.pgName || property?.propertyCategory || 'Property';
    if (tenant && tenant.email) {
      const subject = `Booking Request Accepted for ${propName}`;
      const content = `Hello ${tenant.name},\n\nGreat news! Your booking request for ${propName} has been accepted by the owner.\n\nPlease log in to your Housynest dashboard and navigate to "My Bookings" to complete the payment and finalise your move-in.\n\nThanks,\nHousynest Team`;
      await sendGenericEmail(tenant.email, subject, content, null).catch(err => console.error("Email error:", err));
    }

    res.json({ message: 'Request accepted successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject a booking request
// @route   PUT /api/bookings/:id/reject-request
// @access  Private (Owner)
export const rejectBookingRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'Rejected';
    const savedBooking = await booking.save();

    // Update bed status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    // Send email to tenant
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);
    const propName = property?.societyName || property?.pgName || property?.propertyCategory || 'Property';
    if (tenant && tenant.email) {
      const subject = `Booking Request Update for ${propName}`;
      const content = `Hello ${tenant.name},\n\nUnfortunately, your booking request for ${propName} could not be accepted at this time.\n\nPlease explore other properties on Housynest.\n\nThanks,\nHousynest Team`;
      await sendGenericEmail(tenant.email, subject, content, null).catch(err => console.error("Email error:", err));
    }

    res.json({ message: 'Request rejected successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete booking details (Phase 2 of booking flow)
// @route   PUT /api/bookings/:id/complete
// @access  Private
export const completeBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { personalInfo, emergencyContact, paymentDetails } = req.body;

    booking.personalInfo = personalInfo || booking.personalInfo;
    booking.emergencyContact = emergencyContact || booking.emergencyContact;
    
    if (paymentDetails) {
      booking.paymentDetails = {
        ...booking.paymentDetails,
        ...paymentDetails
      };
      
      if (paymentDetails.status === 'Paid' || paymentDetails.status === 'Partial') {
        booking.paymentDetails.paidAt = new Date();
        const isTokenPayment = paymentDetails.paymentMethod === 'Token Amount' || paymentDetails.paymentMethod === 'Token (40%)';
        booking.status = isTokenPayment ? 'Reserved' : 'Confirmed';
        booking.paymentDetails.status = isTokenPayment ? 'Partial' : 'Paid';

        if (booking.status === 'Confirmed') {
          booking.eStampStatus = 'Processing';
          booking.eSignStatus = 'Pending';
        }
      }
    }

    const updatedBooking = await booking.save();

    // Update bed status
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error completing booking details' });
  }
};
