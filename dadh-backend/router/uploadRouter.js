const express = require("express");
const multer = require("multer");
const path = require("path");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// ✅ Multer Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // timestamp + original name
  },
});

const upload = multer({ storage });

// ✅ POST /api/upload-audio
router.post("/", upload.single("file"), uploadController.uploadAudio);

module.exports = router;
