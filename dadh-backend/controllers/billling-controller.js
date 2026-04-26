const Billing = require("../models/billing-model");
const Doctor = require("../models/doctor-model");
const Consultation = require("../models/consultations-model");
const Patient = require("../models/patient-model");
const mongoose = require("mongoose");
const { sendSms } = require("./smsController");

const getAllBilling = async (req, res, next) => {
  try {
    const billing = await Billing.find();
    if (!billing) {
      return res
        .status(400)
        .json({ state: false, message: "No Billing code found" });
    }
    res.status(200).json({
      state: true,
      data: billing,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const billings = await Billing.find()
      .populate({
        path: "patientId",
        select: "name DOB zipCode gender",
      })
      .select(
        "amount total_amount issued_at patientId doctorId consultationId"
      )
      .lean();
    const filtered = billings.filter((b) => b.patientId);

    if (!filtered.length) {
      return res
        .status(200)
        .json({ state: true, message: "No valid billing records found." });
    }
    const grandTotal = filtered.reduce(
      (sum, b) => sum + Number(b.amount ?? b.total_amount ?? 0),
      0
    );

    res.status(200).json({
      state: true,
      total_billings: filtered.length,
      total_amount: grandTotal.toFixed(2),
      billings: filtered,
    });
  } catch (err) {
    next(err);
  }
};


const endConsultationForReferral = async (req, res, next) => {
  try {
    const consultation_id = req.params.id;
    const { doctor_id, patientId } = req.body;

    if (!consultation_id || !doctor_id || !patientId) {
      return res.status(400).json({
        state: false,
        message: "Please provide consultation_id, doctor_id and patientId",
      });
    }

    // 🔍 Validate consultation
    const consultation = await Consultation.findById(consultation_id);
    if (!consultation) {
      return res.status(404).json({ state: false, message: "Consultation not found" });
    }

    // 🔍 Validate doctor
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ state: false, message: "Doctor not found" });
    }

    // 🔍 Validate patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ state: false, message: "Patient not found" });
    }

    // ✅ Update doctor
    const updateDoctor = await Doctor.findByIdAndUpdate(doctor_id, {
      isConsulting: false,
      $push: { consultedPatients: patientId },
    });

    if (!updateDoctor) {
      return res.status(400).json({ state: false, message: "Doctor not updated" });
    }

    // ✅ Update patient
    const updatePatient = await Patient.findByIdAndUpdate(
      patientId,
      { assignedDoctorId: null, isConsulting: false },
      { new: true }
    );

    if (!updatePatient) {
      return res.status(400).json({ state: false, message: "Patient not updated" });
    }

    // ✅ Calculate total billing
    let totalAmount = 0;
    let billingDetails = [];

    if (consultation.billCodes && consultation.billCodes.length > 0) {
      const bills = await Billing.find({
        _id: { $in: consultation.billCodes },
      });

      billingDetails = bills;
      totalAmount = bills.reduce(
        (sum, bill) => sum + (Number(bill.amount) || 0),
        0
      );
    }

    const totalAmountRounded = totalAmount.toFixed(2);

    // ✅ Do NOT set isCompleted true here — this is the only change!
    await Consultation.findByIdAndUpdate(consultation_id, {
      isCompleted: false,
      isConsulting: false,
    });

    const updatedConsultations = await Consultation.find({ patientId });

    return res.status(200).json({
      state: true,
      message: "Consultation ended for referral (not completed)",
      total_amount: totalAmountRounded,
      billingDetails,
      updatedConsultations,
    });
  } catch (err) {
    next(err);
  }
};




const getBillingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findOne({ _id: id });
    if (!billing) {
      return res
        .status(400)
        .json({ state: false, message: "billing not found" });
    }
    res.status(200).json({
      state: true,
      data: billing,
    });
  } catch (error) {
    next(error);
  }
};

const getBillyByCode = async (req, res, next) => {
  try {
    const { billCode } = req.body;
    const billing = await Billing.findOne({ billCode: billCode });
    if (!billing) {
      return res
        .status(400)
        .json({ state: false, message: "Billing not found" });
    }
    res.status(200).json({
      state: true,
      data: billing,
    });
  } catch (error) {
    next(error);
  }
};

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

//     // 🔍 Validate consultation
//     const consultation = await Consultation.findById(consultation_id);
//     if (!consultation) {
//       return res
//         .status(404)
//         .json({ state: false, message: "Consultation not found" });
//     }

//     // 🔍 Validate doctor
//     const doctor = await Doctor.findById(doctor_id);
//     if (!doctor) {
//       return res
//         .status(404)
//         .json({ state: false, message: "Doctor not found" });
//     }

//     // 🔍 Validate patient
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

//     // ✅ Calculate total billing from billCodes
//     let totalAmount = 0;
//     let billingDetails = [];

