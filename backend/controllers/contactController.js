import { sendGenericEmail } from '../utils/emailService.js';

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, topic, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const emailSubject = `New Contact Form Submission: ${topic || 'General Inquiry'}`;
    const emailText = `
You have received a new message from the contact form on HousyNest.

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Topic: ${topic || 'Not provided'}

Message:
${message}
    `;

    // Send email to the specified address
    await sendGenericEmail('staybuddy2026@gmail.com', emailSubject, emailText);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};
