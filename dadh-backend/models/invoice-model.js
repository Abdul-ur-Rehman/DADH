// const mongoose = require("mongoose");

// const invoiceSchema = new mongoose.Schema({
//   consultation_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Consultation",
//     required: true,
//   },
//   patientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Patient",
//     required: true,
//   },
//   doctorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Doctor",
//     required: true,
//   },
//   bills: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Billing",
//     },
//   ],
//   total_amount: {
//     type: Number,
//     required: true,
//   },
//   issued_at: {
//     type: Date,
//     default: Date.now,
//   }
// },
// {timestamps: true}
// );

// const Invoice = new mongoose.model("Invoice", invoiceSchema);
// module.exports = Invoice;