//     if (consultation.billCodes && consultation.billCodes.length > 0) {
//       const bills = await Billing.find({
//         _id: { $in: consultation.billCodes },
//       });

//       billingDetails = bills;
//       totalAmount = bills.reduce(
//         (sum, bill) => sum + (Number(bill.amount) || 0),
//         0
//       );
//     }

//     const totalAmountRounded = totalAmount.toFixed(2);

//     // ✅ Mark consultation as completed
//     await Consultation.findByIdAndUpdate(consultation_id, {
//       isCompleted: true,
//       isConsulting: false,
//     });

//     // ✅ Fetch all updated consultations for the patient
//     const updatedConsultations = await Consultation.find({ patientId });

//     // ✅ Return response without invoice
//     return res.status(200).json({
//       state: true,
//       message: "Consultation ended successfully",
//       total_amount: totalAmountRounded,
//       billingDetails,
//       updatedConsultations,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// ensure import

const endConsultation = async (req, res, next) => {
  try {
    const consultation_id = req.params.id;
    const { doctor_id, patientId } = req.body;

    if (!consultation_id || !doctor_id || !patientId) {
      return res.status(400).json({
        state: false,
        message: "Please provide consultation_id, doctor_id, and patientId",
      });
    }

    // 🔍 Validate consultation
    const consultation = await Consultation.findById(consultation_id);
    if (!consultation) {
      return res
        .status(404)
        .json({ state: false, message: "Consultation not found" });
    }

    // 🔍 Validate doctor
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res
        .status(404)
        .json({ state: false, message: "Doctor not found" });
    }

    // 🔍 Validate patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .json({ state: false, message: "Patient not found" });
    }

    // ✅ Update doctor
    const updateDoctor = await Doctor.findByIdAndUpdate(doctor_id, {
      isConsulting: false,
      $push: { consultedPatients: patientId },
    });

    if (!updateDoctor) {
      return res
        .status(400)
        .json({ state: false, message: "Doctor not updated" });
    }

    // ✅ Update patient
    const updatePatient = await Patient.findByIdAndUpdate(
      patientId,
      { assignedDoctorId: null, isConsulting: false },
      { new: true }
    );

    if (!updatePatient) {
      return res
        .status(400)
        .json({ state: false, message: "Patient not updated" });
    }

    // ✅ Calculate total billing from billCodes
    let totalAmount = 0;
    let billingDetails = [];

    if (consultation.billCodes && consultation.billCodes.length > 0) {
      const bills = await Billing.find({
        _id: { $in: consultation.billCodes },
      });

      billingDetails = bills;
      totalAmount = bills.reduce(
        (sum, bill) => sum + (Number(bill.amount) || 0),
        0
      );
    }

    const totalAmountRounded = totalAmount.toFixed(2);

    // ✅ Mark consultation as completed
    await Consultation.findByIdAndUpdate(consultation_id, {
      isCompleted: true,
      isConsulting: false,
    });

    // ✅ Prepare dynamic SMS and response message
    let smsBody = `Dear ${patient.name}, `;
    let responseMessage = "";

    if (!consultation.isCompleted && totalAmount === 0) {
      smsBody += `your consultation with Dr. ${doctor.name} has ended.`;
      responseMessage = "Consultation ended successfully";
    } else if (totalAmount > 0) {
      smsBody += `your billing for consultation with Dr. ${doctor.name} is $${totalAmountRounded}.`;
      responseMessage = "Billing info updated successfully";
    } else {
      smsBody += `your consultation with Dr. ${doctor.name} has ended.`;
      responseMessage = "Consultation ended successfully";
    }

    // ✅ Send SMS
    try {
      let patientPhone = patient.phone;
      if (!patientPhone.startsWith("+")) {
        patientPhone = "+" + patientPhone;
    
      }

      await sendSms({
        to: patientPhone,
        body: smsBody,
      });
    } catch (smsErr) {
      console.error("SMS sending failed:", smsErr.message);
    }

    // ✅ Fetch all updated consultations for the patient
    const updatedConsultations = await Consultation.find({ patientId });

    return res.status(200).json({
      state: true,
      message: responseMessage + " & SMS sent to patient",
      total_amount: totalAmountRounded,
      billingDetails,
      updatedConsultations,
    });
  } catch (err) {
    next(err);
  }
};



const addBillingCode = async (req, res, next) => {
  try {
    const {
      billCode,
      shortDescription,
      amount,
      total_amount,
      doctorId,
      patientId,
      consultation_id,
    } = req.body;

    // Check for required fields
    if (!billCode || !shortDescription || !amount) {
      return res.status(400).json({
        state: false,
        message: "Please provide all required fields.",
      });
    }

    // Check for duplicate bill code
    const billing = await Billing.findOne({ billCode });
    if (billing) {
      return res.status(400).json({
        state: false,
        message: "Billing already exists.",
      });
    }

    const newBilling = new Billing({
      billCode,
      shortDescription,
      amount,
      total_amount,
      doctorId,
      patientId,
      consultation_id,
    });

    await newBilling.save();

    res.status(201).json({
      state: true,
      message: "Billing added successfully.",
      data: newBilling,
    });
  } catch (err) {
    next(err);
  }
};


