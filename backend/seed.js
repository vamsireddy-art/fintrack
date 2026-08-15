const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_manager';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const username = 'admin';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    
    console.log(`Admin created successfully. Username: ${username}, Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
