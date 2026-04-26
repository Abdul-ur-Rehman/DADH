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

    // Query patients
    const Patient = require('./models/patient-model');
    const patients = await Patient.find({}, 'name email phone').limit(10); // Get first 10 patients with name, email, phone
    console.log('Patients:', patients);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

connectDB();