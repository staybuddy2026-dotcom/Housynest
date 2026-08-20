import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/housynest');
  
  const RentInvoice = (await import('./models/RentInvoice.js')).default;
  const Booking = (await import('./models/Booking.js')).default;
  
  // Find invoice ending with 6a86cd25
  const invoices = await RentInvoice.find({});
  const inv = invoices.find(i => i._id.toString().toLowerCase().endsWith('6a86cd25'));
  
  if (inv) {
    console.log('Invoice Amount:', inv.amount);
    const booking = await Booking.findById(inv.bookingId);
    console.log('Booking paymentDetails:', JSON.stringify(booking.paymentDetails, null, 2));
    console.log('Booking eStampFees:', booking.eStampFees);
  } else {
    console.log('Invoice not found');
  }
  process.exit(0);
};

run();
