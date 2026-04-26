const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    categories: { 
      type: [String], 
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0  
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model("Medicine", medicineSchema);
module.exports = Medicine;
