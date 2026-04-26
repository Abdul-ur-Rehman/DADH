
// const BiMedlling = require("../models/billing-model");
// const Medicine = require("../models/medicine-model");
// const Consultation = require("../models/consultations-model");
// const Doctor = require("../models/doctor-model");
// const Invoice = require("../models/invoice-model");
// const Billing = require("../models/billing-model");
// const Patient = require("../models/patient-model");
// const ConsultationCategory = require("../models/consultation-category-model");
// const mongoose = require("mongoose");


// const endConsultation = async (req, res, next) => {
//   try {
//     const consultation_id = req.params.id;
//     const { doctor_id, patientId } = req.body;

//     if (!consultation_id || !doctor_id || !patientId) {
//       return res.status(400).json({
//         state: false,
//         message: "Please provide consultation_id and doctor_id and patientId",
//       });
//     }

//     const consultation = await Consultation.findById(consultation_id);
//     if (!consultation) {
//       return res
//         .status(404)
//         .json({ state: false, message: "Consultation not found" });
//     }

//     const doctor = await Doctor.findById(doctor_id);
//     if (!doctor) {
//       return res
//         .status(404)
//         .json({ state: false, message: "Doctor not found" });
//     }

//     const patient = await Patient.findById(patientId);
//     if (!patient) {
//       return res
//         .status(404)
//         .json({ state: false, message: "Patient not found" });
//     }

//     // ✅ Update doctor
//     const updateDoctor = await Doctor.findByIdAndUpdate(doctor_id, {
//       isConsulting: false,
//       $push: { consultedPatients: patientId },
//     });
//     if (!updateDoctor) {
//       return res
//         .status(400)
//         .json({ state: false, message: "Doctor not updated" });
//     }

//     // ✅ Update patient
//     const updatePatient = await Patient.findByIdAndUpdate(
//       patientId,
//       { assignedDoctorId: null, isConsulting: false },
//       { new: true }
//     );
//     if (!updatePatient) {
//       return res
//         .status(400)
//         .json({ state: false, message: "Patient not updated" });
//     }

//     // ✅ Calculate total billing
//     let totalAmount = 0;
//     if (consultation.billCodes && consultation.billCodes.length > 0) {
//       const bills = await Billing.find({
//         _id: { $in: consultation.billCodes },
//       });

//       totalAmount = bills.reduce(
//         (sum, bill) => sum + (Number(bill.amount) || 0),
//         0
//       );
//     }
//     const totalAmountRounded = totalAmount.toFixed(2);

//     // ✅ Generate invoice
//     const newInvoice = new Invoice({
//       consultation_id,
//       patientId: consultation.patientId,
//       doctorId: consultation.doctorId,
//       bills: consultation.billCodes,
//       total_amount: totalAmountRounded,
//       issued_at: new Date(),
//     });
//     await newInvoice.save();

//     // ✅ Mark consultation as completed
//     await Consultation.findByIdAndUpdate(consultation_id, {
//       isCompleted: true,
//       isConsulting: false,
//     });

//     // ✅ 🔄 Fetch all updated consultations for that patient
//     const updatedConsultations = await Consultation.find({ patientId });

//     // ✅ Respond back with updated consultation list
//     return res.status(200).json({
//       state: true,
//       message: "End consultation successfully",
//       total_amount: totalAmountRounded,
//       invoice_id: newInvoice._id,
//       updatedConsultations, // 🔁 send to frontend
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const getByBillCode = async (req, res) => {
//   try {
//     const invoice = await Invoice.findById(req.params.id);
//     if (!invoice) {
//       return res.status(404).json({ state: false, message: "Invoice not found" });
//     }
//     return res.status(200).json({ state: true, total_amount: invoice.total_amount, data: invoice });
//   } catch (err) {
//     return res.status(500).json({ state: false, message: "Server error" });
//   }
// };



// const getByPatientId = async (req, res, next) => {
//   try {
//     const { patientId } = req.params;

//     const invoices = await Invoice.find({
//       patientId: new mongoose.Types.ObjectId(patientId),
//     })
//       .populate({
//         path: "doctorId",
//         select: "name specialization",
//       })
//       .populate({
//         path: "consultation_id",
//         select: "type date notes",
//       })
//       .select("-__v");

//     if (!invoices.length) {
//       return res
//         .status(200)
//         .json({ state: true, message: "No invoices for this patient." });
//     }

//     res.status(200).json({
//       state: true,
//       total_invoices: invoices.length,
//       invoices,
//     });
//   } catch (err) {
//     console.log("Error:", err);
//     next(err);
//   }
// };



// const getAll = async (req, res, next) => {
//   try {
//     // Fetch all invoices and populate patient details
//     const invoices = await Invoice.find()
//       .populate({
//         path: "patientId",
//         select: "name DOB zipCode gender", // Fetch required patient fields
//       })
//       .select("total_amount issued_at patientId"); // Select required invoice fields

//     // Filter out any invoice where patientId is null
//     const filteredInvoices = invoices.filter(
//       (invoice) => invoice.patientId !== null
//     );

//     if (!filteredInvoices.length) {
//       return res
//         .status(200)
//         .json({ state: true, message: "No valid invoices found." });
//     }

//     res.status(200).json({
//       state: true,
//       total_invoices: filteredInvoices.length,
//       invoices: filteredInvoices,
//     });
//   } catch (err) {
//     next(err);
//   }
// };



// const getInvoiceByBillCode = async (req, res) => {
//   try {
//     const billCode = req.params.billCode;

//     if (!mongoose.Types.ObjectId.isValid(billCode)) {
//       return res.status(400).json({ state: false, message: "Invalid bill code format" });
//     }

//     const invoice = await Invoice.findOne({
//       bills: new mongoose.Types.ObjectId(billCode),
//     });

//     if (!invoice) {
//       return res.status(404).json({ state: false, message: "Invoice not found for this bill code" });
//     }

//     res.status(200).json({
//       state: true,
//       message: "Invoice fetched successfully",
//       total_amount: invoice.total_amount,
//       invoice,
//     });
//   } catch (error) {
//     console.error("Error fetching invoice by bill code:", error);
//     res.status(500).json({ state: false, message: "Internal server error" });
//   }
// };

// module.exports = { endConsultation, getAll, getByBillCode, getInvoiceByBillCode, getByPatientId };
