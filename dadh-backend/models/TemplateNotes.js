const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    doctorId: {
      type: String,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Use the same variable name
module.exports = mongoose.model("Template", templateSchema, "templates");
