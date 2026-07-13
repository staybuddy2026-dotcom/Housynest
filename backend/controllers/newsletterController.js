import Newsletter from '../models/Newsletter.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (!existingSubscriber.active) {
        existingSubscriber.active = true;
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Successfully resubscribed to newsletter!' });
      }
      return res.status(200).json({ message: 'You are already subscribed!' });
    }

    await Newsletter.create({ email });
    res.status(201).json({ message: 'Successfully subscribed to newsletter!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Server error while subscribing', error: error.message });
  }
};
