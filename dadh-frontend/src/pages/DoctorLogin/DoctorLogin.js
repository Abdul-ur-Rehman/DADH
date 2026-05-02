import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "store/auth";
import logoDark from "../../assets/images/logo-dark.png";
import { DOCTOR_FORCED_LOGOUT_MESSAGE_KEY } from "../../components/DoctorLayout/doctorSessionStatus";
import { formatLockoutCountdown, getRateLimitRetryAt, AUTH_LOCKOUT_WINDOW_MS } from "./loginRateLimit";

const STYLES = `
  @keyframes dadh-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes dadh-float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-8px) rotate(3deg); }
  }
  @keyframes dadh-pulse-ring {
    0%   { transform: scale(0.9); opacity: 0.6; }
    70%  { transform: scale(1.3); opacity: 0; }
    100% { transform: scale(0.9); opacity: 0; }
  }
  @keyframes dadh-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dadh-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .dadh-float        { animation: dadh-float      3.5s ease-in-out infinite; }
  .dadh-pulse-ring   { animation: dadh-pulse-ring 2.2s ease-out infinite; }
  .dadh-fade-up-3    { animation: dadh-fade-up    0.5s ease-out 0.4s both; }
`;

// ── OTP Modal ─────────────────────────────────────────────────────────────────

function OtpModal({ onVerify, onClose }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const refs = useRef([])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    setError("")
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || ""
    setOtp(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = () => {
    const code = otp.join("")
    if (code.length < 6) { setError("Please enter all 6 digits."); return }
    onVerify()
  }

  const allFilled = otp.every(d => d !== "")

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 16, width: 420, maxWidth: "92vw", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>

        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F0FDFA", border: "1px solid #D1E8E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 18px" }}>
          🔐
        </div>

        <h2 style={{ fontWeight: 800, fontSize: 20, color: "#111E1F", margin: "0 0 8px" }}>Verify Your Identity</h2>
        <p style={{ fontSize: 13, color: "#4B7172", margin: "0 0 28px", lineHeight: 1.6 }}>
          We've sent a 6-digit code to your registered phone number and email. Enter it below to continue.
        </p>

        {/* OTP inputs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: 46, height: 54, textAlign: "center", fontSize: 22, fontWeight: 700,
                border: `2px solid ${digit ? "#0D7377" : "#D1E8E8"}`,
                borderRadius: 10, outline: "none", color: "#111E1F",
                background: digit ? "#F0FDFA" : "#fff",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onFocus={e => e.target.select()}
            />
          ))}
        </div>

        {error && <p style={{ fontSize: 12, color: "#EF4444", margin: "6px 0 0" }}>{error}</p>}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          style={{
            width: "100%", marginTop: 22, padding: "13px",
            background: allFilled ? "#0D7377" : "#94A3B8",
            color: "white", border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: 15,
            cursor: allFilled ? "pointer" : "default",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (allFilled) e.currentTarget.style.background = "#0a5f62" }}
          onMouseLeave={e => { if (allFilled) e.currentTarget.style.background = "#0D7377" }}
        >
          Verify &amp; Sign In
        </button>

        {/* Resend */}
        <p style={{ fontSize: 12, color: "#4B7172", marginTop: 16, marginBottom: 0 }}>
          Didn't receive a code?{" "}
          <span style={{ color: "#0D7377", fontWeight: 600, cursor: "pointer" }}>Resend code</span>
          <span style={{ color: "#94A3B8", fontSize: 11, display: "block", marginTop: 4 }}>
            (SMS &amp; email integration coming soon)
          </span>
        </p>
      </div>
    </div>
  )
}

// ── Main login component ───────────────────────────────────────────────────────

const LS_ATTEMPTS_KEY = "dadh_doctor_login_attempts";

const loadAttempts = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_ATTEMPTS_KEY) || "{}");
    const now = Date.now();
    const cleaned = {};
    Object.entries(stored).forEach(([k, v]) => {
      cleaned[k] = v.lockUntil && v.lockUntil <= now
        ? { attempts: 0, lockUntil: null }
        : v;
    });
    return cleaned;
  } catch {
    return {};
  }
};

