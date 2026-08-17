import User from '../models/User.js';
import Message from '../models/Message.js';
import Lead from '../models/Lead.js';
import LawyerRequest from '../models/LawyerRequest.js';
import Contract from '../models/Contract.js';
import Visit from '../models/Visit.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import RentInvoice from '../models/RentInvoice.js';
import MaintenanceTicket from '../models/MaintenanceTicket.js';
import { sendBlockEmail, sendUnblockEmail } from './authController.js';
import { encryptSymmetric } from '../utils/encryption.js';

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
        dob: user.dob || null,
        gender: user.gender || '',
        emergencyContact: user.emergencyContact || { name: '', relationship: '', phone: '' },
        bankDetails: user.bankDetails ? {
          accountHolderName: user.bankDetails.accountHolderName || '',
          last4AccountNumber: user.bankDetails.last4AccountNumber || '',
          ifscCode: user.bankDetails.ifscCode || '',
          bankName: user.bankDetails.bankName || ''
        } : { accountHolderName: '', last4AccountNumber: '', ifscCode: '', bankName: '' },
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

    let encryptedData = user.bankDetails?.accountNumberEncrypted;
    let ivData = user.bankDetails?.accountNumberIv;
    let last4 = user.bankDetails?.last4AccountNumber;

    if (accountNumber && accountNumber.trim() !== '') {
        const encryptionResult = encryptSymmetric(accountNumber.trim());
        if (encryptionResult) {
            encryptedData = encryptionResult.encryptedData;
            ivData = encryptionResult.iv;
            last4 = accountNumber.trim().slice(-4);
        }
    }

    user.bankDetails = {
      accountHolderName: accountHolderName || user.bankDetails?.accountHolderName,
      accountNumberEncrypted: encryptedData,
      accountNumberIv: ivData,
      last4AccountNumber: last4,
      ifscCode: ifscCode || user.bankDetails?.ifscCode,
      bankName: bankName || user.bankDetails?.bankName,
      razorpayLinkedAccountId: user.bankDetails?.razorpayLinkedAccountId // Keep existing ID if present
    };

    const updatedUser = await user.save();

    res.json({
      message: 'Bank details updated successfully',
      bankDetails: {
        accountHolderName: updatedUser.bankDetails.accountHolderName,
        last4AccountNumber: updatedUser.bankDetails.last4AccountNumber,
        ifscCode: updatedUser.bankDetails.ifscCode,
        bankName: updatedUser.bankDetails.bankName
      }
    });
  } catch (error) {
    console.error('Error updating bank details:', error);
    res.status(500).json({ message: 'Server error while updating bank details' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      user.phone = req.body.phone || user.phone;
      if (req.body.dob) user.dob = req.body.dob;
      if (req.body.gender) user.gender = req.body.gender;
      if (req.body.emergencyContact) user.emergencyContact = req.body.emergencyContact;
      
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
        dob: updatedUser.dob || null,
        gender: updatedUser.gender || '',
        emergencyContact: updatedUser.emergencyContact || { name: '', relationship: '', phone: '' },
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
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 }).lean();
    
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      if (u.role === 'owner') {
        const propCount = await Property.countDocuments({ owner: u._id });
        return { ...u, propertiesCount: propCount };
      } else if (u.role === 'tenant') {
        const booking = await Booking.findOne({ tenantId: u._id, status: { $in: ['Confirmed', 'Active'] } })
          .populate('propertyId', 'pgName societyName propertyCategory');
        return {
          ...u,
          assignedProperty: booking ? (booking.propertyId?.pgName || booking.propertyId?.societyName || booking.propertyId?.propertyCategory) : null,
          assignedRoom: booking?.roomDetails?.roomName || null
        };
      }
      return u;
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const getNotificationCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Unread Messages (Where sender is not me and isRead is false, and I am part of the lead)
    // First, find all leads where user is owner or sender
    const userLeads = await Lead.find({
      $or: [{ ownerId: userId }, { senderId: userId }]
    }).select('_id');

    const leadIds = userLeads.map(inq => inq._id);

    const unreadMessagesCount = await Message.countDocuments({
      leadId: { $in: leadIds },
      senderId: { $ne: userId },
      isRead: false
    });

    // 2. New Leads (Requests)
    // Depending on user role: if Owner, count leads where they are the ownerId and isRead is false
    const newLeadsCount = await Lead.countDocuments({
      ownerId: userId,
      isRead: false
    });

    // 3. New Lawyer Requests, Visits, and Bookings
    let newLawyerRequestsCount = 0;
    let newVisitsCount = 0;
    let newBookingRequestsCount = 0;
    let newBookingsCount = 0;
    let newMaintenanceTicketsCount = 0;
    let newMaintenanceUpdatesCount = 0;
    
    if (req.user.role === 'owner') {
      newLawyerRequestsCount = await LawyerRequest.countDocuments({
        owner: userId,
        isRead: false
      });
      newVisitsCount = await Visit.countDocuments({
        owner: userId,
        status: 'Pending'
      });
      
      // Get all properties owned by this user
      const ownerProperties = await Property.find({ owner: userId }).select('_id');
      const propertyIds = ownerProperties.map(p => p._id);
      
      newBookingRequestsCount = await Booking.countDocuments({
        propertyId: { $in: propertyIds },
        status: 'Pending Request'
      });

      newBookingsCount = await Booking.countDocuments({
        propertyId: { $in: propertyIds },
        status: { $in: ['Confirmed', 'Active'] }
      });

      newMaintenanceTicketsCount = await MaintenanceTicket.countDocuments({
        ownerId: userId,
        status: 'Pending'
      });
    } else if (req.user.role === 'tenant') {
      newMaintenanceUpdatesCount = await MaintenanceTicket.countDocuments({
        tenantId: userId,
        isReadByTenant: false
      });
    }

    res.json({
      unreadMessages: unreadMessagesCount,
      newRequests: newLeadsCount,
      newLawyerRequests: newLawyerRequestsCount,
      newVisits: newVisitsCount,
      newBookingRequests: newBookingRequestsCount,
      newBookings: newBookingsCount,
      newMaintenanceTickets: newMaintenanceTicketsCount,
      newMaintenanceUpdates: newMaintenanceUpdatesCount
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

export const getOwnerPerformanceAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { filter = 'Monthly' } = req.query; // 'Monthly', 'Weekly', 'Daily'

    const now = new Date();
    let startDate;
    let labels = [];

    // Helper to generate empty buckets
    if (filter === 'Monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Last 6 months
      
      for(let i = 0; i < 6; i++) {
        let d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        labels.push(d.toLocaleString('default', { month: 'short' }));
      }
    } else if (filter === 'Weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (7 * 5)); // Last 6 weeks
      startDate.setHours(0,0,0,0);
      
      for(let i = 0; i < 6; i++) {
        let d = new Date(startDate);
        d.setDate(d.getDate() + (i * 7));
        labels.push(`W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`);
      }
    } else { // Daily
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // Last 7 days
      startDate.setHours(0,0,0,0);
      
      for(let i = 0; i < 7; i++) {
        let d = new Date(startDate);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleString('default', { weekday: 'short' }));
      }
    }

    // 1. Get Bookings (Counts)
    const bookings = await Booking.find({
      ownerId,
      createdAt: { $gte: startDate },
      status: { $in: ['Pending Payment', 'Confirmed', 'Reserved', 'Active', 'Completed'] }
    });

    // 2. Get Leads (Counts)
    const leads = await Lead.find({
      ownerId,
      createdAt: { $gte: startDate }
    });

    // 3. Get Rent Invoices (Revenue)
    const invoices = await RentInvoice.find({
      ownerId,
      status: 'Paid',
      createdAt: { $gte: startDate }
    });

    // Bucket data
    let bookingsData = new Array(labels.length).fill(0);
    let bookingsRevenueData = new Array(labels.length).fill(0);
    let leadsData = new Array(labels.length).fill(0);
    let rentData = new Array(labels.length).fill(0);

    const getBucketIndex = (dateObj) => {
      if (filter === 'Monthly') {
        return (dateObj.getFullYear() - startDate.getFullYear()) * 12 + (dateObj.getMonth() - startDate.getMonth());
      } else if (filter === 'Weekly') {
        return Math.floor((dateObj - startDate) / (1000 * 60 * 60 * 24 * 7));
      } else {
        return Math.floor((dateObj - startDate) / (1000 * 60 * 60 * 24));
      }
    };

    bookings.forEach(b => {
      let idx = getBucketIndex(new Date(b.createdAt));
      if (idx >= 0 && idx < labels.length) {
        bookingsData[idx]++;
        if (b.paymentDetails && b.paymentDetails.amount) {
          bookingsRevenueData[idx] += b.paymentDetails.amount;
        }
      }
    });

    leads.forEach(l => {
      let idx = getBucketIndex(new Date(l.createdAt));
      if (idx >= 0 && idx < labels.length) leadsData[idx]++;
    });

    invoices.forEach(i => {
      let dateToUse = i.paidAt || i.createdAt; // fallback
      let idx = getBucketIndex(new Date(dateToUse));
      if (idx >= 0 && idx < labels.length) rentData[idx] += (i.amount || 0);
    });

    res.json({
      labels,
      series: {
        bookings: bookingsData,
        bookingsRevenue: bookingsRevenueData,
        leads: leadsData,
        rentCollected: rentData
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};
