import Waitlist from '../models/Waitlist.js';
import Property from '../models/Property.js';
import { sendRoomAvailabilityEmail } from '../utils/emailService.js';

// @desc    Subscribe to room availability alerts
// @route   POST /api/waitlist/subscribe
// @access  Private (Tenant)
export const subscribeToWaitlist = async (req, res) => {
  try {
    const { propertyId, roomId, sharingType } = req.body;
    const tenantId = req.user._id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    let entry = await Waitlist.findOne({
      tenantId,
      propertyId,
      roomId: roomId || null,
      sharingType: sharingType || null
    });

    if (entry) {
      entry.status = 'Active';
      entry.notifiedAt = null;
      await entry.save();
    } else {
      entry = await Waitlist.create({
        tenantId,
        propertyId,
        roomId: roomId || null,
        sharingType: sharingType || null,
        status: 'Active'
      });
    }

    res.status(200).json({
      message: 'Subscribed to room availability alerts. You will receive an email when available!',
      waitlist: entry
    });
  } catch (error) {
    console.error('Error subscribing to waitlist:', error);
    res.status(500).json({ message: 'Failed to subscribe to availability alert' });
  }
};

// @desc    Get all active room alerts for logged in tenant
// @route   GET /api/waitlist/my-alerts
// @access  Private (Tenant)
export const getTenantWaitlists = async (req, res) => {
  try {
    const tenantId = req.user._id;
    const waitlists = await Waitlist.find({ tenantId, status: 'Active' })
      .populate('propertyId', 'pgName societyName propertyCategory images city locality address monthlyRent propertyType');
    
    res.json(waitlists);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room alerts' });
  }
};

// @desc    Cancel a room alert subscription
// @route   DELETE /api/waitlist/:id
// @access  Private (Tenant)
export const cancelWaitlist = async (req, res) => {
  try {
    const entry = await Waitlist.findOne({ _id: req.params.id, tenantId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Alert subscription not found' });
    }

    entry.status = 'Cancelled';
    await entry.save();
    res.json({ message: 'Alert unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel alert' });
  }
};

// Internal Helper: Trigger instant email notification to waitlisted tenants when a room becomes vacant
export const triggerRoomAvailabilityAlerts = async (propertyId, roomId = null, sharingType = null) => {
  try {
    const property = await Property.findById(propertyId);
    if (!property) return;

    const propName = property.pgName || property.societyName || (property.propertyCategory !== 'Flat' ? property.propertyCategory : '') || 'Property';

    // Find active waitlist entries for this property
    const query = { propertyId, status: 'Active' };
    const waitlists = await Waitlist.find(query).populate('tenantId', 'fullName email phone');

    for (const item of waitlists) {
      if (!item.tenantId || !item.tenantId.email) continue;

      // Filter by roomId or sharingType if specified
      if (item.roomId && roomId && item.roomId !== roomId) continue;
      if (item.sharingType && sharingType && item.sharingType !== sharingType) continue;

      // Send Instant Email Alert!
      await sendRoomAvailabilityEmail(
        item.tenantId.email,
        item.tenantId.fullName,
        propName,
        item.sharingType || sharingType || '',
        propertyId
      );

      // Update status to Notified
      item.status = 'Notified';
      item.notifiedAt = new Date();
      await item.save();
    }
  } catch (error) {
    console.error('Error triggering room availability alerts:', error);
  }
};
