// const sendOTP = async (phone, otp) => {
//   try {
//     const accountSid = process.env.TWILIO_ACCOUNT_SID;
//     const authToken = process.env.TWILIO_AUTH_TOKEN;
//     const client = require("twilio")(accountSid, authToken);

//     const message = await client.messages.create({
//       body: `Your OTP is ${otp}`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: phone,
//     });

//     return message;
//   } catch (err) {
//     console.log(err);
//   }
// };

// module.exports = sendOTP;
