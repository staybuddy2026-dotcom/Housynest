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
    const invoices = await RentInvoice.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName propertyCategory')
      .populate('tenantId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'roomDetails personalInfo'
      })
      .sort('-dueDate');
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
    const invoices = await RentInvoice.find({ tenantId: req.user._id })
      .populate('propertyId', 'pgName propertyCategory')
      .sort('-dueDate');
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
    if (invoice.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (invoice.tenantId && invoice.tenantId.email) {
      const subject = `Rent Reminder - ${invoice.propertyId.pgName || invoice.propertyId.propertyCategory}`;
      const content = `
        Hello ${invoice.tenantId.fullName},
        
        This is a friendly reminder that your rent of Rs. ${invoice.amount} is due on ${new Date(invoice.dueDate).toLocaleDateString()}.
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
