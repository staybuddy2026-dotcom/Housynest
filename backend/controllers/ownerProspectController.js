import OwnerProspect from '../models/OwnerProspect.js';

// @desc    Create or update a OwnerProspect
// @route   POST /api/OwnerProspects
// @access  Private (Admin only)
export const createOwnerProspect = async (req, res) => {
  try {
    const { phone, ownerName, pgName } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Upsert the OwnerProspect
    const OwnerProspect = await OwnerProspect.findOneAndUpdate(
      { phone },
      { ownerName, pgName },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'OwnerProspect saved successfully', OwnerProspect });
  } catch (error) {
    console.error('Error in createOwnerProspect:', error);
    res.status(500).json({ message: 'Server error while saving OwnerProspect', error: error.message });
  }
};

// @desc    Get all OwnerProspects
// @route   GET /api/OwnerProspects
// @access  Private (Admin only)
export const getOwnerProspects = async (req, res) => {
  try {
    const OwnerProspects = await OwnerProspect.find().sort({ createdAt: -1 });
    res.status(200).json(OwnerProspects);
  } catch (error) {
    console.error('Error in getOwnerProspects:', error);
    res.status(500).json({ message: 'Server error while fetching OwnerProspects', error: error.message });
  }
};

// @desc    Update OwnerProspect status
// @route   PATCH /api/OwnerProspects/:id/status
// @access  Private (Admin only)
export const updateOwnerProspectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Interested', 'Not Interested', 'Listed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const OwnerProspect = await OwnerProspect.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!OwnerProspect) {
      return res.status(404).json({ message: 'OwnerProspect not found' });
    }

    res.status(200).json({ message: 'OwnerProspect status updated', OwnerProspect });
  } catch (error) {
    console.error('Error in updateOwnerProspectStatus:', error);
    res.status(500).json({ message: 'Server error while updating OwnerProspect status', error: error.message });
  }
};
