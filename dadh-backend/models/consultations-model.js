const mongoose = require("mongoose");
const { fieldEncryption } = require("mongoose-field-encryption");

const consultationsSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Patient",
    },
    consultationCategory: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      required: true,
      // ref: "ConsultationCategory",
    },
    notes: {
      type: String,
    },
    doctorId: {
      type: String,
      default: null,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Doctor",
    },
    type: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    isExpired: {
      type: Boolean,
      default: false,   // ✅ new field
    },
    medicines: {
      type: Array,
      default: [],
    },
    refer: {
      type: Array,
      default: [],
    },
    certificates: {
      type: Array,
      default: [],
    },
    requestedCertificate: {
      type: Array,
      default: [],
    },

    investigations: {
      type: Array,
      default: [],
    },
    billCodes: {
      type: Array,
      default: [],
    },
    billingLockedAt: {
      type: Date,
      default: null,
    },
    AIScribeNote: {
      type: String,
    },
    medications: {
      type: Array,
      default: [],
    },
    conditions: {
      type: Array,
      default: [],
    },
    isDoctorCalling: {
      type: Boolean,
      default: false,
    },
    isPatientCalling: {
      type: Boolean,
      default: false,
    },
    requiresMedicalCertificate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

consultationsSchema.plugin(fieldEncryption, {
  fields: ["notes", "AIScribeNote"],
  secret: process.env.ENCRYPTION_KEY,
  saltGenerator: () => process.env.ENCRYPTION_SIGNING_KEY.slice(0, 16),
});

const Consultation = new mongoose.model("Consultation", consultationsSchema);
module.exports = Consultation;
