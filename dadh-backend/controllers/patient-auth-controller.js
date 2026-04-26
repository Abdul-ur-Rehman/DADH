const Patient = require("../models/patient-model");
const admin = require("../firebase/firebase-admin");
const jwt = require("jsonwebtoken");
const { sendSms } = require("./smsController");
const generateToken = require("../utils/generate-token");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verify = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const uid = decoded.uid;
    const patient = await Patient.findOne({ uid });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const jwtToken = jwt.sign({ id: patient._id, role: "patient" }, "secretkey", { expiresIn: "7d" });

    res.json({ token: jwtToken, role: "patient", name: patient.name });
  } catch (err) {
    console.log("Token error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};


const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      state,
      DOB,
      // IRN,
      medicareNumber,
      address,
      zipCode,
      gender,
    } = req.body;

    const isEmailExist = await Patient.findOne({ email: email });
    if (isEmailExist) {
      return res
        .status(400)
        .json({ state: false, message: "Patient already exists" });
    }

    // Check for existing phone
    const isPhoneExist = await Patient.findOne({ phone: phone });
    if (isPhoneExist) {
      return res
        .status(400)
        .json({ state: false, message: "Phone number is already registered" });
    }

    const patient = new Patient({
      name,
      email,
      phone,
      city,
      state,
      DOB,
      // IRN,
      medicareNumber,
      address,
      zipCode,
      gender,
    });
    await patient.save();
    res.status(200).json({
      state: true,
      message: "Patient added successfully",
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};

// const login = async (req, res, next) => {
//   try {
//     const { medicareNumber, phone, DOB } = req.body;
//     const patient = await Patient.findOne({ medicareNumber, phone, DOB });
//     if (!patient) {
//       return res
//         .status(401)
//         .json({ state: false, message: "Patient not found" });
//     }
//     const token = await generateToken(patient, next);
//     res.status(200).json({
//       state: true,
//       message: "OTP sent to your registered phone Number",
//       token: token,
//       data: patient
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const login = async (req, res, next) => {
  try {
    const { medicareNumber, phone, DOB } = req.body;

    // 1. Input validation
    if (!medicareNumber || !phone || !DOB) {
      return res.status(400).json({
        state: false,
        message: "Medicare number, phone and DOB are required.",
      });
    }

    // 2. Find patient
    const patient = await Patient.findOne({ medicareNumber, phone, DOB });
    if (!patient) {
      return res.status(401).json({
        state: false,
        message: "Patient not found with provided credentials.",
      });
    }

    if (patient.status === 0) {
      return res.status(403).json({
        state: false,
        message: "Access denied. Your account has been disabled by admin.",
      });
    }

    // 3. Generate OTP
    const otp = generateOtp();

    // 4. Save OTP + expiry + last login
    patient.otp = otp;
    patient.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    patient.lastLogin = new Date();
    await patient.save();

    // 5. Send OTP via SMS
    const phoneToSend = patient.phone.startsWith("+")
      ? patient.phone
      : "+" + patient.phone;

    try {
      await sendSms({
        to: phoneToSend,
        body: `Your login OTP is ${otp}. It is valid for 5 minutes.`,
      });
      console.log(`OTP sent to ${phoneToSend}: ${otp}`);
    } catch (smsErr) {
      console.error("❌ SMS sending failed:", smsErr.message);
    }

    // 6. Send response (strip OTP fields from response — kept in DB only for verify step)
    const { otp: _otp, otpExpiry: _exp, ...patientSafe } = patient.toObject();
    res.status(200).json({
      state: true,
      message: "OTP sent to your registered phone number.",
      token: await generateToken(patient, next), // JWT
      data: patientSafe,
    });
  } catch (err) {
    console.error("Patient login error:", err);
    return res.status(500).json({
      state: false,
      message: "Server error during patient login. Please try again later.",
      error: err.message,
    });
  }
};


const verifyOtp = async (req, res, next) => {
  try {
    const { patientId, otp } = req.body;

    if (!patientId || !otp) {
      return res.status(400).json({
        state: false,
        message: "Patient ID and OTP are required.",
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        state: false,
        message: "Patient not found",
      });
    }

    // ✅ Check OTP validity
    if (patient.otp !== otp) {
      return res.status(401).json({ state: false, message: "Invalid OTP" });
    }

    if (new Date() > patient.otpExpiry) {
      return res.status(401).json({ state: false, message: "OTP has expired" });
    }

    // ✅ OTP Verified → Generate token
    const token = await generateToken(patient, next);

    // Clear OTP
    patient.otp = null;
    patient.otpExpiry = null;
    await patient.save();

    return res.status(200).json({
      state: true,
      message: "OTP verified successfully",
      token,
      data: patient,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({
      state: false,
      message: "Server error during OTP verification",
    });
  }
};



const resendOtp = async (req, res, next) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        state: false,
        message: "Patient ID is required.",
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        state: false,
        message: "Patient not found",
      });
    }

    // ✅ Generate new OTP
    const otp = generateOtp();
    patient.otp = otp;
    patient.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await patient.save();

    // ✅ Yahan SMS bhejna (Twilio/other API)
    console.log("Resent OTP for Patient:", otp);

    return res.status(200).json({
      state: true,
      message: "New OTP sent successfully",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({
      state: false,
      message: "Server error during OTP resend",
    });
  }
};



const getAllFamilyMembers = async (req, res) => {
  try {
    const { medicareNumber } = req.body;

    if (!medicareNumber || medicareNumber.length < 8) {
      return res.status(400).json({
        state: false,
        message: "Valid Medicare number (at least 8 digits) is required",
      });
    }

    const first8Digits = medicareNumber.slice(0, 8); // extract first 8 digits

    // Find all patients whose Medicare number starts with these 8 digits
    const patients = await Patient.find({
      medicareNumber: { $regex: `^${first8Digits}` },
    });

    res.status(200).json({
      state: true,
      message: "All family members fetched successfully",
      data: patients,
    });
  } catch (err) {
    res.status(500).json({
      state: false,
      message: "Server Error",
      error: err.message || err,
    });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({
      state: true,
      message: "All patients fetched successfully",
      data: patients,
    });
  } catch (err) {
    res.status(500).json({ state: false, message: "Server Error", error: err });
  }
};

const updatePatientById = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      state,
      DOB,
      // IRN,
      medicareNumber,
      gender,
      zipCode,
      allergies,
      address,
    } = req.body;
    const patientId = req.params.patientId; // Assuming the patient ID is passed as a parameter

    // // Check if the patient exists
    const patient = await Patient.findById({ _id: patientId });
    if (!patient) {
      return res
        .status(404)
        .json({ state: false, message: "Patient not found" });
    }

    // // Check if the new email is already in use by another patient (excluding the current patient)
    const isEmailExist = await Patient.findOne({
      email: email,
      _id: { $ne: patientId },
    });
    if (isEmailExist) {
      return res.status(400).json({
        state: false,
        message: "Email is already in use by another patient",
      });
    }

    // // Update the patient's information
    patient.name = name || patient.name;
    patient.email = email || patient.email;
    patient.phone = phone || patient.phone;
    patient.city = city || patient.city;
    patient.state = state || patient.state;
    patient.DOB = DOB || patient.DOB;
    // patient.IRN = IRN || patient.IRN;
    patient.medicareNumber = medicareNumber || patient.medicareNumber;
    patient.gender = gender || patient.gender;
    patient.zipCode = zipCode || patient.zipCode;
    patient.allergies = allergies || patient.allergies;
    patient.address = address || patient.address;

    // // Save the updated patient information
    await patient.save();

    res.status(200).json({
      state: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findOne({ _id: patientId });
    if (!patient) {
      return res
        .status(400)
        .json({ state: false, message: "Patient not found" });
    }
    res.status(200).json({
      state: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

const getOneHome = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    // console.log("patient id "+patientId);
    const patient = await Patient.findOne({ _id: patientId });
    if (!patient) {
      return res
        .status(400)
        .json({ state: false, message: "Patient not found" });
    }
    res.status(200).json({
      state: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    // const { patientId} = req.body;
    const patient = await Patient.find();
    if (!patient) {
      return res
        .status(400)
        .json({ state: false, message: "Patient not found" });
    }
    res.status(200).json({
      state: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};


const toggleActive = async (req, res) => {
  try {
    const { status } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Set status from request
    patient.status = status;
    await patient.save();

    res.status(200).json({ success: true, status: patient.status, message: "Status updated successfully" });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const deleteById = async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ state: false, message: "Patient not found" });
    }
    res.status(200).json({
      state: true,
      message: "Patient fetched successfully",
      data: patient,
    });
  } catch (err) {
    res.status(500).json({ state: false, message: "Server error", error: err.message });
  }
};


const setOnline = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findByIdAndUpdate(
      { _id: patientId },
      { isOnline: true },
      { new: true }
    );
    if (!patient) {
      return res.status(400).json({
        state: false,
        message: "Patient not found",
      });
    }
    return res.status(200).json({
      state: true,
      message: "Patient is online",
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};
const setOffline = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findByIdAndUpdate(
      { _id: patientId },
      { isOnline: false },
      { new: true }
    );
    if (!patient) {
      return res.status(400).json({
        state: false,
        message: "Patient not found",
      });
    }
    return res.status(200).json({
      state: true,
      message: "Patient is online",
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getPatientById,
  updatePatientById,
  getPatientById,
  register,
  login,
  getOne,
  getAll,
  getOneHome,
  setOnline,
  setOffline,
  getAllPatients,
  getAllFamilyMembers,
  verify,
  deleteById,
  toggleActive,
  verifyOtp,
  resendOtp,
};
