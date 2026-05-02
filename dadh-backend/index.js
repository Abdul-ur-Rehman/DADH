// Load env FIRST — many requires below (smsController, db-connect, etc.) read process.env at import time.
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db-connect");
const errorMiddleware = require("./middlewares/error-middleware");

const authDoctorRouter = require("./router/doctor-auth-router");
const adminRouter = require("./router/admin-router");
const patientRouter = require("./router/patient-router");
const consultationCategoryRouter = require("./router/consultation-category-router");
const consultationsRouter = require("./router/consultations-router");
const doctorRequestRouter = require("./router/doctor-requests");
const doctorRouter = require("./router/doctor-router");
const billingRouter = require("./router/billing-router");
const chatRouter = require("./router/chat-router");
const billRouter = require("./router/bill-router");
const medicineRouter = require("./router/medicine-router");
const smsRouter = require("./router/smsRouter");
const templateRoutes = require("./router/templateRoutes");
const uploadRoutes = require("./router/uploadRouter");
const aiScribeRouter = require("./router/aiScribeRouter");
const recordingRoutes = require("./router/recordingRoutes");
const transcribeRoutes = require("./services/deepgramService");

const app = express();

// Fail fast if critical secrets are missing (matches multi-env deployment expectations).
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET must be set and at least 32 chars long.");
  process.exit(1);
}
if (!process.env.URI) {
  console.error("FATAL: URI (MongoDB connection string) must be set.");
  process.exit(1);
}

// --- Security middleware (must come before routes) ---

// Helmet sets sensible security headers (X-Frame-Options, X-Content-Type-Options, etc.)
// CSP intentionally not configured here — it requires per-page tuning and breaks inline
// scripts in some pages. Phase 9 (infra) will add a tuned CSP.
app.use(helmet({ contentSecurityPolicy: false }));

// Body size limits — prevent oversized-payload DoS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// CORS — explicit allowlist driven by ALLOWED_ORIGINS env var. No wildcard.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (curl, mobile apps, server-to-server) — no Origin header.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: "POST,PUT,DELETE,GET,PATCH,HEAD,OPTIONS",
    credentials: true,
  })
);

// --- Routes ---

app.use("/api/doctor/auth", authDoctorRouter);
app.use("/api/admin/auth", adminRouter);
app.use("/api/patient/auth", patientRouter);
app.use("/api/consultationCategory", consultationCategoryRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/consultations", consultationsRouter);
app.use("/api/doctor-requests", doctorRequestRouter);
app.use("/api/billing", billingRouter);
app.use("/api/bill", billRouter);
app.use("/api/user-sign", chatRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/FamilyMembers", patientRouter);
app.use("/notification/sms", smsRouter);
app.use("/api/templates", templateRoutes);

// Serve uploaded audio files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/upload-audio", uploadRoutes);

app.use("/api", recordingRoutes);
app.use("/api/ai-scribe", aiScribeRouter);
app.use("/api/transcribe-latest", transcribeRoutes);

// --- Error handler (must be last) ---
app.use(errorMiddleware);

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
  );
});
