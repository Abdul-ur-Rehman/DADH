const Doctor = require("../models/doctor-model");
const { sendSms } = require("./smsController");
const generateToken = require("../utils/generate-token");
const home = (req, res) => {
  res.send("Welcome to the home page");
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      surname,
      phone,
      email,
      city,
      state,
      gender,
      doctorType,
      isHomeVisit,
      workType,
      startDate,
      howFind,
      qualification,
    } = req.body;

    const existingEmail = await Doctor.findOne({ email });
    const existingPhone = await Doctor.findOne({ phone });

    if (existingEmail && existingPhone) {
      return res
        .status(400)
        .json({ state: false, message: "Email and Phone number already exist" });
    } else if (existingEmail) {
      return res
        .status(400)
        .json({ state: false, message: "Email already exists" });
    } else if (existingPhone) {
      return res
        .status(400)
        .json({ state: false, message: "Phone number already exists" });
    }

    const doctor = new Doctor({
      name,
      surname,
      phone,
      email,
      city,
      state,
      gender,
      doctorType,
      isHomeVisit,
      workType,
      startDate,
      howFind,
      qualification,
    });

    await doctor.save();
    res.status(201).json({
      state: true,
      message: "Your request has been sent successfully",
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};


// const login = async (req, res, next) => {
//   try {
//     const { prescriberNumber, doctorPhone } = req.body;

//     // 1. Validate input
//     if (!prescriberNumber || !doctorPhone) {
//       return res.status(400).json({
//         state: false,
//         message: "Prescriber number and phone number are required.",
//       });
//     }

//     // 2. Find doctor
//     const doctor = await Doctor.findOne({
//       prescriberNumber,
//       phone: doctorPhone,
//     });

//     if (!doctor) {
//       return res.status(401).json({
//         state: false,
//         message: "Doctor not found with provided credentials.",
//       });
//     }

//     // 3. Check if doctor is disabled by admin
//     if (doctor.status === 0) {
//       return res.status(403).json({
//         state: false,
//         message: "Access denied. Your account has been disabled by admin.",
//       });
//     }

//     // 4. Generate token and update last login time
//     const token = await generateToken(doctor, next);
//     doctor.lastLogin = new Date().toISOString(); // Optional: save last login
//     await doctor.save();

//     // 5. Send success response
//     res.status(200).json({
//       state: true,
//       message: "OTP sent to your registered phone number.",
//       token,
//       data: doctor,
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({
//       state: false,
//       message: "Server error during login. Please try again later.",
//     });
//   }
// };

const login = async (req, res, next) => {
  try {
    const { prescriberNumber, doctorPhone } = req.body;

    // 1. Validate input
    if (!prescriberNumber || !doctorPhone) {
      return res.status(400).json({
        state: false,
        message: "Prescriber number and phone number are required.",
      });
    }

    // 2. Find doctor
    const doctor = await Doctor.findOne({
      prescriberNumber,
      phone: doctorPhone,
    });

    if (!doctor) {
      return res.status(401).json({
        state: false,
        message: "Doctor not found with provided credentials.",
      });
    }

    if (doctor.status === 0) {
      return res.status(403).json({
        state: false,
        message: "Access denied. Your account has been disabled by admin.",
      });
    }

    // 3. Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save OTP + expiry + last login in DB
    doctor.otp = otp;
    doctor.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    doctor.lastLogin = new Date();
    await doctor.save();

    // 5. Send OTP via SMS
    const phoneToSend = doctor.phone.startsWith("+") ? doctor.phone : "+" + doctor.phone;
    try {
      await sendSms({
        to: phoneToSend,
        body: `Your login OTP is ${otp}. It is valid for 5 minutes.`,
      });
    
    } catch (smsErr) {
      console.error("SMS sending failed:", smsErr.message);
    }

    // 6. Send full doctor object in response
    res.status(200).json({
      state: true,
      message: "OTP sent to your registered phone number.",
      token: await generateToken(doctor, next), // optional: JWT token
      data: {
        _id: doctor._id,
        name: doctor.name,
        surname: doctor.surname,
        email: doctor.email,
        phone: doctor.phone,
        city: doctor.city,
        state: doctor.state,
        doctorType: doctor.doctorType,
        isHomeVisit: doctor.isHomeVisit,
        workType: doctor.workType,
        startDate: doctor.startDate,
        gender: doctor.gender,
        qualification: doctor.qualification,
        consultedPatients: doctor.consultedPatients,
        isSignatureProvided: doctor.isSignatureProvided,
        isOnline: doctor.isOnline,
        isConsulting: doctor.isConsulting,
        activeConsultationId: doctor.activeConsultationId,
        status: doctor.status,
        prescriberNumber: doctor.prescriberNumber,
        providerNumber: doctor.providerNumber,
        lastLogin: doctor.lastLogin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      state: false,
      message: "Server error during login. Please try again later.",
      error: err.message,
    });
  }
};


const verifyOtp = async (req, res, next) => {
  try {
    const { doctorId, otp } = req.body;

    if (!doctorId || !otp) {
      return res.status(400).json({
        state: false,
        message: "Doctor ID and OTP are required.",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        state: false,
        message: "Doctor not found",
      });
    }

    // Check OTP and expiry
    if (doctor.otp !== otp) {
      return res.status(401).json({ state: false, message: "Invalid OTP" });
    }

    if (new Date() > doctor.otpExpiry) {
      return res.status(401).json({ state: false, message: "OTP has expired" });
    }

    // ✅ OTP verified → generate JWT token for session
    const token = await generateToken(doctor, next);

    // Clear OTP after successful verification
    doctor.otp = null;
    doctor.otpExpiry = null;
    await doctor.save();

    res.status(200).json({
      state: true,
      message: "OTP verified successfully",
      
      token,
      data: doctor,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({
      state: false,
      message: "Server error during OTP verification",
    });
  }
};
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const resendOtp = async (req, res, next) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        state: false,
        message: "Doctor ID is required.",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        state: false,
        message: "Doctor not found",
      });
    }

    // Generate new OTP
    const newOtp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    doctor.otp = newOtp;
    doctor.otpExpiry = expiry;
    await doctor.save();

    // Send OTP via SMS
    const phoneToSend = doctor.phone.startsWith("+") ? doctor.phone : "+" + doctor.phone;
    try {
      await sendSms({
        to: phoneToSend,
        body: `Your login OTP is ${newOtp}. It is valid for 5 minutes.`,
      });

    } catch (smsErr) {
      console.error("SMS sending failed:", smsErr.message);
    }

    res.status(200).json({
      state: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({
      state: false,
      message: "Server error while resending OTP",
    });
  }
};


const getUser = (req, res) => {
  res.send("Welcome to the user page");
};

module.exports = { home, register, login, getUser, verifyOtp, resendOtp };
