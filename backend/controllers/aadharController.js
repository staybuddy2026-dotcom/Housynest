import User from '../models/User.js';

// Mock sending OTP
export const generateAadharOtp = async (req, res) => {
  try {
    const { aadharNumber } = req.body;
    
    if (!aadharNumber || aadharNumber.length !== 12) {
      return res.status(400).json({ message: 'Valid 12-digit Aadhaar number is required.' });
    }

    // In a real app, you would call a provider API like Zoop/Setu here.
    // For now, we mock success.
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to registered mobile number.',
      referenceId: 'MOCK_REF_' + Date.now(),
      last4Aadhar: aadharNumber.slice(-4)
    });
  } catch (error) {
    console.error('Error generating Aadhar OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mock verifying OTP
export const verifyAadharOtp = async (req, res) => {
  try {
    const { otp, referenceId, aadharNumber, fullName } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    // In a real app, verify OTP using provider API.
    if (otp !== '123456') { // Mock OTP is always 123456
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Return mock success with verified details
    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully.',
      data: {
        isAadharVerified: true,
        aadharName: fullName || 'Mock Verified Name',
        last4Aadhar: aadharNumber ? aadharNumber.slice(-4) : 'XXXX'
      }
    });

  } catch (error) {
    console.error('Error verifying Aadhar OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