const saveAttempts = (map) => {
  try { localStorage.setItem(LS_ATTEMPTS_KEY, JSON.stringify(map)); } catch {}
};

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { storeDataInLS } = useAuth();

  const [formData, setFormData] = useState({ prescriberNumber: "", doctorPhone: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const pendingPayload = useRef(null);
  // Track attempts per prescriber number: { [prescriber]: { attempts, lockUntil } }
  const attemptsRef = useRef({});
  const MAX_ATTEMPTS = 5;

  useEffect(() => {
    document.title = "Login | Doctor Portal";
    attemptsRef.current = loadAttempts();

    const forcedLogoutMessage = localStorage.getItem(DOCTOR_FORCED_LOGOUT_MESSAGE_KEY);
    if (forcedLogoutMessage) {
      setApiError(forcedLogoutMessage);
      localStorage.removeItem(DOCTOR_FORCED_LOGOUT_MESSAGE_KEY);
    }

    const isLoggedIn = localStorage.getItem("isDoctorLoggedIn");
    const userRole = localStorage.getItem("userRole");
    if (isLoggedIn === "true" && userRole === "doctor") navigate("/doctor");
  }, [navigate]);

  useEffect(() => {
    if (!lockoutUntil) return undefined;

    const tick = () => setNowMs(Date.now());
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  useEffect(() => {
    if (lockoutUntil && lockoutUntil <= nowMs) {
      setLockoutUntil(null);
      setApiError("");
      const key = String(formData.prescriberNumber || "");
      const entry = attemptsRef.current[key];
      if (entry && entry.lockUntil && entry.lockUntil <= nowMs) {
        attemptsRef.current[key] = { attempts: 0, lockUntil: null };
        saveAttempts(attemptsRef.current);
      }
    }
  }, [lockoutUntil, nowMs]);

  const lockoutRemainingMs = lockoutUntil ? Math.max(0, lockoutUntil - nowMs) : 0;
  const isLockedOut = lockoutRemainingMs > 0;
  const displayError = isLockedOut
    ? `Too many attempts. Please try again in ${formatLockoutCountdown(lockoutRemainingMs)} minutes.`
    : apiError;
  const submitDisabled = loading || isLockedOut;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned = value.replace(/\D/g, "");
    setFormData((p) => ({ ...p, [name]: cleaned }));
    setErrors((p) => ({ ...p, [name]: "" }));

    if (name === "prescriberNumber") {
      // Switching prescriber — reload that doctor's lockout state and clear any previous error
      setApiError("");
      const entry = attemptsRef.current[cleaned];
      const lock = entry && entry.lockUntil && entry.lockUntil > Date.now() ? entry.lockUntil : null;
      setLockoutUntil(lock);
    } else {
      setApiError("");
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!/^\d{3}$/.test(formData.prescriberNumber)) errs.prescriberNumber = "Must be exactly 3 digits.";
    if (!/^\d{10,}$/.test(formData.doctorPhone))    errs.doctorPhone = "Must be at least 10 digits.";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    // Re-check per-user lock state before submitting
    const userKey = String(formData.prescriberNumber || "");
    const userEntry = attemptsRef.current[userKey];
    if (userEntry && userEntry.lockUntil && userEntry.lockUntil > Date.now()) {
      setLockoutUntil(userEntry.lockUntil);
      return;
    }
    if (isLockedOut) return;
    if (!validateForm()) return;
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";
      const res = await fetch(`${backendUrl}/doctor/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, prescriberNumber: Number(formData.prescriberNumber) }),
      });
      const data = await res.json();
      if (res.ok && data.state === true) {
        // Store payload temporarily — only commit to localStorage after OTP
        pendingPayload.current = { token: data.token, role: "doctor", data: data.data };
        setShowOtp(true);
      } else if (res.status === 429 || /too many attempts/i.test(data.message || "")) {
        const retryAt = getRateLimitRetryAt(res.headers);
        const key = String(formData.prescriberNumber || "");
        attemptsRef.current[key] = { ...(attemptsRef.current[key] || {}), lockUntil: retryAt };
        saveAttempts(attemptsRef.current);
        setLockoutUntil(retryAt);
      } else {
        // Increment failed attempt for this prescriber only
        const key = String(formData.prescriberNumber || "");
        const prev = attemptsRef.current[key] || { attempts: 0, lockUntil: null };
        const updated = { ...prev, attempts: (prev.attempts || 0) + 1 };
        if (updated.attempts >= MAX_ATTEMPTS) {
          updated.lockUntil = Date.now() + AUTH_LOCKOUT_WINDOW_MS;
          setLockoutUntil(updated.lockUntil);
        }
        attemptsRef.current[key] = updated;
        saveAttempts(attemptsRef.current);

        setApiError(data.message || data.extraDetail || "Doctor not found with provided credentials.");
      }
    } catch {
      setApiError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = () => {
    const payload = pendingPayload.current;
    if (!payload) return;
    localStorage.setItem("sendBirdUserId",   payload.data._id);
    localStorage.setItem("sendBirdUserName", `${payload.data.name} ${payload.data.surname}`);
    localStorage.setItem("userRole",         "doctor");
    localStorage.setItem("isDoctorLoggedIn", "true");
    localStorage.setItem("doctorId",         payload.data._id);
    storeDataInLS(payload);
    navigate("/doctor");
  };

  return (
    <div className="dadh-tw-root flex flex-col min-h-screen bg-background">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-6 h-16 border-b border-border bg-white shadow-sm shrink-0">
        <img src={logoDark} alt="DADH logo" className="h-9 w-auto" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-wide" style={{ color: "#111E1F" }}>DIAL A HOME DOCTOR</span>
          <span className="text-xs text-muted-foreground">Doctor Portal</span>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
            Available 24 / 7
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <div
          className="hidden md:flex md:w-[46%] flex-col items-center justify-center p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #053F42 0%, #0D7377 55%, #14B8A6 100%)" }}
        >
          <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

          <div style={{ position: "relative", marginBottom: 32, animation: "dadh-float 3.5s ease-in-out infinite" }}>
            <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", animation: "dadh-pulse-ring 2s ease-out infinite" }} />
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
              👨‍⚕️
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 32, animation: "dadh-fade-up 0.7s ease both" }}>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 26, margin: "0 0 8px", lineHeight: 1.25 }}>Your Patients Need You</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 280 }}>
              Australia's trusted after-hours home visiting medical service — secure, fast, and always available.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
            {[
              { icon: "✅", label: "Verified Portal",    sub: "Secure doctor access" },
              { icon: "🔐", label: "SMS 2FA",            sub: "Two-factor authentication" },
              { icon: "🕐", label: "Real-time Queue",    sub: "Live patient updates" },
              { icon: "🤖", label: "AI Medical Scribe",  sub: "Auto-generated notes" },
            ].map((card, i) => (
              <div key={card.label} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(4px)", animation: `dadh-fade-up ${0.5 + i * 0.15}s ease both` }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{card.icon}</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{card.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50">
          <div className="w-full max-w-sm dadh-fade-up-3">
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2ECF0", padding: "40px 36px", boxShadow: "0 4px 24px rgba(13,115,119,0.08)" }}>

              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#F0FDFA", border: "1px solid #D1E8E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>
                  👨‍⚕️
                </div>
                <h1 style={{ fontWeight: 800, fontSize: 22, color: "#111E1F", margin: "0 0 6px" }}>Doctor Sign In</h1>
                <p style={{ fontSize: 13, color: "#4B7172", margin: 0 }}>Enter your credentials to access the portal</p>
              </div>

              {displayError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#B91C1C", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  ⚠️ {displayError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={fieldLabel}>Prescriber Number</label>
                  <input
                    name="prescriberNumber" type="text" inputMode="numeric" maxLength={3}
                    value={formData.prescriberNumber} onChange={handleChange} placeholder="e.g. 123"
                    style={fieldInput(!!errors.prescriberNumber)}
                  />
                  {errors.prescriberNumber
                    ? <p style={fieldErr}>{errors.prescriberNumber}</p>
                    : <p style={fieldHint}>3-digit AHPRA registration number</p>}
                </div>

                <div>
                  <label style={fieldLabel}>Phone Number</label>
                  <input
                    name="doctorPhone" type="text" inputMode="numeric" maxLength={15}
                    value={formData.doctorPhone} onChange={handleChange} placeholder="e.g. 0412345678"
                    style={fieldInput(!!errors.doctorPhone)}
                  />
                  {errors.doctorPhone
                    ? <p style={fieldErr}>{errors.doctorPhone}</p>
                    : <p style={fieldHint}>Mobile number registered with DADH</p>}
                </div>

                <button
                  type="submit" disabled={submitDisabled}
                  style={{ width: "100%", padding: "12px", background: submitDisabled ? "#4B7172" : "#0D7377", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: submitDisabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s", marginTop: 4 }}
                  onMouseEnter={e => { if (!submitDisabled) e.currentTarget.style.background = "#0a5f62" }}
                  onMouseLeave={e => { if (!submitDisabled) e.currentTarget.style.background = "#0D7377" }}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: "dadh-spin-slow 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <path d="M14 8a6 6 0 01-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Verifying...
                    </>
                  ) : isLockedOut ? `Try again in ${formatLockoutCountdown(lockoutRemainingMs)}` : "Sign in"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#4B7172", marginBottom: 0 }}>
                Having trouble?{" "}
                <a href="mailto:admin@dialahomee.com.au" style={{ color: "#0D7377", fontWeight: 700, textDecoration: "none" }}>
                  Contact DADH admin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "14px 24px", borderTop: "1px solid #D1E8E8", fontSize: 12, color: "#4B7172", background: "#fff", flexShrink: 0 }}>
        © {new Date().getFullYear()} Dial A Home Doctor · After-Hours Telehealth · Australia
      </footer>

      {/* OTP Modal */}
      {showOtp && <OtpModal onVerify={handleOtpVerified} onClose={() => setShowOtp(false)} />}
    </div>
  );
};

const fieldLabel = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 };
const fieldInput = (hasError) => ({
  width: "100%", padding: "10px 13px",
  border: `1.5px solid ${hasError ? "#EF4444" : "#D1E8E8"}`,
  borderRadius: 8, fontSize: 14, color: "#111E1F", outline: "none",
  background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s",
});
const fieldErr  = { fontSize: 12, color: "#EF4444", margin: "5px 0 0" };
const fieldHint = { fontSize: 11, color: "#4B7172", margin: "5px 0 0" };

export default DoctorLogin;
