const express = require("express");
const router = express.Router();
const BillingController = require('../controllers/billling-controller');


router.post("/end/referral/:id", BillingController.endConsultationForReferral);
router.get("/getAllBilling", BillingController.getAllBilling);
router.get("/getAll", BillingController.getAll);
router.post("/add", BillingController.addBillingCode);
router.post("/end/consultation/:id", BillingController.endConsultation);
router.get("/getOneById/:id", BillingController.getBillingById);
router.post("/updateOne/:id", BillingController.updateBilling);
router.delete("/deleteById/:id", BillingController.deleteBillCode);
router.get("/sevenDaysBillingsByDoctor/:id", BillingController.getSevendDaysBillingsByDoctor);
router.get("/currentDayBillingByDoctor/:id", BillingController.getCurrentDayBillingByDoctor);
router.get("/by-doctor/:doctorId", BillingController.getBillingsByDoctorId);

module.exports = router;

