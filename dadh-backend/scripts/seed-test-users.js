/**
 * Seed script — safe to re-run (idempotent)
 * 1. Updates ALL existing patient + doctor phones starting with "91" → "92"
 * 2. Creates Test Patient 2 (if not already present)
 * 3. Creates Test Doctor 2  (if not already present)
 */
const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const Patient = require("../models/patient-model");
const Doctor  = require("../models/doctor-model");

async function run() {
  await mongoose.connect(process.env.URI, {
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
  });
  console.log("DB connected");

  // 1. Patch existing phones 91... -> 92...
  const patients = await Patient.find({ phone: /^91/ });
  for (const p of patients) {
    const oldPhone = p.phone;
    p.phone = "92" + p.phone.slice(2);
    await p.save();
    console.log(`Patient "${p.name}" phone: ${oldPhone} -> ${p.phone}`);
  }

  const doctors = await Doctor.find({ phone: /^91/ });
  for (const d of doctors) {
    const oldPhone = d.phone;
    d.phone = "92" + d.phone.slice(2);
    await d.save();
    console.log(`Doctor "${d.name} ${d.surname}" phone: ${oldPhone} -> ${d.phone}`);
  }

  // 2. New Test Patient 2
  const existingP2 = await Patient.findOne({ medicareNumber: "9876543210" });
  if (existingP2) {
    console.log("Patient 2 already exists - skipping");
  } else {
    await Patient.create({
      name:           "Test Patient 2",
      email:          "patient2@test.com",
      phone:          "921234567891",
      city:           "Sydney",
      state:          "NSW",
      DOB:            "1992-08-15",
      medicareNumber: "9876543210",
      address:        "2 Collins Street",
      zipCode:        "2000",
      gender:         "female",
      status:         1,
    });
    console.log("Created Test Patient 2");
  }

  // 3. New Test Doctor 2
  const existingD2 = await Doctor.findOne({ prescriberNumber: 101 });
  if (existingD2) {
    console.log("Doctor 2 already exists - skipping");
  } else {
    await Doctor.create({
      name:             "Test",
      surname:          "Doctor2",
      email:            "doctor2@test.com",
      phone:            "929876543211",
      city:             "Melbourne",
      state:            "VIC",
      doctorType:       "General Practitioner",
      isHomeVisit:      "no",
      workType:         "Full Time",
      startDate:        new Date("2020-01-01"),
      howFind:          "Referral",
      gender:           "Male",
      prescriberNumber: 101,
      providerNumber:   1000001,
      qualification:    "MBBS",
      status:           1,
    });
    console.log("Created Test Doctor 2");
  }

  console.log("\nDone");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
