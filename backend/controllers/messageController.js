import Message from '../models/Message.js';
import Inquiry from '../models/Inquiry.js';
import { getIo } from '../socket.js';

// @desc    Get all messages for an inquiry
// @route   GET /api/messages/:inquiryId
// @access  Private (Owner or Tenant of the inquiry)
export const getMessages = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    // Verify access
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.ownerId.toString() !== req.user._id.toString() && inquiry.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ inquiryId })
      .populate('senderId', 'fullName profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// @desc    Send a new message
// @route   POST /api/messages/:inquiryId
// @access  Private (Owner or Tenant of the inquiry)
export const sendMessage = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.ownerId.toString() !== req.user._id.toString() && inquiry.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to send message to this inquiry' });
    }

    const newMessage = await Message.create({
      inquiryId,
      senderId: req.user._id,
      text
    });

    const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'fullName profilePic');

    // Socket.io integration
    const io = getIo();
    
    // Broadcast message to everyone in the inquiry chat room
    io.to(`inquiry_${inquiryId}`).emit('receiveMessage', populatedMessage);

    // Emit a new message notification to the recipient specifically
    const recipientId = inquiry.ownerId.toString() === req.user._id.toString() ? inquiry.senderId.toString() : inquiry.ownerId.toString();
    io.to(`user_${recipientId}`).emit('newNotification', {
      inquiryId,
      message: populatedMessage
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// @desc    Mark all messages in an inquiry as read
// @route   PUT /api/messages/:inquiryId/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    // Verify access
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.ownerId.toString() !== req.user._id.toString() && inquiry.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update all unread messages in this inquiry sent by the OTHER person
    await Message.updateMany(
      { inquiryId, isRead: false, senderId: { $ne: req.user._id } },
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
    const inquiries = await Inquiry.find({
      $or: [{ ownerId: req.user._id }, { senderId: req.user._id }]
    }).select('_id');
    
    const inquiryIds = inquiries.map(inq => inq._id);
    
    const unreadCount = await Message.countDocuments({
      inquiryId: { $in: inquiryIds },
      isRead: false,
      senderId: { $ne: req.user._id }
    });
    
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error in getTotalUnreadCount:', error);
    res.status(500).json({ message: 'Server error while fetching unread count' });
  }
};
