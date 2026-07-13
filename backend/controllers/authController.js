import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';

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
        role: assignedRole
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
