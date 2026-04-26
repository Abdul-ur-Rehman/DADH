const express = require("express");
const router = express.Router();
const validator = require("../middlewares/validator-middleware");
const adminController = require("../controllers/admin-auth-controller");
const emailController = require("../controllers/emailController");

const signupSchema = require("../validator/admin-signup-validator");
const loginSchema = require("../validator/admin-login-validator");

// Auth Routes
router.post("/register", validator(signupSchema), adminController.register);
router.post("/login", validator(loginSchema), adminController.login);

// Admin CRUD Routes
router.patch("/toggleActive/:id", adminController.toggleActiveById);
router.get("/getAll", adminController.getAll);
router.get("/getOneById/:id", adminController.getOne);
router.put("/updateById/:id", adminController.updateById);
router.delete("/deleteById/:id", adminController.deleteById); // ✅ Must match the exported function name

router.get('/payment-documents', adminController.getAllPaymentDocumentsForAdmin);


// Email Route
router.post("/sendEmail", emailController.sendEmail);

module.exports = router;
