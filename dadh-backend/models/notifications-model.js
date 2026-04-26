const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
