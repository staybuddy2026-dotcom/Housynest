import Contract from '../models/Contract.js';
import Inquiry from '../models/Inquiry.js';
import { getIo } from '../socket.js';
import { sendGenericEmail } from '../utils/emailService.js';
import { cloudinary } from '../config/cloudinary.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// @desc    Get all contracts for a lawyer
// @route   GET /api/contracts/lawyer
// @access  Private (Lawyer)
export const getLawyerContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ lawyerId: req.user._id })
      .populate('ownerId', 'fullName email profilePic')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contracts', error: error.message });
  }
};

// @desc    Get a specific contract by ID
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('lawyerId', 'fullName email')
      .populate('ownerId', 'fullName email profilePic');
      
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // Ensure the user requesting is either the lawyer or the owner
    if (contract.lawyerId._id.toString() !== req.user._id.toString() && 
        contract.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this contract' });
    }
    
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contract', error: error.message });
  }
};

// @desc    Create a new draft contract
// @route   POST /api/contracts
// @access  Private (Lawyer)
export const createContract = async (req, res) => {
  try {
    const { ownerId, title } = req.body;
    
    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required' });
    }

    const contract = new Contract({
      lawyerId: req.user._id,
      ownerId,
      title: title || 'New Draft Contract',
      status: 'DRAFT',
      ...req.body
    });

    const savedContract = await contract.save();
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create contract', error: error.message });
  }
};

