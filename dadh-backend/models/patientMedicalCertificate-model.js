const mongoose = require("mongoose");

const patientMedicalCertificateSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    signature: {
      type: String,  // yahan aap base64 string ya image URL store kar sakte hain
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PatientMedicalCertificate = mongoose.model(
  "PatientMedicalCertificate",
  patientMedicalCertificateSchema
);

module.exports = PatientMedicalCertificate;
