const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const userRoutes = require('./routes/userRoutes'); 
const binRoute = require('./routes/binRoute');
const sensorRoute = require('./routes/sensorRoute')


// Middleware
app.use(cors());
app.use(express.json());
app.use('/user',userRoutes);
app.use('/bin',binRoute)
app.use('/sensor',sensorRoute)


// Sample route
app.get('/', (req, res) => {
  res.send('Smart Bin Backend API 🚮✅');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
