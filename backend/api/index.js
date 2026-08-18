const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

// ✅ Import supabase so DB is available in all routes
const supabase = require('../config/supabase');

const authRoutes = require('../routes/authRoutes');
const customerRoutes = require('../routes/customerRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────
// Allow: explicit FRONTEND_URL, any *.vercel.app subdomain, and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow any vercel.app subdomain (covers preview deployments too)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Allow explicitly listed origins (exact prefix match)
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parser ───────────────────────────────────────────────────────────
app.use(express.json());

// ─── Request Logger ────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    // Quick Supabase connectivity check
    const { error } = await supabase.from('admins').select('id').limit(1);
    res.json({
      status: 'ok',
      message: 'FinTrack API running on Vercel',
      db: error ? `warn: ${error.message}` : 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({ status: 'ok', message: 'FinTrack API running on Vercel', db: 'unknown' });
  }
});

// ─── 404 Fallback ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// ─── Export for Vercel Serverless ──────────────────────────────────────────
module.exports = app;
