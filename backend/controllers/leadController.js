import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { getIo } from '../socket.js';
import { sendGenericEmail } from '../utils/emailService.js';

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (Tenant/User)
export const createLead = async (req, res) => {
  try {
    const { propertyId, ownerId, message, occupants, gender, contactMethod, subject, agreedToShareDetails, floorName, roomName, bedName } = req.body;
    let moveInDate = req.body.moveInDate;
    if (!moveInDate) {
      moveInDate = undefined;
    }

    if (!propertyId || !ownerId || !message || agreedToShareDetails === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the lead
    const lead = await Lead.create({
      propertyId,
      ownerId,
      senderId: req.user._id, // Set by auth middleware
      message,
      moveInDate,
      occupants,
      gender,
      contactMethod,
      subject,
      agreedToShareDetails,
      floorName,
      roomName,
      bedName
    });

    // Increment property leads counter
    await Property.findByIdAndUpdate(propertyId, { $inc: { leads: 1 } });

    // Send email to owner
    try {
      const owner = await User.findById(ownerId);
      const property = await Property.findById(propertyId);
      if (owner && owner.email) {
        const tenantName = req.user.fullName || 'A user';
        const propertyName = property ? (property.pgName || property.propertyCategory) : 'your property';
        const subject = `New Lead for ${propertyName}`;
        const text = `Hello ${owner.fullName},\n\nYou have received a new lead from ${tenantName} for ${propertyName}.\n\nMessage: ${message}\n\nPlease log in to your dashboard to view the details and reply.\n\nThank you!`;
        
        await sendGenericEmail(owner.email, subject, text);
      }
    } catch (emailError) {
      console.error('Error sending lead email:', emailError);
      // Non-blocking, so we continue
    }

    // Socket.io integration
    try {
      const io = getIo();
      io.to(`user_${ownerId}`).emit('newLead', lead);
      io.to(`user_${req.user._id}`).emit('leadSent', lead);
    } catch (socketErr) {
      console.error('Socket error on createLead:', socketErr);
    }

    res.status(201).json(lead);
  } catch (error) {
    const fs = await import('fs');
    fs.appendFileSync('lead_error.log', JSON.stringify({ error: error.message, stack: error.stack }) + '\n');
    console.error('Error in createLead:', error);
    res.status(500).json({ message: error.message || 'Server error while creating lead' });
  }
};

// @desc    Get owner's leads
// @route   GET /api/leads/owner
// @access  Private (Owner)
export const getOwnerLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName bhkType propertyCategory city locality images propertyType monthlyRent rooms')
      .populate('senderId', 'fullName email phone profilePic')
      .sort({ createdAt: -1 })
      .lean();

    const leadsWithUnread = await Promise.all(leads.map(async (inq) => {
      const unreadCount = await Message.countDocuments({
        leadId: inq._id,
        isRead: false,
        senderId: { $ne: req.user._id }
      });
      return { ...inq, unreadCount };
    }));

    res.status(200).json(leadsWithUnread);
  } catch (error) {
    console.error('Error in getOwnerLeads:', error);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
};

// @desc    Get tenant's leads
// @route   GET /api/leads/tenant
// @access  Private (Tenant/User)
export const getTenantLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ senderId: req.user._id })
      .populate('propertyId', 'pgName bhkType propertyCategory city locality images propertyType monthlyRent rooms')
      .populate('ownerId', 'fullName email phone profilePic')
      .sort({ createdAt: -1 })
      .lean();

    const leadsWithUnread = await Promise.all(leads.map(async (inq) => {
      const unreadCount = await Message.countDocuments({
        leadId: inq._id,
        isRead: false,
        senderId: { $ne: req.user._id }
      });
      return { ...inq, unreadCount };
    }));

    res.status(200).json(leadsWithUnread);
  } catch (error) {
    console.error('Error in getTenantLeads:', error);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
};

// @desc    Mark lead as read
// @route   PUT /api/leads/:id/read
// @access  Private (Owner)
export const markLeadAsRead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    lead.isRead = true;
    await lead.save();

    res.status(200).json({ message: 'Lead marked as read' });
  } catch (error) {
    console.error('Error in markLeadAsRead:', error);
    res.status(500).json({ message: 'Server error while marking lead as read' });
  }
};
// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Private (Owner)
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    lead.status = status;
    if (status !== 'New') {
      lead.isRead = true;
    }
    await lead.save();

    res.status(200).json({ message: 'Lead status updated', lead });
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    res.status(500).json({ message: 'Server error while updating lead status' });
  }
};
