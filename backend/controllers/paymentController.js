import Razorpay from 'razorpay';
import crypto from 'crypto';

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
