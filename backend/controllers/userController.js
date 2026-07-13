import User from '../models/User.js';
import Message from '../models/Message.js';
import Inquiry from '../models/Inquiry.js';
import LawyerRequest from '../models/LawyerRequest.js';
import Contract from '../models/Contract.js';
import Visit from '../models/Visit.js';
import { sendBlockEmail, sendUnblockEmail } from './authController.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      res.json({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        googleId: user.googleId,
        savedProperties: user.savedProperties || [],
        profilePic: user.profilePic || '',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      user.phone = req.body.phone || user.phone;
      
      const updatedUser = await user.save();
      
      res.json({
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        googleId: updatedUser.googleId,
        savedProperties: updatedUser.savedProperties || [],
        profilePic: updatedUser.profilePic || '',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const toggleSavedProperty = async (req, res) => {
  try {
    const user = req.user;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    if (user) {
      const savedProperties = user.savedProperties || [];
      const index = savedProperties.indexOf(String(propertyId));

      if (index > -1) {
        // Remove from favorites
        savedProperties.splice(index, 1);
      } else {
        // Add to favorites
        savedProperties.push(String(propertyId));
      }

      user.savedProperties = savedProperties;
      await user.save();

      res.json({ savedProperties: user.savedProperties });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const getNotificationCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Unread Messages (Where sender is not me and isRead is false, and I am part of the inquiry)
    // First, find all inquiries where user is owner or sender
    const userInquiries = await Inquiry.find({
      $or: [{ ownerId: userId }, { senderId: userId }]
    }).select('_id');

    const inquiryIds = userInquiries.map(inq => inq._id);

    const unreadMessagesCount = await Message.countDocuments({
      inquiryId: { $in: inquiryIds },
      senderId: { $ne: userId },
      isRead: false
    });

    // 2. New Inquiries (Requests)
    // Depending on user role: if Owner, count inquiries where they are the ownerId and isRead is false
    const newInquiriesCount = await Inquiry.countDocuments({
      ownerId: userId,
      isRead: false
    });

    // 3. New Lawyer Requests
    let newLawyerRequestsCount = 0;
    let newVisitsCount = 0;
    if (req.user.role === 'owner') {
      newLawyerRequestsCount = await LawyerRequest.countDocuments({
        owner: userId,
        isRead: false
      });
      newVisitsCount = await Visit.countDocuments({
        owner: userId,
        status: 'Pending'
      });
    }

    res.json({
      unreadMessages: unreadMessagesCount,
      newRequests: newInquiriesCount,
      newLawyerRequests: newLawyerRequestsCount,
      newVisits: newVisitsCount
    });
  } catch (error) {
    console.error('Error in getNotificationCounts:', error);
    res.status(500).json({ message: 'Failed to fetch notification counts' });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    user.profilePic = req.file.path; // Cloudinary URL
    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      googleId: updatedUser.googleId,
      savedProperties: updatedUser.savedProperties || [],
      profilePic: updatedUser.profilePic || '',
    });
  } catch (error) {
    console.error('Error uploading profile pic:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'Users logged in with Google cannot change their password' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { userId, isBlocked, blockReason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot block an admin user' });
    }

    user.isBlocked = isBlocked;
    user.blockReason = isBlocked ? blockReason : null;
    await user.save();

    if (isBlocked) {
      await sendBlockEmail(user.email, blockReason);
    } else {
      await sendUnblockEmail(user.email);
    }

    res.json({ message: `User successfully ${isBlocked ? 'blocked' : 'unblocked'}`, user });
  } catch (error) {
    console.error('Error toggling block status:', error);
    res.status(500).json({ message: 'Server error while updating block status' });
  }
};

export const getLawyerRequests = async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer' }).select('-password');
    // Map to a format suitable for the admin dashboard
    const formattedLawyers = lawyers.map(lawyer => ({
      id: lawyer._id,
      name: lawyer.fullName,
      email: lawyer.email,
      phone: lawyer.phone,
      barNumber: lawyer.lawyerDetails?.barCouncilNumber || 'N/A',
      experience: lawyer.lawyerDetails?.experience ? `${lawyer.lawyerDetails.experience} years experience` : 'N/A',
      aadhar: lawyer.lawyerDetails?.aadharNumber || 'N/A',
      certificateUploaded: !!lawyer.lawyerDetails?.certificate,
      certificateUrl: lawyer.lawyerDetails?.certificate,
      registeredDate: new Date(lawyer.createdAt).toLocaleDateString(),
      status: lawyer.lawyerStatus === 'pending' ? 'Pending' : lawyer.lawyerStatus === 'approved' ? 'Approved' : 'Rejected',
    }));
    res.json(formattedLawyers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lawyer requests', error: error.message });
  }
};

export const updateLawyerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const lawyer = await User.findById(id);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    lawyer.lawyerStatus = status;
    await lawyer.save();

    res.json({ message: `Lawyer request ${status}`, lawyer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update lawyer status', error: error.message });
  }
};

export const getLawyerOwners = async (req, res) => {
  try {
    const lawyerId = req.user._id;
    const owners = await User.find({ role: 'owner' }).select('-password');
    
    // Fetch all requests and contracts made by this lawyer
    const lawyerRequests = await LawyerRequest.find({ lawyer: lawyerId });
    const contracts = await Contract.find({ lawyerId });
    
    // Map owners and attach request status if it exists
    const ownersWithStatus = owners.map(owner => {
      const ownerObj = owner.toObject();
      const requests = lawyerRequests.filter(req => String(req.owner) === String(owner._id));
      
      ownerObj.requestCount = requests.length;
      
      // Find the most recent request
      if (requests.length > 0) {
        // Assuming requests are sorted or we can just sort them by createdAt descending
        const latestRequest = requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        ownerObj.requestStatus = latestRequest.status;
        ownerObj.rejectionReason = latestRequest.rejectionReason;
        
        if (latestRequest.status === 'accepted') {
          // Find the corresponding contract
          const contract = contracts.find(c => String(c.ownerId) === String(owner._id));
          if (contract) {
            ownerObj.contractId = contract._id;
          }
        }
      } else {
        ownerObj.requestStatus = null;
      }
      return ownerObj;
    });

    res.json(ownersWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owners', error: error.message });
  }
};
