import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "store/auth";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../../store/auth/firebase";
import logoDark from "../../assets/images/logo-dark.png";

/* ── inline keyframes so we don't need a separate CSS file ── */
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
  .dadh-float-slow   { animation: dadh-float-slow 4.5s ease-in-out infinite; }
  .dadh-float-card1  { animation: dadh-float      4s   ease-in-out infinite; }
  .dadh-float-card2  { animation: dadh-float-slow 5s   ease-in-out 0.8s infinite; }
  .dadh-float-card3  { animation: dadh-float      3.8s ease-in-out 1.4s infinite; }
  .dadh-pulse-ring   { animation: dadh-pulse-ring 2.2s ease-out infinite; }
  .dadh-fade-up-1    { animation: dadh-fade-up    0.5s ease-out 0.1s both; }
  .dadh-fade-up-2    { animation: dadh-fade-up    0.5s ease-out 0.25s both; }
  .dadh-fade-up-3    { animation: dadh-fade-up    0.5s ease-out 0.4s both; }
  .dadh-fade-up-4    { animation: dadh-fade-up    0.5s ease-out 0.55s both; }
  .dadh-spin-slow    { animation: dadh-spin-slow 18s linear infinite; }
`;

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { storeDataInLS } = useAuth();

  const [formData, setFormData] = useState({ prescriberNumber: "", doctorPhone: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login | Doctor Portal";
    const isLoggedIn = localStorage.getItem("isDoctorLoggedIn");
    const userRole = localStorage.getItem("userRole");
    if (isLoggedIn === "true" && userRole === "doctor") navigate("/doctor");
  }, [navigate]);

  useEffect(() => {
    const auth = getAuth(app);
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
      window.recaptchaVerifier.render().then((id) => { window.recaptchaWidgetId = id; });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value.replace(/\D/g, "") }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const errs = {};
    if (!/^\d{3}$/.test(formData.prescriberNumber)) errs.prescriberNumber = "Must be exactly 3 digits.";
    if (!/^\d{10,}$/.test(formData.doctorPhone))    errs.doctorPhone = "Must be at least 10 digits.";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const sendOTP = async (phone) => {
    try {
      const auth = getAuth(app);
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = result;
      navigate("/doctor-2fa");
    } catch (err) {
      console.error("OTP Error:", err);
      setApiError("Failed to send OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
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
        const payload = { token: data.token, role: "doctor", data: data.data };
        localStorage.setItem("sendBirdUserId", payload.data._id);
        localStorage.setItem("sendBirdUserName", `${payload.data.name} ${payload.data.surname}`);
        storeDataInLS(payload);
        localStorage.setItem("userRole", "doctor");
        localStorage.setItem("isDoctorLoggedIn", "true");
        localStorage.setItem("doctorId", payload.data._id);
        navigate("/doctor-2fa");
        await sendOTP(`+92${formData.doctorPhone}`);
      } else {
        setApiError(data.message || data.extraDetail || "Doctor not found or account disabled.");
      }
    } catch {
      setApiError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          {/* Decorative background circles */}
          <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

          {/* Hero icon with pulse ring */}
          <div style={{ position: "relative", marginBottom: 32, animation: "dadh-float 3.5s ease-in-out infinite" }}>
            <div
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.35)",
                animation: "dadh-pulse-ring 2s ease-out infinite",
              }}
            />
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
              }}
            >
              👨‍⚕️
            </div>
          </div>

          {/* Headline */}
          <div style={{ textAlign: "center", marginBottom: 32, animation: "dadh-fade-up 0.7s ease both" }}>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 26, margin: "0 0 8px", lineHeight: 1.25 }}>
              Your Patients Need You
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 280 }}>
              Australia's trusted after-hours home visiting medical service — secure, fast, and always available.
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
            {[
              { icon: "✅", label: "Verified Portal", sub: "Secure doctor access" },
              { icon: "🔐", label: "SMS 2FA", sub: "Two-factor authentication" },
              { icon: "🕐", label: "Real-time Queue", sub: "Live patient updates" },
              { icon: "🤖", label: "AI Medical Scribe", sub: "Auto-generated notes" },
            ].map((card, i) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backdropFilter: "blur(4px)",
                  animation: `dadh-fade-up ${0.5 + i * 0.15}s ease both`,
                }}
              >
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

            {/* Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #E2ECF0",
                padding: "40px 36px",
                boxShadow: "0 4px 24px rgba(13,115,119,0.08)",
              }}
            >
              {/* Avatar + heading */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#F0FDFA",
                    border: "1px solid #D1E8E8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    margin: "0 auto 14px",
                  }}
                >
                  👨‍⚕️
                </div>
                <h1 style={{ fontWeight: 800, fontSize: 22, color: "#111E1F", margin: "0 0 6px" }}>
                  Doctor Sign In
                </h1>
                <p style={{ fontSize: 13, color: "#4B7172", margin: 0 }}>
                  Enter your credentials to access the portal
                </p>
              </div>

              {/* API error */}
              {apiError && (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#B91C1C",
                    fontSize: 13,
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  ⚠️ {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Prescriber Number */}
                <div>
                  <label style={fieldLabel}>Prescriber Number</label>
                  <input
                    id="prescriberNumber"
                    name="prescriberNumber"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={formData.prescriberNumber}
                    onChange={handleChange}
                    placeholder="e.g. 123"
                    style={fieldInput(!!errors.prescriberNumber)}
                  />
                  {errors.prescriberNumber
                    ? <p style={fieldErr}>{errors.prescriberNumber}</p>
                    : <p style={fieldHint}>3-digit AHPRA registration number</p>
                  }
                </div>

                {/* Phone Number */}
                <div>
                  <label style={fieldLabel}>Phone Number</label>
                  <input
                    id="doctorPhone"
                    name="doctorPhone"
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={formData.doctorPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0412345678"
                    style={fieldInput(!!errors.doctorPhone)}
                  />
                  {errors.doctorPhone
                    ? <p style={fieldErr}>{errors.doctorPhone}</p>
                    : <p style={fieldHint}>Mobile number registered with DADH</p>
                  }
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: loading ? "#4B7172" : "#0D7377",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.2s",
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#0a5f62"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#0D7377"; }}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: "dadh-spin-slow 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <path d="M14 8a6 6 0 01-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Verifying...
                    </>
                  ) : "Sign In →"}
                </button>
              </form>

              {/* Contact link */}
              <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#4B7172", marginBottom: 0 }}>
                Having trouble?{" "}
                <a
                  href="mailto:admin@dialahomee.com.au"
                  style={{ color: "#0D7377", fontWeight: 700, textDecoration: "none" }}
                >
                  Contact DADH admin
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "14px 24px",
          borderTop: "1px solid #D1E8E8",
          fontSize: 12,
          color: "#4B7172",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        © {new Date().getFullYear()} Dial A Home Doctor · After-Hours Telehealth · Australia
      </footer>

      <div id="recaptcha-container" />
    </div>
  );
};

const fieldLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const fieldInput = (hasError) => ({
  width: "100%",
  padding: "10px 13px",
  border: `1.5px solid ${hasError ? "#EF4444" : "#D1E8E8"}`,
  borderRadius: 8,
  fontSize: 14,
  color: "#111E1F",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
});

const fieldErr  = { fontSize: 12, color: "#EF4444", margin: "5px 0 0" };
const fieldHint = { fontSize: 11, color: "#4B7172", margin: "5px 0 0" };

export default DoctorLogin;
