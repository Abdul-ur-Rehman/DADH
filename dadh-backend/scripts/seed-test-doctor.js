require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("../models/doctor-model");

const TEST_DOCTOR = {
  name: "Test",
  surname: "Doctor",
  email: "test.doctor@dadh.local",
  phone: "919876543210",
  city: "Sydney",
  state: "NSW",
  doctorType: "General Practitioner",
  isHomeVisit: "No",
  workType: "Full Time",
  startDate: new Date(),
  gender: "Male",
  qualification: "MBBS",
  prescriberNumber: 100,
  providerNumber: 9999999,
  status: 1,
  isSignatureProvided: false,
};

(async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connected to MongoDB");

    const existing = await Doctor.findOne({ phone: TEST_DOCTOR.phone });
    if (existing) {
      Object.assign(existing, TEST_DOCTOR);
      await existing.save();
      console.log("Updated existing test doctor:", existing._id.toString());
    } else {
      const doc = await Doctor.create(TEST_DOCTOR);
      console.log("Created test doctor:", doc._id.toString());
    }

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Prescriber Number:", TEST_DOCTOR.prescriberNumber);
    console.log("Phone Number:    ", TEST_DOCTOR.phone);
    console.log("=========================\n");
    console.log("After clicking Login, the OTP will appear in:");
    console.log("  1. The backend console (this terminal)");
    console.log("  2. The login API response body (data.otp field)");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    if (err.errors) {
      Object.entries(err.errors).forEach(([k, v]) => console.error(`  - ${k}: ${v.message}`));
    }
    process.exit(1);
  }
})();
