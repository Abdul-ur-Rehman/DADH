const express = require("express");
const router = express.Router();
const admin = require("../firebase/firebase-admin");
const patientController = require("../controllers/patient-auth-controller");
const validator = require("../middlewares/validator-middleware");
const signupSchema = require("../validator/patient-signup-validator");
const loginSchema = require("../validator/patient-login-validator copy");
// const authMiddleware = require('../middlewares/auth-middleware')

router.post("/verify-otp-token",patientController.verify);
router.post("/register", validator(signupSchema), patientController.register);
router.post("/getAllFamilyMembers", patientController.getAllFamilyMembers);
router.get("/patients", patientController.getAllPatients);
router.patch("/update/:patientId", patientController.updatePatientById);
router.get("/profile/:id", patientController.getPatientById);
router.post("/login", validator(loginSchema), patientController.login);
router.get("/getOneById/:id", patientController.getOne);
router.get("/getAll", patientController.getAll);
router.delete("/deleteById/:id",patientController.deleteById);
router.patch("/toggleActive/:id",patientController.toggleActive);
router.post("/get-one", patientController.getOneHome);
router.patch("/set-online/:id", patientController.setOnline);
router.patch("/set-offline/:id", patientController.setOffline);

router.post("/verify-otp", patientController.verifyOtp);
router.post("/resend-otp", patientController.resendOtp);

// router.get("/get-doctor-requests", authController.getDoctorRequests);
// router.get("/get-doctor-request/:id", authController.getDoctorRequestById);
// router.route("/login").post(authController.login);
// router.get('/get-user',authMiddleware,authController.getUser)
module.exports = router;
