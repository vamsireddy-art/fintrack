const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinTrack 3D Combined Fullstack API is operational with Supabase DB' });
});

// Serve static frontend build from frontend/dist
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Catch-all route for Express v5 to serve client-side React SPA router
app.get('/{*splat}', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API Endpoint Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Combined Server & Connect to DB
const startServer = async () => {
  try {
    console.log('⚡ Initializing Supabase Connection...');
    app.listen(PORT, () => {
      console.log(`🚀 Combined Fullstack Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting combined server:', error);
    process.exit(1);
  }
};

startServer();
