const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// Login — 5 tries / 15 min keyed per prescriber number so each doctor has an independent counter.
const doctorLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const prescriber = req.body && String(req.body.prescriberNumber || "").trim();
    return prescriber ? `dr_login_${prescriber}` : ipKeyGenerator(req);
  },
  message: {
    state: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// Strict — for OTP endpoints. 5 tries / 15 min per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    state: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// Moderate — for signup endpoints. 50 attempts / hour per IP.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    state: false,
    message: "Too many signup attempts. Please try again in an hour.",
  },
});

module.exports = { authLimiter, doctorLoginLimiter, registerLimiter };
