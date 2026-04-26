
// require("dotenv").config(); // load .env

// const express = require("express");
// const { createClient } = require("@deepgram/sdk");
// const COS = require("cos-nodejs-sdk-v5");
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// const router = express.Router();
// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
// const cos = new COS({
//   SecretId: process.env.TENCENT_SECRET_ID,
//   SecretKey: process.env.TENCENT_SECRET_KEY,
//   Region: process.env.TENCENT_REGION,
// });
// const bucket = "dadh-recording-trtc-1367645519";

// async function listAllObjects(bucket, prefix) {
//   return new Promise((resolve, reject) => {
//     cos.getBucket({ Bucket: bucket, Region: process.env.TENCENT_REGION, Prefix: prefix }, (err, data) => {
//       if (err) return reject(err);
//       resolve(data.Contents || []);
//     });
//   });
// }

// async function downloadFromCOS(bucket, key) {
//   return new Promise((resolve, reject) => {
//     cos.getObject({ Bucket: bucket, Region: process.env.TENCENT_REGION, Key: key }, (err, data) => {
//       if (err) return reject(err);
//       resolve(data.Body);
//     });
//   });
// }

// async function transcribeMedicalAudio(buffer, mimetype = "audio/mp4") {
//   const response = await deepgram.listen.prerecorded.transcribeFile(buffer, { mimetype, model: "general", language: "en", punctuate: true });
//   return response?.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
// }

// function getLatestRecordingKeysFromObjects(objects) {
//   const userMap = {};
//   objects.forEach(obj => {
//     const keyParts = obj.Key.split("/");
//     const userIndex = keyParts.indexOf("individual") + 1;
//     if (userIndex <= 0 || userIndex >= keyParts.length) return;
//     const userId = keyParts[userIndex];
//     if (!userMap[userId] || new Date(obj.LastModified) > new Date(userMap[userId].LastModified)) {
//       userMap[userId] = obj;
//     }
//   });
//   return Object.values(userMap).map(f => f.Key);
// }

// router.post("/", async (req, res) => {
//   const { patientId, doctorId, template } = req.body;
//   if (!patientId || !doctorId || !template) return res.status(400).json({ error: "patientId, doctorId and template required" });

//   try {
//     // 1️⃣ Get recordings
//     const prefix = "dadh-recording/";
//     const allObjects = await listAllObjects(bucket, prefix);
//     const filteredObjects = allObjects.filter(
//       obj => obj.Key.includes(`/individual/${patientId}`) || obj.Key.includes(`/individual/${doctorId}`)
//     );
//     if (!filteredObjects.length) return res.status(404).json({ error: "No recordings found for these users" });

//     // 2️⃣ Latest session
//     const sessionSet = new Set();
//     filteredObjects.forEach(obj => {
//       const match = obj.Key.match(/(20025337_\d+)/);
//       if (match) sessionSet.add(match[1]);
//     });
//     const sessions = Array.from(sessionSet).sort();
//     const latestSession = sessions[sessions.length - 1];
//     const sessionObjects = filteredObjects.filter(obj => obj.Key.includes(`${latestSession}/individual/`));
//     const latestKeys = getLatestRecordingKeysFromObjects(sessionObjects);

//     // 3️⃣ Deepgram transcription
//     const transcripts = [];
//     for (const key of latestKeys) {
//       const buffer = await downloadFromCOS(bucket, key);
//       const transcript = await transcribeMedicalAudio(buffer, "audio/mp4");
//       transcripts.push({ key, transcript });
//     }

//     // 4️⃣ Combine transcript + template
//     const combinedTranscript = transcripts.map(t => t.transcript).join("\n");
//     const prompt = `You are a medical scribe. Using the template below, generate structured medical notes:\n\nTEMPLATE:\n${template}\n\nTRANSCRIPT:\n${combinedTranscript}\n\nNotes:`;

//     // 5️⃣ OpenRouter API call with correct API key
//     const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
//     const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENROUTER_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-4.5-preview",
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: 2000
//       }),
//     });


//     const aiData = await aiResponse.json();
//     console.log("OPENROUTER_API_KEY:",process.env.OPENROUTER_API_KEY);

//     console.log("OpenRouter RAW RESPONSE:", aiData);
//     const generatedNote = aiData?.choices?.[0]?.message?.content || "";

