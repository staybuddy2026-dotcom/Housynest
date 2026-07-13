import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { getIo } from '../socket.js';
import { sendGenericEmail } from '../utils/emailService.js';

// @desc    Create a new inquiry
// @route   POST /api/inquiries
// @access  Private (Tenant/User)
export const createInquiry = async (req, res) => {
  try {
    const { propertyId, ownerId, message, moveInDate, occupants, gender, contactMethod, subject, agreedToShareDetails } = req.body;

    if (!propertyId || !ownerId || !message || agreedToShareDetails === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the inquiry
    const inquiry = await Inquiry.create({
      propertyId,
      ownerId,
      senderId: req.user._id, // Set by auth middleware
      message,
      moveInDate,
      occupants,
      gender,
      contactMethod,
      subject,
      agreedToShareDetails
    });

    // Increment property inquiries counter
    await Property.findByIdAndUpdate(propertyId, { $inc: { inquiries: 1 } });

    // Send email to owner
    try {
      const owner = await User.findById(ownerId);
      const property = await Property.findById(propertyId);
      if (owner && owner.email) {
        const tenantName = req.user.fullName || 'A user';
        const propertyName = property ? (property.pgName || property.propertyCategory) : 'your property';
        const subject = `New Inquiry for ${propertyName}`;
        const text = `Hello ${owner.fullName},\n\nYou have received a new inquiry from ${tenantName} for ${propertyName}.\n\nMessage: ${message}\n\nPlease log in to your dashboard to view the details and reply.\n\nThank you!`;
        
        await sendGenericEmail(owner.email, subject, text);
      }
    } catch (emailError) {
      console.error('Error sending inquiry email:', emailError);
      // Non-blocking, so we continue
    }

    // Socket.io integration
    const io = getIo();
    io.to(`user_${ownerId}`).emit('newInquiry', inquiry);

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error in createInquiry:', error);
    res.status(500).json({ message: 'Server error while creating inquiry' });
  }
};

// @desc    Get owner's inquiries
// @route   GET /api/inquiries/owner
// @access  Private (Owner)
export const getOwnerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName bhkType propertyCategory city locality images propertyType monthlyRent rooms')
      .populate('senderId', 'fullName email phone profilePic')
      .sort({ createdAt: -1 })
      .lean();

    const inquiriesWithUnread = await Promise.all(inquiries.map(async (inq) => {
      const unreadCount = await Message.countDocuments({
        inquiryId: inq._id,
        isRead: false,
        senderId: { $ne: req.user._id }
      });
      return { ...inq, unreadCount };
    }));

    res.status(200).json(inquiriesWithUnread);
  } catch (error) {
    console.error('Error in getOwnerInquiries:', error);
    res.status(500).json({ message: 'Server error while fetching inquiries' });
  }
};

// @desc    Get tenant's inquiries
// @route   GET /api/inquiries/tenant
// @access  Private (Tenant/User)
export const getTenantInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ senderId: req.user._id })
      .populate('propertyId', 'pgName bhkType propertyCategory city locality images propertyType monthlyRent rooms')
      .populate('ownerId', 'fullName email phone profilePic')
      .sort({ createdAt: -1 })
      .lean();

    const inquiriesWithUnread = await Promise.all(inquiries.map(async (inq) => {
      const unreadCount = await Message.countDocuments({
        inquiryId: inq._id,
        isRead: false,
        senderId: { $ne: req.user._id }
      });
      return { ...inq, unreadCount };
    }));

    res.status(200).json(inquiriesWithUnread);
  } catch (error) {
    console.error('Error in getTenantInquiries:', error);
    res.status(500).json({ message: 'Server error while fetching inquiries' });
  }
};

// @desc    Mark inquiry as read
// @route   PUT /api/inquiries/:id/read
// @access  Private (Owner)
export const markInquiryAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    inquiry.isRead = true;
    await inquiry.save();

    res.status(200).json({ message: 'Inquiry marked as read' });
  } catch (error) {
    console.error('Error in markInquiryAsRead:', error);
    res.status(500).json({ message: 'Server error while marking inquiry as read' });
  }
};
// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id/status
// @access  Private (Owner)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({ message: 'Inquiry status updated', inquiry });
  } catch (error) {
    console.error('Error in updateInquiryStatus:', error);
    res.status(500).json({ message: 'Server error while updating inquiry status' });
  }
};
