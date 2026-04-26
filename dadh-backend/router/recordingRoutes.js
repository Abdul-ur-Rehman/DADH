const express = require("express");
const router = express.Router();
const { startRecording, stopRecording } = require("../controllers/recordingController");

router.post("/recording/start", startRecording);
router.post("/recording/stop", stopRecording);

module.exports = router;
