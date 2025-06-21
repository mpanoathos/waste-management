const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
require('./utils/sensorUtils'); 
const analyticsRoutes = require('./routes/analytics');
const routeRoutes = require('./routes/routeRoutes');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const userRoutes = require('./routes/userRoutes'); 
const binRoute = require('./routes/binRoute');
const sensorRoute = require('./routes/sensorRoute');
const setupSensor = require('./utils/sensorUtils');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportThreadRoutes = require('./routes/reportThreadRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Log environment variables (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables loaded:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV
  });
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/user', userRoutes);
app.use('/bin', binRoute);
app.use('/sensor', sensorRoute);
app.use('/api/payments', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/report-thread', reportThreadRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/routes', routeRoutes);
// Sample route
app.get('/', (req, res) => {
  res.send('Smart Bin Backend API 🚮✅');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // If it's an AppError, use its status code and message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // For unknown errors, return 500
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  } 
});

// Pass io into sensor module
setupSensor(io);
module.exports.io = io;

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // console.log('Available routes:');
  // console.log('- POST /user/forgot-password');
  // console.log('- POST /user/reset-password');
  // console.log('- POST /user/register');
  // console.log('- POST /user/login');
  // console.log('- GET /user/profile');
  // console.log('- GET /user/all');
  // console.log('- POST /chat');
  // console.log('- GET /chat/history');
  // console.log('\n🔗 n8n Webhook Endpoints:');
  // console.log('- GET /webhook/health');
  // console.log('- GET /webhook/bins');
  // console.log('- GET /webhook/bins/full');
  // console.log('- GET /webhook/collections');
  // console.log('- GET /webhook/requests/pending');
  // console.log('- GET /webhook/reports/active');
  // console.log('- GET /webhook/analytics/summary');
  // console.log('\n🤖 AI Assistant Webhook Endpoints:');
  // console.log('- POST /webhook/ai/message');
  // console.log('- GET /webhook/ai/content');
});
