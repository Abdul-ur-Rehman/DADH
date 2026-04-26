// const path = require("path");

// const uploadAudio = (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({
//       state: false,
//       message: "No file uploaded",
//     });
//   }

//   const fileName = req.file.filename;
//   const filePath = path.join(__dirname, "../uploads", fileName);

//   console.log("✅ File uploaded:", filePath);

//   res.status(201).json({
//     state: true,
//     message: "File uploaded successfully",
//     file: {
//       name: fileName,
//       path: `/uploads/${fileName}`, // frontend access
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//     },
//   });
// };

// module.exports = { uploadAudio };


const path = require("path");
const { transcribeMedicalAudio } = require("../services/deepgramService"); // tumhara service file

const uploadAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      state: false,
      message: "No file uploaded",
    });
  }

  const fileName = req.file.filename;
  const filePath = path.join(__dirname, "../uploads", fileName);

  console.log("✅ File uploaded:", filePath);

  try {
    // 🔹 Call Deepgram service
    const transcript = await transcribeMedicalAudio(filePath);

    console.log("✅ Transcript:", transcript);

    res.status(201).json({
      state: true,
      message: "File uploaded and transcribed successfully",
      file: {
        name: fileName,
        path: `/uploads/${fileName}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
        transcript, // include transcript
      },
    });
  } catch (err) {
    console.error("❌ Error during transcription:", err);
    res.status(500).json({
      state: false,
      message: "Transcription failed",
      error: err.message,
    });
  }
};

module.exports = { uploadAudio };
