import Lead from '../models/Lead.js';

// @desc    Create or update a lead
// @route   POST /api/leads
// @access  Private (Admin only)
export const createLead = async (req, res) => {
  try {
    const { phone, ownerName, pgName } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Upsert the lead
    const lead = await Lead.findOneAndUpdate(
      { phone },
      { ownerName, pgName },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Lead saved successfully', lead });
  } catch (error) {
    console.error('Error in createLead:', error);
    res.status(500).json({ message: 'Server error while saving lead', error: error.message });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin only)
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    console.error('Error in getLeads:', error);
    res.status(500).json({ message: 'Server error while fetching leads', error: error.message });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private (Admin only)
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Interested', 'Not Interested', 'Listed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead status updated', lead });
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    res.status(500).json({ message: 'Server error while updating lead status', error: error.message });
  }
};
