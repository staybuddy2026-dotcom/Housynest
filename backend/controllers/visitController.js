import Visit from '../models/Visit.js';
import Property from '../models/Property.js';
import { sendGenericEmail } from '../utils/emailService.js';
import { getIo } from '../socket.js';

export const scheduleVisit = async (req, res) => {
  try {
    const { propertyId, date, time, message, name, phone } = req.body;
    const tenantId = req.user._id;

    const property = await Property.findById(propertyId).populate('owner');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const visit = await Visit.create({
      property: propertyId,
      tenant: tenantId,
      owner: property.owner._id,
      name,
      phone,
      date,
      time,
      message,
    });

    // Notify Owner via Email
    const subject = `New Visit Request for ${property.title || 'your property'}`;
    const text = `Hello ${property.owner.fullName},\n\nYou have a new visit request from ${name} (${phone}) for your property on ${date} during the ${time}.\n\nMessage: ${message || 'No message provided'}\n\nPlease log in to your dashboard to accept or reschedule this visit.`;

    await sendGenericEmail(property.owner.email, subject, text);

    // Socket notification if connected
    try {
      const io = getIo();
      io.emit('visit_update', { ownerId: property.owner._id });
    } catch (e) {
      // socket not initialized
    }

    res.status(201).json({ message: 'Visit scheduled successfully', visit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to schedule visit', error: error.message });
  }
};

export const getOwnerVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ owner: req.user._id })
      .populate('property', 'pgName propertyCategory bhkType city locality images')
      .populate('tenant', 'fullName email phone profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visits', error: error.message });
  }
};

export const getTenantVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ tenant: req.user._id })
      .populate('property', 'pgName propertyCategory bhkType city locality images')
      .populate('owner', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visits', error: error.message });
  }
};

export const updateVisitStatus = async (req, res) => {
  try {
    const { status, suggestedTime } = req.body;
    const visitId = req.params.id;

    const visit = await Visit.findById(visitId).populate('property').populate('tenant').populate('owner');

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.owner._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    visit.status = status;
    if (suggestedTime) {
      visit.suggestedTime = suggestedTime;
    }

    await visit.save();

    // Send email to tenant
    let subject = '';
    let text = '';

    if (status === 'Accepted') {
      subject = `Visit Request Accepted - ${visit.property.title}`;
      text = `Hello ${visit.tenant.fullName},\n\nYour visit request for ${visit.property.title} on ${visit.date} during the ${visit.time} has been accepted by the owner.\n\nOwner Contact: ${visit.owner.phone}\n\nThank you!`;
    } else if (status === 'Rejected') {
      subject = `Visit Request Rejected - ${visit.property.title}`;
      text = `Hello ${visit.tenant.fullName},\n\nUnfortunately, your visit request for ${visit.property.title} on ${visit.date} has been rejected by the owner.`;
    } else if (status === 'Rescheduled') {
      subject = `Visit Request Rescheduled - ${visit.property.title}`;
      text = `Hello ${visit.tenant.fullName},\n\nThe owner of ${visit.property.title} has suggested a new time for your visit on ${visit.date}.\n\nSuggested Time: ${suggestedTime}\n\nPlease check your dashboard or contact the owner (${visit.owner.phone}) to confirm.`;
    } else if (status === 'Completed') {
      subject = `Visit Completed - ${visit.property.title}`;
      text = `Hello ${visit.tenant.fullName},\n\nYour visit for ${visit.property.title} is marked as completed! You can now proceed to book the property from your dashboard if you liked it.`;
    }

    if (subject) {
      await sendGenericEmail(visit.tenant.email, subject, text);
    }

    try {
      const io = getIo();
      io.emit('visit_update', { tenantId: visit.tenant._id });
    } catch (e) { }

    res.status(200).json({ message: 'Visit status updated', visit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update visit status', error: error.message });
  }
};

export const sendVisitReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find visits scheduled for tomorrow that are Accepted
    const visits = await Visit.find({ date: tomorrowStr, status: 'Accepted' })
      .populate('property')
      .populate('tenant')
      .populate('owner');

    for (const visit of visits) {
      const subject = `Reminder: Property Visit Tomorrow - ${visit.property.title}`;
      const text = `Hello ${visit.tenant.fullName},\n\nThis is a friendly reminder that you have a property visit scheduled for tomorrow (${visit.date}) during the ${visit.time}.\n\nProperty: ${visit.property.title}\nOwner Contact: ${visit.owner.phone}\n\nSee you there!`;
      await sendGenericEmail(visit.tenant.email, subject, text);
    }
    console.log(`Sent ${visits.length} visit reminders.`);
  } catch (error) {
    console.error("Error sending visit reminders:", error);
  }
};
