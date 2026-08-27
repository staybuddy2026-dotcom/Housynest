import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import MaintenanceTicket from '../models/MaintenanceTicket.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendGenericEmail } from '../utils/emailService.js';
import puppeteer from 'puppeteer';
import { getIo } from '../socket.js';
import { triggerRoomAvailabilityAlerts } from './waitlistController.js';
import { generateReceiptPdfBuffer } from '../utils/receiptGenerator.js';
import fs from 'fs';
import path from 'path';

const getPdfHtmlContent = (booking, tenant, property, actualOwner) => {
  let logoBase64 = '';
  try {
    const logoPath = path.resolve(process.cwd(), '../frontend/src/assets/logo.png');
    logoBase64 = fs.readFileSync(logoPath, 'base64');
  } catch (e) {
    console.error('Could not load logo for PDF', e);
  }

  const todayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const cityStr = property?.city || 'Mumbai';
  
  const customEn = property?.ownerContract?.contractTextEn || '<p style="text-align: center; font-weight: bold;">(11-Month Rental Agreement)</p>\n<h3>Property Details</h3>\n<b>Owner:</b> [property_name]\n<b>Address:</b> [property_address]\n<b>Location:</b> [property_locality], [property_city]\n<h3>Tenant Details</h3>\n<b>Name:</b> [tenant_full_name]\n<b>Phone:</b> [tenant_mobile]\n<b>Email:</b> [tenant_email]\n<b>Date of Birth:</b> [tenant_date_of_birth]\n<h3>Booking Details</h3>\n<b>Room:</b> [room_name]\n<b>Bed:</b> [bed_number]\n<b>Move-in Date:</b> [move_in_date]\n<b>Expected Move-out:</b> [move_out_date]\n<b>Monthly Rent:</b> Rs. [rent_amount]\n<b>Security Deposit:</b> Rs. [deposit_amount]\n<b>Booking Reference:</b> [booking_reference]\n<h3>Emergency Contact</h3>\n<b>Name:</b> [emergency_contact_name]\n<b>Phone:</b> [emergency_contact_phone]\n<b>Relationship:</b> [emergency_contact_relationship]\n<h3>Terms and Conditions</h3>\n1. <b>Rent Payment:</b> Rent must be paid by the 5th of every month.\n2. <b>Security Deposit:</b> The deposit is fully refundable upon vacating the premises, provided there is no damage.\n3. <b>Notice Period:</b> A minimum of 30 days notice is required before vacating.\n4. <b>House Rules:</b> Tenants must abide by the rules set by the PG/Property owner.\n5. <b>Maintenance:</b> Any damage to the property caused by the tenant will be deducted from the security deposit.';
  
  let substituted = customEn
    .replace(/<(b|strong)>Signature:<\/(b|strong)>\s*_{5,}\s*/gi, '')
    .replace(/<(b|strong)>Date:<\/(b|strong)>\s*\[agreement_date\]\s*/gi, '')
    .replace(/<h3[^>]*>PARTIES TO THE AGREEMENT<\/h3>\s*/gi, '')
    .replace(/<p[^>]*>.*?Licensor \(Owner\/Property Manager\).*?<\/p>\s*/gi, '')
    .replace(/<p[^>]*>.*?Licensee \(Tenant\).*?<\/p>\s*/gi, '')
    .replace(/<(b|strong)[^>]*>Licensor \(Owner\/Property Manager\):<\/(b|strong)>.*?\[owner_name\]\s*/gi, '')
    .replace(/<(b|strong)[^>]*>Licensee \(Tenant\):<\/(b|strong)>.*?\[tenant_full_name\]\s*/gi, '')
    .replace(/\[agreement_date\]/g, todayDateStr)
    .replace(/\[agreement_city\]/g, cityStr)
    .replace(/\[property_name\]/g, property?.pgName || property?.societyName || 'HousyNest Property')
    .replace(/\[property_address\]/g, property?.locality || property?.address || 'Address')
    .replace(/\[property_locality\]/g, property?.locality || 'Locality')
    .replace(/\[property_city\]/g, cityStr)
    .replace(/\[tenant_full_name\]/g, tenant?.fullName || 'Tenant')
    .replace(/\[tenant_mobile\]/g, booking?.personalInfo?.phone || 'N/A')
    .replace(/\[tenant_email\]/g, booking?.personalInfo?.email || 'N/A')
    .replace(/\[tenant_date_of_birth\]/g, booking?.personalInfo?.dob ? new Date(booking.personalInfo.dob).toLocaleDateString('en-GB') : 'N/A')
    .replace(/\[room_name\]/g, booking?.roomDetails?.roomName || 'Room')
    .replace(/\[bed_number\]/g, booking?.roomDetails?.bedName || 'Bed')
    .replace(/\[rent_amount\]/g, Number(booking?.paymentDetails?.amount || property?.monthlyRent?.replace(/\D/g, '') || 12000).toLocaleString('en-IN'))
    .replace(/\[deposit_amount\]/g, Number(property?.securityAmount?.replace(/\D/g, '') || 12000).toLocaleString('en-IN'))
    .replace(/\[move_in_date\]/g, booking?.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB') : 'Move-In')
    .replace(/\[move_out_date\]/g, booking?.expectedMoveOutDate ? new Date(booking.expectedMoveOutDate).toLocaleDateString('en-GB') : 'Vacation')
    .replace(/\[booking_reference\]/g, booking?._id ? booking._id.toString().substring(booking._id.toString().length - 8).toUpperCase() : 'HN-REF')
    .replace(/\[emergency_contact_name\]/g, booking?.emergencyContact?.name || 'N/A')
    .replace(/\[emergency_contact_phone\]/g, booking?.emergencyContact?.phone || 'N/A')
    .replace(/\[emergency_contact_relationship\]/g, booking?.emergencyContact?.relationship || 'N/A');

  const lines = substituted.split('\n');
  const formattedContract = '<div style="font-size: 13px; line-height: 1.6; color: #334155;">' + lines.map(line => {
    let trimmed = line.trim();
    if (!trimmed) return '<br/>';
    if (trimmed.startsWith('<h1>') && trimmed.endsWith('</h1>')) {
      return `<div style="text-align: center; font-weight: bold; font-size: 18px; color: #062F26; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 15px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">${trimmed.replace(/<\/?h1>/g, '')}</div>`;
    }
    if (trimmed.startsWith('<h3>') && trimmed.endsWith('</h3>')) {
      return `<div style="font-weight: bold; color: #062F26; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; padding-top: 12px; border-top: 1px dashed #cbd5e1; margin-top: 15px; margin-bottom: 10px;">${trimmed.replace(/<\/?h3>/g, '')}</div>`;
    }
    const parts = trimmed.split(/(<b>.*?<\/b>)/g);
    const pContent = parts.map(part => {
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        return `<strong style="color: #0f172a;">${part.slice(3, -4)}</strong>`;
      }
      return part;
    }).join('');
    return `<p style="margin-bottom: 8px; text-align: justify;">${pContent}</p>`;
  }).join('') + '</div>';

  const terms = property?.ownerContract?.termsAndConditions || [];
  const formattedTerms = terms.length > 0 ? `
    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
      <h3 style="font-weight: bold; color: #062F26; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; margin-bottom: 15px;">Terms & Conditions</h3>
      <ol style="padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
        ${terms.map(t => `<li style="margin-bottom: 8px;"><strong style="color: #0f172a;">${t.titleEn || 'Term'}</strong>: ${t.descriptionEn || ''}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const bookingRef = booking?._id ? booking._id.toString().substring(booking._id.toString().length - 8).toUpperCase() : 'HN-REF';
  const moveIn = booking?.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB') : 'Move-In';
  const moveOut = booking?.expectedMoveOutDate ? new Date(booking.expectedMoveOutDate).toLocaleDateString('en-GB') : 'Vacation';
  const rentAmt = Number(booking?.paymentDetails?.amount || property?.monthlyRent?.replace(/\D/g, '') || 12000).toLocaleString('en-IN');
  const depositAmt = Number(property?.securityAmount?.replace(/\D/g, '') || 12000).toLocaleString('en-IN');

  const detailsBox = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; color: #062F26; font-size: 15px; text-transform: uppercase;">Accommodation & Financial Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; width: 50%;"><b>Property:</b> ${property?.pgName || property?.societyName || 'HousyNest Property'}</td>
          <td style="padding: 6px 0; width: 50%;"><b>Booking Ref:</b> ${bookingRef}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;" colspan="2"><b>Address:</b> ${property?.locality || property?.address || 'Address'}, ${cityStr}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><b>Room / Unit:</b> ${booking?.roomDetails?.roomName || 'Room'}</td>
          <td style="padding: 6px 0;"><b>Bed Number:</b> ${booking?.roomDetails?.bedName || 'Bed'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><b>Monthly Rent:</b> ₹${rentAmt}</td>
          <td style="padding: 6px 0;"><b>Security Deposit:</b> ₹${depositAmt}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><b>Commencement Date:</b> ${moveIn}</td>
          <td style="padding: 6px 0;"><b>Vacation Date:</b> ${moveOut}</td>
        </tr>
      </table>

      <h4 style="margin-top: 15px; margin-bottom: 8px; color: #062F26; font-size: 14px; text-transform: uppercase;">Emergency Contact</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
        <tr>
          <td style="padding: 4px 0; width: 33%;"><b>Name:</b> ${booking?.emergencyContact?.name || 'N/A'}</td>
          <td style="padding: 4px 0; width: 33%;"><b>Phone:</b> ${booking?.emergencyContact?.phone || 'N/A'}</td>
          <td style="padding: 4px 0; width: 33%;"><b>Relationship:</b> ${booking?.emergencyContact?.relationship || 'N/A'}</td>
        </tr>
      </table>
    </div>
  `;

  return `
    <html>
      <head>
        <title>Rental Agreement - ${property?.pgName || property?.societyName || 'Housynest'}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; font-size: 14px; position: relative; z-index: 1; }
          .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 70%; opacity: 0.06; z-index: -1; pointer-events: none; }
          .header-info { text-align: right; font-size: 12px; color: #64748b; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="watermark" alt="watermark" />` : ''}
        <div class="header-info">
          Generated on: ${todayDateStr}<br/>
          Ref: ${bookingRef}
        </div>
        
        ${detailsBox}
        
        ${formattedContract}
        ${formattedTerms}
        
        <br/><br/>
        <div style="break-inside: avoid; color: #0f172a;">
          <h3 style="font-weight: bold; color: #062F26; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; padding-top: 15px; border-top: 1px dashed #cbd5e1; margin-bottom: 20px;">PARTIES TO THE AGREEMENT</h3>
          
          <p style="margin-bottom: 10px; font-size: 13px;"><b>Licensor (Owner/Property Manager):</b> ${actualOwner?.fullName || '[owner_name]'}</p>
          <p style="margin-bottom: 30px; font-size: 13px;"><b>Signature:</b> ___________________________</p>
          
          <p style="margin-bottom: 10px; font-size: 13px;"><b>Licensee (Tenant):</b> ${tenant?.fullName || '[tenant_name]'}</p>
          <p style="margin-bottom: 30px; font-size: 13px;"><b>Signature:</b> ___________________________</p>
          
          <p style="margin-bottom: 10px; font-size: 13px;"><b>Date:</b> ${todayDateStr}</p>
        </div>
      </body>
    </html>
  `;
};


const updateBedStatus = async (propertyId, roomName, bedName) => {
  if (!roomName || !bedName) return;
  const property = await Property.findById(propertyId);
  if (!property || property.propertyType !== 'PG') return;

  // Find all active/pending bookings for this property and bed
  const activeBookings = await Booking.find({
    propertyId,
    'roomDetails.roomName': roomName,
    'roomDetails.bedName': bedName,
    status: { $in: ['Reserved', 'Confirmed', 'Active'] }
  });

  let bedStatus = 'Vacant';
  const hasOccupied = activeBookings.some(b => ['Confirmed', 'Active'].includes(b.status));
  const hasReserved = activeBookings.some(b => ['Pending Request', 'Pending Payment', 'Reserved'].includes(b.status));

  if (hasOccupied) {
    bedStatus = 'Occupied';
  } else if (hasReserved) {
    bedStatus = 'Reserved';
  }

  let bedFound = false;
  for (const floor of property.floors) {
    if (bedFound) break;
    const room = floor.rooms.find(r => r.roomName === roomName);
    if (room) {
      const bed = room.beds.find(b => b.bedName === bedName);
      if (bed) {
        if (bed.status !== 'Maintenance') {
          bed.status = bedStatus;
        }
        bedFound = true;
      }
    }
  }

  if (bedFound) {
    await property.save();
    if (bedStatus === 'Vacant') {
      triggerRoomAvailabilityAlerts(propertyId, roomName);
    }
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Tenant)
export const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      moveInDate,
      expectedMoveOutDate,
      personalInfo,
      emergencyContact,
      roomDetails,
      paymentDetails
    } = req.body;

    // Validate propertyId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID. This seems to be a mock property rather than a real one in the database.' });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for double bookings
    if (property.propertyType === 'PG' && roomDetails?.roomName && roomDetails?.bedName) {
      const activeBookings = await Booking.find({
        propertyId,
        'roomDetails.roomName': roomDetails.roomName,
        'roomDetails.bedName': roomDetails.bedName,
        status: { $in: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });

      if (activeBookings.length > 0) {
        return res.status(400).json({ message: 'This bed is already booked or reserved.' });
      }
    } else if (property.propertyType === 'Tenant') {
      const activeBookings = await Booking.find({
        propertyId,
        status: { $in: ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });
      if (activeBookings.length > 0) {
        return res.status(400).json({ message: 'This property is already booked or reserved.' });
      }
    }

    // Determine status: all bookings now require owner approval (Pending Request) by default
    const status = 'Pending Request';

    const booking = new Booking({
      propertyId,
      ownerId: property.owner,
      tenantId: req.user._id,
      propertyType: property.propertyType,
      status,
      moveInDate,
      expectedMoveOutDate,
      personalInfo,
      emergencyContact,
      roomDetails,
      paymentDetails
    });

    const savedBooking = await booking.save();

    // Update user profile with personal details entered during booking
    try {
      const userToUpdate = await User.findById(req.user._id);
      if (userToUpdate) {
        let updated = false;
        if (personalInfo?.dob && !userToUpdate.dob) {
          userToUpdate.dob = personalInfo.dob;
          updated = true;
        }
        if (personalInfo?.gender && !userToUpdate.gender) {
          userToUpdate.gender = personalInfo.gender;
          updated = true;
        }
        if (emergencyContact && (!userToUpdate.emergencyContact || !userToUpdate.emergencyContact.phone)) {
          userToUpdate.emergencyContact = emergencyContact;
          updated = true;
        }
        if (updated) {
          await userToUpdate.save();
        }
      }
    } catch (profileErr) {
      console.error('Error updating user profile during booking:', profileErr);
    }

    // Update bed status based on the initial booking status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    if (status === 'Pending Request') {
      try {
        const io = getIo();
        if (io) {
          io.to(`user_${property.owner.toString()}`).emit('newBookingRequest', { bookingId: savedBooking._id });
        }
      } catch (err) {
        console.error('Socket error on createBooking:', err);
      }
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    const fs = await import('fs');
    fs.appendFileSync('booking_error.log', JSON.stringify({ body: req.body, error: error.message, stack: error.stack }) + '\n');
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Server error creating booking',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get owner's bookings
// @route   GET /api/bookings/owner
// @access  Private (Owner)
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('propertyId', 'pgName societyName propertyCategory propertyType address images locality city monthlyRent securityAmount maintenanceCharges pgPricing floors')
      .populate('tenantId', 'fullName email phone profilePic')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    console.error('Fetch owner bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Get tenant's bookings
// @route   GET /api/bookings/tenant
// @access  Private (Tenant)
export const getTenantBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantId: req.user._id })
      .populate('propertyId', 'pgName societyName propertyCategory propertyType address images locality city monthlyRent securityAmount maintenanceCharges pgPricing floors')
      .populate('ownerId', 'fullName email phone profilePic')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    console.error('Fetch tenant bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Update booking status (Approve/Reject/Cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending Request', 'Pending Payment', 'Reserved', 'Confirmed', 'Active', 'Rejected', 'Cancelled', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    // Owner can approve(Confirmed) or reject(Rejected)
    // Tenant can cancel(Cancelled)
    if (booking.ownerId.toString() !== req.user._id.toString() && booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const previousStatus = booking.status;
    booking.status = status;
    const updatedBooking = await booking.save();

    // Update bed status when booking status changes
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send email if it's being approved for payment
    if (status === 'Pending Payment' && previousStatus !== 'Pending Payment') {
      const tenant = await User.findById(booking.tenantId);
      const property = await Property.findById(booking.propertyId);
      if (tenant && tenant.email && property) {
        const isToken = booking.paymentDetails?.paymentMethod === 'Token Amount' || booking.paymentDetails?.paymentMethod === 'Token (40%)';
        const subject = isToken ? 'Reservation Request Approved - Action Required' : 'Booking Confirmation Approved - Action Required';

        const actionText = isToken
          ? 'pay the Token amount to reserve your bed.'
          : 'pay the Full amount to confirm your booking.';

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const dashboardUrl = `${frontendUrl}/dashboard/tenant`;

        const textContent = `Hello ${tenant.fullName},\n\nGreat news! Your request for ${property.pgName || property.societyName || 'Property'} has been approved by the owner.\n\nTo secure this, please log in to your Housynest dashboard and ${actionText}\n\nBooking Details:\n- Property: ${property.pgName || property.societyName || 'Property'}\n- Room: ${booking.roomDetails?.roomName || 'N/A'}\n- Bed: ${booking.roomDetails?.bedName || 'N/A'}\n- Move In Date: ${new Date(booking.moveInDate).toDateString()}\n\nThank you for choosing Housynest!`;

        const htmlContent = `
          <p style="font-size: 16px; color: #334155;">Hello <strong>${tenant.fullName}</strong>,</p>
          <p style="font-size: 16px; color: #334155; margin-top: 16px;">Great news! Your booking request for <strong style="color: #062F26;">${property.pgName || property.societyName || 'Property'}</strong> has been approved by the owner.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #062F26; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 120px;">Room:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${booking.roomDetails?.roomName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Bed:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${booking.roomDetails?.bedName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Move-In Date:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 16px; color: #334155;">To secure this booking, please log in to your Housynest dashboard and <strong>${actionText}</strong></p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" style="background-color: #0AA87D; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block; font-family: sans-serif;">Go to My Dashboard to Pay</a>
          </div>
          
          <p style="font-size: 16px; color: #334155; margin-top: 24px;">Thank you for choosing Housynest!</p>
        `;
        
        await sendGenericEmail(tenant.email, subject, textContent, htmlContent);
      }
    }

    try {
      const io = getIo();
      if (io) {
        // Emit to tenant
        io.to(`user_${booking.tenantId.toString()}`).emit('bookingStatusUpdated', { bookingId: updatedBooking._id, status: updatedBooking.status });
        // Emit to owner
        io.to(`user_${booking.ownerId.toString()}`).emit('bookingStatusUpdated', { bookingId: updatedBooking._id, status: updatedBooking.status });
      }
    } catch (err) {
      console.error('Socket error on updateBookingStatus:', err);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

// @desc    Process payment for a booking
// @route   PUT /api/bookings/:id/pay
// @access  Private
export const processPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    // Update payment details and status
    const isTokenPayment = booking.paymentDetails.paymentMethod === 'Token Amount' || booking.paymentDetails.paymentMethod === 'Token (40%)';
    booking.paymentDetails.status = isTokenPayment ? 'Partial' : 'Paid';
    booking.paymentDetails.paidAt = new Date();
    booking.status = isTokenPayment ? 'Reserved' : 'Confirmed';

    // Trigger E-stamp simulation automatically when Confirmed
    if (booking.status === 'Confirmed') {
      booking.eStampStatus = 'Processing';
      booking.eSignStatus = 'Pending';
      // Simulate webhook delay for e-stamp generation
      setTimeout(async () => {
        try {
          const b = await import('../models/Booking.js').then(m => m.default).then(BookingModel => BookingModel.findById(booking._id));
          if (b) {
            b.eStampStatus = 'Completed';
            b.eStampId = 'ESTAMP-' + Date.now();
            await b.save();
          }
        } catch (e) {
          console.error('Error in e-stamp simulation:', e);
        }
      }, 5000);
    }

    const updatedBooking = await booking.save();

    // Update bed status when booking status changes via payment
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send confirmation email
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);

    if (tenant && tenant.email && property) {
      const isToken = booking.paymentDetails.paymentMethod === 'Token Amount' || booking.paymentDetails.paymentMethod === 'Token (40%)';
      const subject = isToken ? 'Bed Reserved Successfully!' : 'Room Booked Successfully!';
      const htmlContent = `
        <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
          <p>Hi <b>${tenant.fullName}</b>,</p>
          <p>Great news! Your ${isToken ? 'reservation' : 'booking'} for <b>${property.pgName || property.societyName || 'Property'}</b> has been successfully confirmed. We are thrilled to welcome you to the Housynest family!</p>
          <p>Here are your confirmed details:</p>
          
          <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">Booking Summary</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 4px;"><b>Booking ID:</b> #${booking._id.toString().substring(booking._id.toString().length - 8).toUpperCase()}</li>
            <li style="margin-bottom: 4px;"><b>Property:</b> ${property.pgName || property.societyName || 'Property'}</li>
            <li style="margin-bottom: 4px;"><b>Room:</b> ${booking.roomDetails?.roomName || 'N/A'}</li>
            <li style="margin-bottom: 4px;"><b>Bed:</b> ${booking.roomDetails?.bedName || 'N/A'}</li>
            <li style="margin-bottom: 4px;"><b>Location:</b> ${[property.address, property.locality, property.city, property.state].filter(Boolean).join(', ')}</li>
            <li style="margin-bottom: 4px;"><b>Move-in Date:</b> ${new Date(booking.moveInDate).toLocaleDateString('en-GB')}</li>
          </ul>

          <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">Payment Details</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 4px;"><b>Monthly Rent:</b> ₹${Number((property.monthlyRent || '0').toString().replace(/\D/g, '')).toLocaleString('en-IN')}</li>
            <li style="margin-bottom: 4px;"><b>Security Deposit:</b> ₹${Number((property.securityAmount || '0').toString().replace(/\D/g, '')).toLocaleString('en-IN')} (To be paid during move-in)</li>
            <li style="margin-bottom: 4px;"><b>Amount Paid Now:</b> ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')}</li>
            <li style="margin-bottom: 4px;"><b>Payment Status:</b> ${booking.paymentDetails?.status || 'Paid'} (${booking.paymentDetails?.paymentMethod || 'N/A'})</li>
          </ul>

          <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">What happens next?</h3>
          <ol style="padding-left: 16px;">
            <li style="margin-bottom: 6px;"><b>Contact the Owner:</b> The property owner is expecting you. You can reach them via your Housynest dashboard to discuss the move-in time.</li>
            <li style="margin-bottom: 6px;"><b>Documentation:</b> Please keep your Aadhar Card, PAN Card, and a passport-size photo ready for the rental agreement and verification.</li>
            <li style="margin-bottom: 6px;"><b>Move-in:</b> Pack your bags and get ready to move into your new home on <b>${new Date(booking.moveInDate).toLocaleDateString('en-GB')}</b>!</li>
          </ol>

          <p style="margin-top: 24px;">If you have any questions or need assistance, our support team is always here to help. Just reply to this email or contact us at support@housynest.com.</p>
          <p>Welcome home!</p>
          <br>
          <p>Warm regards,<br><b style="color: #062F26;">The Housynest Team</b></p>
        </div>
      `;
      await sendGenericEmail(tenant.email, subject, 'Your booking has been confirmed! Please view this email in an HTML compatible client.', htmlContent);

      // --- Notify Owner ---
      const owner = await User.findById(property.owner);
      if (owner && owner.email) {
        const ownerSubject = isToken ? 'New Bed Reservation!' : 'New Room Booking!';
        const ownerContent = `
          Hello ${owner.fullName},

          Great news! A new booking payment has been made for your property.
          
          Booking Details:
          - Property: ${property.pgName || property.societyName || 'Property'}
          - Room: ${booking.roomDetails?.roomName || 'N/A'}
          - Bed: ${booking.roomDetails?.bedName || 'N/A'}
          - Tenant Name: ${tenant.fullName}
          - Move In Date: ${new Date(booking.moveInDate).toDateString()}
          - Payment Received: ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')} (${booking.paymentDetails.paymentMethod})

          Please log in to your dashboard to view more details.
        `;
        await sendGenericEmail(owner.email, ownerSubject, ownerContent, null);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error processing payment' });
  }
};

// @desc    Process remaining balance payment for a reserved booking
// @route   PUT /api/bookings/:id/pay-balance
// @access  Private
export const payBalance = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    if (booking.status !== 'Reserved') {
      return res.status(400).json({ message: 'Only Reserved bookings can have a balance paid' });
    }

    const remainingAmount = req.body.amount || 0;

    // Update payment details and status
    booking.paymentDetails.amount = Number(booking.paymentDetails.amount) + Number(remainingAmount);
    booking.paymentDetails.paymentMethod = 'Full Payment';
    booking.paymentDetails.status = 'Paid';
    booking.paymentDetails.paidAt = new Date();
    booking.status = 'Confirmed';

    // Trigger E-stamp simulation automatically when Confirmed
    if (booking.status === 'Confirmed') {
      booking.eStampStatus = 'Processing';
      booking.eSignStatus = 'Pending';
      // Simulate webhook delay for e-stamp generation
      setTimeout(async () => {
        try {
          const b = await import('../models/Booking.js').then(m => m.default).then(BookingModel => BookingModel.findById(booking._id));
          if (b) {
            b.eStampStatus = 'Completed';
            b.eStampId = 'ESTAMP-' + Date.now();
            await b.save();
          }
        } catch (e) {
          console.error('Error in e-stamp simulation:', e);
        }
      }, 5000);
    }

    const updatedBooking = await booking.save();

    // Update bed status when booking status changes via balance payment
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Send confirmation email
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);

    if (tenant && tenant.email && property) {
      const subject = 'Full Balance Paid - Room Confirmed!';
      const htmlContent = `
        <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
          <p>Hi <b>${tenant.fullName}</b>,</p>
          <p>Great news! Your payment of ₹${remainingAmount.toLocaleString('en-IN')} for the remaining balance was successful. Your room at <b>${property.pgName || property.societyName || 'Property'}</b> is now fully booked and confirmed. We are thrilled to welcome you to the Housynest family!</p>
          <p>Here are your confirmed details:</p>
          
          <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">Booking Summary</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 4px;"><b>Booking ID:</b> #${booking._id.toString().substring(booking._id.toString().length - 8).toUpperCase()}</li>
            <li style="margin-bottom: 4px;"><b>Property:</b> ${property.pgName || property.societyName || 'Property'}</li>
            <li style="margin-bottom: 4px;"><b>Room:</b> ${booking.roomDetails?.roomName || 'N/A'}</li>
            <li style="margin-bottom: 4px;"><b>Bed:</b> ${booking.roomDetails?.bedName || 'N/A'}</li>
            <li style="margin-bottom: 4px;"><b>Location:</b> ${[property.address, property.locality, property.city, property.state].filter(Boolean).join(', ')}</li>
            <li style="margin-bottom: 4px;"><b>Move-in Date:</b> ${new Date(booking.moveInDate).toLocaleDateString('en-GB')}</li>
          </ul>

          <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">Payment Details</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 4px;"><b>Monthly Rent:</b> ₹${Number((property.monthlyRent || '0').toString().replace(/\D/g, '')).toLocaleString('en-IN')}</li>
            <li style="margin-bottom: 4px;"><b>Security Deposit:</b> ₹${Number((property.securityAmount || '0').toString().replace(/\D/g, '')).toLocaleString('en-IN')} (To be paid during move-in)</li>
            <li style="margin-bottom: 4px;"><b>Total Paid:</b> ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')}</li>
            <li style="margin-bottom: 4px;"><b>Payment Status:</b> ${booking.paymentDetails?.status || 'Paid'} (${booking.paymentDetails?.paymentMethod || 'N/A'})</li>
          </ul>

          <h3 style="color: #062F26; border-bottom: 1px solid #eee; padding-bottom: 8px;">What happens next?</h3>
          <ol style="padding-left: 16px;">
            <li style="margin-bottom: 6px;"><b>Contact the Owner:</b> The property owner is expecting you. You can reach them via your Housynest dashboard to discuss the move-in time.</li>
            <li style="margin-bottom: 6px;"><b>Documentation:</b> Please keep your Aadhar Card, PAN Card, and a passport-size photo ready for the rental agreement and verification.</li>
            <li style="margin-bottom: 6px;"><b>Move-in:</b> Pack your bags and get ready to move into your new home on <b>${new Date(booking.moveInDate).toLocaleDateString('en-GB')}</b>!</li>
          </ol>

          <p style="margin-top: 24px;">If you have any questions or need assistance, our support team is always here to help. Just reply to this email or contact us at support@housynest.com.</p>
          <p>Welcome home!</p>
          <br>
          <p>Warm regards,<br><b style="color: #062F26;">The Housynest Team</b></p>
        </div>
      `;
      await sendGenericEmail(tenant.email, subject, 'Your full balance has been paid and your booking is confirmed! Please view this email in an HTML compatible client.', htmlContent);

      // --- Notify Owner ---
      const owner = await User.findById(property.owner);
      if (owner && owner.email) {
        const ownerSubject = 'Full Balance Received for Booking!';
        const ownerContent = `
          Hello ${owner.fullName},

          Great news! The tenant ${tenant.fullName} has paid the remaining balance of ₹${remainingAmount.toLocaleString('en-IN')}.
          The booking is now fully confirmed.
          
          Booking Details:
          - Property: ${property.pgName || property.societyName || 'Property'}
          - Room: ${booking.roomDetails?.roomName || 'N/A'}
          - Bed: ${booking.roomDetails?.bedName || 'N/A'}
          - Total Paid: ₹${booking.paymentDetails.amount?.toLocaleString('en-IN')}

          Please log in to your dashboard to view more details.
        `;
        await sendGenericEmail(owner.email, ownerSubject, ownerContent, null);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Process balance payment error:', error);
    res.status(500).json({ message: 'Server error processing balance payment' });
  }
};

// @desc    Get rent collection data for owner dashboard
// @route   GET /api/bookings/owner/rent-collection
// @access  Private
export const getOwnerRentCollection = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Fetch all active/completed bookings for the owner
    const bookings = await Booking.find({
      ownerId,
      status: { $in: ['Active', 'Completed', 'Confirmed', 'Reserved'] }
    }).populate('propertyId').populate('tenantId', 'fullName email profileImage');

    let totalCollected = 0;
    let totalPending = 0;
    let onTimeCount = 0;
    let rentList = [];

    const today = new Date();

    bookings.forEach((booking, idx) => {
      // 1. Calculate Rent Amount
      let rentAmount = 14500;
      if (booking.propertyId) {
        if (booking.propertyId.pgPricing && booking.roomDetails && booking.roomDetails.sharingType) {
          const baseType = booking.roomDetails.sharingType.includes('Single') ? 'Single' : booking.roomDetails.sharingType.includes('Double') ? 'Double' : booking.roomDetails.sharingType.includes('Triple') ? 'Triple' : booking.roomDetails.sharingType.includes('Four') ? 'Four' : 'Other';
          const typeStr = `${baseType}_${booking.propertyId.isAC ? 'AC' : 'NonAC'}`;
          if (booking.propertyId.pgPricing[typeStr]?.rentPerBed) {
            rentAmount = Number(booking.propertyId.pgPricing[typeStr].rentPerBed.replace(/\D/g, ''));
          }
        } else if (booking.propertyId.monthlyRent) {
          rentAmount = Number(booking.propertyId.monthlyRent.replace(/\D/g, ''));
        }
      }

      // 2. Calculate Next Due Date
      const moveInDate = booking.moveInDate ? new Date(booking.moveInDate) : new Date(booking.createdAt);
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), moveInDate.getDate());

      // If due date has passed this month, the next one is next month
      if (nextDueDate < today) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      const diffMs = nextDueDate - today;
      const daysDue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      // 3. Determine Status dynamically based on days due
      let status = 'Paid';
      let statusColor = 'bg-emerald-50 text-brand-teal border-emerald-100';

      // If due within 7 days, it's pending (they haven't paid yet for the upcoming cycle)
      // Since we simulate: if nextDueDate is very soon (<= 7 days), it's "Reminder sent" or "Pending"
      if (daysDue <= 7 && daysDue > 0) {
        status = 'Reminder sent';
        statusColor = 'bg-amber-50 text-amber-500 border-amber-100';
        totalPending += rentAmount;
      } else if (nextDueDate < today) {
        // Technically this branch won't be hit with the logic above, but for robustness
        status = 'Overdue';
        statusColor = 'bg-red-50 text-red-500 border-red-100';
        totalPending += rentAmount;
      } else {
        // If it's more than 7 days away, assume they paid this month's rent early or last month's rent on time
        status = 'Paid';
        statusColor = 'bg-emerald-50 text-brand-teal border-emerald-100';
        totalCollected += rentAmount;
        onTimeCount++;
      }

      const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      rentList.push({
        id: booking._id,
        propertyId: booking.propertyId ? booking.propertyId._id : null,
        name: booking.tenantId ? booking.tenantId.fullName : (booking.personalInfo?.firstName + ' ' + booking.personalInfo?.lastName),
        amount: `₹${rentAmount.toLocaleString('en-IN')}`,
        rawAmount: rentAmount,
        date: `Due ${formatDate(nextDueDate)}`,
        rawDate: nextDueDate,
        method: status === 'Paid' ? 'UPI' : '—', // Simulating payment method
        status,
        statusColor
      });
    });

    const totalExpected = totalCollected + totalPending;
    const onTimePercentage = bookings.length > 0 ? Math.round((onTimeCount / bookings.length) * 100) : 100;

    const summary = [
      { id: 1, title: `₹${(totalCollected / 100000).toFixed(1)}L`, subtitle: `Collected (of ₹${(totalExpected / 100000).toFixed(1)}L)`, icon: 'lucide:wallet', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0}%]`, progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-[#062F26] hover:border-[#062F26]', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-slate-300' },
      { id: 2, title: `${onTimePercentage}%`, subtitle: `On Time (${onTimeCount}/${bookings.length})`, icon: 'lucide:calendar-check', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${onTimePercentage}%]`, progressBg: 'bg-brand-teal', hoverBg: 'hover:bg-brand-teal hover:border-brand-teal', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-emerald-50' },
      { id: 3, title: `₹${totalPending >= 100000 ? (totalPending / 100000).toFixed(1) + 'L' : totalPending.toLocaleString('en-IN')}`, subtitle: `Pending (${bookings.length - onTimeCount} tenants)`, icon: 'lucide:clock', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: `w-[${totalExpected > 0 ? (totalPending / totalExpected) * 100 : 0}%]`, progressBg: 'bg-amber-500', hoverBg: 'hover:bg-amber-500 hover:border-amber-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-amber-100' },
      { id: 4, title: bookings.length > 0 ? '24' : '0', subtitle: 'AI Reminder Calls', icon: 'lucide:bot', bg: 'bg-white', border: 'border-slate-100', text: 'text-[#062F26]', progress: 'w-[100%]', progressBg: 'bg-indigo-500', hoverBg: 'hover:bg-indigo-500 hover:border-indigo-500', hoverText: 'group-hover:text-white', hoverSubtitle: 'group-hover:text-indigo-100' },
    ];

    // Sort rentList by due date
    rentList.sort((a, b) => a.rawDate - b.rawDate);

    res.json({
      summaryData: summary,
      rentData: rentList
    });
  } catch (error) {
    console.error('Error fetching rent collection:', error);
    res.status(500).json({ message: 'Server error fetching rent collection' });
  }
};

// @desc    Auto-activate bookings whose move-in date has arrived
// @route   N/A (Cron Job)
// @access  Internal
export const autoActivateBookings = async () => {
  try {
    const today = new Date();
    // Reset time to start of day for comparison
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      status: { $in: ['Confirmed', 'Reserved'] },
      moveInDate: { $lte: today }
    });

    for (const booking of bookings) {
      booking.status = 'Active';
      const updatedBooking = await booking.save();

      // Update bed status when booking status changes via auto-activation
      if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
        await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
      }
    }

    if (bookings.length > 0) {
      console.log(`[Cron] Auto-activated ${bookings.length} bookings successfully.`);
    }
  } catch (error) {
    console.error('[Cron] Error auto-activating bookings:', error);
  }
};

// @desc    Auto-disburse bookings 2 days after move-in date if not confirmed
// @route   N/A (Cron Job)
// @access  Internal
export const autoDisburseBookings = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(0, 0, 0, 0);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const bookings = await Booking.find({
      status: 'Active',
      tenantConfirmedMoveIn: false,
      moveInDate: { $lte: twoDaysAgo }
    })
    .populate('tenantId')
    .populate('ownerId')
    .populate('propertyId');

    for (const booking of bookings) {
      if (booking.payoutStatus !== 'Paid') {
        await processBookingPayout(booking, true);
      }
    }

    if (bookings.length > 0) {
      console.log(`[Cron] Auto-disbursed ${bookings.length} bookings successfully.`);
    }
  } catch (error) {
    console.error('[Cron] Error auto-disbursing bookings:', error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('propertyId', 'pgName societyName propertyCategory propertyType city locality address images price rent')
      .populate('tenantId', 'fullName email phone profilePic')
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin bookings', error: error.message });
  }
};

const processBookingPayout = async (booking, isAutoConfirmed = false) => {
  // Payout Calculation
  const rentAmount = booking.paymentDetails?.rentAmount || 0;
  const securityDeposit = booking.paymentDetails?.securityDeposit || 0;
  
  // 4% commission on rent only
  const housynestCommission = rentAmount * 0.04;
  const rentPayout = rentAmount - housynestCommission;
  const totalPayoutAmount = securityDeposit + rentPayout;

  if (!booking.paymentDetails.housynestFee) {
      booking.paymentDetails.housynestFee = housynestCommission;
  }

  const ownerAccountId = booking.ownerId?.bankDetails?.razorpayLinkedAccountId;
  let payoutStatusStr = 'Paid';

  if (totalPayoutAmount > 0) {
    if (!ownerAccountId) {
      console.warn(`Move-in confirmed but no Razorpay Linked Account ID for owner ${booking.ownerId._id}`);
      payoutStatusStr = 'Pending';
    } else {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        await razorpay.transfers.create({
          account: ownerAccountId,
          amount: Math.round(totalPayoutAmount * 100), // in paise
          currency: 'INR',
          notes: {
            bookingId: booking._id.toString(),
            purpose: isAutoConfirmed ? 'Auto Move-in Payout' : 'Move-in Payout'
          }
        });

        payoutStatusStr = 'Paid';
      } catch (transferErr) {
        console.error('Razorpay Route Transfer Error:', transferErr);
        payoutStatusStr = 'Pending';
      }
    }
  }

  // Set confirmation and trigger payout
  booking.tenantConfirmedMoveIn = true;
  booking.moveInConfirmedAt = new Date();
  booking.payoutStatus = payoutStatusStr;
  booking.status = 'Active'; // Change status to Active upon move-in confirmation

  // Mark modified since paymentDetails is a nested object
  booking.markModified('paymentDetails');

  const updatedBooking = await booking.save();

  // Send emails
  try {
    const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';

    // Email to Owner
    if (booking.ownerId && booking.ownerId.email) {
      const ownerSubject = `Move-in Confirmed & Payout Initiated - ${propertyName}`;
      const amountString = totalPayoutAmount > 0 ? `Total Payout Amount: ₹${totalPayoutAmount.toLocaleString('en-IN')} (Security Deposit + Rent minus 4% Housynest commission)` : '';
      const autoConfirmedNote = isAutoConfirmed ? `\nNote: This move-in was auto-confirmed by the system as 2 days have passed since the move-in date.\n` : '';
      
      const ownerContent = `
        Hello ${booking.ownerId.fullName},

        Great news! The move-in for your tenant, ${booking.tenantId.fullName}, at ${propertyName} has been confirmed.
        ${autoConfirmedNote}
        The rent and security deposit collected by Housynest have now been released from Escrow and the payout has been initiated to your registered bank account.
        
        Booking Details:
        - Property: ${propertyName}
        - Tenant: ${booking.tenantId.fullName}
        - Move-in Date: ${new Date(booking.moveInDate).toDateString()}
        - Payout Status: ${payoutStatusStr === 'Paid' ? 'Released' : 'Processing/Pending (Please check your bank details)'}
        ${amountString ? `- ${amountString}` : ''}

        Thank you for choosing Housynest!
      `;
      await sendGenericEmail(booking.ownerId.email, ownerSubject, ownerContent, null);
    }

    // Email to Tenant
    if (booking.tenantId && booking.tenantId.email) {
      const tenantSubject = `Move-in Confirmation Successful - ${propertyName}`;
      const autoConfirmedNote = isAutoConfirmed ? `\nNote: This move-in was automatically confirmed by the system since 2 days have passed since your scheduled move-in date.\n` : '';

      const tenantContent = `
        Hello ${booking.tenantId.fullName},

        Thank you for choosing Housynest! The move-in at ${propertyName} is now confirmed.
        ${autoConfirmedNote}
        Your initial rent and security deposit have now been released from Escrow and transferred to the owner.
        We hope you have a wonderful stay!
        
        If you face any issues, feel free to contact Housynest support.

        Thank you for choosing Housynest!
      `;
      await sendGenericEmail(booking.tenantId.email, tenantSubject, tenantContent, null);
    }
  } catch (emailErr) {
    console.error('Error sending move-in confirmation emails:', emailErr);
  }

  return updatedBooking;
};

// @desc    Confirm move-in by tenant and trigger payout
// @route   PUT /api/bookings/:id/confirm-move-in
// @access  Private (Tenant)
export const confirmMoveIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tenantId')
      .populate('ownerId')
      .populate('propertyId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the tenant can confirm move-in' });
    }

    if (booking.tenantConfirmedMoveIn) {
      return res.status(400).json({ message: 'Move-in already confirmed' });
    }

    const updatedBooking = await processBookingPayout(booking, false);
    res.json(updatedBooking);
  } catch (error) {
    console.error('Confirm move-in error:', error);
    res.status(500).json({ message: 'Server error confirming move-in' });
  }
};

// @desc    Request Move Out (Tenant)
// @route   POST /api/bookings/:id/request-move-out
// @access  Private (Tenant only)
export const requestMoveOut = async (req, res) => {
  try {
    const { intendedMoveOutDate, reason } = req.body;

    if (!intendedMoveOutDate) {
      return res.status(400).json({ message: 'Intended move-out date is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('ownerId', 'email fullName')
      .populate('tenantId', 'fullName email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the tenant can request a move-out' });
    }

    booking.moveOutRequest = {
      isRequested: true,
      requestedAt: new Date(),
      intendedMoveOutDate: new Date(intendedMoveOutDate),
      status: 'Pending',
      reason: reason || ''
    };

    const updatedBooking = await booking.save();

    // Send email to owner
    if (booking.ownerId && booking.ownerId.email) {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
      const ownerSubject = `Move-out Requested - ${propertyName}`;
      const ownerContent = `
        Hello ${booking.ownerId.fullName},

        Your tenant, ${booking.tenantId.fullName}, has requested to move out from ${propertyName}.
        Intended Move-out Date: ${new Date(intendedMoveOutDate).toDateString()}
        Reason: ${reason || 'Not specified'}

        Please log in to your dashboard to review this request and process the final checkout.

        Thank you!
      `;
      try {
        await sendGenericEmail(booking.ownerId.email, ownerSubject, ownerContent, null);
      } catch (e) {
        console.error('Error sending move-out request email:', e);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Request move out error:', error);
    res.status(500).json({ message: 'Server error requesting move out' });
  }
};

// @desc    Reject Move Out Request (Owner)
// @route   POST /api/bookings/:id/reject-move-out
// @access  Private (Owner only)
export const rejectMoveOut = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('tenantId', 'email fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can reject a move-out request' });
    }

    if (!booking.moveOutRequest || !booking.moveOutRequest.isRequested) {
      return res.status(400).json({ message: 'No move-out request found' });
    }

    booking.moveOutRequest.status = 'Rejected';
    booking.moveOutRequest.rejectionReason = rejectionReason;

    const updatedBooking = await booking.save();

    // Send email to tenant
    if (booking.tenantId && booking.tenantId.email) {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
      const tenantSubject = `Move-out Request Rejected - ${propertyName}`;
      const tenantContent = `
        Hello ${booking.tenantId.fullName},

        Your request to move out from ${propertyName} on ${new Date(booking.moveOutRequest.intendedMoveOutDate).toDateString()} has been rejected by the owner.
        
        Reason for rejection:
        ${rejectionReason}

        Please log in to your dashboard to clear any pending dues or contact the owner for more details.

        Thank you!
      `;
      try {
        await sendGenericEmail(booking.tenantId.email, tenantSubject, tenantContent, null);
      } catch (e) {
        console.error('Error sending rejection email:', e);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Reject move out error:', error);
    res.status(500).json({ message: 'Server error rejecting move out' });
  }
};

// @desc    Process Checkout (Owner)
// @route   POST /api/bookings/:id/process-checkout
// @access  Private (Owner only)
export const processCheckout = async (req, res) => {
  try {
    const { deductions } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('tenantId', 'email fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can process a checkout' });
    }

    if (!booking.moveOutRequest || !booking.moveOutRequest.isRequested) {
      // If the owner is checking them out without a formal request, we can auto-fill it
      booking.moveOutRequest = {
        isRequested: true,
        requestedAt: new Date(),
        intendedMoveOutDate: new Date(),
      };
    }

    booking.moveOutRequest.status = 'Completed';
    booking.moveOutRequest.deductions = deductions || 0;

    // Mark the entire booking as completed
    booking.status = 'Completed';
    booking.expectedMoveOutDate = new Date(); // Actual move out date

    const updatedBooking = await booking.save();

    // Update bed status
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Auto-close open maintenance tickets
    await MaintenanceTicket.updateMany(
      { 
        tenantId: booking.tenantId._id, 
        propertyId: booking.propertyId._id, 
        status: { $in: ['Pending', 'In-Progress'] } 
      },
      { 
        $set: { status: 'Closed' } 
      }
    );

    // Send email to tenant
    if (booking.tenantId && booking.tenantId.email) {
      const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
      const tenantSubject = `Checkout Completed - ${propertyName}`;
      const tenantContent = `
        Hello ${booking.tenantId.fullName},

        The owner has processed your final checkout for ${propertyName}.
        
        Final Settlement Details:
        - Security Deposit Deductions (Damages/Dues): ₹${deductions || 0}
        
        We hope you had a great stay!

        Thank you for choosing Housynest.
      `;
      try {
        await sendGenericEmail(booking.tenantId.email, tenantSubject, tenantContent, null);
      } catch (e) {
        console.error('Error sending checkout email:', e);
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Process checkout error:', error);
    res.status(500).json({ message: 'Server error processing checkout' });
  }
};

// @desc    Email Agreement PDF
// @route   POST /api/bookings/:id/email-agreement
// @access  Private
export const emailAgreement = async (req, res) => {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ message: 'HTML content is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'pgName societyName')
      .populate('tenantId', 'email fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the requester is either the tenant or the admin/owner
    if (booking.tenantId._id.toString() !== req.user._id.toString() && booking.ownerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to email this agreement' });
    }

    if (!booking.tenantId || !booking.tenantId.email) {
      return res.status(400).json({ message: 'Tenant email not found' });
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();

    const propertyName = booking.propertyId?.pgName || booking.propertyId?.societyName || 'Property';
    const subject = `Your Rental Agreement - ${propertyName}`;
    const textContent = `
      Hello ${booking.tenantId.fullName},

      Please find attached the PDF copy of your rental agreement for ${propertyName}.

      Thank you for choosing Housynest!
    `;

    // Email attachment using the existing email service setup
    // Since sendGenericEmail might not support attachments easily out of the box, we will manually send via nodemailer 
    // or modify our sendGenericEmail if it supports it.
    // Let's check if we can pass attachments to sendGenericEmail. 
    // Usually it doesn't, so let's import nodemailer dynamically or assume sendGenericEmail handles it.
    // Wait, let's just use nodemailer directly here to be safe, as it's standard.

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: booking.tenantId.email,
      subject: subject,
      text: textContent,
      attachments: [
        {
          filename: 'Rental_Agreement.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Agreement PDF emailed successfully' });
  } catch (error) {
    console.error('Email agreement error:', error);
    res.status(500).json({ message: 'Server error sending agreement email' });
  }
};

// @desc    Update Consent Status (Aadhaar OTP verified by frontend)
// @route   PUT /api/bookings/:id/consent
// @access  Private
export const updateBookingConsent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tenantId')
      .populate('ownerId')
      .populate('propertyId');
      
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let isTenantConsenting = false;
    if (booking.tenantId._id.toString() === req.user._id.toString()) {
      booking.tenantConsentStatus = 'Consented';
      booking.eSignStatus = 'Completed';
      booking.eStampStatus = 'Completed';
      if (!booking.eStampId) {
         booking.eStampId = 'ESTAMP-' + Date.now();
      }
      isTenantConsenting = true;
    } else if (booking.ownerId && booking.ownerId._id.toString() === req.user._id.toString()) {
      booking.ownerConsentStatus = 'Consented';
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedBooking = await booking.save();

    const isFullyConsented = updatedBooking.tenantConsentStatus === 'Consented' && updatedBooking.ownerConsentStatus === 'Consented';

    // Automatically generate and send PDF if BOTH have consented
    if (isFullyConsented) {
      // Run asynchronously so we don't block the API response
      (async () => {
         try {
           const tenant = booking.tenantId;
           const property = booking.propertyId;
           const owner = booking.ownerId;
           
           if (!tenant || !property) return;
           
           const actualOwnerId = owner ? owner._id : property.owner;
           const actualOwner = owner ? owner : await User.findById(actualOwnerId);

           const htmlContent = getPdfHtmlContent(booking, tenant, property, actualOwner);
           
           const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
           const page = await browser.newPage();
           await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
           const pdfBuffer = await page.pdf({
             format: 'A4',
             printBackground: true,
             margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
           });
           await browser.close();

           const propertyName = property.pgName || property.societyName || 'Property';
           const subject = `Your Rental Agreement - ${propertyName}`;
           
            const textContentTenant = `Hello ${tenant.fullName},\n\nCongratulations! The e-Sign process for your rental agreement at ${propertyName} has been successfully completed by both parties.\n\nYour finalized, legally-binding rental agreement is attached to this email as a PDF document for your records.\n\nWelcome to your new home!\n\nBest regards,\nHousynest Team`;
            const htmlContentTenant = `
              <p style="font-size: 16px; color: #334155;">Hello <strong>${tenant.fullName}</strong>,</p>
              <p style="font-size: 16px; color: #334155; margin-top: 16px;">Congratulations! The e-Sign process for your rental agreement at <strong style="color: #062F26;">${propertyName}</strong> has been successfully completed by both parties.</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #0AA87D; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #062F26; font-weight: 500;">Your finalized, legally-binding rental agreement is securely attached to this email as a PDF document for your records.</p>
              </div>
              <p style="font-size: 16px; color: #334155;">Please keep this document safe. We wish you a wonderful stay!</p>
              <p style="font-size: 16px; color: #334155; margin-top: 24px;">Welcome to your new home!<br/><br/>Best regards,<br/><strong>Housynest Team</strong></p>
            `;
            
            const textContentOwner = `Hello ${actualOwner.fullName},\n\nGreat news! The rental agreement for your property ${propertyName} has been successfully signed by both you and the tenant, ${tenant.fullName}.\n\nYour finalized, legally-binding rental agreement is attached to this email as a PDF document for your records.\n\nThank you for hosting with Housynest!\n\nBest regards,\nHousynest Team`;
            const htmlContentOwner = `
              <p style="font-size: 16px; color: #334155;">Hello <strong>${actualOwner.fullName}</strong>,</p>
              <p style="font-size: 16px; color: #334155; margin-top: 16px;">Great news! The rental agreement for your property <strong style="color: #062F26;">${propertyName}</strong> has been successfully signed by both you and your tenant, <strong>${tenant.fullName}</strong>.</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #0AA87D; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #062F26; font-weight: 500;">The finalized, legally-binding rental agreement is securely attached to this email as a PDF document for your records.</p>
              </div>
              <p style="font-size: 16px; color: #334155;">Thank you for hosting with Housynest!</p>
              <p style="font-size: 16px; color: #334155; margin-top: 24px;">Best regards,<br/><strong>Housynest Team</strong></p>
            `;

            const attachments = [{
              filename: 'Rental_Agreement.pdf',
              content: pdfBuffer,
              contentType: 'application/pdf'
            }];

            // Send emails in parallel
            const emailPromises = [];
            if (tenant.email) {
              emailPromises.push(sendGenericEmail(tenant.email, subject, textContentTenant, htmlContentTenant, attachments));
            }
            if (actualOwner && actualOwner.email) {
              emailPromises.push(sendGenericEmail(actualOwner.email, subject, textContentOwner, htmlContentOwner, attachments));
            }
           
           await Promise.all(emailPromises);

         } catch (err) {
           console.error('Error generating/sending auto PDF agreement:', err);
         }
      })();
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking consent error:', error);
    res.status(500).json({ message: 'Server error updating consent' });
  }
};

// @desc    Download Agreement PDF
// @route   GET /api/bookings/:id/download-agreement
// @access  Private
export const downloadAgreement = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tenantId')
      .populate('ownerId')
      .populate('propertyId');
      
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Check if both have consented
    if (booking.tenantConsentStatus !== 'Consented' || booking.ownerConsentStatus !== 'Consented') {
      return res.status(400).json({ message: 'Agreement is not fully signed yet.' });
    }

    const tenant = booking.tenantId;
    const property = booking.propertyId;
    const owner = booking.ownerId;
    const actualOwner = owner ? owner : await User.findById(property.owner);

    const htmlContent = getPdfHtmlContent(booking, tenant, property, actualOwner);
    
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Rental_Agreement.pdf"',
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download agreement error:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
};


// @desc    Trigger E-Stamp and E-Sign process (simulated)
// @route   PUT /api/bookings/:id/trigger-estamp
// @access  Private
export const triggerEStampAndSign = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // In a real scenario, this is triggered post-payment by a webhook.
    // We simulate API delays
    booking.eStampStatus = 'Processing';
    booking.eSignStatus = 'Processing';
    await booking.save();

    setTimeout(async () => {
      booking.eStampStatus = 'Completed';
      booking.eStampId = 'ESTAMP-' + Date.now();
      booking.eSignStatus = 'Completed';
      booking.finalDocumentUrl = 'https://example.com/signed-document.pdf';
      await booking.save();
    }, 5000); // 5 sec simulated delay

    res.json({ message: 'E-Stamp and E-Sign process initiated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error triggering e-stamp' });
  }
};

// @desc    Send a booking request (Phase 1)
// @route   POST /api/bookings/request
// @access  Private
export const requestBooking = async (req, res) => {
  try {
    const { propertyId, moveInDate, roomDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for double bookings if PG
    if (property.propertyType === 'PG' && roomDetails?.roomName && roomDetails?.bedName) {
      const activeBookings = await Booking.find({
        propertyId,
        'roomDetails.roomName': roomDetails.roomName,
        'roomDetails.bedName': roomDetails.bedName,
        status: { $in: ['Pending Payment', 'Reserved', 'Confirmed', 'Active'] }
      });
      if (activeBookings.length > 0) {
        return res.status(400).json({ message: 'This bed is already booked or reserved.' });
      }
    }

    const bookingId = `BKG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newBooking = new Booking({
      bookingId,
      propertyId,
      ownerId: property.owner,
      tenantId: req.user._id,
      status: 'Pending Request',
      propertyType: property.propertyType,
      moveInDate,
      roomDetails: roomDetails || {},
      personalInfo: {}, // To be filled later
      emergencyContact: {}, // To be filled later
      paymentDetails: {
        amount: 0,
        rentAmount: roomDetails?.rent || 0,
        securityDeposit: roomDetails?.deposit || 0,
        status: 'Pending'
      }
    });

    const savedBooking = await newBooking.save();

    // Update bed status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    // Send email to owner
    const owner = await User.findById(property.owner);
    const tenant = req.user;
    const propName = property.societyName || property.pgName || property.propertyCategory || 'Property';
    
    if (owner && owner.email) {
      const ownerSubject = `New Booking Request for ${propName}`;
      const ownerContent = `Hello ${owner.name},\n\nYou have a new booking request for ${propName} from ${tenant.name}. Move-in date is requested for ${new Date(moveInDate).toDateString()}.\n\nPlease log in to your dashboard to review and accept this request.\n\nThanks,\nHousynest Team`;
      await sendGenericEmail(owner.email, ownerSubject, ownerContent, null).catch(err => console.error("Email error:", err));
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating booking request' });
  }
};

// @desc    Accept a booking request (Phase 2)
// @route   PUT /api/bookings/:id/accept-request
// @access  Private (Owner)
export const acceptBookingRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'Pending Payment';
    const savedBooking = await booking.save();

    // Update bed status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    // Send email to tenant
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);
    const propName = property?.societyName || property?.pgName || property?.propertyCategory || 'Property';
    if (tenant && tenant.email) {
      const subject = `Booking Request Accepted for ${propName}`;
      const content = `Hello ${tenant.name},\n\nGreat news! Your booking request for ${propName} has been accepted by the owner.\n\nPlease log in to your Housynest dashboard and navigate to "My Bookings" to complete the payment and finalise your move-in.\n\nThanks,\nHousynest Team`;
      await sendGenericEmail(tenant.email, subject, content, null).catch(err => console.error("Email error:", err));
    }

    res.json({ message: 'Request accepted successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject a booking request
// @route   PUT /api/bookings/:id/reject-request
// @access  Private (Owner)
export const rejectBookingRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'Rejected';
    const savedBooking = await booking.save();

    // Update bed status
    if (savedBooking.roomDetails?.roomName && savedBooking.roomDetails?.bedName) {
      await updateBedStatus(savedBooking.propertyId, savedBooking.roomDetails.roomName, savedBooking.roomDetails.bedName);
    }

    // Send email to tenant
    const tenant = await User.findById(booking.tenantId);
    const property = await Property.findById(booking.propertyId);
    const propName = property?.societyName || property?.pgName || property?.propertyCategory || 'Property';
    if (tenant && tenant.email) {
      const subject = `Booking Request Update for ${propName}`;
      const content = `Hello ${tenant.name},\n\nUnfortunately, your booking request for ${propName} could not be accepted at this time.\n\nPlease explore other properties on Housynest.\n\nThanks,\nHousynest Team`;
      await sendGenericEmail(tenant.email, subject, content, null).catch(err => console.error("Email error:", err));
    }

    res.json({ message: 'Request rejected successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete booking details (Phase 2 of booking flow)
// @route   PUT /api/bookings/:id/complete
// @access  Private
export const completeBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { personalInfo, emergencyContact, paymentDetails } = req.body;

    booking.personalInfo = personalInfo || booking.personalInfo;
    booking.emergencyContact = emergencyContact || booking.emergencyContact;
    
    if (paymentDetails) {
      booking.paymentDetails = {
        ...booking.paymentDetails,
        ...paymentDetails
      };
      
      if (paymentDetails.status === 'Paid' || paymentDetails.status === 'Partial') {
        booking.paymentDetails.paidAt = new Date();
        const isTokenPayment = paymentDetails.paymentMethod === 'Token Amount' || paymentDetails.paymentMethod === 'Token (40%)';
        booking.status = isTokenPayment ? 'Reserved' : 'Confirmed';
        booking.paymentDetails.status = isTokenPayment ? 'Partial' : 'Paid';

        if (booking.status === 'Confirmed') {
          booking.eStampStatus = 'Processing';
          booking.eSignStatus = 'Pending';
        }
      }
    }

    const updatedBooking = await booking.save();

    // Update bed status
    if (updatedBooking.roomDetails?.roomName && updatedBooking.roomDetails?.bedName) {
      await updateBedStatus(updatedBooking.propertyId, updatedBooking.roomDetails.roomName, updatedBooking.roomDetails.bedName);
    }

    // Generate and send receipt asynchronously if payment was made
    if (paymentDetails && (paymentDetails.status === 'Paid' || paymentDetails.status === 'Partial')) {
      (async () => {
        try {
          const property = await Property.findById(updatedBooking.propertyId);
          const tenant = await User.findById(updatedBooking.tenantId);
          const pdfBuffer = await generateReceiptPdfBuffer(updatedBooking, property, tenant);
          
          const propName = property?.societyName || property?.pgName || property?.propertyCategory || 'Property';
          const subject = `Payment Receipt for ${propName}`;
          const text = `Hello ${tenant.fullName || 'Tenant'},\n\nThank you for your payment! Please find your official payment receipt attached to this email.\n\nBest regards,\nHousynest Team`;
          const htmlContent = `
            <p style="font-size: 16px; color: #334155;">Hello <strong>${tenant.fullName || 'Tenant'}</strong>,</p>
            <p style="font-size: 16px; color: #334155; margin-top: 16px;">Thank you for your payment towards your booking at <strong style="color: #062F26;">${propName}</strong>.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0AA87D; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #062F26; font-weight: 500;">Your official payment receipt is securely attached to this email as a PDF document for your records.</p>
            </div>
            <p style="font-size: 16px; color: #334155;">If you have any questions about this payment, please don't hesitate to contact support.</p>
            <p style="font-size: 16px; color: #334155; margin-top: 24px;">Best regards,<br/><strong>Housynest Team</strong></p>
          `;
          
          const attachments = [{
            filename: `Receipt-${updatedBooking.bookingId || updatedBooking._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }];
          
          await sendGenericEmail(tenant.email, subject, text, htmlContent, attachments);
        } catch (err) {
          console.error('Failed to generate/send receipt:', err);
        }
      })();
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error completing booking details' });
  }
};
