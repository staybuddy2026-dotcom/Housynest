import Report from '../models/Report.js';
import { getIo } from '../socket.js';
import { sendGenericEmail } from '../utils/emailService.js';

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private (Tenant/User)
export const createReport = async (req, res) => {
  try {
    const { propertyId, reason, details } = req.body;

    if (!propertyId || !reason) {
      return res.status(400).json({ message: 'Property ID and reason are required' });
    }

    const report = await Report.create({
      propertyId,
      reporterId: req.user._id,
      reason,
      details
    });

    try {
      getIo().emit('report_update');
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error while creating report' });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admin)
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('propertyId', 'pgName propertyCategory propertyType images')
      .populate('reporterId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Admin)
export const updateReportStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!['Open', 'Investigating', 'Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('propertyId', 'pgName propertyCategory propertyType images')
      .populate('reporterId', 'fullName email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    try {
      getIo().emit('report_update');
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    // Send email to user if resolved and message provided
    if (status === 'Resolved' && message && report.reporterId && report.reporterId.email) {
      const propertyName = report.propertyId?.pgName || report.propertyId?.propertyCategory || 'the property';
      const subject = `Update on your report regarding ${propertyName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Report Update</h2>
          <p>Hi ${report.reporterId.fullName},</p>
          <p>Thank you for submitting a report regarding <strong>${propertyName}</strong>.</p>
          <p>Our team has reviewed your report and marked it as <strong>Resolved</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #062F26; margin: 20px 0;">
            <strong>Message from Admin:</strong><br/>
            ${message}
          </div>
          <p>If you have any further questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br/>The Housynest Team</p>
        </div>
      `;
      
      await sendGenericEmail(report.reporterId.email, subject, '', html);
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Server error while updating report status' });
  }
};

// @desc    Get count of pending (open) reports
// @route   GET /api/reports/pending-count
// @access  Private (Admin)
export const getPendingReportCount = async (req, res) => {
  try {
    const count = await Report.countDocuments({ status: 'Open' });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching pending report count:', error);
    res.status(500).json({ message: 'Server error while fetching pending report count' });
  }
};
