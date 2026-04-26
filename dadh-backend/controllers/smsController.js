// controllers/smsController.js
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendSms = async ({ to, body }) => {
  if (!to) throw new Error("Recipient phone number is missing");
  if (!body) throw new Error("Message body is missing");

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE, // Twilio number from .env
      to,
    });
    return message;
  } catch (err) {
    console.error("Twilio Error:", err);
    throw err;
  }
};

module.exports = { sendSms };
