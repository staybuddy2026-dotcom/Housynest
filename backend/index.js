
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import lawyerRequestRoutes from './routes/lawyerRequestRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import cron from 'node-cron';
import { sendVisitReminders } from './controllers/visitController.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Important for cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/lawyer-requests', lawyerRequestRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/v1/chat', chatbotRoutes);

// Cron Job for Visit Reminders
cron.schedule('0 8 * * *', () => {
  console.log('Running daily visit reminders check...');
  sendVisitReminders();
});

app.get('/', (req, res) => {
  res.send('HousyNest Backend is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: err.stack
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
