const mongoose = require("mongoose");

const consultationCategorySchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultationCategory = mongoose.model(
  "ConsultationCategory",
  consultationCategorySchema
);

module.exports = ConsultationCategory;
