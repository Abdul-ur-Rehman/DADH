// const hashPassword = require("../utils/hash-password");
const Patient = require("../models/patient-model");
const generateToken = require("../utils/generate-token");
const register = async (req, res, next) => {
  try {
    const { name, email, phone, city, state, DOB,  medicareNumber } =
      req.body;
    const isEmailExist = await Patient.findOne({ email: email });
    if (isEmailExist) {
      return res
        .status(400)
        .json({ state: false, message: "Patient already exists" });
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
    });
    await patient.save();
    res.status(201).json({
      state: true,
      message: "Patient added successfully",
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};
const getOne = async (req, res, next) =>{
  try {
    const  patientId = req.params.id; 
    console.log("patient id "+patientId);
    const patient = await Patient.findOne({_id : patientId});
    if (!patient) {
      return res
        .status(400)
        .json({ state: false, message: "Patient not found" });
    }
    res.status(200).json({
      state: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
}

const getOneHome = async (req, res, next) =>{
  try {
    const  {patientId} = req.body; 
    // console.log("patient id "+patientId);
    const patient = await Patient.findOne({_id : patientId});
    if (!patient) {
      return res
        .status(400)
        .json({ state: false, message: "Patient not found" });
    }
    res.status(200).json({
      state: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
}
const getAll = async (req, res, next) =>{
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
      data: patient
    });
  } catch (error) {
    next(error);
  }
}
const login = async (req, res, next) => {
  try {
    const { medicareNumber, phone, DOB } = req.body;
    const patient = await Patient.findOne({ medicareNumber, phone, DOB });
    if (!patient) {
      return res
        .status(401)
        .json({ state: false, message: "Patient not found" });
    }
    const token = await generateToken(patient, next);
    res.status(200).json({
      state: true,
      message: "OTP sent to your registered phone Number",
      token: token,
      data: patient
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { register, login, getOne, getAll,getOneHome };