import Message from '../models/Message.js';
import Lead from '../models/Lead.js';
import { getIo } from '../socket.js';

// @desc    Get all messages for an lead
// @route   GET /api/messages/:leadId
// @access  Private (Owner or Tenant of the lead)
export const getMessages = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Verify access
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.ownerId.toString() !== req.user._id.toString() && lead.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ leadId })
      .populate('senderId', 'fullName profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// @desc    Send a new message
// @route   POST /api/messages/:leadId
// @access  Private (Owner or Tenant of the lead)
export const sendMessage = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.ownerId.toString() !== req.user._id.toString() && lead.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to send message to this lead' });
    }

    const newMessage = await Message.create({
      leadId,
      senderId: req.user._id,
      text
    });

    const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'fullName profilePic');

    // Socket.io integration
    const io = getIo();
    
    // Broadcast message to everyone in the lead chat room
    io.to(`lead_${leadId}`).emit('receiveMessage', populatedMessage);

    // Emit a new message notification to the recipient specifically
    const recipientId = lead.ownerId.toString() === req.user._id.toString() ? lead.senderId.toString() : lead.ownerId.toString();
    io.to(`user_${recipientId}`).emit('newNotification', {
      leadId,
      message: populatedMessage
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// @desc    Mark all messages in an lead as read
// @route   PUT /api/messages/:leadId/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Verify access
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.ownerId.toString() !== req.user._id.toString() && lead.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update all unread messages in this lead sent by the OTHER person
    await Message.updateMany(
      { leadId, isRead: false, senderId: { $ne: req.user._id } },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    res.status(500).json({ message: 'Server error while marking messages as read' });
  }
};

// @desc    Get total unread message count for current user
// @route   GET /api/messages/unread/count
// @access  Private
export const getTotalUnreadCount = async (req, res) => {
  try {
    const leads = await Lead.find({
      $or: [{ ownerId: req.user._id }, { senderId: req.user._id }]
    }).select('_id');
    
    const leadIds = leads.map(inq => inq._id);
    
    const unreadCount = await Message.countDocuments({
      leadId: { $in: leadIds },
      isRead: false,
      senderId: { $ne: req.user._id }
    });
    
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error in getTotalUnreadCount:', error);
    res.status(500).json({ message: 'Server error while fetching unread count' });
  }
};
