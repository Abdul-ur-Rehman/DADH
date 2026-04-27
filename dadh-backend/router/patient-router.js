const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const admin = require("../firebase/firebase-admin");
const patientController = require("../controllers/patient-auth-controller");

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, `patient-photo-${Date.now()}${path.extname(file.originalname)}`),
});
const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});
const validator = require("../middlewares/validator-middleware");
const signupSchema = require("../validator/patient-signup-validator");
const loginSchema = require("../validator/patient-login-validator");
const { authLimiter, registerLimiter } = require("../middlewares/rate-limit-middleware");
// const authMiddleware = require('../middlewares/auth-middleware')

router.post("/verify-otp-token",patientController.verify);
router.post("/register", registerLimiter, validator(signupSchema), patientController.register);
router.post("/getAllFamilyMembers", patientController.getAllFamilyMembers);
router.get("/patients", patientController.getAllPatients);
router.patch("/update/:patientId", patientController.updatePatientById);
router.patch("/upload-photo/:patientId", uploadPhoto.single("profileImage"), patientController.uploadProfilePhoto);
router.get("/profile/:id", patientController.getPatientById);
router.post("/login", authLimiter, validator(loginSchema), patientController.login);
router.get("/getOneById/:id", patientController.getOne);
router.get("/getAll", patientController.getAll);
router.delete("/deleteById/:id",patientController.deleteById);
router.patch("/toggleActive/:id",patientController.toggleActive);
router.post("/get-one", patientController.getOneHome);
router.patch("/set-online/:id", patientController.setOnline);
router.patch("/set-offline/:id", patientController.setOffline);

router.post("/verify-otp", authLimiter, patientController.verifyOtp);
router.post("/resend-otp", authLimiter, patientController.resendOtp);

// router.get("/get-doctor-requests", authController.getDoctorRequests);
// router.get("/get-doctor-request/:id", authController.getDoctorRequestById);
// router.route("/login").post(authController.login);
// router.get('/get-user',authMiddleware,authController.getUser)
module.exports = router;
