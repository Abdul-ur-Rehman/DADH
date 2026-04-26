const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log('Database connected');

    // Query admins
    const Admin = require('./models/admin-model');
    const admins = await Admin.find({}, 'username email level').limit(10); // Get first 10 admins with username, email, level
    console.log('Admins:', admins);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

connectDB();