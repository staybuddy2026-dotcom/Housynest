import RentInvoice from '../models/RentInvoice.js';
import Booking from '../models/Booking.js';
import { sendGenericEmail } from '../utils/emailService.js';
import User from '../models/User.js';
import Property from '../models/Property.js';

// @desc    Get owner's invoices
// @route   GET /api/invoices/owner
// @access  Private (Owner)
export const getOwnerInvoices = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Automatically update overdue invoices in the database
    await RentInvoice.updateMany(
      { status: 'Pending', dueDate: { $lt: today } },
      { $set: { status: 'Overdue' } }
    );

    let invoices = await RentInvoice.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName societyName propertyCategory')
      .populate('tenantId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'roomDetails personalInfo'
      })
      .lean();
      
    // Inject initial booking payments
    const bookings = await Booking.find({ ownerId: req.user._id, 'paymentDetails.status': 'Paid', moveInDate: { $exists: true } })
      .populate('propertyId', 'pgName societyName propertyCategory')
      .populate('tenantId', 'fullName email phone')
      .lean();
      
    for (const b of bookings) {
      const moveIn = new Date(b.moveInDate);
      const endOfFirstMonth = new Date(moveIn);
      endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() + 1);
      
      invoices.push({
        _id: b._id,
        bookingId: {
          _id: b._id,
          roomDetails: b.roomDetails,
          personalInfo: b.personalInfo
        },
        tenantId: b.tenantId,
        ownerId: b.ownerId,
        propertyId: b.propertyId,
        amount: b.paymentDetails.amount,
        dueDate: moveIn,
        billingPeriodStart: moveIn,
        billingPeriodEnd: endOfFirstMonth,
        status: 'Paid',
        paymentMethod: b.paymentDetails.paymentMethod,
        paidAt: b.paymentDetails.paidAt || b.createdAt
      });
    }

    invoices.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching owner invoices:', error);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};

// @desc    Get tenant's invoices
// @route   GET /api/invoices/tenant
// @access  Private (Tenant)
export const getTenantInvoices = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Automatically update overdue invoices in the database
    await RentInvoice.updateMany(
      { status: 'Pending', dueDate: { $lt: today } },
      { $set: { status: 'Overdue' } }
    );

    let invoices = await RentInvoice.find({ tenantId: req.user._id })
      .populate('propertyId', 'pgName societyName propertyCategory')
      .populate({
        path: 'bookingId',
        select: 'roomDetails'
      })
      .lean();

    // Inject initial booking payments
    const bookings = await Booking.find({ tenantId: req.user._id, 'paymentDetails.status': 'Paid', moveInDate: { $exists: true } })
      .populate('propertyId', 'pgName societyName propertyCategory')
      .lean();
      
    for (const b of bookings) {
      const moveIn = new Date(b.moveInDate);
      const endOfFirstMonth = new Date(moveIn);
      endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() + 1);
      
      invoices.push({
        _id: b._id,
        bookingId: {
          _id: b._id,
          roomDetails: b.roomDetails
        },
        tenantId: b.tenantId,
        ownerId: b.ownerId,
        propertyId: b.propertyId,
        amount: b.paymentDetails.amount,
        dueDate: moveIn,
        billingPeriodStart: moveIn,
        billingPeriodEnd: endOfFirstMonth,
        status: 'Paid',
        paymentMethod: b.paymentDetails.paymentMethod,
        paidAt: b.paymentDetails.paidAt || b.createdAt
      });
    }

    invoices.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching tenant invoices:', error);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};

// @desc    Pay invoice
// @route   POST /api/invoices/:id/pay
// @access  Private (Tenant)
export const payInvoice = async (req, res) => {
  try {
    const invoice = await RentInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    invoice.status = 'Paid';
    invoice.paidAt = new Date();
    invoice.paymentMethod = 'Online Transfer'; // Mocking online payment
    
    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error('Error paying invoice:', error);
    res.status(500).json({ message: 'Server error paying invoice' });
  }
};

// @desc    Send reminder for invoice
// @route   POST /api/invoices/:id/remind
// @access  Private (Owner)
export const remindInvoice = async (req, res) => {
  try {
    const invoice = await RentInvoice.findById(req.params.id).populate('tenantId').populate('propertyId');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (invoice.tenantId && invoice.tenantId.email) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = today - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let statusText = '';
      if (diffDays > 0) {
        statusText = `is OVERDUE by ${diffDays} days (was due on ${dueDate.toLocaleDateString()})`;
      } else if (diffDays === 0) {
        statusText = `is due TODAY (${dueDate.toLocaleDateString()})`;
      } else {
        statusText = `is due in ${Math.abs(diffDays)} days (on ${dueDate.toLocaleDateString()})`;
      }

      const subject = `Rent Reminder - ${invoice.propertyId.pgName || invoice.propertyId.societyName || 'Property'}`;
      const content = `
        Hello ${invoice.tenantId.fullName},
        
        This is a friendly reminder that your rent of Rs. ${invoice.amount} ${statusText}.
        Please login to your dashboard to complete the payment.
        
        Thank you!
      `;
      await sendGenericEmail(invoice.tenantId.email, subject, content);
    }
    
    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Server error sending reminder' });
  }
};

// @desc    Admin send reminders to all overdue
// @route   POST /api/invoices/admin/remind-all
// @access  Private (Admin)
export const adminRemindAll = async (req, res) => {
  try {
    const overdueInvoices = await RentInvoice.find({ status: 'Overdue' })
      .populate('tenantId', 'fullName email')
      .populate('propertyId', 'pgName societyName');

    let count = 0;
    for (const invoice of overdueInvoices) {
      if (invoice.tenantId && invoice.tenantId.email) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const overdueText = diffDays > 0 ? `${diffDays} days` : 'several days';

        const propertyName = invoice.propertyId?.pgName || invoice.propertyId?.societyName || 'Property';
        const subject = `URGENT: Rent Overdue Reminder - ${propertyName}`;
        const content = `
          Hello ${invoice.tenantId.fullName},
          
          This is an urgent reminder that your rent of Rs. ${invoice.amount} for ${propertyName} is OVERDUE by ${overdueText} (was due on ${new Date(invoice.dueDate).toLocaleDateString()}).
          
          Please log in to your Housynest dashboard immediately to complete the payment and avoid further penalties.
          
          Thank you.
        `;
        await sendGenericEmail(invoice.tenantId.email, subject, content);
        count++;
      }
    }
    res.json({ message: `Sent ${count} reminders successfully` });
  } catch (error) {
    console.error('Error in adminRemindAll:', error);
    res.status(500).json({ message: 'Server error sending reminders' });
  }
};

// @desc    Manual cron run for testing invoice generation
// @route   POST /api/invoices/run-cron
// @access  Private
export const runCron = async (req, res) => {
  try {
    await generateMonthlyInvoices();
    res.json({ message: 'Invoices generated successfully' });
  } catch (error) {
    console.error('Error running cron:', error);
    res.status(500).json({ message: 'Server error running cron' });
  }
};

