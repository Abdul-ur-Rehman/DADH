const mongoose = require('mongoose');
const hashPassword = require('./utils/hash-password');
require('dotenv').config();

const URI = process.env.URI;

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(URI, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log('Database connected');

    const Admin = require('./models/admin-model');

    // Find the admin by username
    const admin = await Admin.findOne({ username: 'shaheryar' });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    // Hash new password
    const newPassword = 'admin123'; // Set a known password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    console.log('Password updated for admin:', admin.username);
    console.log('New login credentials:');
    console.log('Username:', admin.username);
    console.log('Password:', newPassword);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateAdminPassword();