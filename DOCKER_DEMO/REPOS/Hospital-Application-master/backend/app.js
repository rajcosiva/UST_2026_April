// Hospital Management System - Main Server File
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");
const session = require('express-session');
const mongoose = require('mongoose');

// Import MongoStore for production session persistence
const MongoStore = require('connect-mongo');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, '../public')));

// CORS configuration - MUST be before routes
app.use(cors({
  origin: [
    "http://ad38854d1c26d43879026ec8f54509e5-1765280511.ap-south-1.elb.amazonaws.com", 
    "https://ad38854d1c26d43879026ec8f54509e5-1765280511.ap-south-1.elb.amazonaws.com",
    "http://localhost:3000", 
    "http://localhost:5000"
  ],  
  credentials: true,                       // ✅ allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json());

// Session configuration for admin authentication
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'hospital-secret-2024',  
  resave: false,
  saveUninitialized: false,
  name: 'hospital.sid',
  cookie: {
    httpOnly: true,
    secure: false,  // Set to false for LoadBalancer HTTP traffic
    sameSite: 'lax',  // Changed from 'none' to 'lax' for better compatibility
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    domain: undefined  // Remove domain restriction for LoadBalancer
  }
};

// Always use MongoDB session store for persistence across LoadBalancer
if (process.env.MONGO_URI) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 24 hours in seconds
      touchAfter: 24 * 3600 // Lazy session update
    });
    console.log('✅ Using MongoDB session store for LoadBalancer compatibility');
  } catch (error) {
    console.error('❌ Failed to create MongoDB session store:', error);
    console.warn('⚠️ Falling back to memory store - sessions may not persist across LoadBalancer requests');
  }
} else {
  console.warn('⚠️ No MONGO_URI found - using memory store - sessions may not persist across LoadBalancer requests');
}

app.use(session(sessionConfig));

// Debug middleware to log session info
app.use('/api', (req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Session ID: ${req.sessionID}, isAdmin: ${!!(req.session && req.session.isAdmin)}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Static HTML Page Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/admin.html"));
});

app.get("/patient-portal.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/patient-portal.html"));
});

app.get("/html/admin-login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/admin-login.html"));
});

// API Routes Setup
const appointmentRoutes = require('./routes/appointment');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');

// Mount API routes with /api prefix
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

// Admin Authentication Routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Verify admin credentials from environment variables
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Session status check route (for debugging)
app.get('/api/admin/session-status', (req, res) => {
  res.json({
    hasSession: !!req.session,
    isAdmin: !!(req.session && req.session.isAdmin),
    sessionID: req.sessionID || 'No session ID',
    cookies: req.headers.cookie || 'No cookies',
    nodeEnv: process.env.NODE_ENV
  });
});

// Admin Authorization Middleware (Note: This is also defined in middleware/requireAdmin.js)
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// CORS already configured above - removing duplicate

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 Hospital Management System running on http://localhost:${PORT}`);
});

