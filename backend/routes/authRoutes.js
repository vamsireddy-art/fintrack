const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../config/supabase');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Admin Login (credentials)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required.' });
    }

    const cleanUsername = username.trim();

    // Query Supabase admins table by username or email
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .or(`username.ilike.${cleanUsername},email.ilike.${cleanUsername}`);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    const admin = admins && admins[0];

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
      { adminId: admin.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      username: admin.username,
      email: admin.email || null,
      businessName: admin.business_name || null,
      profilePicture: admin.profile_picture || null,
      authProvider: admin.auth_provider || 'local'
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

    // Check if username or email already exists in Supabase
    let filterQuery = `username.ilike.${cleanUsername}`;
    if (cleanEmail) {
      filterQuery += `,email.ilike.${cleanEmail}`;
    }

    const { data: existingUsers, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .or(filterQuery);

    if (checkError) {
      console.error('Supabase check error:', checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already registered. Please sign in.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new Admin record into Supabase
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert([
        {
          username: cleanUsername,
          email: cleanEmail,
          password: hashedPassword,
          business_name: businessName ? businessName.trim() : null,
          auth_provider: 'local'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ message: 'Failed to create account in database', error: insertError.message });
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: newAdmin.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      username: newAdmin.username,
      email: newAdmin.email,
      businessName: newAdmin.business_name,
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

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Search in Supabase
    const { data: existingAdmins } = await supabase
      .from('admins')
      .select('*')
      .or(`google_id.eq.${googleId},email.eq.${email}`);

    let admin = existingAdmins && existingAdmins[0];

    if (admin) {
      // Update Google info if needed
      const updates = {};
      if (!admin.google_id) {
        updates.google_id = googleId;
        updates.auth_provider = 'google';
      }
      if (picture) updates.profile_picture = picture;

      if (Object.keys(updates).length > 0) {
        const { data: updated } = await supabase
          .from('admins')
          .update(updates)
          .eq('id', admin.id)
          .select()
          .single();
        if (updated) admin = updated;
      }
    } else {
      // Insert new admin record
      const { data: createdAdmin, error: createError } = await supabase
        .from('admins')
        .insert([
          {
            username: name || email.split('@')[0],
            email,
            google_id: googleId,
            profile_picture: picture || null,
            auth_provider: 'google'
          }
        ])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ message: 'Failed to create Google account', error: createError.message });
      }
      admin = createdAdmin;
    }

    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      username: admin.username,
      email: admin.email,
      profilePicture: admin.profile_picture,
      authProvider: admin.auth_provider
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ 
      message: error.message || 'Google authentication failed', 
      error: error.message 
    });
  }
});

// Setup initial admin if no admin exists
router.post('/setup', async (req, res) => {
  try {
    const { count, error } = await supabase.from('admins').select('*', { count: 'exact', head: true });
    if (count && count > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { error: insertErr } = await supabase.from('admins').insert([
      { username, password: hashedPassword, auth_provider: 'local' }
    ]);

    if (insertErr) {
      return res.status(500).json({ message: 'Failed to create admin', error: insertErr.message });
    }
    
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