// @desc    Update a contract
// @route   PUT /api/contracts/:id
// @access  Private
export const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('ownerId', 'fullName email')
      .populate('lawyerId', 'fullName email');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    const isLawyer = contract.lawyerId._id.toString() === req.user._id.toString();
    const isOwner = contract.ownerId._id.toString() === req.user._id.toString();
    const isTenant = contract.tenantEmail && contract.tenantEmail === req.user.email;

    if (!isLawyer && !isOwner && !isTenant) {
      return res.status(403).json({ message: 'Not authorized to update this contract' });
    }

    const { action, ...fields } = req.body;
    let update = {};

    if (isLawyer) {
      if (action === 'save') {
        if (!['DRAFT', 'REVISION_REQUIRED'].includes(contract.status)) {
          return res.status(400).json({ message: 'Cannot edit in current status' });
        }
        const allowed = ['tenantName','tenantEmail','tenantPhone','propertyAddress',
          'monthlyRent','securityDeposit','leaseDuration','startDate','endDate',
          'noticePeriod','terms','policies'];
        for (const key of allowed) {
          if (fields[key] !== undefined) update[key] = fields[key];
        }
      } else if (action === 'send_to_owner') {
        if (!['DRAFT', 'REVISION_REQUIRED'].includes(contract.status)) {
          return res.status(400).json({ message: 'Cannot send in current status' });
        }
        update.status = 'PENDING_OWNER_REVIEW';
        const allowed = ['tenantName','tenantEmail','tenantPhone','propertyAddress',
          'monthlyRent','securityDeposit','leaseDuration','startDate','endDate',
          'noticePeriod','terms','policies'];
        for (const key of allowed) {
          if (fields[key] !== undefined) update[key] = fields[key];
        }
        // Emit socket
        const io = getIo();
        io.to(`user_${contract.ownerId._id}`).emit('newOwnerContract', { ...contract.toObject(), ...update });
        
        // Send email to owner
        if (contract.ownerId.email) {
          const propertyName = update.propertyAddress || contract.propertyAddress || 'your property';
          const subject = `Contract Ready for Review: ${propertyName}`;
          const text = `Hello ${contract.ownerId.fullName},\n\nYour lawyer has prepared the contract for ${propertyName}.\n\nPlease log into your dashboard to review and sign it.\n\nThank you,\nHousynest Team`;
          const html = `<p>Hello ${contract.ownerId.fullName},</p><p>Your lawyer has prepared the contract for <strong>${propertyName}</strong>.</p><p>Please log into your dashboard to review and sign it.</p><p>Thank you,<br/>Housynest Team</p>`;
          await sendGenericEmail(contract.ownerId.email, subject, text, html);
        }
      } else if (action === 'save_tenant') {
        if (!['DRAFT', 'REVISION_REQUIRED', 'OWNER_SIGNED'].includes(contract.status)) {
          return res.status(400).json({ message: 'Cannot edit tenant details in current status' });
        }
        const tenantFields = ['tenantName', 'tenantEmail', 'tenantPhone'];
        for (const key of tenantFields) {
          if (fields[key] !== undefined) update[key] = fields[key];
        }
      } else if (action === 'send_to_tenant') {
        if (contract.status !== 'OWNER_SIGNED') {
          return res.status(400).json({ message: 'Owner must sign before sending to tenant' });
        }
        const tenantEmail = fields.tenantEmail || contract.tenantEmail;
        if (!tenantEmail) {
          return res.status(400).json({ message: 'Tenant email is required' });
        }
        if (fields.tenantName !== undefined) update.tenantName = fields.tenantName;
        if (fields.tenantEmail !== undefined) update.tenantEmail = fields.tenantEmail;
        if (fields.tenantPhone !== undefined) update.tenantPhone = fields.tenantPhone;
        
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        update.status = 'PENDING_TENANT_REVIEW';
        update.tenantSignToken = token;
        
        // In a real app we'd send an email here. For now just emit socket demo
        const io = getIo();
        io.emit('newTenantContract', { ...contract.toObject(), ...update });
      } else if (action === 'email_completed_pdf') {
        if (contract.status !== 'TENANT_SIGNED') {
          return res.status(400).json({ message: 'Contract must be fully signed to email copies' });
        }
        
        const ownerEmail = contract.ownerId?.email;
        const tenantEmail = contract.tenantEmail;
        
        if (!ownerEmail || !tenantEmail) {
          return res.status(400).json({ message: 'Both owner and tenant emails are required' });
        }
        
        const pdfBuffer = await generatePdfBuffer(contract);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        const attachments = [
          {
            filename: `rental-agreement-${contract._id}.pdf`,
            content: pdfBase64,
            encoding: 'base64'
          }
        ];
        
        const subject = `Completed Rental Agreement: ${contract.propertyAddress}`;
        const text = `Please find attached the fully executed rental agreement for ${contract.propertyAddress}.`;
        
        await sendGenericEmail(ownerEmail, subject, text, null, attachments);
        await sendGenericEmail(tenantEmail, subject, text, null, attachments);
        
        return res.json({ message: 'Emails sent successfully', contract });
      }
    }
    
    // Add logic for tenant signing
    // The request user might be the tenant. If the user's email matches the tenantEmail.
    if (isTenant) {
      if (action === 'sign_tenant') {
        if (contract.status !== 'PENDING_TENANT_REVIEW') {
          return res.status(400).json({ message: 'Contract is not ready for your signature' });
        }
        if (!fields.signature) {
          return res.status(400).json({ message: 'Signature is required' });
        }
        
        let signatureUrl = fields.signature;
        if (signatureUrl.startsWith('data:image')) {
          const uploadRes = await cloudinary.uploader.upload(signatureUrl, {
            folder: 'housynest_signatures'
          });
          signatureUrl = uploadRes.secure_url;
        }

        update.status = 'TENANT_SIGNED';
        update.tenantSignature = signatureUrl;
        update.tenantSignedAt = new Date();
        
        // Notify lawyer and owner via socket
        const io = getIo();
        io.to(`user_${contract.lawyerId._id}`).emit('tenantSignedContract', { ...contract.toObject(), ...update });
        io.to(`user_${contract.ownerId._id}`).emit('tenantSignedContract', { ...contract.toObject(), ...update });
        
        // Notify lawyer and owner via email
        if (contract.lawyerId.email) {
          const subject = `Tenant Signed Contract: ${contract.propertyAddress || 'Rental Property'}`;
          const text = `Hello ${contract.lawyerId.fullName},\n\nThe tenant has successfully signed the contract for ${contract.propertyAddress || 'the property'}. The contract is now fully executed.\n\nThank you,\nHousynest Team`;
          const html = `<p>Hello ${contract.lawyerId.fullName},</p><p>The tenant has successfully signed the contract for <strong>${contract.propertyAddress || 'the property'}</strong>. The contract is now fully executed.</p><p>Thank you,<br/>Housynest Team</p>`;
          await sendGenericEmail(contract.lawyerId.email, subject, text, html);
        }

        if (contract.ownerId.email) {
          const subject = `Contract Fully Executed: ${contract.propertyAddress || 'Rental Property'}`;
          const text = `Hello ${contract.ownerId.fullName},\n\nThe tenant has signed the lease agreement for ${contract.propertyAddress || 'the property'}. The contract is now fully executed.\n\nThank you,\nHousynest Team`;
          const html = `<p>Hello ${contract.ownerId.fullName},</p><p>The tenant has signed the lease agreement for <strong>${contract.propertyAddress || 'the property'}</strong>. The contract is now fully executed.</p><p>Thank you,<br/>Housynest Team</p>`;
          await sendGenericEmail(contract.ownerId.email, subject, text, html);
        }
      }
    }

    if (isOwner) {
      if (action === 'request_changes') {
        if (contract.status !== 'PENDING_OWNER_REVIEW') {
          return res.status(400).json({ message: 'Cannot request changes in current status' });
        }
        update.status = 'REVISION_REQUIRED';
        update.revisionNote = fields.revisionNote || '';
      }
      else if (action === 'sign_owner') {
        if (contract.status !== 'PENDING_OWNER_REVIEW') {
          return res.status(400).json({ message: 'Contract is not ready for signing' });
        }
        if (!fields.signature) {
          return res.status(400).json({ message: 'Signature is required' });
        }
        
        let signatureUrl = fields.signature;
        if (signatureUrl.startsWith('data:image')) {
          const uploadRes = await cloudinary.uploader.upload(signatureUrl, {
            folder: 'housynest_signatures'
          });
          signatureUrl = uploadRes.secure_url;
        }
        
        update.ownerSignature = signatureUrl;
        update.ownerSignedAt = new Date();
        const io = getIo();
        
        // Notify lawyer via email
        if (contract.lawyerId.email) {
          const subject = `Owner Signed Contract: ${contract.propertyAddress || 'Rental Property'}`;
          const text = `Hello ${contract.lawyerId.fullName},\n\nThe property owner has successfully signed the contract for ${contract.propertyAddress || 'the property'}.\n\nThank you,\nHousynest Team`;
          const html = `<p>Hello ${contract.lawyerId.fullName},</p><p>The property owner has successfully signed the contract for <strong>${contract.propertyAddress || 'the property'}</strong>.</p><p>Thank you,<br/>Housynest Team</p>`;
          await sendGenericEmail(contract.lawyerId.email, subject, text, html);
        }
        
        if (contract.tenantEmail) {
          update.status = 'PENDING_TENANT_REVIEW';
          io.to(`user_${contract.lawyerId._id}`).emit('ownerSignedContract', { ...contract.toObject(), ...update });
          io.emit('newTenantContract', { ...contract.toObject(), ...update });
          
          // Notify tenant via email
          const subject = `Lease Agreement Ready for Signature: ${contract.propertyAddress || 'Rental Property'}`;
          const text = `Hello,\n\nThe owner has signed the lease agreement for ${contract.propertyAddress || 'the property'}. Please log into your Housynest dashboard to review and sign it.\n\nThank you,\nHousynest Team`;
          const html = `<p>Hello,</p><p>The owner has signed the lease agreement for <strong>${contract.propertyAddress || 'the property'}</strong>. Please log into your Housynest dashboard to review and sign it.</p><p>Thank you,<br/>Housynest Team</p>`;
          await sendGenericEmail(contract.tenantEmail, subject, text, html);
        } else {
          update.status = 'OWNER_SIGNED';
          io.to(`user_${contract.lawyerId._id}`).emit('ownerSignedContract', { ...contract.toObject(), ...update });
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid action or nothing to update' });
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    )
      .populate('lawyerId', 'fullName email')
      .populate('ownerId', 'fullName email');

    res.json(updatedContract);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update contract', error: error.message });
  }
};

