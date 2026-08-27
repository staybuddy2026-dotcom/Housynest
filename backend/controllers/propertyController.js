import Property from '../models/Property.js';
import User from '../models/User.js';
import Newsletter from '../models/Newsletter.js';
import Lead from '../models/Lead.js';
import Booking from '../models/Booking.js';
import { getIo } from '../socket.js';
import { sendPropertyDeletionEmail } from './authController.js';
import { sendGenericEmail } from '../utils/emailService.js';
import { triggerRoomAvailabilityAlerts } from './waitlistController.js';

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private
export const createProperty = async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Prevent Mass Assignment of protected fields
    delete propertyData.status;
    delete propertyData.isVerified;
    delete propertyData.views;
    delete propertyData.leads;
    delete propertyData.owner;

    // Convert complex objects/arrays from stringified JSON if needed (multipart/form-data sends complex objects as strings)
    const jsonFields = ['rooms', 'floors', 'pgPricing', 'bankDetails'];
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

    let ownerContractData = null;
    if (req.body.ownerContract_mode === 'customize') {
      let parsedTerms = [];
      try {
        if (req.body.ownerContract_terms) {
          parsedTerms = JSON.parse(req.body.ownerContract_terms);
        }
      } catch (e) {
        console.error('Failed to parse ownerContract_terms', e);
      }
      
      ownerContractData = {
        mode: 'customize',
        contractTextEn: req.body.ownerContract_en || '',
        contractTextGu: req.body.ownerContract_gu || '',
        termsAndConditions: parsedTerms
      };
    }

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
      })) : [],
      ownerContract: ownerContractData
    });

    if (!property.images || property.images.length < 2) {
      return res.status(400).json({ message: 'Validation Error', error: 'Minimum 2 images are required.' });
    }

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
        const price = createdProperty.pgPricing?.monthlyRent || createdProperty.rentAmount || 'Contact for price';
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const propertyLink = `${appUrl}/property/${createdProperty._id}`;
        
        // Extract amenities (if any)
        const amenity1 = (createdProperty.commonAmenities && createdProperty.commonAmenities.length > 0) ? createdProperty.commonAmenities[0] : 'Fully Furnished';
        const amenity2 = (createdProperty.commonAmenities && createdProperty.commonAmenities.length > 1) ? createdProperty.commonAmenities[1] : 'Prime Location';

        const subject = `New Property Alert: ${title} in ${location}!`;
        const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 25px;">
        Great news! We've just listed a brand new property that we think you'll love. Don't miss out on the chance to make it yours.
    </p>
    
    <!-- Property Card -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #f9fafb; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #111827; font-size: 18px;">${title}</h3>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">📍 ${location}</p>
        <p style="margin: 15px 0 0 0; color: #4F46E5; font-size: 20px; font-weight: bold;">₹${price} / month</p>
        <ul style="padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
            <li>${amenity1}</li>
            <li>${amenity2}</li>
            <li>Ready to move in</li>
        </ul>
    </div>

    <div style="text-align: center;">
        <a href="${propertyLink}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Property Details</a>
    </div>
</div>
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

