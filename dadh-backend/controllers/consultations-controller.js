const Consultation = require("../models/consultations-model");
const consultations = require("../models/consultations-model");
const Doctor = require("../models/doctor-model");
const Patient = require("../models/patient-model");
const Billing = require("../models/billing-model");
const { sendSms } = require("./smsController");


const mongoose = require("mongoose");


const getNotesByDoctorId = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    if (!doctorId) {
      return res.status(400).json({
        state: false,
        message: "Doctor ID is required",
      });
    }

    // Sirf AIScribeNote wale consultations nikaalo
    const consultations = await Consultation.find(
      { doctorId: doctorId, AIScribeNote: { $ne: null } }, // null na ho
      { AIScribeNote: 1, createdAt: 1, _id: 0 }            // sirf AIScribeNote & date
    ).sort({ createdAt: -1 });

    if (!consultations || consultations.length === 0) {
      return res.status(200).json({
        state: true,
        data: [],
        message: "No notes found for this doctor",
      });
    }

    // Extract sirf notes ka array
    const notes = consultations.map((c) => c.AIScribeNote);

    return res.status(200).json({
      state: true,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
};

const getConsultationCallStatusByPatient = async (req, res, next) => {
  try {
    const consultationId = req.params.id;

    // Validate consultationId (string format, not ObjectId cast)
    if (!consultationId || typeof consultationId !== 'string' || consultationId.trim() === '') {
      return res.status(400).json({ state: false, message: "Invalid Consultation ID" });
    }

    // Find by consultationId without forcing ObjectId cast
    const consultation = await Consultation.findOne({
      _id: consultationId, // Only cast if it's valid
      isCalling: true,
      isCompleted: false,
    }).lean();

    if (!consultation) {
      return res.status(404).json({ state: false, message: "No active call for this consultation" });
    }

    let total = 0;
    if (consultation.billCodes?.length) {
      const bills = await Billing.find({
        _id: { $in: consultation.billCodes },
      }).lean();

      total = bills.reduce(
        (sum, b) => sum + (Number(b.amount) || 0),
        0
      );
    }

    return res.status(200).json({
      state: true,
      data: {
        _id: consultation._id,
        isCalling: consultation.isCalling,
        type: consultation.type,
        isCompleted: consultation.isCompleted,
        doctorId: consultation.doctorId,
        totalAmount: total.toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
};




const updateConsultation = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const { type, isDoctorCalling, isPatientCalling } = req.body;

    // Check if at least one call field is provided
    if (typeof isDoctorCalling === "undefined" && typeof isPatientCalling === "undefined") {
      return res.status(400).json({
        state: false,
        message: "Please provide 'isDoctorCalling' or 'isPatientCalling' field",
      });
    }

    const updateFields = {};

    if (typeof isDoctorCalling !== "undefined") {
      updateFields.isDoctorCalling = isDoctorCalling;
    }

    if (typeof isPatientCalling !== "undefined") {
      updateFields.isPatientCalling = isPatientCalling;
    }

    // Add type only if it's defined
    if (typeof type !== "undefined") {
      updateFields.type = type;
    }

    const updated = await consultations.findByIdAndUpdate(
      consultationId,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }

    return res.status(200).json({
      state: true,
      message: "Consultation updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};





const getConsultations = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ isCompleted: true })
      .populate('doctorId')         // populate doctor info
      .populate('patientId')        // populate patient info
      .populate('billCodes');       // populate billing info

    return res.status(200).json({
      state: true,
      count: consultations.length,
      message: "All incomplete consultations retrieved successfully",
      data: consultations,
    });
  } catch (err) {
    next(err);
  }
};


const getAllConsultations = async (req, res, next) => {
  try {
    // 1. Sab uncompleted consultations nikaalo
    const consultations = await Consultation.find({ isCompleted: false });

    const now = new Date();

    for (let cons of consultations) {
      // 2. Agar doctor assign nahi hai aur 12h cross ho gaye
      if (!cons.doctorId) {
        const created = new Date(cons.createdAt);
        const hoursPassed = (now - created) / (1000 * 60 * 60);

        if (hoursPassed >= 12 && !cons.isExpired) {
          cons.isExpired = true;  // field update
          await cons.save();      // DB me save karo
        }
      }
    }

    // 3. Response bhejo
    return res.status(200).json({
      state: true,
      count: consultations.length,
      message: "Consultations retrieved successfully",
      data: consultations,
    });
  } catch (err) {
    next(err);
  }
};

// const getAllConsultations = async (req, res, next) => {
//   try {
//     const consultations = await Consultation.find({ isCompleted: false });
//     const now = new Date();

//     console.log(`Total uncompleted consultations: ${consultations.length}`);

//     for (let cons of consultations) {
//       const created = new Date(cons.createdAt);
//       const hoursPassed = (now - created) / (1000 * 60 * 60);

//       console.log(`\nChecking consultation: ${cons._id}`);
//       console.log(`Created at: ${created.toISOString()}, Hours passed: ${hoursPassed.toFixed(2)}`);
//       console.log(`Doctor assigned: ${cons.doctorId ? 'Yes' : 'No'}`);

//       // ✅ Sirf unassigned consultations ke liye
//       if (!cons.doctorId) {
//         // 🔹 Patient phone fetch karo directly
//         const patient = await Patient.findById(cons.patientId);
//         if (!patient || !patient.phone) {
//           console.warn(`Consultation ${cons._id} has no patient phone. Skipping SMS.`);
//           continue;
//         }

//         let patientPhone = patient.phone;
//         if (!patientPhone.startsWith("+")) patientPhone = "+" + patientPhone;
//         console.log(`Patient phone: ${patientPhone}`);

//         // 🔹 SMS har 1 ghante reminder
//         if (!cons.lastReminderSent || (now - new Date(cons.lastReminderSent)) >= 1000 * 60 * 60) {
//           try {
//             console.log(`Sending reminder SMS to ${patientPhone}`);
//             await sendSms({
//               to: patientPhone,
//               body: `Dear patient, your consultation request is still waiting for a doctor. We are trying to assign a doctor as soon as possible.`,
//             });

//             cons.lastReminderSent = now;
//             await cons.save();
//             console.log("Reminder SMS sent and lastReminderSent updated.");
//           } catch (smsErr) {
//             console.error("Reminder SMS failed:", smsErr.message);
//           }
//         } else {
//           console.log("Reminder SMS not sent (less than 1 hour since last reminder).");
//         }

//         // 🔹 Expire after 12 hours
//         if (hoursPassed >= 12 && !cons.isExpired) {
//           cons.isExpired = true;
//           await cons.save();

//           try {
//             console.log(`Sending expired SMS to ${patientPhone}`);
//             await sendSms({
//               to: patientPhone,
//               body: `Dear patient, unfortunately your consultation could not be assigned to any doctor and has expired. Please try again later.`,
//             });
//             console.log("Expired SMS sent.");
//           } catch (smsErr) {
//             console.error("Expired SMS failed:", smsErr.message);
//           }
//         } else if (hoursPassed < 12) {
//           console.log("Consultation not expired yet, expired SMS not sent.");
//         }
//       } else {
//         console.log("Doctor assigned, no SMS will be sent for this consultation.");
//       }
//     }

//     return res.status(200).json({
//       state: true,
//       count: consultations.length,
//       message: "Consultations retrieved successfully",
//       data: consultations,
//     });
//   } catch (err) {
//     next(err);
//   }
// };




const getBillingsByDoctorId = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    const consultations = await Consultation.find({
      doctorId: doctorId,
      isCompleted: true,
      billCodes: { $exists: true, $not: { $size: 0 } }, // only those having bills
    })
      .populate({
        path: "patientId",
        select: "name gender DOB",
      })
      .select("billCodes createdAt patientId consultationCategory");

    return res.status(200).json({
      state: true,
      total: consultations.length,
      billings: consultations, // return consultations with bills
    });
  } catch (err) {
    next(err);
  }
};





const getOneById = async (req, res, next) => {
  try {
    const consultationId = req.params.id;
    const records = await Consultation.findOne({ _id: consultationId });
    if (records) {
      return res.status(200).json({
        data: records,
      });
    }
    return res.status(400).json({
      message: "record not found",
      id: consultationId,
      record: records,
    });
  } catch (err) {
    next(err);
  }
};

const getHistoryPatient = async (req, res) => {
  try {
    const consultations = await Consultation.find({ patientId: req.params.patientId });
    res.json({
      state: true,
      data: consultations
    });
  } catch (err) {
    res.status(500).json({ state: false, message: err.message });
  }
}

// const addConsultation = async (req, res, next) => {
//   try {
//     const { consultationCategory, patientId, notes, type, doctorId } = req.body;

//     if (!consultationCategory || !patientId || !notes || !type) {
//       return res.status(400).json({
//         state: false,
//         message: "Please provide the required fields",
//       });
//     }

//     const newConsultation = new consultations({
//       consultationCategory,
//       patientId,
//       notes,
//       type, // videoCall, phoneCall, textChat
//       doctorId,
//       requestedCertificate, 
//     });

//     await newConsultation.save();

//     res.status(201).json({
//       state: true,
//       message: "Consultation added successfully.",
//       data: newConsultation,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const addConsultation = async (req, res, next) => {
  try {
    const {
      consultationCategory,
      patientId,
      notes,
      type,
      doctorId,
      requestedCertificate = [], // 👈 safe default
    } = req.body;

    if (!consultationCategory || !patientId || !notes || !type) {
      return res.status(400).json({
        state: false,
        message: "Please provide the required fields",
      });
    }

    const newConsultation = new consultations({
      consultationCategory,
      patientId,
      notes,
      type,
      doctorId,
      requestedCertificate, // yaha safe hoga ab
    });

    await newConsultation.save();

    res.status(201).json({
      state: true,
      message: "Consultation added successfully.",
      data: newConsultation,
    });
  } catch (err) {
    next(err);
  }
};


const getConsultationByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res
        .status(400)
        .json({ state: false, message: "Invalid Patient ID" });
    }

    /* fetch consultations for the patient — no .lean() so field-encryption init hook fires */
    const docs = await Consultation.find({ patientId }).sort({ _id: -1 });

    /* attach totalAmount from billing codes */
    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const c = doc.toObject(); // plain object after decryption
        let total = 0;

        if (c.billCodes?.length) {
          const bills = await Billing.find({ _id: { $in: c.billCodes } }).lean();
          total = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        }

        return { ...c, totalAmount: total.toFixed(2) };
      })
    );

    return res.status(200).json({
      state: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};



const getConsultationByDoctor = async (req, res, next) => {
  try {
    let doctorId = req.params.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Consultation.countDocuments({
      doctorId: doctorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({
      state: true,
      data: count ? count : 0,
    });
  } catch (error) {
    next(error);
  }
};


// const assignConsultToDoctor = async (req, res, next) => {
//   try {
//     const { consultationId, doctorId, patientId } = req.body;

//     // Validate inputs
//     if (!consultationId || !doctorId || !patientId) {
//       return res.status(400).json({
//         state: false,
//         message: "Consultation ID, Doctor ID, and Patient ID are all required",
//       });
//     }

//     const consultation = await Consultation.findById(consultationId);
//     if (!consultation) {
//       return res.status(404).json({ state: false, message: "Consultation not found" });
//     }

//     // Update consultation
//     const update = await Consultation.updateOne(
//       { _id: consultationId },
//       { $set: { doctorId } }
//     );

//     // Update patient
//     const patient = await Patient.findByIdAndUpdate(
//       patientId,
//       { $set: { assignedDoctorId: doctorId, isConsulting: true } },
//       { new: true }
//     );
//     if (!patient) {
//       return res.status(400).json({ state: false, message: "Patient not updated" });
//     }

//     // Update doctor
//     const doctor = await Doctor.findByIdAndUpdate(
//       doctorId,
//       { $set: { isConsulting: true } },
//       { new: true }
//     );

//     // Send SMS to patient
//     try {
//       let patientPhone = patient.phone;

//       if (!patientPhone.startsWith("+")) {
//         patientPhone = "+" + patientPhone;
//       }

//       await sendSms({

//         to: patientPhone,

//         body: `Dear ${patient.name}, your consultation with Dr. ${doctor.name} has started.`,
//       });
//     } catch (smsErr) {
//       console.error("SMS sending failed:", smsErr.message);
//       // Optional: you can choose to continue without failing the request
//     }

//     return res.status(200).json({
//       state: true,
//       message: "Doctor assigned successfully & SMS sent to patient",
//       data: update,
//       doctor,
//       consultation,
//     });

//   } catch (error) {
//     next(error);
//   }
// };

const assignConsultToDoctor = async (req, res, next) => {
  try {
    const { consultationId, doctorId, patientId } = req.body;

    if (!consultationId || !doctorId || !patientId) {
      return res.status(400).json({
        state: false,
        message: "Consultation ID, Doctor ID, and Patient ID are all required",
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ state: false, message: "Consultation not found" });
    }

    const update = await Consultation.updateOne({ _id: consultationId }, { $set: { doctorId } });

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $set: { assignedDoctorId: doctorId, isConsulting: true } },
      { new: true }
    );
    if (!patient) {
      return res.status(400).json({ state: false, message: "Patient not updated" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { isConsulting: true } },
      { new: true }
    );

    // ✅ SMS Trigger with detailed error logging
    try {
      let patientPhone = patient.phone;

      if (!patientPhone) {
        console.warn(`Patient ${patientId} has no phone number. SMS skipped.`);
      } else {
        if (!patientPhone.startsWith("+")) patientPhone = "+" + patientPhone;

        const message = await sendSms({
          to: patientPhone,
          body: `Dear ${patient.name}, your consultation with Dr. ${doctor.name} has started.`,
        });

        // Log Twilio response for debugging
        console.log("SMS sent successfully:");
        console.log("Message SID:", message.sid);
        console.log("Status:", message.status);
        console.log("Error code:", message.errorCode);
        console.log("Error message:", message.errorMessage);
      }
    } catch (smsErr) {
      console.error("SMS sending failed:");
      console.error("Message:", smsErr.message);
      if (smsErr.code) console.error("Twilio Error Code:", smsErr.code);
      if (smsErr.moreInfo) console.error("More info:", smsErr.moreInfo);
    }

    return res.status(200).json({
      state: true,
      message: "Doctor assigned successfully & SMS attempted to patient",
      data: update,
      doctor,
      consultation,
    });

  } catch (error) {
    next(error);
  }
};


const getActiveConsultationByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Find active consultation for this patient
    const activeConsultation = await Consultation.findOne({
      patientId: patientId,
      doctorId: { $exists: true }, // means doctor assigned => consultation started
    });

    if (activeConsultation) {
      res.status(200).json({
        state: true,
        active: true,
        consultation: activeConsultation,
      });
    } else {
      res.status(200).json({
        state: true,
        active: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

const requeuePatient = async (req, res) => {
  try {
    const { consultationId, patientId } = req.body;

    if (!consultationId || !patientId) {
      return res.status(400).json({
        state: false,
        message: "Consultation ID and Patient ID are required",
      });
    }

    // Find consultation
    const consultation = await Consultation.findOne({ _id: consultationId });

    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }

    // Extra safety: check if patient matches this consultation
    if (consultation.patientId.toString() !== patientId.toString()) {
      return res.status(400).json({
        state: false,
        message: "This consultation does not belong to the provided patient ID",
      });
    }

    // SAVE doctorId before updating consultation
    const doctorId = consultation.doctorId ? consultation.doctorId.toString() : null;

    // Update consultation
    await Consultation.updateOne(
      { _id: consultationId },
      {
        $set: {
          doctorId: "",
        },
      }
    );

    // Update patient
    await Patient.updateOne(
      { _id: patientId },
      {
        $unset: { assignedDoctorId: "" },
        $set: { isConsulting: false },
      }
    );

    // Update doctor (set isConsulting false)
    if (doctorId) {
      await Doctor.updateOne(
        { _id: doctorId },
        {
          $set: {
            isConsulting: false,
            activeConsultationId: null
          },
        }
      );
    }

    return res.status(200).json({
      state: true,
      message: "Patient has been successfully requeued",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      state: false,
      message: "Internal Server Error",
    });
  }
};



var d = new Date(),
  hour = d.getHours(),
  min = d.getMinutes(),
  month = d.getMonth(),
  year = d.getFullYear(),
  sec = d.getSeconds(),
  day = d.getDate();
///abdullah

// working
// const getAllDoctorsWithConsultationCount = async (req, res, next) => {
//   try {
//     const doctors = await Doctor.find({}, "_id name isOnline");

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const result = await Promise.all(
//       doctors.map(async (doc) => {
//         const count = await Consultation.countDocuments({
//           doctorId: doc._id,
//           createdAt: { $gte: startOfDay, $lte: endOfDay },
//         });

//         return {
//           id: doc._id,
//           name: doc.name,
//           isOnline: doc.isOnline,
//           consultedPatientCount: count,
//         };
//       })
//     );

//     res.status(200).json({ state: true, data: result });
//   } catch (error) {
//     next(error);
//   }
// };

const getTotalDoctorConsultationsToday = async (req, res, next) => {
  try {
    let doctorId = req.params.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // const consultations = await Consultation.find({
    //   doctorId: doctorId,
    // }).sort({ _id: -1 });

    const count = await Consultation.countDocuments({
      doctorId: doctorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    if (count > 0) {
      res.status(200).json({
        state: true,
        data: count,
      });
    } else {
      res.status(200).json({
        state: false,
        data: 0,
      });
    }
  } catch (error) {
    next(error);
  }
};
// const getDoctorConsultationStats = async (req, res, next) => {
//   try {
//     const doctorId = req.params.id;

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const last7Days = Array.from({ length: 7 }, (_, i) => {
//       const date = new Date(today);
//       date.setDate(today.getDate() - i);
//       const start = new Date(date);
//       const end = new Date(date);
//       start.setHours(0, 0, 0, 0);
//       end.setHours(23, 59, 59, 999);
//       return { date: start, end };
//     });

//     const stats = await Promise.all(
//       last7Days.map(async ({ date, end }) => {
//         const count = await Consultation.countDocuments({
//           doctorId,
//           createdAt: { $gte: date, $lte: end },
//         });
//         return {
//           date: date.toISOString().split("T")[0], // format as "YYYY-MM-DD"
//           count,
//         };
//       })
//     );

//     res.status(200).json({
//       state: true,
//       data: stats.reverse(), // so the oldest is first
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// dr ne total cons 3 ki hen total
// but by patient 6 arhi hen
// kiu ke 3 cons aese thi jisme doctor id nahi thi
// to ye data kis tara fetch hoga

const totalPatientsByConsultation = async (req, res, next) => {
  try {
    let doctorId = req.params.id; // Extract doctorId from request parameters

    // Get the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch consultations for the specified doctor within today's date
    const consultations = await Consultation.find({
      doctorId: doctorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Extract unique patientIds from the consultations
    const uniquePatientIds = [
      ...new Set(consultations.map((consultation) => consultation.patientId)),
    ];

    // Return the number of unique patients
    res.status(200).json({
      state: true,
      data: uniquePatientIds.length,
    });
  } catch (error) {
    next(error);
  }
};

// return currrent day consultations count
// isme masla arha hamesha 0 return kar rha
// solved
const TotalCurrentDayConsultationsCount = async (req, res, next) => {
  try {
    let doctorId = req.params.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Consultation.countDocuments({
      isCompleted: false,
      doctorId: doctorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (count > 0)
      res.status(200).json({
        state: true,
        data: count ? count : 0,
      });
    else
      res.status(200).json({
        state: true,
        data: 0,
      });
  } catch (error) {
    next(error);
  }
};

// working
const getLast7DaysConsultations = async (req, res, next) => {
  try {
    let doctorId = req.params.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const consultations = await Consultation.find({
      doctorId: doctorId,
      createdAt: { $gte: sevenDaysAgo, $lte: new Date() },
    }).sort({ _id: -1 });

    res
      .status(200)
      .json({ state: true, count: consultations.length, data: consultations });
  } catch (error) {
    next(error);
  }
};

// working
const getIncompleteBillingConsultations = async (req, res, next) => {
  try {
    let doctorId = req.params.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);

    const consultations = await Consultation.find({
      doctorId: doctorId,
      isCompleted: true,
      createdAt: { $gte: sevenDaysAgo, $lte: new Date() },
    }).sort({ _id: -1 });

    res
      .status(200)
      .json({ state: true, coutn: consultations.length, data: consultations });
  } catch (error) {
    next(error);
  }
};

// const getIncompleteBillingConsultations = async (req, res, next) => {
//   try {
//     let doctorId = req.params.id;
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     const consultations = await Consultation.find({
//       doctorId: doctorId,
//       isCompleted: true,
//       billCodes: { $eq: [] }, // 🔥 Only consultations that haven't been billed
//       createdAt: { $gte: thirtyDaysAgo, $lte: new Date() },
//     }).sort({ _id: -1 });

//     res.status(200).json({
//       state: true,
//       count: consultations.length,
//       data: consultations,
//     });
//   } catch (error) {
//     next(error);
//   }
// };



//working
const checkIsDuplicate = async (req, res, next) => {
  try {
    const { category, notes, patientId } = req.body;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const duplicate = await Consultation.findOne({
      category,
      notes,
      patientId,
      createdAt: { $gte: twentyFourHoursAgo, $lte: new Date() },
    });

    res.status(200).json({ duplicate: duplicate ? "true" : "false" });
  } catch (error) {
    next(error);
  }
};


// const referDoctor = async (req, res, next) => {
//   try {
//     const { doctorId, consultationId, ReferralMessage } = req.body;

//     // Get new referred doctor
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ state: false, message: "Doctor not found" });
//     }

//     // Fetch consultation first
//     const consultation = await Consultation.findById(consultationId);
//     if (!consultation) {
//       return res.status(404).json({
//         state: false,
//         message: "Consultation not found",
//       });
//     }

//     // Push new referral in `refer[]` and update consultation
//     consultation.refer.push({
//       doctorId: doctor._id,
//       name: doctor.name,
//       message: ReferralMessage,
//     });

//     consultation.isCompleted = true;      // ✅ mark done for current doctor
//     consultation.doctorId = null;         // ✅ release it for next doctor

//     const updatedConsultation = await consultation.save();

//     return res.status(200).json({
//       state: true,
//       message: "Doctor referred successfully",
//       data: updatedConsultation,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// const getReferralsForDoctor = async (req, res) => {
//   try {
//     const doctorId = req.params.doctorId;

//     const consultations = await Consultation.find({
//       "refer.doctorId": doctorId
//     }).populate("patientId doctorId");

//     return res.status(200).json({
//       success: true,
//       message: "Referred consultations fetched successfully",
//       data: consultations,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

const referDoctor = async (req, res, next) => {
  try {
    const { doctorId, consultationId, ReferralMessage } = req.body;

    // Get new referred doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ state: false, message: "Doctor not found" });
    }

    // Fetch consultation first
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }

    // Push new referral in `refer[]` and update consultation
    consultation.refer.push({
      doctorId: doctor._id,
      name: doctor.name,
      message: ReferralMessage,
    });

    consultation.isCompleted = true;      // mark done for current doctor
    consultation.doctorId = null;         // release it for next doctor
    const updatedConsultation = await consultation.save();

    // =================== SEND SMS TO PATIENT ===================
    try {
      const patient = await Patient.findById(consultation.patientId);
      if (!patient) {
        console.warn(`Patient ${consultation.patientId} not found. SMS skipped.`);
      } else if (!patient.phone) {
        console.warn(`Patient ${patient._id} has no phone number. SMS skipped.`);
      } else {
        let phone = patient.phone;
        if (!phone.startsWith("+")) phone = "+" + phone;

        const message = await sendSms({
          to: phone,
          body: `Dear ${patient.name}, your consultation has been referred to Dr. ${doctor.name}. Message: ${ReferralMessage  || 'No additional message'} by `,
        });

        console.log("SMS sent successfully:", message.sid);
      }
    } catch (smsErr) {
      console.error("SMS sending failed:", smsErr.message);
    }

    return res.status(200).json({
      state: true,
      message: "Doctor referred successfully & SMS attempted to patient",
      data: updatedConsultation,
    });
  } catch (err) {
    next(err);
  }
};



const getReferralsForDoctor = async (req, res) => {
  try {
    const doctorId = new mongoose.Types.ObjectId(req.params.doctorId);  // ✅ convert to ObjectId

    const referrals = await Consultation.find({
      refer: {
        $elemMatch: { doctorId: doctorId }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Referred consultations fetched successfully",
      data: referrals
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



const addInvestigateion = async (req, res, next) => {
  try {
    const { investigationType, note, investigation, consultationId } = req.body;
    if (!investigationType || !note || !investigation || !consultationId) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const update = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        $push: { investigations: { investigationType, note, investigation } },
      },
      { new: true }
    );
    if (update) {
      return res.status(200).json({
        state: true,
        message: "investigation added successfully",
        data: update,
      });
    }
    return res.status(400).json({
      state: false,
      message: "investigation not added",
    });
  } catch (err) {
    next(err);
  }
};

// const addCertification = async (req, res, next) => {
//   try {
//     const { certificationType, startDate, endDate, note, consultationId, signature } = req.body;

//     if (!certificationType || !startDate || !endDate || !note || !consultationId) {
//       return res.status(400).json({
//         state: false,
//         message: "Please provide the required fields",
//       });
//     }

//     const consultation = await Consultation.findById(consultationId);
//     if (!consultation) {
//       return res.status(404).json({
//         state: false,
//         message: "Consultation not found",
//       });
//     }

//     const newCertificate = { certificationType, startDate, endDate, note };
//     if (signature) {
//       newCertificate.signature = signature;  // add signature if provided
//     }

//     const update = await Consultation.findByIdAndUpdate(
//       consultationId,
//       { $push: { certificates: newCertificate } },
//       { new: true }
//     );

//     if (update) {
//       return res.status(200).json({
//         state: true,
//         message: "Certification added successfully",
//         data: update,
//       });
//     }

//     return res.status(400).json({
//       state: false,
//       message: "Certification not added",
//     });
//   } catch (error) {
//     console.error("Error adding certification:", error);
//     return res.status(500).json({
//       state: false,
//       message: "Server error while adding certification",
//       error: error.message,
//     });
//   }
// };

const addCertification = async (req, res, next) => {
  try {
    const { certificationType, startDate, endDate, note, consultationId, signature } = req.body;

    if (!certificationType || !startDate || !endDate || !note || !consultationId) {
      return res.status(400).json({
        state: false,
        message: "Please provide the required fields",
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }

    const newCertificate = { certificationType, startDate, endDate, note };
    if (signature) newCertificate.signature = signature;

    const update = await Consultation.findByIdAndUpdate(
      consultationId,
      { $push: { certificates: newCertificate } },
      { new: true }
    );

    if (update) {
      // 🔹 Patient fetch karo for SMS
      const patient = await Patient.findById(consultation.patientId);
      if (patient && patient.phone) {
        let patientPhone = patient.phone;
        if (!patientPhone.startsWith("+")) patientPhone = "+" + patientPhone;

        try {
          await sendSms({
            to: patientPhone,
            body: `Dear ${patient.name}, your ${certificationType} certificate has been added for your consultation. Please check your profile for details.`,
          });
          console.log(`Certificate SMS sent to ${patientPhone}`);
        } catch (smsErr) {
          console.error("Certificate SMS failed:", smsErr.message);
        }
      } else {
        console.warn(`Patient phone not found for consultation ${consultationId}. SMS skipped.`);
      }

      return res.status(200).json({
        state: true,
        message: "Certification added successfully & SMS sent to patient",
        data: update,
      });
    }

    return res.status(400).json({
      state: false,
      message: "Certification not added",
    });
  } catch (error) {
    console.error("Error adding certification:", error);
    return res.status(500).json({
      state: false,
      message: "Server error while adding certification",
      error: error.message,
    });
  }
};


const getCertifications = async (req, res) => {
  const { consultationId } = req.params;

  try {
    const consultation = await Consultation.findById(consultationId).select("certificates");
    if (!consultation) {
      return res.status(404).json({ state: false, message: "Consultation not found" });
    }

    return res.status(200).json({
      state: true,
      message: "Certifications fetched successfully",
      data: consultation.certificates || [],
    });
  } catch (err) {
    return res.status(500).json({ state: false, message: "Server error", error: err.message });
  }
};

const requestCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ state: false, message: "Consultation not found" });
    }
    if (!consultation.isCompleted) {
      return res.status(400).json({ state: false, message: "Consultation is still active" });
    }
    consultation.requestedCertificate.push({ requestedAt: new Date(), status: "pending" });
    await consultation.save();
    return res.status(200).json({ state: true, message: "Certificate requested successfully", data: consultation });
  } catch (err) {
    return res.status(500).json({ state: false, message: "Server error", error: err.message });
  }
};

const addPrescribtion = async (req, res, next) => {
  try {
    const { medicine_id, dose, quantity, frequency, duration, instruction } =
      req.body;
    const consultation_id = req.params.id;
    if (!medicine_id || !dose || !quantity || !frequency || !duration) {
      return res
        .status(400)
        .json({ state: false, message: "Please fill all fields" });
    }
    const consultation = await Consultation.findByIdAndUpdate(
      consultation_id,
      {
        $push: {
          medicines: {
            medicine_id, // Convert medicine_id to ObjectId
            dose,
            quantity,
            frequency,
            duration,
            instruction,
          },
        },
      },
      { new: true }
    );

    if (!consultation) {
      return res
        .status(404)
        .json({ state: false, message: "Consultation not found" });
    }
    await consultation.save();
    return res.status(200).json({
      state: true,
      message: "Prescription added successfully",
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
};
const pauseConsultation = async (req, res, next) => {
  try {
    const consultationId = req.params.id;
    const { doctorId } = req.body;

    if (!consultationId) {
      return res
        .status(400)
        .json({ state: false, message: `Consultaion ID is required` });
    }
    if (!doctorId) {
      return res
        .status(400)
        .json({ state: false, message: `Doctor ID is required` });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res
        .status(404)
        .json({ state: false, message: "Consultation not found" });
    }

    // Update the doctor's isConsulting status to false
    const updateDoctor = await Doctor.findByIdAndUpdate(doctorId, {
      isConsulting: false,
    });
    if (!updateDoctor) {
      return res
        .status(400)
        .json({ state: false, message: "Doctor not updated" });
    }

    // Update the consultation as paused
    await Consultation.findByIdAndUpdate(consultationId, {
      isCompleted: false,
      isConsulting: false,
    });

    return res.status(200).json({
      state: true,
      message: "Pause consultation successfully",
    });
  } catch (err) {
    next(err);
  }
};

const addScribeNote = async (req, res, next) => {
  try {
    const { consultationId, AIScribeNote } = req.body;
    if (!consultationId || !AIScribeNote) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const update = await Consultation.findByIdAndUpdate(
      consultationId,
      { $set: { AIScribeNote: AIScribeNote } },
      { new: true }
    );
    if (update) {
      return res.status(200).json({
        state: true,
        message: "Scribe note added successfully",
        data: update,
      });
    }
  } catch (err) {
    next(err);
  }
};

const getAIScribeNote = async (req, res, next) => {
  const { id: consultationId } = req.params;
  try {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const AIScribeNote = consultation.AIScribeNote;
    return res.status(200).json({
      state: true,
      message: "Scribe note retrieved successfully",
      data: AIScribeNote,
    });
  } catch (err) {
    next(err)
  }
}

const addMedication = async (req, res, next) => {
  try {
    const { medicineName, dosage, consultationId, doctorId, doctorName } =
      req.body;
    if (
      !medicineName ||
      !dosage ||
      !consultationId ||
      !doctorId ||
      !doctorName
    ) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        state: false,
        message: "Doctor not found",
      });
    }

    const date = new Date();
    const time = date.toLocaleString();
    const update = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        $push: {
          medications: { medicineName, dosage, time, doctorId, doctorName },
        },
      },
      { new: true }
    );
    if (update) {
      return res.status(200).json({
        state: true,
        message: "Medication added successfully",
        data: update,
      });
    }
    return res.status(400).json({
      state: false,
      message: "Medication not added",
    });
  } catch (err) {
    next(err);
  }
};

const getMedications = async (req, res, next) => {
  try {
    const { consultationId } = req.body;
    if (!consultationId) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const medications = consultation.medications;
    return res.status(200).json({
      state: true,
      message: "Medications retrieved successfully",
      data: medications,
    });
  } catch (err) {
    next(err);
  }
};

const getMedicationByIndex = async (req, res, next) => {
  try {
    const { consultationId, index } = req.body;
    if (!consultationId || index === undefined) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const medications = consultation.medications;
    if (index < 0 || index >= medications.length) {
      return res.status(400).json({
        state: false,
        message: "Index out of bounds",
      });
    }
    const medication = medications[index];
    return res.status(200).json({
      state: true,
      message: "Medication retrieved successfully",
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

const updateMedicationByIndex = async (req, res, next) => {
  try {
    const { index } = req.params;
    const { medicineName, dosage, consultationId, doctorId } = req.body;
    if (
      !medicineName ||
      !dosage ||
      !consultationId ||
      !doctorId
    ) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        state: false,
        message: "Doctor not found",
      });
    }
    const medications = consultation.medications;
    if (index < 0 || index >= medications.length) {
      return res.status(400).json({
        state: false,
        message: "Index out of bounds",
      });
    }
    const date = new Date();
    const time = date.toLocaleString();
    const update = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        $set: {
          [`medications.${index}`]: {
            medicineName,
            dosage,
            time,
            doctorId,
            doctorName: doctor.name,
          },
        },
      },
      { new: true }
    );
    if (update) {
      return res.status(200).json({
        state: true,
        message: "Medication updated successfully",
        data: update,
      });
    }
  } catch (err) {
    next(err);
  }
};

const deleteMedicationByIndex = async (req, res, next) => {
  try {
    const { index } = req.params;
    const { consultationId } = req.body;

    // Validate required fields
    if (!consultationId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the required fields",
      });
    }

    // Convert index to number and validate
    const indexNum = parseInt(index);
    if (isNaN(indexNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid index value",
      });
    }

    // Find the consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    // Check if index is valid
    if (indexNum < 0 || indexNum >= consultation.medications.length) {
      return res.status(400).json({
        success: false,
        message: "Index out of bounds",
      });
    }

    // Remove the element at the specified index
    consultation.medications.splice(indexNum, 1);

    // Save the updated consultation
    const updatedConsultation = await consultation.save();

    return res.status(200).json({
      success: true,
      message: "Medication deleted successfully",
      data: updatedConsultation,
    });

  } catch (err) {
    next(err);
  }
};

const addCondition = async (req, res, next) => {
  try {
    const { condition, consultationId, doctorName, doctorId, patientId } = req.body;

    if (!condition || !consultationId || !doctorName || !doctorId || !patientId) {
      return res.status(400).json({
        state: false,
        message: "Please provide the required fields",
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        state: false,
        message: "Doctor not found",
      });
    }

    const date = new Date();
    const time = date.toLocaleString();

    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        $push: {
          conditions: { condition, time, doctorName, doctorId }
        }
      },
      { new: true }
    );

    if (updatedConsultation) {
      return res.status(200).json({
        state: true,
        message: "Condition added successfully",
        data: updatedConsultation,
      });
    }
  } catch (err) {
    next(err);
  }
};

const getConditions = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        state: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      state: true,
      message: "Conditions retrieved successfully",
      data: patient.conditions,
    });
  } catch (err) {
    next(err);
  }
};


