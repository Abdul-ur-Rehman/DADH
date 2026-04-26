const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    billCode: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    /* optional relationship */
    consultation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    total_amount: {
      type: Number,
    },

    issued_at: {
      type: Date,
      default: Date.now,
    }
    },

  { timestamps: true }
);

// const Billing = new mongoose.model("Billing", billingSchema);
const Billing = mongoose.model("Billing", billingSchema, "billings Code");
module.exports = Billing;
