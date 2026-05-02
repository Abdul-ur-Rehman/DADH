// const fetch = require("node-fetch");

exports.sendEmail = async (req, res) => {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

  // 1) Extract data from the request body
  const { to, subject, content } = req.body;

  // 2) Define API endpoint and API key
  const API_URL = "https://api.resend.com/emails";
  const API_KEY = process.env.RESEND_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      status: "failed",
      message: "Email service is not configured (RESEND_API_KEY missing).",
    });
  }

  try {
    // 3) Prepare the request payload
    const payload = {
      from: 'onboard@resend.dev',
      to: to,
      subject: subject,
      html: `<div>${content}</div>`,
      tags: [{ name: "category", value: "confirm_email" }],
    };

    // 4) Send API request using fetch
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      

    // 5) Parse response
    const data = await response.json();

    // 6) Handle errors from API response
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    // 7) Send success response to client
    res.status(200).json({
      status: "success",
      data: {
        emailRef: data,
      },
    });
  } catch (err) {
    // 8) Handle errors
    res.status(400).json({
      status: "failed",
      message: err.message || "Something went wrong. Please try again.",
    });
  }
};