// The core logic to generate invoices
export const generateMonthlyInvoices = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Automatically update overdue invoices in the database
    await RentInvoice.updateMany(
      { status: 'Pending', dueDate: { $lt: today } },
      { $set: { status: 'Overdue' } }
    );

    // Find all active bookings
    const activeBookings = await Booking.find({ status: { $in: ['Active', 'Confirmed', 'Reserved', 'Completed'] } }).populate('propertyId');
    
    for (const b of activeBookings) {
      if (!b.moveInDate || !b.propertyId) continue;
      
      const moveIn = new Date(b.moveInDate);
      
      // Determine the rent amount
      let rentAmount = 0;
      if (b.propertyId.propertyType === 'PG' && b.roomDetails?.sharingType) {
        const floor = b.propertyId.floors?.find(f => f.floorName === b.roomDetails.floorName);
        const room = floor?.rooms?.find(r => r.roomName === b.roomDetails.roomName);
        let baseType = 'Single';
        let isAC = false;
        
        if (room) {
            baseType = room.sharingType || 'Single';
            isAC = room.isAC;
        } else if (b.roomDetails?.sharingType) {
            const st = b.roomDetails.sharingType;
            baseType = st.includes('Single') ? 'Single' : st.includes('Double') ? 'Double' : st.includes('Triple') ? 'Triple' : st.includes('Four') ? 'Four' : 'Other';
            isAC = st.includes('(AC)');
        }

        const typeStr = `${baseType}_${isAC ? 'AC' : 'NonAC'}`;
        const pricing = b.propertyId.pgPricing?.[typeStr];
        if (pricing) {
          rentAmount = Number(pricing.rentPerBed?.replace(/\D/g, '') || 0);
        }
      } else {
        rentAmount = Number(b.propertyId.monthlyRent?.replace(/\D/g, '') || 0);
      }
      
      if (rentAmount <= 0) {
        console.log(`Skipping booking ${b._id}: rentAmount is 0`);
        continue;
      }

      // Find the most recent invoice for this booking
      const latestInvoice = await RentInvoice.findOne({ bookingId: b._id }).sort('-dueDate');
      
      let nextCycleStart;
      let nextCycleEnd;
      let nextDueDate;
      
      if (!latestInvoice) {
        // First cycle is covered by initial booking payment. So we generate the 2nd cycle.
        // Cycle 1: moveIn to (moveIn + 1 month)
        // Cycle 2: (moveIn + 1 month) to (moveIn + 2 months)
        nextCycleStart = new Date(moveIn);
        nextCycleStart.setMonth(nextCycleStart.getMonth() + 1);
        
        nextCycleEnd = new Date(nextCycleStart);
        nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1);
        
        nextDueDate = new Date(nextCycleStart);
      } else {
        // Generate the next cycle after the latest invoice
        nextCycleStart = new Date(latestInvoice.billingPeriodEnd);
        
        nextCycleEnd = new Date(nextCycleStart);
        nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1);
        
        nextDueDate = new Date(nextCycleStart);
      }
      
      // If the next due date is within 7 days from now, generate it
      const today = new Date();
      const diffTime = nextDueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && diffDays >= -30) {
        // Create the invoice
        const newInvoice = new RentInvoice({
          bookingId: b._id,
          tenantId: b.tenantId,
          ownerId: b.ownerId,
          propertyId: b.propertyId._id,
          amount: rentAmount,
          dueDate: nextDueDate,
          billingPeriodStart: nextCycleStart,
          billingPeriodEnd: nextCycleEnd,
          status: 'Pending'
        });
        await newInvoice.save();
        console.log(`Generated invoice for booking ${b._id}`);
      } else {
        console.log(`Skipping booking ${b._id}: nextDueDate ${nextDueDate.toISOString()} is ${diffDays} days away.`);
      }
    }
    console.log(`Cron job finished generating invoices. Processed ${activeBookings.length} active bookings.`);
  } catch (error) {
    console.error('Cron job error generating invoices:', error);
  }
};

// @desc    Auto send rent reminders 5 days and 2 days before due date
// @route   N/A (Cron Job)
// @access  Internal
export const sendAutoRentReminders = async () => {
  try {
    console.log('Running auto rent reminders check...');
    
    // Find all Pending invoices
    const pendingInvoices = await RentInvoice.find({ status: 'Pending' })
      .populate('tenantId', 'fullName email')
      .populate('propertyId', 'pgName propertyCategory');
      
    let sentCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const invoice of pendingInvoices) {
      if (!invoice.dueDate || !invoice.tenantId || !invoice.tenantId.email) continue;
      
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If due date is exactly 5 days or 2 days away
      if (diffDays === 5 || diffDays === 2) {
        const propertyName = invoice.propertyId?.pgName || invoice.propertyId?.societyName || 'Property';
        const subject = `Upcoming Rent Reminder - ${propertyName}`;
        const content = `
          Hello ${invoice.tenantId.fullName},
          
          This is an automated reminder that your rent of Rs. ${invoice.amount} for ${propertyName} is due in ${diffDays} days on ${dueDate.toLocaleDateString()}.
          
          Please ensure your payment is made on time to avoid any late fees. You can log in to your Housynest dashboard to view the invoice and complete the payment.
          
          Thank you for choosing Housynest!
        `;
        
        await sendGenericEmail(invoice.tenantId.email, subject, content);
        sentCount++;
      }
    }
    
    console.log(`Auto rent reminders finished. Sent ${sentCount} reminders.`);
  } catch (error) {
    console.error('Error in sendAutoRentReminders:', error);
  }
};

