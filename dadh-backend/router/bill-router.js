const express = require("express");
const router = express.Router();
const BillController = require('../controllers/bill-controller');


router.patch("/add/:id", BillController.addBill);
router.patch("/remove/:id", BillController.removeBill);

module.exports = router;

// router.get("/getConsulationByDoctor/:id",BillingController.getConsultationByDoctor);