import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import lawyerRequestRoutes from './routes/lawyerRequestRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import ownerProspectRoutes from './routes/ownerProspectRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';
import cron from 'node-cron';
import { sendVisitReminders } from './controllers/visitController.js';
import { generateMonthlyInvoices, sendAutoRentReminders } from './controllers/invoiceController.js';
import { autoActivateBookings } from './controllers/bookingController.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

// Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Important for cookies
app.use(express.json());
app.use(cookieParser());

// Global Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, // Limit each IP to 5000 requests per windowMs in dev, 100 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', globalLimiter);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/lawyer-requests', lawyerRequestRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/owner-prospects', ownerProspectRoutes);
app.use('/api/v1/chat', chatbotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Cron Job for Visit Reminders
cron.schedule('0 8 * * *', () => {
  console.log('Running daily visit reminders check...');
  sendVisitReminders();
});

// Cron Job for Generating Rent Invoices
cron.schedule('0 0 * * *', () => {
  console.log('Running daily rent invoice generation...');
  generateMonthlyInvoices();
});

// Cron Job for Sending Auto Rent Reminders (5 days and 2 days before)
cron.schedule('0 9 * * *', () => {
  console.log('Running auto rent reminders check...');
  sendAutoRentReminders();
});

// Cron Job for Auto-Activating Bookings on Move-In Date
cron.schedule('0 0 * * *', () => {
  console.log('Running daily booking auto-activation check...');
  autoActivateBookings();
});

app.get('/', (req, res) => {
  res.send('HousyNest Backend is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