export const getAdminInvoiceStats = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Fetch all invoices and populate necessary fields
    const allInvoices = await RentInvoice.find()
      .populate('tenantId', 'fullName email phone profilePic')
      .populate('propertyId', 'pgName societyName')
      .populate({ path: 'bookingId', select: 'roomDetails' })
      .lean();

    // Fetch all active/paid bookings (for initial payments treated as rent)
    const bookings = await Booking.find({ 'paymentDetails.status': 'Paid' })
      .populate('tenantId', 'fullName email phone profilePic')
      .populate('propertyId', 'pgName societyName')
      .lean();

    // Inject bookings into invoice list (as they count as month 1 rent)
    const combinedInvoices = [...allInvoices];
    
    for (const b of bookings) {
      if (b.moveInDate) {
        const moveIn = new Date(b.moveInDate);
        const endOfFirstMonth = new Date(moveIn);
        endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() + 1);
        
        // Ensure we don't duplicate if there's already an invoice for this booking for the same period
        const hasExisting = allInvoices.some(inv => 
           inv.bookingId?._id?.toString() === b._id.toString() &&
           new Date(inv.billingPeriodStart).getTime() === moveIn.getTime()
        );

        if (!hasExisting) {
          combinedInvoices.push({
            _id: b._id,
            bookingId: {
              _id: b._id,
              roomDetails: b.roomDetails
            },
            tenantId: b.tenantId,
            propertyId: b.propertyId,
            amount: b.paymentDetails.amount,
            dueDate: moveIn,
            billingPeriodStart: moveIn,
            billingPeriodEnd: endOfFirstMonth,
            status: 'Paid',
            paymentMethod: b.paymentDetails.paymentMethod,
            paidAt: b.paymentDetails.paidAt || b.createdAt,
            isInitialPayment: true
          });
        }
      }
    }

    // Sort combined invoices by due date descending
    combinedInvoices.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

    // --- Calculate Stats ---
    let stats = {
      current: { collected: 0, pending: 0, overdue: 0 },
      previous: { collected: 0, pending: 0, overdue: 0 },
      historical: {
        collected: new Array(12).fill(0),
        pending: new Array(12).fill(0),
        overdue: new Array(12).fill(0)
      }
    };

    const recentOverdue = [];

    combinedInvoices.forEach(inv => {
      const d = new Date(inv.dueDate);
      const invMonth = d.getMonth();
      const invYear = d.getFullYear();
      const amount = Number(inv.amount) || 0;

      // Current Month
      if (invMonth === currentMonth && invYear === currentYear) {
        if (inv.status === 'Paid') stats.current.collected += amount;
        if (inv.status === 'Pending') stats.current.pending += amount;
        if (inv.status === 'Overdue') stats.current.overdue += amount;
      }

      // Previous Month
      if (invMonth === previousMonth && invYear === previousMonthYear) {
        if (inv.status === 'Paid') stats.previous.collected += amount;
        if (inv.status === 'Pending') stats.previous.pending += amount;
        if (inv.status === 'Overdue') stats.previous.overdue += amount;
      }

      // Historical (Current Year Only)
      if (invYear === currentYear) {
        if (inv.status === 'Paid') stats.historical.collected[invMonth] += amount;
        if (inv.status === 'Pending') stats.historical.pending[invMonth] += amount;
        if (inv.status === 'Overdue') stats.historical.overdue[invMonth] += amount;
      }

      // Populate Recent Overdue List
      if (inv.status === 'Overdue' && recentOverdue.length < 10) {
        const daysOverdue = Math.floor((today - d) / (1000 * 60 * 60 * 24));
        recentOverdue.push({
          id: inv._id,
          tenant: inv.tenantId?.fullName || 'Unknown',
          property: inv.propertyId?.pgName || inv.propertyId?.societyName || 'Unknown',
          dueDate: d,
          amount: amount,
          daysOverdue: daysOverdue > 0 ? daysOverdue : 0
        });
      }
    });

    // Helper for percentage change calculation
    const calcTrend = (curr, prev) => {
      if (prev === 0) return { value: curr > 0 ? 100 : 0, up: curr >= prev };
      const change = ((curr - prev) / prev) * 100;
      return { value: Math.abs(change).toFixed(1), up: change >= 0 };
    };

    const trends = {
      collected: calcTrend(stats.current.collected, stats.previous.collected),
      pending: calcTrend(stats.current.pending, stats.previous.pending),
      overdue: calcTrend(stats.current.overdue, stats.previous.overdue)
    };

    res.status(200).json({
      stats: {
        current: stats.current,
        trends: trends,
        expected: stats.current.collected + stats.current.pending + stats.current.overdue
      },
      historical: stats.historical,
      recentOverdue: recentOverdue,
      invoices: combinedInvoices
    });
  } catch (error) {
    console.error('Error in getAdminInvoiceStats:', error);
    res.status(500).json({ message: 'Error fetching admin invoice stats', error: error.message });
  }
};
