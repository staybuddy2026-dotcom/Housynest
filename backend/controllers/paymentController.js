import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/payments/razorpay/order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, bookingId, purpose } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise
      currency: 'INR',
      receipt: bookingId || `rcpt_${Date.now()}`,
      notes: {
        bookingId: bookingId || '',
        purpose: purpose || 'booking_payment',
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

/**
 * @desc    Verify a Razorpay payment signature
 * @route   POST /api/payments/razorpay/verify
 * @access  Private
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is successfully verified
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

/**
 * @desc    Create a Razorpay order for Visit Pass
 * @route   POST /api/payments/visit-pass/order
 * @access  Private
 */
export const createVisitPassOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { passType } = req.body; // '5_visits' or 'unlimited'
    let amount = 0;

    if (passType === '5_visits') {
      amount = 50;
    } else if (passType === 'unlimited') {
      amount = 100;
    } else {
      return res.status(400).json({ message: 'Invalid pass type' });
    }

    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `vp_${Date.now()}_${req.user._id.toString().substring(0, 5)}`,
      notes: {
        passType,
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Visit Pass order:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

/**
 * @desc    Verify Visit Pass payment and update user
 * @route   POST /api/payments/visit-pass/verify
 * @access  Private
 */
export const verifyVisitPassPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, passType } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is successfully verified, update user's pass
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

      let visitsRemaining = 0;
      if (passType === '5_visits') {
        visitsRemaining = 5;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            'visitPass.passType': passType,
            'visitPass.visitsRemaining': visitsRemaining,
            'visitPass.validUntil': validUntil
          }
        },
        { new: true }
      );

      res.status(200).json({ success: true, message: 'Pass activated successfully', user: updatedUser });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying Visit Pass payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};