// @desc    Update property details
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this property' });
    }

    const propertyData = req.body;

    // Prevent Mass Assignment of protected fields
    delete propertyData.status;
    delete propertyData.isVerified;
    delete propertyData.views;
    delete propertyData.leads;
    delete propertyData.owner;

    // Convert complex objects/arrays from stringified JSON if needed
    const jsonFields = ['rooms', 'floors', 'pgPricing', 'bankDetails'];
    jsonFields.forEach(field => {
      if (propertyData[field] && typeof propertyData[field] === 'string') {
        try {
          propertyData[field] = JSON.parse(propertyData[field]);
        } catch (e) {
          console.error(`Failed to parse ${field}:`, propertyData[field]);
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
          propertyData[field] = propertyData[field].split(',');
        }
      }
    });

    // Handle new image uploads (append to existing)
    if (req.files && req.files.images) {
      const newImages = req.files.images.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
      propertyData.images = [...(property.images || []), ...newImages];
    }
    
    // Handle new document uploads
    if (req.files && req.files.documents) {
        const newDocs = req.files.documents.map(file => ({
            url: file.path,
            public_id: file.filename
        }));
        propertyData.verificationDocs = [...(property.verificationDocs || []), ...newDocs];
    }

    // Handle owner contract customized text
    if (req.body.ownerContract_mode === 'customize') {
      let parsedTerms = [];
      try {
        if (req.body.ownerContract_terms) {
          parsedTerms = JSON.parse(req.body.ownerContract_terms);
        }
      } catch (e) {
        console.error('Failed to parse ownerContract_terms', e);
      }
      
      propertyData.ownerContract = {
        mode: 'customize',
        contractTextEn: req.body.ownerContract_en || '',
        contractTextGu: req.body.ownerContract_gu || '',
        termsAndConditions: parsedTerms
      };
    }
    
    // Allow deleting existing images/docs via frontend by sending an array of public_ids to remove
    if (propertyData.removeImages) {
        let removeIds = [];
        try {
            removeIds = JSON.parse(propertyData.removeImages);
        } catch(e) {
            removeIds = typeof propertyData.removeImages === 'string' ? propertyData.removeImages.split(',') : propertyData.removeImages;
        }
        if (Array.isArray(removeIds) && removeIds.length > 0) {
            propertyData.images = (propertyData.images || property.images).filter(img => !removeIds.includes(img.public_id));
        }
    }

    if (propertyData.removeDocs) {
        let removeIds = [];
        try {
            removeIds = JSON.parse(propertyData.removeDocs);
        } catch(e) {
            removeIds = typeof propertyData.removeDocs === 'string' ? propertyData.removeDocs.split(',') : propertyData.removeDocs;
        }
        if (Array.isArray(removeIds) && removeIds.length > 0) {
            propertyData.verificationDocs = (propertyData.verificationDocs || property.verificationDocs).filter(doc => !removeIds.includes(doc.public_id));
        }
    }

    const totalImages = (propertyData.images ? propertyData.images.length : property.images.length);
    if (totalImages < 2) {
      return res.status(400).json({ message: 'Validation Error', error: 'Minimum 2 images are required.' });
    }

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: propertyData },
      { new: true, runValidators: true }
    );

    // Trigger availability alerts for waitlisted tenants
    triggerRoomAvailabilityAlerts(propertyId);

    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', error: error.message, details: error.errors });
    }
    res.status(500).json({ message: 'Failed to update property', error: error.message });
  }
};

// Helper to attach ratings to properties
const attachRatings = async (properties) => {
  const isArray = Array.isArray(properties);
  const propsArray = isArray ? properties : [properties];
  if (propsArray.length === 0) return properties;

  const propertyIds = propsArray.map(p => p._id);
  const reviewsAggregation = await Review.aggregate([
    { $match: { property: { $in: propertyIds } } },
    { $group: { _id: '$property', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const reviewsMap = {};
  reviewsAggregation.forEach(r => {
    reviewsMap[r._id.toString()] = {
      rating: r.avgRating.toFixed(1),
      count: r.count
    };
  });

  const propsWithRatings = propsArray.map(p => {
    const pId = p._id.toString();
    const rev = reviewsMap[pId] || { rating: '0', count: 0 };
    return { ...p, rating: rev.rating, reviewCount: rev.count };
  });

  return isArray ? propsWithRatings : propsWithRatings[0];
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

    let properties = await Property.find(query).populate('owner', 'fullName email profilePic').lean();
    properties = await attachRatings(properties);
    
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

    // Dynamically calculate accurate leads and bookings count for perfect sync with DB
    const propertiesWithCounts = await Promise.all(properties.map(async (prop) => {
      const [leadCount, bookingCount] = await Promise.all([
        Lead.countDocuments({ propertyId: prop._id }),
        Booking.countDocuments({ propertyId: prop._id, status: { $nin: ['Rejected', 'Cancelled', 'Completed'] } })
      ]);
      return { ...prop, leads: leadCount, bookings: bookingCount };
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
    const propertyDoc = await Property.findById(req.params.id).populate('owner', 'fullName email phone profilePic');
    if (propertyDoc) {
      // Auto-heal PG bed statuses from Bookings
      if (propertyDoc.propertyType === 'PG' && propertyDoc.floors?.length > 0) {
        const activeBookings = await Booking.find({
          propertyId: propertyDoc._id,
          status: { $in: ['Reserved', 'Confirmed', 'Active'] }
        });
        
        for (const floor of propertyDoc.floors) {
          for (const room of floor.rooms) {
            for (const bed of room.beds) {
              if (bed.status === 'Maintenance') continue;
              
              const bedBookings = activeBookings.filter(b => 
                b.roomDetails?.roomName === room.roomName && 
                b.roomDetails?.bedName === bed.bedName
              );
              
              const hasOccupied = bedBookings.some(b => ['Confirmed', 'Active'].includes(b.status));
              const hasReserved = bedBookings.some(b => ['Reserved'].includes(b.status));
              
              let correctStatus = 'Vacant';
              if (hasOccupied) correctStatus = 'Occupied';
              else if (hasReserved) correctStatus = 'Reserved';
              
              if (bed.status !== correctStatus) {
                bed.status = correctStatus;
              }
            }
          }
        }
      }

      // Increment views without triggering full document validation
      await Property.updateOne({ _id: propertyDoc._id }, { $inc: { views: 1 } });
      
      let property = propertyDoc.toObject();
      property = await attachRatings(property);
      
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    console.error("Error in getPropertyById:", error);
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
    // Populate owner so we can send an email if approved
    const property = await Property.findById(req.params.id).populate('owner', 'fullName email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const previousStatus = property.status;

    if (status !== undefined) property.status = status;
    if (isVerified !== undefined) property.isVerified = isVerified;

    const updatedProperty = await property.save();

    // Send email to owner if property was just approved
    if (status === 'Approved' && previousStatus !== 'Approved') {
      const ownerEmail = property.owner?.email;
      if (ownerEmail) {
        const ownerName = property.owner?.fullName || 'Property Owner';
        const propName = property.pgName || property.societyName || property.propertyCategory || 'Property';
        const locationStr = [property.locality, property.city].filter(Boolean).join(', ');
        
        // Ensure you have frontend URL configured
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const dashboardUrl = `${appUrl}/dashboard/owner/listings`;

        const subject = '🎉 Congratulations! Your property listing is now Live on Housynest';
        const htmlContent = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Hi <b>${ownerName}</b>,</p>
            <p>Great news! Your property listing for <b>${propName}</b> has been successfully reviewed and approved by our admin team.</p>
            <p>It is now live on Housynest and visible to thousands of potential tenants searching for their perfect home!</p>
            
            <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">Listing Details</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li style="margin-bottom: 4px;"><b>Property Name:</b> ${propName}</li>
              <li style="margin-bottom: 4px;"><b>Location:</b> ${locationStr}</li>
              <li style="margin-bottom: 4px;"><b>Status:</b> <span style="color: #16a34a; font-weight: bold;">Active & Live</span></li>
            </ul>

            <p style="margin-top: 20px;">To get the most out of your listing, make sure your photos are up to date and your availability is correctly marked. You can view your live property and manage your dashboard anytime by clicking the button below.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #062F26; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                View & Manage Your Property
              </a>
            </div>

            <p>If you need any assistance managing your property or bookings, our support team is just a click away.</p>
            <p>Welcome to the Housynest Owner Community! 🚀</p>
            <br>
            <p>Warm regards,<br><b style="color: #062F26;">The Housynest Admin Team</b></p>
          </div>
        `;

        await sendGenericEmail(ownerEmail, subject, 'Your property is now approved and live on Housynest. Please view this email in an HTML client.', htmlContent);
      }
    }

    // Emit event to update pending counts
    try {
      const io = getIo();
      io.emit('property_update');
    } catch (err) {
      console.log('Socket not initialized or failed to emit', err.message);
    }

    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property status:', error);
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
    let properties = await Property.find({
      _id: { $in: validIds },
      status: { $in: ['Approved', 'Active'] }
    }).populate('owner', 'fullName email').lean();

    properties = await attachRatings(properties);

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
    }).limit(4).populate('owner', 'fullName email profilePic').lean();

    // If less than 4, find just by city
    if (similarProperties.length < 4) {
      const moreProps = await Property.find({
        _id: { $ne: propertyId, $nin: similarProperties.map(p => p._id) },
        status: { $in: ['Approved', 'Active'] },
        city: property.city
      }).limit(4 - similarProperties.length).populate('owner', 'fullName email profilePic').lean();
      similarProperties = [...similarProperties, ...moreProps];
    }

    // If still less than 4, find any active properties
    if (similarProperties.length < 4) {
      const moreProps = await Property.find({
        _id: { $ne: propertyId, $nin: similarProperties.map(p => p._id) },
        status: { $in: ['Approved', 'Active'] }
      }).limit(4 - similarProperties.length).populate('owner', 'fullName email profilePic').lean();
      similarProperties = [...similarProperties, ...moreProps];
    }
    
    similarProperties = await attachRatings(similarProperties);

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
