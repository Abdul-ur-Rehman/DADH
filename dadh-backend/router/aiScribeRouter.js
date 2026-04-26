const path = require("path");
const fs = require("fs");
const express = require("express");
const { transcribeMedicalAudio } = require("../services/deepgramService");

const router = express.Router();

router.get("/:consultationId", async (req, res) => {
  const consultationId = req.params.consultationId;

  if (!consultationId) {
    return res.status(400).json({ success: false, message: "Consultation ID is required" });
  }

  const uploadsDir = path.join(__dirname, "..", "uploads");

  // 🔍 Search for any file ending with the consultation ID
  const files = fs.readdirSync(uploadsDir);
  // const matchingFile = files.find(file => file.endsWith(`call-${consultationId}.webm`));
  const matchingFile = files.find(file =>
    file.includes(`call-${consultationId}.webm`)
  );


  if (!matchingFile) {
    return res.status(404).json({ success: false, message: "Audio file not found" });
  }

  const filePath = path.join(uploadsDir, matchingFile);

  try {
    const transcript = await transcribeMedicalAudio(filePath);
    res.json({
      success: true,
      consultationId,
      note: transcript,
    });
  } catch (err) {
    console.error("❌ Transcription Error:", err);
    res.status(500).json({ success: false, message: "Transcription failed" });
  }
});

module.exports = router;
