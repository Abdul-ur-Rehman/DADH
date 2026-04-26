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

  signature: { type: String, default: "" },
  isSignatureProvided: { type: Boolean, default: false },

  isOnline: { type: Boolean, default: false },
  lastLogin: { type: String },
  isConsulting: { type: Boolean, default: false },
  activeConsultationId: { type: String, default: null },
  // ✅ OTP related fields
  otp: { type: String },
  otpExpiry: { type: Date },

  // ✅ Only keep this for enable/disable
  status: {
    type: Number,
    enum: [0, 1], // 0 = Disabled, 1 = Enabled
    default: 1,
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
