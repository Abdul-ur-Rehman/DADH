const mongoose = require("mongoose");

const consulationCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      min: 3,
    },
    notes: {
      type: String,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
const ConsultationCategory = new mongoose.model("ConsultationCategory", consulationCategorySchema);
module.exports = ConsultationCategory;
