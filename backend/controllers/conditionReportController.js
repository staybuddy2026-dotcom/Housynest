import ConditionReport from '../models/ConditionReport.js';
import Booking from '../models/Booking.js';

// @desc    Get condition reports for a specific booking
// @route   GET /api/condition-reports/booking/:bookingId
// @access  Private (Owner/Tenant)
export const getConditionReportsByBooking = async (req, res) => {
  try {
    const reports = await ConditionReport.find({ bookingId: req.params.bookingId })
      .populate('tenantId', 'fullName email')
      .populate('ownerId', 'fullName email')
      .sort({ createdAt: -1 });

    // Permissions check: user must be owner or tenant of these reports
    // For simplicity, we just filter it. If it returns empty, they have no access.
    const filteredReports = reports.filter(r => 
      r.ownerId._id.toString() === req.user.id || r.tenantId._id.toString() === req.user.id
    );

    res.json(filteredReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new condition report
// @route   POST /api/condition-reports
// @access  Private (Owner)
export const createConditionReport = async (req, res) => {
  try {
    const { bookingId, type, items } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create report for this booking' });
    }

    const report = new ConditionReport({
      bookingId,
      propertyId: booking.propertyId,
      ownerId: booking.ownerId,
      tenantId: booking.tenantId,
      type,
      items
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a condition report (add items, complete)
// @route   PUT /api/condition-reports/:id
// @access  Private (Owner)
export const updateConditionReport = async (req, res) => {
  try {
    const { items, status } = req.body;
    
    const report = await ConditionReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Condition report not found' });
    }

    if (report.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    if (items) {
      report.items = items;
    }
    
    if (status) {
      report.status = status;
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
