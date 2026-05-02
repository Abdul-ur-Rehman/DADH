// services/tencentRecordingService.js
const axios = require("axios");
const crypto = require("crypto");
const zlib = require("zlib");

// ----------------- ENVIRONMENT VARIABLES -----------------
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
const APP_ID = parseInt(process.env.TENCENT_APP_ID);
const REGION = process.env.TENCENT_REGION;
const TRTC_SECRET_KEY = process.env.TRTC_SECRET_KEY;
const COS_BUCKET = process.env.TENCENT_BUCKET;

const tencentConfigured = SECRET_ID && SECRET_KEY && APP_ID && TRTC_SECRET_KEY && COS_BUCKET && REGION;
const assertTencentConfig = () => {
  if (!tencentConfigured) throw new Error("Missing Tencent Cloud environment variables");
};
// ----------------------------------------------------------

// TRTC UserSig Generator
function genUserSig(sdkAppId, secretKey, userId, expire = 86400) {
  const currTime = Math.floor(Date.now() / 1000);
  const sigDoc = {
    "TLS.ver": "2.0",
    "TLS.identifier": userId,
    "TLS.sdkappid": sdkAppId,
    "TLS.expire": expire,
    "TLS.time": currTime
  };

  const contentToBeSigned =
    "TLS.identifier:" + userId + "\n" +
    "TLS.sdkappid:" + sdkAppId + "\n" +
    "TLS.time:" + currTime + "\n" +
    "TLS.expire:" + expire + "\n";

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(contentToBeSigned);
  sigDoc["TLS.sig"] = hmac.digest('base64');

  return zlib.deflateSync(Buffer.from(JSON.stringify(sigDoc))).toString('base64');
}

// Tencent Cloud TC3-HMAC-SHA256 Signature
function getAuthHeaders(service, action, payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split("T")[0];

  const hashedRequestPayload = crypto.createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex");
  const canonicalRequest = `POST\n/\n\ncontent-type:application/json; charset=utf-8\nhost:${service}.tencentcloudapi.com\n\ncontent-type;host\n${hashedRequestPayload}`;
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = crypto.createHash("sha256").update(canonicalRequest, "utf8").digest("hex");

  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
  const kDate = crypto.createHmac("sha256", `TC3${SECRET_KEY}`).update(date).digest();
  const kService = crypto.createHmac("sha256", kDate).update(service).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("tc3_request").digest();
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  return {
    Authorization: `TC3-HMAC-SHA256 Credential=${SECRET_ID}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`,
    "Content-Type": "application/json; charset=utf-8",
    Host: `${service}.tencentcloudapi.com`,
    "X-TC-Action": action,
    "X-TC-Timestamp": timestamp,
    "X-TC-Version": "2019-07-22",
    "X-TC-Region": REGION,
  };
}

async function startRecording(roomId, userId = "recorder_bot") {
  assertTencentConfig();
  if (!roomId) throw new Error("roomId is required");

  const recordUserSig = genUserSig(APP_ID, TRTC_SECRET_KEY, userId);

  const body = {
    SdkAppId: APP_ID,
    RoomId: roomId,
    RoomIdType: 1,
    UserId: userId,
    UserSig: recordUserSig,
    RecordParams: {
      RecordMode: 1,
      MaxIdleTime: 30,
      SubscribeStreamUserIds: [
        { UserId: userId }  // <-- object type required by Tencent API
      ],
      OutputFormat: 0,
      StreamType: 0,
    },
    StorageParams: {
      CloudStorage: {
        Vendor: 0,
        Region: REGION,
        Bucket: COS_BUCKET,
        AccessKey: SECRET_ID,
        SecretKey: SECRET_KEY
      }
    }
  };

  try {
    const headers = getAuthHeaders("trtc", "CreateCloudRecording", body);

    console.log("Final Request Payload:", JSON.stringify(body, null, 2));
    const res = await axios.post("https://trtc.tencentcloudapi.com", body, { headers });

    // Ensure TaskId exists
    if (!res.data.Response || !res.data.Response.TaskId) {
      console.error("No TaskId in response:", res.data);
      throw new Error("Recording did not start: No TaskId returned");
    }

    return {
      TaskId: res.data.Response.TaskId,
      RequestId: res.data.Response.RequestId
    };
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    throw new Error(`Recording failed: ${err.response?.data?.Error?.Message || err.message}`);
  }
}

// Stop Cloud Recording
async function stopRecording(taskId, roomId) {
  assertTencentConfig();
  if (!taskId || !roomId) throw new Error("taskId and roomId are required");

  const body = {
    SdkAppId: APP_ID,
    RoomId: roomId,
    RoomIdType: 1,
    TaskId: taskId
  };

  try {
    const headers = getAuthHeaders("trtc", "StopCloudRecording", body);
    headers["X-TC-Version"] = "2019-07-22"; // version updated

    const res = await axios.post("https://trtc.tencentcloudapi.com", body, { headers });
    return res.data;
  } catch (err) {
    console.error("Stop Recording Tencent API Error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { startRecording, stopRecording };
