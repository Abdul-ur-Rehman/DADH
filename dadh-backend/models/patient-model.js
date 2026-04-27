const mongoose = require("mongoose");
const { fieldEncryption } = require("mongoose-field-encryption");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      email: true,
      max: 255,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      max: 20,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    DOB: {
      type: String,
      required: true,
    },
    // IRN: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   minlength: 1,
    //   maxlength: 1,
    // },

    medicareNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10,
      match: [/^\d{10}$/, "Medicare number must be exactly 10 digits"],
    },

    address: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "undisclosed", "null"],
      default: "null",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    conditions: {
      type: Array,
      default: [],
    },
    lastLogin: {
      type: String,
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    isConsulting: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1, // 1 = active, 0 = inactive
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Field-level encryption for medical PII at rest.
// NOTE: medicareNumber, phone, and DOB are intentionally NOT encrypted here even
// though they are sensitive. The patient login uses Patient.findOne({ medicareNumber,
// phone, DOB }) and Mongoose does not auto-encrypt query criteria — encrypting these
// fields would break login. Phase 8 (compliance) will add hash-based search columns
// (e.g. medicareNumberHash = sha256(value)) so we can encrypt the originals while still
// supporting login lookups. Until then, address + zipCode are encrypted (most sensitive
// non-query PII), and these three remain plaintext.
patientSchema.plugin(fieldEncryption, {
  fields: ["address", "zipCode"],
  secret: process.env.ENCRYPTION_KEY,
  saltGenerator: () => process.env.ENCRYPTION_SIGNING_KEY.slice(0, 16),
});

const Patient = new mongoose.model("Patient", patientSchema);
module.exports = Patient;
