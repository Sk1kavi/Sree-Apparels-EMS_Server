// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const staffRoutes = require('./routes/staffRoutes');
app.use('/api/staff', staffRoutes);
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);
const pieceRoutes = require('./routes/pieceRoutes');
app.use('/api/pieces', pieceRoutes);
// Serve uploaded images statically if needed (local disk storage fallback)
app.use('/uploads', express.static('uploads'));

// Root route
app.get('/', (req, res) => {
  res.send('Sree Apparels API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
