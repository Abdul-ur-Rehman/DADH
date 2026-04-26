const Doctor = require("../models/doctor-model");

const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    return res.status(201).json({
      state: true,
      message: "All doctors fetched successfully",
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};


const setOnline = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findByIdAndUpdate(
      { _id: doctorId },
      { isOnline: true },
      { new: true }
    );
    if (!doctor) {
      return res.status(400).json({
        state: false,
        message: "Doctor not found",
      });
    }
    return res.status(200).json({
      state: true,
      message: 'Doctor is online',
      data: doctor
    })
  } catch (err) {
    next(err);
  }
};
const setOffline = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findByIdAndUpdate(
      { _id: doctorId },
      { isOnline: false },
      { new: true }
    );
    if (!doctor) {
      return res.status(400).json({
        state: false,
        message: "Doctor not found",
      });
    }
    return res.status(200).json({
      state: true,
      message: 'Doctor is offline',
      data: doctor
    })
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDoctors, setOnline,setOffline };
