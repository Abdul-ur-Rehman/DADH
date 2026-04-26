const crypto = require("crypto");
require('dotenv').config()

function genUserSig(userId) {
  const currTime = Math.floor(Date.now() / 1000);
  const obj = {
    "TLS.ver": "2.0",
    "TLS.identifier": userId,
    "TLS.sdkappid": process.env.SDKAppID,
    "TLS.expire": process.env.EXPIRE_TIME,
    "TLS.time": currTime,
  };

  const baseString = Object.keys(obj)
    .map((key) => `${key}:${obj[key]}`)
    .join("\n");

  const signature = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(baseString)
    .digest("base64");

  obj["TLS.sig"] = signature;

  return Buffer.from(JSON.stringify(obj)).toString("base64") || 'error in generating user-sign';
}

module.exports = genUserSig;
