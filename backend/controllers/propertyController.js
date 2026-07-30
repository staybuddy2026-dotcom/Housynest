import Property from '../models/Property.js';
import User from '../models/User.js';
import Newsletter from '../models/Newsletter.js';
import Inquiry from '../models/Inquiry.js';
import { getIo } from '../socket.js';
import { sendPropertyDeletionEmail } from './authController.js';
import { sendGenericEmail } from '../utils/emailService.js';

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private
export const createProperty = async (req, res) => {
  try {
    const propertyData = req.body;

    // Convert complex objects/arrays from stringified JSON if needed (multipart/form-data sends complex objects as strings)
    const jsonFields = ['rooms', 'floors', 'pgPricing'];
    jsonFields.forEach(field => {
      if (propertyData[field] && typeof propertyData[field] === 'string') {
        try {
          propertyData[field] = JSON.parse(propertyData[field]);
        } catch (e) {
          console.error(`Failed to parse ${field}:`, propertyData[field]);
          propertyData[field] = field === 'pgPricing' ? {} : [];
        }
      }
    });

    // Convert array fields from strings if needed
    const arrayFields = ['nearbyPlaces', 'services', 'extraServices', 'meals', 'commonAmenities', 'extraCommonAmenities', 'parking', 'pgRules', 'extraRules', 'additionalRooms', 'overlooking', 'societyAmenities', 'preferredTenants', 'usps', 'customUsps'];

    arrayFields.forEach(field => {
      if (propertyData[field] && typeof propertyData[field] === 'string') {
        try {
          propertyData[field] = JSON.parse(propertyData[field]);
        } catch (e) {
          // It might be just a comma separated string if not JSON stringified array
          propertyData[field] = propertyData[field].split(',');
        }
      }
    });

    const property = new Property({
      ...propertyData,
      owner: req.user._id,
      images: req.files && req.files.images ? req.files.images.map(file => ({
        url: file.path,
        public_id: file.filename
      })) : [],
      verificationDocs: req.files && req.files.documents ? req.files.documents.map(file => ({
        url: file.path,
        public_id: file.filename
      })) : []
    });

    const createdProperty = await property.save();

    // Push the property ID to the owner's listedProperties
    req.user.listedProperties.push(createdProperty._id);
    await req.user.save();

    // Emit event to all connected admin sockets to update notification badges
    try {
      const io = getIo();
      io.emit('property_update');
    } catch (err) {
      console.log('Socket not initialized or failed to emit', err.message);
    }

    // --- Newsletter Alert for New Property ---
    try {
      const subscribers = await Newsletter.find({ active: true });
      if (subscribers.length > 0) {
        const title = createdProperty.pgName || createdProperty.propertyCategory || 'New Property';
        const location = createdProperty.city ? `${createdProperty.locality || ''}, ${createdProperty.city}` : 'a great location';
        const subject = `New Property Alert: ${title} in ${location}!`;
        const html = `
          <h2>New Property Available on Housynest!</h2>
          <p>We are excited to announce a new property listing that matches our premium standards.</p>
          <h3>${title}</h3>
          <p><strong>Location:</strong> ${location}</p>
          <p>Check out our latest listings to find your perfect home before it gets booked!</p>
          <br>
          <p>Thanks,<br>The Housynest Team</p>
        `;

        // Blast emails (asynchronous, don't wait for all to finish to prevent slow response)
        subscribers.forEach(sub => {
          sendGenericEmail(sub.email, subject, '', html).catch(e => console.error('Newsletter email failed for', sub.email));
        });
      }
    } catch (newsErr) {
      console.error('Failed to process newsletter alerts:', newsErr);
    }

    res.status(201).json(createdProperty);
  } catch (error) {
    console.error('Error creating property details:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', error: error.message, details: error.errors });
    }
    res.status(500).json({ message: 'Failed to create property', error: error.message, stack: error.stack });
  }
};

// @desc    Get all properties (with filters)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const query = { status: { $in: ['Approved', 'Active'] } };
    if (req.query.type) {
      query.propertyType = req.query.type;
    }

    const properties = await Property.find(query).populate('owner', 'fullName email profilePic');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get popular cities with property counts
