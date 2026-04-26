// controllers/recordingController.js
const { startRecording, stopRecording } = require("../services/tencentRecordingService");

exports.startRecording = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    if (!roomId || !userId) {
      return res.status(400).json({ error: "roomId and userId required" });
    }

    const result = await startRecording(roomId, userId);
    res.json(result);
  } catch (err) {
    console.error("Start Recording Error:", err);
    res.status(500).json({ error: "Failed to start recording" });
  }
};

exports.stopRecording = async (req, res) => {
  try {
    const { taskId, roomId } = req.body;
    if (!taskId || !roomId) {
      return res.status(400).json({ error: "taskId and roomId required" });
    }

    const result = await stopRecording(taskId, roomId);
    res.json(result);
  } catch (err) {
    console.error("Stop Recording Error:", err);
    res.status(500).json({ error: "Failed to stop recording" });
  }
};
