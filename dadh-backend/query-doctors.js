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

    // Query doctors
    const Doctor = require('./models/doctor-model');
    const doctors = await Doctor.find({}, 'name email phone').limit(10); // Get first 10 doctors with name, email, phone
    console.log('Doctors:', doctors);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

connectDB();