// @desc    Delete a contract
// @route   DELETE /api/contracts/:id
// @access  Private (Lawyer)
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    if (contract.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this contract' });
    }

    if (contract.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only draft contracts can be deleted' });
    }

    await Contract.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete contract', error: error.message });
  }
};

// @desc    Get booked tenants for a contract's owner
// @route   GET /api/contracts/:id/booked-tenants
// @access  Private (Lawyer)
export const getBookedTenants = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const inquiries = await Inquiry.find({ ownerId: contract.ownerId })
      .populate('senderId', 'fullName email')
      .sort({ createdAt: -1 });

    const uniqueTenants = [];
    const seenIds = new Set();
    
    inquiries.forEach(inq => {
      if (inq.senderId && !seenIds.has(inq.senderId._id.toString())) {
        seenIds.add(inq.senderId._id.toString());
        uniqueTenants.push({
          _id: inq.senderId._id,
          fullName: inq.senderId.fullName,
          email: inq.senderId.email
        });
      }
    });

    res.json(uniqueTenants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booked tenants', error: error.message });
  }
};

// @desc    Get owner contracts
// @route   GET /api/contracts/owner
// @access  Private (Owner)
export const getOwnerContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ ownerId: req.user._id, status: { $ne: 'DRAFT' } })
      .populate('lawyerId', 'fullName profilePic')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owner contracts', error: error.message });
  }
};

// @desc    Get tenant contracts
// @route   GET /api/contracts/tenant
// @access  Private (Tenant)
export const getTenantContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ tenantEmail: req.user.email, status: { $in: ['PENDING_TENANT_REVIEW', 'TENANT_SIGNED'] } })
      .populate('lawyerId', 'fullName profilePic')
      .populate('ownerId', 'fullName profilePic')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tenant contracts', error: error.message });
  }
};