// @route   GET /api/properties/popular-cities
// @access  Public
export const getPopularCities = async (req, res) => {
  try {
    const popularCities = await Property.aggregate([
      { $match: { status: { $in: ['Approved', 'Active'] }, city: { $exists: true, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const formattedCities = popularCities.map(city => ({
      name: city._id,
      properties: city.count
    }));

    res.status(200).json(formattedCities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingPropertyCount = async (req, res) => {
  try {
    const count = await Property.countDocuments({ status: 'Pending' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get properties of logged in owner
// @route   GET /api/properties/owner
// @access  Private
export const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).lean();

    // Dynamically calculate accurate inquiries count for perfect sync with DB
    const propertiesWithCounts = await Promise.all(properties.map(async (prop) => {
      const inquiryCount = await Inquiry.countDocuments({ propertyId: prop._id });
      return { ...prop, inquiries: inquiryCount };
    }));

    res.json(propertiesWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owner properties' });
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'fullName email phone profilePic');
    if (property) {
      // Increment views
      property.views = (property.views || 0) + 1;
      await property.save();
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch property' });
  }
};


// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (property) {
      if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this property' });
      }

      await property.deleteOne();
      res.json({ message: 'Property removed' });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete property' });
  }
};

// @desc    Delete a property by admin with reason
// @route   DELETE /api/properties/admin/:id
// @access  Private (Admin)
export const deletePropertyByAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Deletion reason is required' });
    }

    const property = await Property.findById(req.params.id).populate('owner', 'email fullName');

    if (property) {
      const propertyName = property.pgName || property.propertyCategory || 'Property';
      const ownerEmail = property.owner?.email;
      const ownerName = property.owner?.fullName;

      await property.deleteOne();

      if (ownerEmail) {
        await sendPropertyDeletionEmail(ownerEmail, propertyName, reason);
      }

      // Emit event to refresh listings on frontend
      try {
        const io = getIo();
        io.emit('property_update');
      } catch (err) {
        console.log('Socket not initialized or failed to emit', err.message);
      }

      res.json({ message: 'Property deleted successfully' });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    console.error('Error deleting property by admin:', error);
    res.status(500).json({ message: 'Failed to delete property' });
  }
};
// @desc    Get all properties for admin without filtering status
// @route   GET /api/properties/admin/all
// @access  Private (Admin)
export const getAdminProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'fullName email phone');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin properties' });
  }
};

// @desc    Update property status or verification
// @route   PATCH /api/properties/admin/:id/status
// @access  Private (Admin)
export const updatePropertyStatus = async (req, res) => {
  try {
    const { status, isVerified } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (status !== undefined) property.status = status;
    if (isVerified !== undefined) property.isVerified = isVerified;

    const updatedProperty = await property.save();

    // Emit event to update pending counts
    try {
      const io = getIo();
      io.emit('property_update');
    } catch (err) {
      console.log('Socket not initialized or failed to emit', err.message);
    }

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update property status' });
  }
};

// @desc    Get user's saved properties
// @route   GET /api/properties/saved
// @access  Private
export const getSavedProperties = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedPropertyIds = user.savedProperties || [];
    const validIds = savedPropertyIds.filter(id => /^[0-9a-fA-F]{24}$/.test(String(id)));

    // Find all properties whose ID is in the savedPropertyIds array
    const properties = await Property.find({
      _id: { $in: validIds },
      status: { $in: ['Approved', 'Active'] }
    }).populate('owner', 'fullName email');

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch saved properties', error: error.message });
  }
};

export const getLawyerOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required' });
    }

    const properties = await Property.find({
      owner: ownerId,
      status: { $in: ['Approved', 'Active'] }
    }).populate('owner', 'fullName email profilePic');

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owner properties', error: error.message });
  }
};

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
// @access  Public
export const getSimilarProperties = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Try to find properties in the same city and same type
    let similarProperties = await Property.find({
      _id: { $ne: propertyId },
      status: { $in: ['Approved', 'Active'] },
      city: property.city,
      propertyType: property.propertyType
    }).limit(4).populate('owner', 'fullName email profilePic');

    // If less than 4, find just by city
    if (similarProperties.length < 4) {
      const moreProps = await Property.find({
        _id: { $ne: propertyId, $nin: similarProperties.map(p => p._id) },
        status: { $in: ['Approved', 'Active'] },
        city: property.city
      }).limit(4 - similarProperties.length).populate('owner', 'fullName email profilePic');
      similarProperties = [...similarProperties, ...moreProps];
    }

    // If still less than 4, find any active properties
    if (similarProperties.length < 4) {
      const moreProps = await Property.find({
        _id: { $ne: propertyId, $nin: similarProperties.map(p => p._id) },
        status: { $in: ['Approved', 'Active'] }
      }).limit(4 - similarProperties.length).populate('owner', 'fullName email profilePic');
      similarProperties = [...similarProperties, ...moreProps];
    }

    res.status(200).json(similarProperties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch similar properties', error: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/properties/:id/reviews
// @access  Private (Tenants only)
import Review from '../models/Review.js';

export const createReview = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { rating, comment } = req.body;

    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can leave a review.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const reviewCount = await Review.countDocuments({
      property: propertyId,
      tenant: req.user._id
    });

    if (reviewCount >= 3) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 3 reviews for this property.' });
    }

    const review = new Review({
      property: propertyId,
      tenant: req.user._id,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Populate tenant info to send back to frontend
    const populatedReview = await Review.findById(review._id).populate('tenant', 'fullName profilePic');

    res.status(201).json({ message: 'Review added successfully', review: populatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get property reviews
// @route   GET /api/properties/:id/reviews
// @access  Public
export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.id })
      .populate('tenant', 'fullName profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
