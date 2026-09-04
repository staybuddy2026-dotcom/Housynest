import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendGenericEmail } from '../utils/emailService.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['owner', 'tenant', 'lawyer']),
});

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'HousyNest - Account Verification OTP',
      text: `Your OTP for account verification is: ${otp}. It is valid for 5 minutes.`,
    };

    if(process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] OTP for ${email} is ${otp}`);
    }
  } catch (error) {
    console.error("Error sending email", error);
  }
};

export const sendBlockEmail = async (email, reason) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'HousyNest - Account Blocked',
      text: `Your HousyNest account has been blocked by an administrator.\n\nReason: ${reason}\n\nIf you believe this is a mistake, please contact support.`,
    };

    if(process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] Account block notification for ${email}. Reason: ${reason}`);
    }
  } catch (error) {
    console.error("Error sending block email", error);
  }
};

export const sendUnblockEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'HousyNest - Account Unblocked (Warning)',
      text: `Your HousyNest account has been unblocked and your access is restored.\n\nPlease note: This is an official warning. Any further violation of our terms of service or policies may result in a permanent ban from our platform.\n\nThank you for your cooperation.`,
    };

    if(process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] Account unblock notification for ${email}. (Warning included)`);
    }
  } catch (error) {
    console.error("Error sending unblock email", error);
  }
};

export const sendPropertyDeletionEmail = async (email, propertyName, reason) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'HousyNest - Listing Deleted',
      text: `Your listing "${propertyName}" has been removed from HousyNest by an administrator.\n\nReason: ${reason}\n\nIf you believe this is a mistake, please contact support.`,
    };

    if(process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] Property deletion notification for ${email}. Property: ${propertyName}. Reason: ${reason}`);
    }
  } catch (error) {
    console.error("Error sending property deletion email", error);
  }
};

export const sendMaintenanceUpdateEmail = async (email, ticketId, status) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `HousyNest - Maintenance Ticket Update (${ticketId})`,
      text: `Your maintenance ticket ${ticketId} has been updated.\n\nCurrent Status: ${status}\n\nPlease check your HousyNest dashboard for more details.`,
    };

    if(process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] Maintenance update for ${email}. Ticket: ${ticketId}. Status: ${status}`);
    }
  } catch (error) {
    console.error("Error sending maintenance update email", error);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: validatedData.email });

    await Otp.create({
      email: validatedData.email,
      otp: otpCode
    });

    await sendEmail(validatedData.email, otpCode);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { otp, ...userData } = req.body;
    
    if(!otp) {
       return res.status(400).json({ message: 'OTP is required' });
    }
    
    const validatedData = registerSchema.parse(userData);

    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otpRecord = await Otp.findOne({ email: validatedData.email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }
    
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    const user = await User.create({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone,
      password: validatedData.password,
      role: validatedData.role,
      isEmailVerified: true,
      ...(validatedData.role === 'lawyer' && {
        lawyerDetails: {
          barCouncilNumber: userData.barCouncilNumber,
          experience: userData.experience ? Number(userData.experience) : undefined,
          aadharNumber: userData.aadharNumber,
          certificate: req.file ? req.file.path : undefined
        }
      })
    });
    
    await Otp.deleteMany({ email: validatedData.email });

    if (user.role === 'lawyer') {
      return res.status(201).json({
        message: 'Registration complete. Please wait for admin approval.',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePic: user.profilePic || ''
        }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const admin = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'admin',
    });

    const { accessToken, refreshToken } = generateTokens(admin._id);

    res.status(201).json({
      message: 'Admin registered successfully',
      accessToken,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        profilePic: admin.profilePic || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: `Your account has been blocked. Reason: ${user.blockReason || 'Violation of terms'}` });
    }

    if (user.role === 'lawyer' && user.lawyerStatus !== 'approved') {
      if (user.lawyerStatus === 'pending') {
        return res.status(403).json({ message: 'Your account is under review. You can login once an admin approves it.' });
      }
      return res.status(403).json({ message: 'Your account registration was rejected.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!googleResponse.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await googleResponse.json();
    const { email, name, sub: googleId } = payload;
    
    let user = await User.findOne({ email });
    
    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ message: `Your account has been blocked. Reason: ${user.blockReason || 'Violation of terms'}` });
      }

      if (user.role === 'lawyer') {
        return res.status(403).json({ message: 'Lawyers must login with email and password.' });
      }

      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      const assignedRole = role && ['owner', 'tenant', 'lawyer'].includes(role) ? role : 'tenant';
      if (assignedRole === 'lawyer') {
        return res.status(400).json({ message: 'Lawyers cannot register using Google Login.' });
      }

      user = await User.create({
        fullName: name,
        email,
        googleId,
        role: assignedRole,
        isEmailVerified: true
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Logged in successfully!',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Server Error during Google Login', error: error.message });
  }
};

export const sendAadharOtp = async (req, res) => {
  try {
    const { aadharNumber } = req.body;
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({ message: 'Valid 12-digit Aadhaar number is required.' });
    }

    // MOCK OTP generation and sending
    const otpCode = '123456'; 
    console.log(`[MOCK AADHAAR OTP] OTP for Aadhaar ${aadharNumber} is ${otpCode}`);

    // In a real scenario, you'd integrate with an Aadhaar API provider (like SurePass, Zoop, etc.)
    // to generate an OTP to the linked mobile number. We would store this OTP or a transactionId.
    
    // For now, we simulate success
    res.status(200).json({ message: 'OTP sent successfully to the Aadhaar-linked mobile number.' });
  } catch (error) {
    console.error('Error in sendAadharOtp:', error);
    res.status(500).json({ message: 'Server error while sending Aadhaar OTP.', error: error.message });
  }
};

export const verifyAadharOtpAndRegister = async (req, res) => {
  try {
    const { otp, aadharNumber, fullName, email, phone, password, role } = req.body;

    if (!otp || !aadharNumber || !fullName || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (otp !== '123456') {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash the Aadhaar number for security
    const salt = await bcrypt.genSalt(10);
    const hashedAadhar = await bcrypt.hash(aadharNumber, salt);
    const last4Aadhar = aadharNumber.slice(-4);

    const user = await User.create({
      fullName,
      email,
      phone,
      password, // Mongoose schema/pre-save handles password hashing
      role,
      hashedAadhar,
      last4Aadhar,
      isAadharVerified: true
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Registration and Aadhaar Verification complete.',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAadharVerified: user.isAadharVerified,
        profilePic: user.profilePic || ''
      }
    });

  } catch (error) {
    console.error('Error in verifyAadharOtpAndRegister:', error);
    res.status(500).json({ message: 'Server error during Aadhaar verification.', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email address.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    const htmlMessage = `
      <p>You requested a password reset</p>
      <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
    `;

    try {
      await sendGenericEmail(user.email, 'Password Reset Request', message, htmlMessage);
      res.status(200).json({ message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