// @desc    Mark owner contracts as read
// @route   PUT /api/contracts/owner/mark-read
export const markOwnerContractsRead = async (req, res) => {
  try {
    await Contract.updateMany(
      { ownerId: req.user._id, isOwnerRead: false },
      { $set: { isOwnerRead: true } }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

// @desc    Mark tenant contracts as read
// @route   PUT /api/contracts/tenant/mark-read
export const markTenantContractsRead = async (req, res) => {
  try {
    await Contract.updateMany(
      { tenantEmail: req.user.email, isTenantRead: false },
      { $set: { isTenantRead: true } }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

export const generatePdfBuffer = async (contract) => {
  let logoBase64 = '';
  try {
    const logoPath = path.resolve(process.cwd(), '../frontend/src/assets/logo.png');
    logoBase64 = fs.readFileSync(logoPath, 'base64');
  } catch (e) {
    console.error('Could not load logo for PDF', e);
  }

  const logoHtml = logoBase64 ? `<div style="text-align: center; margin-bottom: 20px;"><img src="data:image/png;base64,${logoBase64}" style="max-height: 60px;" alt="Housynest Logo" /></div>` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rental Agreement</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111827; }
        h1 { text-align: center; font-size: 24px; color: #062F26; margin-bottom: 30px; border-bottom: 2px solid #25D366; padding-bottom: 10px; }
        h2 { font-size: 16px; color: #062F26; margin-top: 25px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        p { font-size: 14px; line-height: 1.6; margin: 8px 0; color: #374151; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .col { flex: 1; }
        .label { font-weight: bold; color: #111827; }
        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; }
        .signature-img { max-height: 60px; max-width: 100%; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
      </style>
    </head>
    <body>
      ${logoHtml}
      <h1>Residential Rental Agreement</h1>
      
      <div class="row">
        <div class="col"><span class="label">Contract Date:</span> ${new Date(contract.createdAt).toLocaleDateString()}</div>
        <div class="col"><span class="label">Status:</span> ${contract.status}</div>
      </div>

      <h2>Property Details</h2>
      <p><span class="label">Address:</span> ${contract.propertyAddress || '—'}</p>

      <h2>Parties Involved</h2>
      <div class="row">
        <div class="col">
          <p><span class="label">Owner:</span> ${contract.ownerId?.fullName || '—'}</p>
          <p><span class="label">Email:</span> ${contract.ownerId?.email || '—'}</p>
        </div>
        <div class="col">
          <p><span class="label">Tenant:</span> ${contract.tenantName || '—'}</p>
          <p><span class="label">Email:</span> ${contract.tenantEmail || '—'}</p>
        </div>
      </div>

      <h2>Lease Terms</h2>
      <div class="row">
        <div class="col"><p><span class="label">Monthly Rent:</span> $${contract.monthlyRent || '—'}</p></div>
        <div class="col"><p><span class="label">Security Deposit:</span> $${contract.securityDeposit || '—'}</p></div>
      </div>
      <div class="row">
        <div class="col"><p><span class="label">Start Date:</span> ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '—'}</p></div>
        <div class="col"><p><span class="label">End Date:</span> ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '—'}</p></div>
      </div>
      <p><span class="label">Lease Duration:</span> ${contract.leaseDuration || '—'} months</p>
      <p><span class="label">Notice Period:</span> ${contract.noticePeriod || '—'} days</p>

      <h2>Terms & Conditions</h2>
      <p>${(contract.terms || '—').replace(/\n/g, '<br>')}</p>

      <h2>Policies</h2>
      <p>${(contract.policies || '—').replace(/\n/g, '<br>')}</p>

      <div class="signatures">
        <div class="signature-box">
          <h2>Owner's Signature</h2>
          ${contract.ownerSignature ? `<img src="${contract.ownerSignature}" class="signature-img" />` : '<div style="height:60px; border-bottom:1px solid #000; margin-bottom:5px;"></div>'}
          <p>Signed: ${contract.ownerSignedAt ? new Date(contract.ownerSignedAt).toLocaleDateString() : '—'}</p>
        </div>
        <div class="signature-box">
          <h2>Tenant's Signature</h2>
          ${contract.tenantSignature ? `<img src="${contract.tenantSignature}" class="signature-img" />` : '<div style="height:60px; border-bottom:1px solid #000; margin-bottom:5px;"></div>'}
          <p>Signed: ${contract.tenantSignedAt ? new Date(contract.tenantSignedAt).toLocaleDateString() : '—'}</p>
        </div>
      </div>

      <div class="footer">
        Generated securely by Housynest on ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
  await browser.close();
  return pdfBuffer;
};

// @desc    Download Contract PDF
// @route   GET /api/contracts/:id/pdf
export const generateContractPdf = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('lawyerId', 'fullName email')
      .populate('ownerId', 'fullName email');
      
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    const pdfBuffer = await generatePdfBuffer(contract);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rental-agreement-${contract._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Failed to generate PDF', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
};



