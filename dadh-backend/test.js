const { listRecordings, downloadRecording } = require("./utils/download-recording");

(async () => {
  try {
    const files = await listRecordings();

    if (!files || files.length === 0) {
      console.log("❌ No recordings found");
      return;
    }

    const fileKey = files[0].Key;
    console.log(`🎯 Downloading file: ${fileKey}`);

    await downloadRecording(fileKey, "./downloaded-audio.mp3");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
