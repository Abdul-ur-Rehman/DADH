const Consultation = require("../models/consultations-model");

const addBill = async (req, res, next) => {
  try {
    const bill_id = req.body.bill_id;
    const consultation_id = req.params.id;
    const consultation = await Consultation.findByIdAndUpdate(
      consultation_id,
      { $push: { billCodes: bill_id } }, 
      { new: true }  
    )
    return res.status(200).json({ state: true, message: "bill added successfully", consultation_data: consultation});
  } catch (err) {
    next();
  }
};

const removeBill = async (req, res, next) => {
  try {
    const bill_id = req.body.bill_id;
    const consultation_id = req.params.id;
    const consultation = await Consultation.findByIdAndUpdate(
      consultation_id,
      { $pull: { billCodes: bill_id } },
      { new: true }  
    )
    return res.status(200).json({ state: true, message: "bill removed successfully" , consultation_data: consultation});
  } catch (err) {
    next();
  }
};
module.exports = { addBill, removeBill };
