const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.URI;

const updateAdminEmail = async () => {
  try {
    await mongoose.connect(URI, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log('Database connected');

    const Admin = require('./models/admin-model');

    // Find the admin by username
    const admin = await Admin.findOne({ username: 'abdurrehman' });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    // Update email
    admin.email = 'chattha926242@gmail.com';
    await admin.save();

    console.log('Email updated for admin');
    console.log('Username:', admin.username);
    console.log('New Email:', admin.email);
    console.log('Level:', admin.level);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateAdminEmail();