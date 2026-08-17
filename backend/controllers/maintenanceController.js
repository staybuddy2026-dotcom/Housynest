import MaintenanceTicket from '../models/MaintenanceTicket.js';
import Property from '../models/Property.js';
import { getIo } from '../socket.js';

// @desc    Create a new maintenance ticket
// @route   POST /api/maintenance
// @access  Private (Tenant)
export const createTicket = async (req, res) => {
  try {
    const { propertyId, title, description, category } = req.body;
    const tenantId = req.user.id;

    // Defensive check against corrupted frontend state passing objects as strings
    if (!propertyId || propertyId === '[object Object]') {
      return res.status(400).json({ message: 'Invalid property selected. Please refresh the page and try again.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!property.owner) {
      return res.status(400).json({ message: 'This property does not have an assigned owner.' });
    }

    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => photos.push(file.path));
    }

    const newTicket = new MaintenanceTicket({
      tenantId,
      ownerId: property.owner,
      propertyId,
      title,
      description,
      category,
      photos
    });

    await newTicket.save();

    // Notify owner
    const io = getIo();
    io.to(`user_${property.owner}`).emit('newNotification', {
      message: { text: `New maintenance ticket raised for ${property.title}` },
      type: 'maintenance'
    });
    io.to(`user_${property.owner}`).emit('newMaintenanceTicket', newTicket);

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets for a tenant
// @route   GET /api/maintenance/tenant
// @access  Private (Tenant)
export const getTenantTickets = async (req, res) => {
  try {
    const tickets = await MaintenanceTicket.find({ tenantId: req.user.id })
      .populate('propertyId', 'pgName societyName bhkType propertyCategory address images')
      .populate('ownerId', 'fullName phone email')
      .sort({ createdAt: -1 });

    // Mark as read when fetched
    await MaintenanceTicket.updateMany(
      { tenantId: req.user.id, isReadByTenant: false },
      { $set: { isReadByTenant: true } }
    );

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets for an owner
// @route   GET /api/maintenance/owner
// @access  Private (Owner)
export const getOwnerTickets = async (req, res) => {
  try {
    const tickets = await MaintenanceTicket.find({ ownerId: req.user.id })
      .populate('propertyId', 'pgName societyName bhkType propertyCategory address images')
      .populate('tenantId', 'fullName phone email profilePic')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status and notes
// @route   PUT /api/maintenance/:id
// @access  Private (Owner)
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, cost } = req.body;
    
    const ticket = await MaintenanceTicket.findById(req.params.id).populate('tenantId', 'email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Ensure the user is the owner of the property
    if (ticket.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    ticket.status = status || ticket.status;
    ticket.resolutionNotes = resolutionNotes !== undefined ? resolutionNotes : ticket.resolutionNotes;
    ticket.cost = cost !== undefined ? cost : ticket.cost;
    ticket.isReadByTenant = false;

    await ticket.save();

    // Notify tenant
    const io = getIo();
    io.to(`user_${ticket.tenantId._id}`).emit('newNotification', {
      message: { text: `Your maintenance ticket status changed to ${ticket.status}` },
      type: 'maintenance_update'
    });
    io.to(`user_${ticket.tenantId._id}`).emit('maintenanceTicketUpdated', ticket);

    // Send email
    if (ticket.tenantId && ticket.tenantId.email) {
      const { sendMaintenanceUpdateEmail } = await import('./authController.js');
      await sendMaintenanceUpdateEmail(ticket.tenantId.email, ticket.ticketId, ticket.status);
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
