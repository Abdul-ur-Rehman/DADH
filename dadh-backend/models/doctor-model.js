const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, min: 3, max: 255 },
  surname: { type: String, required: true, trim: true, min: 3, max: 255 },
  email: { type: String, required: true, trim: true, min: 8, max: 255 },
  phone: { type: String, required: true, trim: true, min: 10, max: 20 },
  city: { type: String, required: true, trim: true, min: 3, max: 255 },
  state: { type: String, required: true, trim: true, min: 3, max: 255 },
  doctorType: { type: String, required: true, trim: true, min: 3, max: 255 },
  isHomeVisit: { type: String, required: true, trim: true, min: 2, max: 255 },
  workType: { type: String, required: true, trim: true, min: 3, max: 255 },
  startDate: { type: Date, required: true },
  howFind: { type: String },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
    trim: true,
  },
  prescriberNumber: { type: Number, unique: true, min: 3, max: 255 },
  providerNumber: { type: Number, unique: true, min: 10 },
  qualification: { type: String, required: true, trim: true, min: 3, max: 255 },
  consultedPatients: { type: Array },

  photo: { type: String, default: "" },
  signature: { type: String, default: "" },
  isSignatureProvided: { type: Boolean, default: false },

  isOnline: { type: Boolean, default: false },
  lastLogin: { type: String },
  isConsulting: { type: Boolean, default: false },
  activeConsultationId: { type: String, default: null },
  // ✅ OTP related fields
  otp: { type: String },
  otpExpiry: { type: Date },

  // isApproved: set to true by admin when doctor request is approved
  isApproved: {
    type: Boolean,
    default: false,
  },

  // status: 0 = Disabled by admin, 1 = Enabled
  status: {
    type: Number,
    enum: [0, 1],
    default: 0, // new registrations start blocked until admin approves
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