const getConditionByIndex = async (req, res, next) => {
  try {
    const { consultationId, index } = req.body;
    if (!consultationId || index === undefined) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const conditions = consultation.conditions;
    if (index < 0 || index >= conditions.length) {
      return res.status(400).json({
        state: false,
        message: "Index out of bounds",
      });
    }
    const condition = conditions[index];
    return res.status(200).json({
      state: true,
      message: "Condition retrieved successfully",
      data: condition,
    });
  } catch (error) {
    next(error);
  }
};

const updateConditionByIndex = async (req, res, next) => {
  try {
    const { index } = req.params;
    const { condition, consultationId, doctorId } = req.body;
    if (!condition || !consultationId || !doctorId) {
      return res.status(400).json({
        state: false,
        message: "please provide the required fields",
      });
    }
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        state: false,
        message: "Consultation not found",
      });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        state: false,
        message: "Doctor not found",
      });
    }
    const conditions = consultation.conditions;
    if (index < 0 || index >= conditions.length) {
      return res.status(400).json({
        state: false,
        message: "Index out of bounds",
      });
    }
    const date = new Date();
    const time = date.toLocaleString();
    const update = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        $set: {
          [`conditions.${index}`]: {
            condition,
            time,
            doctorName: doctor.name,
            doctorId,
          },
        },
      },
      { new: true }
    );
    if (update) {
      return res.status(200).json({
        state: true,
        message: "Condition updated successfully",
        data: update,
      });
    }
  } catch (err) {
    next(err);
  }
};

