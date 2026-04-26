// routes/smsRoutes.js
const express = require("express");
const router = express.Router();
const SMSController = require("../controllers/smsController");

router.post("/", SMSController.sendSms);

module.exports = router;
