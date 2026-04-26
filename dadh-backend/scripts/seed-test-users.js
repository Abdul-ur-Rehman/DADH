require("dotenv").config();
const mongoose = require("mongoose");
const Patient = require("../models/patient-model");
const Admin = require("../models/admin-model");
const hashPassword = require("../utils/hash-password");

const TEST_PATIENT = {
  name: "Test Patient",
  email: "test.patient@dadh.local",
  phone: "911234567890",
  city: "Sydney",
  state: "NSW",
  DOB: "1990-01-15",
  medicareNumber: "1234567890",
  gender: "male",
  status: 1,
};

const TEST_ADMIN = {
  username: "testadmin",
  email: "test.admin@dadh.local",
  passwordPlain: "Admin@123",
  level: "superadmin",
  status: 1,
};

(async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connected to MongoDB\n");

    // ─── PATIENT ──────────────────────────────────────────────────────
    const existingPatient = await Patient.findOne({ phone: TEST_PATIENT.phone });
    if (existingPatient) {
      Object.assign(existingPatient, TEST_PATIENT);
      await existingPatient.save();
      console.log("Updated existing test patient:", existingPatient._id.toString());
    } else {
      const p = await Patient.create(TEST_PATIENT);
      console.log("Created test patient:", p._id.toString());
    }

    // ─── ADMIN ────────────────────────────────────────────────────────
    const hashed = await hashPassword(TEST_ADMIN.passwordPlain, (err) => {
      if (err) throw err;
    });
    const adminFields = {
      username: TEST_ADMIN.username,
      email: TEST_ADMIN.email,
      password: hashed,
      level: TEST_ADMIN.level,
      status: TEST_ADMIN.status,
    };
    const existingAdmin = await Admin.findOne({ username: TEST_ADMIN.username });
    if (existingAdmin) {
      Object.assign(existingAdmin, adminFields);
      await existingAdmin.save();
      console.log("Updated existing test admin:", existingAdmin._id.toString());
    } else {
      const a = await Admin.create(adminFields);
      console.log("Created test admin:", a._id.toString());
    }

    console.log("\n=== PATIENT LOGIN CREDENTIALS ===");
    console.log("Medicare Number:", TEST_PATIENT.medicareNumber);
    console.log("Phone Number:   ", TEST_PATIENT.phone);
    console.log("Date of Birth:  ", TEST_PATIENT.DOB);
    console.log("(OTP appears in login API response → data.otp)");

    console.log("\n=== ADMIN LOGIN CREDENTIALS ===");
    console.log("Username:", TEST_ADMIN.username);
    console.log("Password:", TEST_ADMIN.passwordPlain);
    console.log("Level:   ", TEST_ADMIN.level, "(can manage other admins)");
    console.log("(No OTP — backend returns token immediately)\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\nSeed failed:", err.message);
    if (err.errors) {
      Object.entries(err.errors).forEach(([k, v]) => console.error(`  - ${k}: ${v.message}`));
    }
    process.exit(1);
  }
})();