const deleteConditionByIndex = async (req, res, next) => {
  try {
    const { index } = req.params;
    const { consultationId } = req.body;

    // Validate required fields
    if (!consultationId) {
      return res.status(400).json({
        success: false,
        message: "Please provide consultationId",
      });
    }

    // Convert index to number and validate
    const indexNum = parseInt(index);
    if (isNaN(indexNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid index value",
      });
    }

    // Find the consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    // Check if index is valid
    if (indexNum < 0 || indexNum >= consultation.conditions.length) {
      return res.status(400).json({
        success: false,
        message: "Index out of bounds",
      });
    }

    // Remove the condition at the specified index
    consultation.conditions.splice(indexNum, 1);

    // Save the updated consultation
    const updatedConsultation = await consultation.save();

    return res.status(200).json({
      success: true,
      message: "Condition deleted successfully",
      data: updatedConsultation,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllConsultations,
  addConsultation,
  getConsultationByPatient,
  getConsultationByDoctor,
  getOneById,
  assignConsultToDoctor,
  getTotalDoctorConsultationsToday,
  totalPatientsByConsultation,
  getLast7DaysConsultations,
  getIncompleteBillingConsultations,
  checkIsDuplicate,
  TotalCurrentDayConsultationsCount,
  referDoctor,
  addInvestigateion,
  addCertification,
  addPrescribtion,
  pauseConsultation,
  requeuePatient,
  addScribeNote,
  getAIScribeNote,
  addMedication,
  getMedications,
  addCondition,
  getConditions,
  getConditionByIndex,
  updateConditionByIndex,
  getMedicationByIndex,
  updateMedicationByIndex,
  deleteMedicationByIndex,
  deleteConditionByIndex,
  getCertifications,
  requestCertificate,
  getHistoryPatient,
  getActiveConsultationByPatient,
  getBillingsByDoctorId,
  getReferralsForDoctor,
  updateConsultation,
  getConsultations,
  getConsultationCallStatusByPatient,
  getNotesByDoctorId
  // getDoctorConsultationStats
};
