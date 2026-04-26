const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
require("dotenv").config();

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY,
});

const Bucket = process.env.TENCENT_BUCKET;
const Region = process.env.TENCENT_REGION;

// List all recordings
function listRecordings() {
  return new Promise((resolve, reject) => {
    cos.getBucket(
      {
        Bucket,
        Region,
        Prefix: "recordings/",
      },
      (err, data) => {
        if (err) return reject(err);
        console.log("📂 Files in bucket:", data.Contents);
        resolve(data.Contents);
      }
    );
  });
}

// Download specific recording file
function downloadRecording(fileKey, savePath) {
  return new Promise((resolve, reject) => {
    cos.getObject(
      {
        Bucket,
        Region,
        Key: fileKey,
      },
      (err, data) => {
        if (err) return reject(err);
        fs.writeFileSync(savePath, data.Body);
        console.log(`✅ Recording saved to ${savePath}`);
        resolve();
      }
    );
  });
}

module.exports = { listRecordings, downloadRecording };
