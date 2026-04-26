const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.URI;

const updateAdminUsername = async () => {
  try {
    await mongoose.connect(URI, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log('Database connected');

    const Admin = require('./models/admin-model');

    // Find the admin by current username
    const admin = await Admin.findOne({ username: 'shaheryar' });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    // Update username
    admin.username = 'abdurrehman';
    await admin.save();

    console.log('Username updated for admin');
    console.log('New username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Level:', admin.level);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateAdminUsername();