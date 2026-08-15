const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Admin = require('../models/Admin');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Admin Login (credentials)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required.' });
    }

    const cleanUsername = username.trim();

    // Find admin by username OR email (case-insensitive)
    const admin = await Admin.findOne({ 
      $or: [
        { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
        { email: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } }
      ] 
    });

    if (!admin) {
      return res.status(400).json({ message: 'Account not found. Please check your username/email or sign up.' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }
    
    // Create token
    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      username: admin.username,
      email: admin.email || null,
      businessName: admin.businessName || null,
      profilePicture: admin.profilePicture || null,
      authProvider: admin.authProvider || 'local'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register New Business Owner Account
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, businessName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    // Check if user or email already exists (case-insensitive)
    const existingUser = await Admin.findOne({ 
      $or: [
        { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
        ...(cleanEmail ? [{ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already registered. Please sign in.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new Admin / Owner account
    const admin = new Admin({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      businessName: businessName ? businessName.trim() : null,
      authProvider: 'local'
    });
    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      username: admin.username,
      email: admin.email,
      businessName: admin.businessName,
      profilePicture: null,
      authProvider: 'local',
      message: 'Account created successfully!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
});

// Google OAuth Login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find existing admin by googleId or email
    let admin = await Admin.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (admin) {
      // Update Google info if needed
      if (!admin.googleId) {
        admin.googleId = googleId;
        admin.authProvider = 'google';
      }
      if (picture) admin.profilePicture = picture;
      await admin.save();
    } else {
      // Create new admin from Google account
      admin = new Admin({
        username: name || email.split('@')[0],
        email,
        googleId,
        profilePicture: picture || null,
        authProvider: 'google'
      });
      await admin.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      username: admin.username,
      email: admin.email,
      profilePicture: admin.profilePicture,
      authProvider: admin.authProvider
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});

// Create initial admin (only works if no admin exists)
router.post('/setup', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