const deleteBillCode = async (req, res, next) => {
  try {
    const id = req.params.id;
    const billing = await Billing.findByIdAndDelete({ _id: id });
    if (!billing) {
      return res
        .status(404)
        .json({ state: false, message: " billing not found" });
    }
    return res
      .status(200)
      .json({ state: true, message: "billing deleted successfully" });
  } catch (err) {
    next(err);
  }
};
const updateBilling = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { billCode, shortDescription, amount } = req.body;
    const billing = await Billing.findByIdAndUpdate(
      { _id: id },
      { billCode, shortDescription, amount },
      { new: true }
    );
    if (!billing) {
      return res
        .status(404)
        .json({ state: false, message: "Billing not found" });
    }
    return res.status(200).json({
      state: true,
      message: "Billing updated successfully",
      data: billing,
    });
  } catch (err) {
    next(err);
  }
};

const getCurrentDayBillingByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;


    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);


    const consultations = await Consultation.find({
      doctorId,
      createdAt: { $gte: start, $lte: end },
      billCodes: { $exists: true, $ne: [] },
    }).lean();

    if (!consultations.length) {
      return res.status(200).json({
        state: true,
        message: "No billings found for today.",
        total_consultations: 0,
        gross_total: 0,
        data: [],
      });
    }

    const allBillIds = consultations.flatMap((c) => c.billCodes);
    const billDocs = await Billing.find({ _id: { $in: allBillIds } }).lean();

    const amountById = Object.fromEntries(
      billDocs.map((b) => [String(b._id), Number(b.amount) || 0])
    );


    const enriched = consultations.map((c) => {
      const total = (c.billCodes || []).reduce(
        (sum, id) => sum + (amountById[String(id)] || 0),
        0
      );
      return { ...c, totalAmount: total.toFixed(2) };
    });

    const grossTotal = enriched.reduce(
      (sum, c) => sum + Number(c.totalAmount),
      0
    );
    res.status(200).json({
      state: true,
      message: "Billings fetched successfully.",
      total_consultations: enriched.length,
      gross_total: grossTotal.toFixed(2),
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};


const getBillingsByDoctorId = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    // Find billings for this doctor
    const billings = await Billing.find({ doctorId })
      .populate({
        path: "patientId",
        select: "name gender DOB",
      })
      .populate({
        path: "consultation_id",
        select: "symptoms diagnosis createdAt",
      })
      .select("billCode amount total_amount issued_at patientId consultation_id")
      .lean();

    if (!billings.length) {
      return res.status(200).json({
        state: true,
        message: "No billing records found for this doctor.",
        billings: [],
      });
    }

    return res.status(200).json({
      state: true,
      total: billings.length,
      billings,
    });
  } catch (err) {
    next(err);
  }
};



const getSevendDaysBillingsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    /* ── date range: today + previous 6 days ── */
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    /* ── 1. fetch consultations in range ── */
    const consultations = await Consultation.find({
      doctorId,
      createdAt: { $gte: startOfWeek, $lte: endOfToday },
      billCodes: { $exists: true, $ne: [] },
    }).lean();

    if (!consultations.length) {
      return res.status(200).json({
        state: true,
        message: "No billings found for the past 7 days.",
        total_consultations: 0,
        gross_total: 0,
        data: [],
      });
    }

    /* ── 2. fetch all referenced bills ── */
    const allBillIds = consultations.flatMap((c) => c.billCodes);
    const billDocs = await Billing.find({ _id: { $in: allBillIds } }).lean();

    const amountById = Object.fromEntries(
      billDocs.map((b) => [String(b._id), Number(b.amount) || 0])
    );

    /* ── 3. compute totals ── */
    const enriched = consultations.map((c) => {
      const total = (c.billCodes || []).reduce(
        (sum, id) => sum + (amountById[String(id)] || 0),
        0
      );
      return { ...c, totalAmount: total.toFixed(2) };
    });

    const grossTotal = enriched.reduce(
      (sum, c) => sum + Number(c.totalAmount),
      0
    );

    return res.status(200).json({
      state: true,
      message: "Billings fetched successfully.",
      total_consultations: enriched.length,
      gross_total: grossTotal.toFixed(2),
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  getAll,
  getAllBilling,
  getBillingById,
  getBillyByCode,
  addBillingCode,
  deleteBillCode,
  updateBilling,
  getSevendDaysBillingsByDoctor,
  getCurrentDayBillingByDoctor,
  endConsultation,
  getBillingsByDoctorId,
  endConsultationForReferral
};
