import LawyerRequest from '../models/LawyerRequest.js';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { getIo } from '../socket.js';
import { sendGenericEmail } from '../utils/emailService.js';

// @desc    Send a request to an owner
// @route   POST /api/lawyer-requests/send
// @access  Private (Lawyer)
export const sendRequest = async (req, res) => {
  try {
    const { ownerId } = req.body;
    const lawyerId = req.user._id;

    if (req.user.role !== 'lawyer') {
      return res.status(403).json({ message: 'Only lawyers can send requests' });
    }

    // Check if the lawyer has already sent 2 requests to this owner
    const requestCount = await LawyerRequest.countDocuments({
      lawyer: lawyerId,
      owner: ownerId,
    });

    if (requestCount >= 2) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 2 requests for this owner.' });
    }

    // Check if there is an existing pending or accepted request
    const existingRequest = await LawyerRequest.findOne({
      lawyer: lawyerId,
      owner: ownerId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: `You already have a ${existingRequest.status} request with this owner.` });
    }

    const newRequest = await LawyerRequest.create({
      lawyer: lawyerId,
      owner: ownerId,
      status: 'pending'
    });

    const populatedRequest = await LawyerRequest.findById(newRequest._id)
      .populate('lawyer', 'fullName email phone lawyerDetails createdAt profilePic')
      .populate('owner', 'fullName email');

    // Send Email to Owner
    if (populatedRequest.owner?.email && populatedRequest.lawyer?.fullName) {
      const subject = `New Representation Request from Lawyer ${populatedRequest.lawyer.fullName}`;
      const text = `Hello ${populatedRequest.owner.fullName || 'Property Owner'},\n\nLawyer ${populatedRequest.lawyer.fullName} has sent you a request to represent you. Please log in to your dashboard to review and accept the request.\n\nThank you,\nHousynest Team`;
      const html = `<p>Hello ${populatedRequest.owner.fullName || 'Property Owner'},</p><p>Lawyer <strong>${populatedRequest.lawyer.fullName}</strong> has sent you a request to represent you. Please log in to your dashboard to review and accept the request.</p><p>Thank you,<br/>Housynest Team</p>`;
      
      await sendGenericEmail(populatedRequest.owner.email, subject, text, html);
    }

    try {
      const io = getIo();
      io.to(`user_${ownerId}`).emit('newLawyerRequest', populatedRequest);
    } catch (socketError) {
      console.error('Socket error (newLawyerRequest):', socketError);
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error sending lawyer request:', error);
    res.status(500).json({ message: 'Server error while sending request' });
  }
};

// @desc    Get owner's lawyer requests
// @route   GET /api/lawyer-requests/owner
// @access  Private (Owner)
export const getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user._id;

    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can view these requests' });
    }

    const requests = await LawyerRequest.find({ owner: ownerId })
      .populate('lawyer', 'fullName email phone lawyerDetails createdAt profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching owner requests:', error);
    res.status(500).json({ message: 'Server error while fetching requests' });
  }
};

// @desc    Accept or reject a request
// @route   PUT /api/lawyer-requests/:id/status
// @access  Private (Owner)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const requestId = req.params.id;
    const ownerId = req.user._id;

    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can perform this action' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await LawyerRequest.findById(requestId)
      .populate('lawyer', 'fullName email')
      .populate('owner', 'fullName');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending requests' });
    }

    request.status = status;
    if (status === 'rejected' && rejectionReason) {
      request.rejectionReason = rejectionReason;
    }
    await request.save();

    let contractId = null;
    if (status === 'accepted') {
      // Create a contract
      const contract = await Contract.create({
        lawyerId: request.lawyer._id,
        ownerId: request.owner._id,
        title: 'Owner-Lawyer Representation Agreement',
        status: 'Draft'
      });
      contractId = contract._id;

      // Send Acceptance Email
      if (request.lawyer?.email) {
        const subject = `Representation Request Accepted by ${request.owner?.fullName || 'Property Owner'}`;
        const text = `Hello ${request.lawyer.fullName},\n\nGood news! ${request.owner?.fullName || 'The property owner'} has accepted your representation request.\n\nYou can now log into your dashboard to draft and finalize the contract.\n\nThank you,\nHousynest Team`;
        const html = `<p>Hello ${request.lawyer.fullName},</p><p>Good news! <strong>${request.owner?.fullName || 'The property owner'}</strong> has accepted your representation request.</p><p>You can now log into your dashboard to draft and finalize the contract.</p><p>Thank you,<br/>Housynest Team</p>`;
        await sendGenericEmail(request.lawyer.email, subject, text, html);
      }
    } else if (status === 'rejected') {
      // Send Rejection Email
      if (request.lawyer?.email) {
        const subject = `Representation Request Declined by ${request.owner?.fullName || 'Property Owner'}`;
        const text = `Hello ${request.lawyer.fullName},\n\nWe wanted to inform you that ${request.owner?.fullName || 'the property owner'} has declined your representation request.\n\nReason provided:\n"${request.rejectionReason || 'No reason provided.'}"\n\nThank you,\nHousynest Team`;
        const html = `<p>Hello ${request.lawyer.fullName},</p><p>We wanted to inform you that <strong>${request.owner?.fullName || 'the property owner'}</strong> has declined your representation request.</p><p><strong>Reason provided:</strong><br/><em>"${request.rejectionReason || 'No reason provided.'}"</em></p><p>Thank you,<br/>Housynest Team</p>`;
        await sendGenericEmail(request.lawyer.email, subject, text, html);
      }
    }

    try {
      const io = getIo();
      io.to(`user_${request.lawyer._id}`).emit('lawyerRequestUpdated', {
        requestId: request._id,
        ownerId: request.owner._id,
        status: request.status,
        contractId: contractId,
        rejectionReason: request.rejectionReason
      });
    } catch (socketError) {
      console.error('Socket error (lawyerRequestUpdated):', socketError);
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error while updating request' });
  }
};

// @desc    Mark owner's lawyer requests as read
// @route   PUT /api/lawyer-requests/mark-read
// @access  Private (Owner)
export const markRequestsAsRead = async (req, res) => {
  try {
    const ownerId = req.user._id;

    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can perform this action' });
    }

    await LawyerRequest.updateMany(
      { owner: ownerId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Requests marked as read' });
  } catch (error) {
    console.error('Error marking requests as read:', error);
    res.status(500).json({ message: 'Server error while marking requests as read' });
  }
};
