const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);
const Consultation = new mongoose.model("Consultation", consultationsSchema);
module.exports = Consultation;
