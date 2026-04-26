const express = require("express");
const genUserSig = require("../utils/generate-user-sig");
const router = express.Router();

const SDKAppID = 20020763; // Your Tencent SDKAppID
const SECRET_KEY = "e7996fc5460679518245ea0648f9221d81c7d3b8a7b01842fb2709f6ff922a62"; // Replace with your actual Secret Key

router.get("/getUserSig", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  const userSig = genUserSig(userId);
  res.json({ userSig });
});

module.exports = router;