//     res.json({ latestSession, transcripts, generatedNote });

//   } catch (err) {
//     console.error("❌ Error in transcription & AI Scribe API:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// module.exports = router;


require("dotenv").config();
const express = require("express");
const { createClient } = require("@deepgram/sdk");
const COS = require("cos-nodejs-sdk-v5");
const { CohereClientV2 } = require("cohere-ai");

const router = express.Router();
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY,
  Region: process.env.TENCENT_REGION,
});
const bucket = "dadh-recording-trtc-1367645519";

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

async function listAllObjects(bucket, prefix) {
  return new Promise((resolve, reject) => {
    cos.getBucket({ Bucket: bucket, Region: process.env.TENCENT_REGION, Prefix: prefix }, (err, data) => {
      if (err) return reject(err);
      resolve(data.Contents || []);
    });
  });
}

async function downloadFromCOS(bucket, key) {
  return new Promise((resolve, reject) => {
    cos.getObject({ Bucket: bucket, Region: process.env.TENCENT_REGION, Key: key }, (err, data) => {
      if (err) return reject(err);
      resolve(data.Body);
    });
  });
}

async function transcribeMedicalAudio(buffer, mimetype = "audio/mp4") {
  const response = await deepgram.listen.prerecorded.transcribeFile(buffer, { mimetype, model: "general", language: "en", punctuate: true });
  return response?.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
}

function getLatestRecordingKeysFromObjects(objects) {
  const userMap = {};
  objects.forEach(obj => {
    const keyParts = obj.Key.split("/");
    const userIndex = keyParts.indexOf("individual") + 1;
    if (userIndex <= 0 || userIndex >= keyParts.length) return;
    const userId = keyParts[userIndex];
    if (!userMap[userId] || new Date(obj.LastModified) > new Date(userMap[userId].LastModified)) {
      userMap[userId] = obj;
    }
  });
  return Object.values(userMap).map(f => f.Key);
}

router.post("/", async (req, res) => {
  const { patientId, doctorId, template } = req.body;
  if (!patientId || !doctorId || !template) return res.status(400).json({ error: "patientId, doctorId and template required" });

  try {
    // 1️⃣ Get recordings
    const prefix = "dadh-recording/";
    const allObjects = await listAllObjects(bucket, prefix);
    const filteredObjects = allObjects.filter(
      obj => obj.Key.includes(`/individual/${patientId}`) || obj.Key.includes(`/individual/${doctorId}`)
    );
    if (!filteredObjects.length) return res.status(404).json({ error: "No recordings found for these users" });

    // 2️⃣ Latest session
    const sessionSet = new Set();
    filteredObjects.forEach(obj => {
      const match = obj.Key.match(/(20025337_\d+)/);
      if (match) sessionSet.add(match[1]);
    });
    const sessions = Array.from(sessionSet).sort();
    const latestSession = sessions[sessions.length - 1];
    const sessionObjects = filteredObjects.filter(obj => obj.Key.includes(`${latestSession}/individual/`));
    const latestKeys = getLatestRecordingKeysFromObjects(sessionObjects);

    // 3️⃣ Deepgram transcription
    const transcripts = [];
    for (const key of latestKeys) {
      const buffer = await downloadFromCOS(bucket, key);
      const transcript = await transcribeMedicalAudio(buffer);
      transcripts.push({ key, transcript });
    }

    // 4️⃣ Combine transcript + template
    const combinedTranscript = transcripts.map(t => t.transcript).join("\n");
    const prompt = `You are a medical scribe. Using the template below, generate structured medical notes:\n\nTEMPLATE:\n${template}\n\nTRANSCRIPT:\n${combinedTranscript}\n\nNotes:`;

    // 5️⃣ Cohere API call
    const cohereResponse = await cohere.chat({
      model: "command-a-03-2025",
      messages: [
        { role: "user", content: prompt }
      ],
      maxTokens: 500,
      temperature: 0.2
    });

    // Correct access for generated text
    // Extract generated note from Cohere response
    const generatedNote = cohereResponse?.message?.content?.[0]?.text || "";

    res.json({ latestSession, transcripts, generatedNote });

  } catch (err) {
    console.error("❌ Error in transcription & Cohere API:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
