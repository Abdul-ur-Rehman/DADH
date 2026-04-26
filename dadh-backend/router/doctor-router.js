const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor-controller");
// const authMiddleware = require('../middlewares/auth-middleware')

router.get("/getAll",doctorController.getAllDoctors);
router.patch("/set-online/:id",doctorController.setOnline);
router.patch("/set-offline/:id",doctorController.setOffline);
// router.get("/getDoctorConsultationCount", doctorController.getDoctorConsultationCount);


module.exports = router;