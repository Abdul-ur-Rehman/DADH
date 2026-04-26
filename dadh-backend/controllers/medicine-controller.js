const Medicine = require("../models/medicine-model");
const Doctor = require("../models/doctor-model");

const addMedicine = async (req, res, next) => {
  try {
    const { medicineName, categories, price } = req.body;
    if ((!medicineName || !categories, !price)) {
      return res
        .status(400)
        .json({ state: false, message: "All fields are required" });
    }
    const newMedicine = new Medicine({
      medicineName,
      categories,
      price,
    });
    await newMedicine.save();
    return res
      .status(200)
      .json({
        state: true,
        message: "Medicine added successfully",
        data: newMedicine,
      });
  } catch (err) {
    next(err);
  }
};

const getAllMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find();
    if (!medicines.length) {
      return res
        .status(200)
        .json({ state: true, message: "No medicines found" });
    }
    res.status(200).json({
      state: true,
      total_medicines: medicines.length,
      data: medicines,
    });
  } catch (err) {
    next(err);
  }
};

const getMedicine = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ state: false, message: "Doctor not found" });
    }
    const medicines = await Medicine.find({
      categories: { $in: doctor.doctorType },
    });
    if (!medicines.length) {
      return res
        .status(200)
        .json({ state: true, message: "No medicines found" });
    }
    res.status(200).json({
      state: true,
      total_medicines: medicines.length,
      data: medicines,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  addMedicine,
  getAllMedicines,
  getMedicine,
};
