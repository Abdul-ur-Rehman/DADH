const { default: mongoose } = require("mongoose");
const Consultation = require("../models/consultations-model");

const addPrescribtion = async (req, res, next) => {
  // try {
  //   const { medicine_id } = req.body;
  //   const consultation_id = req.params.id;

  //   const consultation = await Consultation.findByIdAndUpdate(
  //     consultation_id,
  //     { $push: { medicines: medicine_id } },
  //     { new: true }
  //   );
  //   if (!consultation) {
  //     return res
  //       .status(404)
  //       .json({ state: false, message: "Consultation not found" });
  //   }
  //   await consultation.save();
  //   return res.status(200).json({
  //     state: true,
  //     message: "Prescription added successfully",
  //     data: consultation,
  //   });
  // } catch (err) {
  //   next(err);
  // }

  try {
    const { medicine_id, dose, quantity, frequency, duration, instruction } =
      req.body;
    const consultation_id = req.params.id;
    if (
      !medicine_id ||
      !dose ||
      !quantity ||
      !frequency ||
      !duration ||
      !instruction
    ) {
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

const removePrescribtion = async (req, res, next) => {
  try {
    const { medicine_id } = req.body;
    const consultation_id = req.params.id;
    const consultation = await Consultation.findByIdAndUpdate(
      consultation_id,
      { $pull: { medicines: medicine_id } },
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
      message: "Prescription removed successfully",
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addPrescribtion, removePrescribtion };
