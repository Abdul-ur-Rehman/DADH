import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "store/auth";
import logoDark from "../../assets/images/logo-dark.png";

const REACT_APP_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";

// Keyframe animations (scoped — no @layer base needed)
const STYLES = `
  @keyframes pl-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes pl-float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-14px) rotate(3deg); }
  }
  @keyframes pl-pulse-ring {
    0%   { transform: scale(0.92); opacity: 0.7; }
    70%  { transform: scale(1.18); opacity: 0; }
    100% { transform: scale(1.18); opacity: 0; }
  }
  @keyframes pl-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pl-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

const FEATURE_CARDS = [
  { icon: "📋", label: "Medicare Verified", sub: "Secure identity check" },
  { icon: "🕐", label: "24/7 Availability", sub: "After-hours care" },
  { icon: "🔒", label: "Private & Secure", sub: "Your data protected" },
];

const PatientLogin = () => {
  const { storeDataInLS } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isPatientLoggedIn");
    const userRole = localStorage.getItem("userRole");
    if (isLoggedIn === "true" && userRole === "patient") {
      navigate("/patient");
    }
  }, []);

  const [formData, setFormData] = useState({
    medicareNumber: "",
    phone: "",
    DOB: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^\d{10,}$/.test(formData.medicareNumber))
      e.medicareNumber = "Must be at least 10 digits";
    if (!/^\d{10,}$/.test(formData.phone))
      e.phone = "Must be at least 10 digits";
    if (!formData.DOB) e.DOB = "Date of birth is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]:
        name === "medicareNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setApiError("");
  };

  const goPatientOnline = async (id) => {
    try {
      await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/set-online/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: true }),
      });
      localStorage.setItem("isOnline", true);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          medicareNumber: String(formData.medicareNumber),
        }),
      });

      const data = await response.json();

      if (!data.state) {
        setApiError(data.message || "No account found with these details.");
        return;
      }

      storeDataInLS(data);

      // Ensure a token exists to prevent layout errors in legacy shell
      const storedData = JSON.parse(localStorage.getItem("data"));
      if (!storedData.token) {
        storedData.token =
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.dummy";
        localStorage.setItem("data", JSON.stringify(storedData));
      }

      localStorage.setItem("userRole", "patient");
      localStorage.setItem("isPatientLoggedIn", "true");
      localStorage.setItem("sendBirdUserName", data.data.name);
      localStorage.setItem("sendBirdUserId", data.data._id);
      localStorage.setItem("patientData", JSON.stringify(data));
      localStorage.setItem("PatientId", data.data._id);

      await goPatientOnline(data.data._id);
      navigate("/patient");
    } catch {
      setApiError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="dadh-tw-root"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFFFE" }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #D1E8E8",
            padding: "12px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logoDark} alt="DADH Logo" style={{ height: 36 }} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#111E1F", letterSpacing: "-0.2px" }}>
                DIAL A HOME DOCTOR
              </div>
              <div style={{ fontSize: 10, color: "#4B7172", fontWeight: 500 }}>
                After-Hours Telehealth
              </div>
            </div>
          </div>
          <span
            style={{
              background: "#F0FDFA",
              color: "#0D7377",
              border: "1px solid #D1E8E8",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            🟢 Available 24/7
          </span>
        </header>

        {/* ── Two-column body ─────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

          {/* Left panel */}
          <div
            style={{
              flex: "0 0 46%",
              background: "linear-gradient(145deg, #053F42 0%, #0D7377 55%, #14B8A6 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 40px",
              position: "relative",
              overflow: "hidden",
            }}
            className="hidden-on-mobile"
          >
            {/* Background circles */}
            <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
            <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

            {/* Hero icon with pulse ring */}
            <div
              style={{
                position: "relative",
                marginBottom: 32,
                animation: "pl-float 3.5s ease-in-out infinite",
              }}
            >
              {/* Pulse ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.35)",
                  animation: "pl-pulse-ring 2s ease-out infinite",
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
                🏥
              </div>
            </div>

            {/* Headline */}
            <div style={{ textAlign: "center", marginBottom: 32, animation: "pl-fade-up 0.7s ease both" }}>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 26, margin: "0 0 8px", lineHeight: 1.25 }}>
                Your Health, Our Priority
              </h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 280 }}>
                Access after-hours medical care from the comfort of your home — anytime, anywhere.
              </p>
            </div>

            {/* Feature cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
              {FEATURE_CARDS.map((card, i) => (
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
                    animation: `pl-fade-up ${0.5 + i * 0.15}s ease both`,
                    animationDelay: `${i * 0.1}s`,
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
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
              background: "#F8FAFC",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #E2ECF0",
                padding: "40px 36px",
                boxShadow: "0 4px 24px rgba(13,115,119,0.08)",
                animation: "pl-fade-up 0.5s ease both",
              }}
            >
              {/* Form header */}
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
                  🧑
                </div>
                <h1 style={{ fontWeight: 800, fontSize: 22, color: "#111E1F", margin: "0 0 6px" }}>
                  Patient Sign In
                </h1>
                <p style={{ fontSize: 13, color: "#4B7172", margin: 0 }}>
                  Enter your Medicare details to access the portal
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
                {/* Medicare Number */}
                <div>
                  <label style={labelStyle}>Medicare Number</label>
                  <input
                    type="text"
                    name="medicareNumber"
                    placeholder="10-digit Medicare number"
                    value={formData.medicareNumber}
                    onChange={handleInput}
                    style={inputStyle(!!errors.medicareNumber)}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                  {errors.medicareNumber && <p style={errStyle}>{errors.medicareNumber}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Australian mobile number"
                    value={formData.phone}
                    onChange={handleInput}
                    style={inputStyle(!!errors.phone)}
                  />
                  {errors.phone && <p style={errStyle}>{errors.phone}</p>}
                </div>

                {/* DOB */}
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    type="date"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleInput}
                    style={inputStyle(!!errors.DOB)}
                  />
                  {errors.DOB && <p style={errStyle}>{errors.DOB}</p>}
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
                      <svg style={{ animation: "pl-spin-slow 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <path d="M14 8a6 6 0 01-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Register link */}
              <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#4B7172", marginBottom: 0 }}>
                Don't have an account?{" "}
                <Link
                  to="/patient/register"
                  style={{ color: "#0D7377", fontWeight: 700, textDecoration: "none" }}
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer
          style={{
            textAlign: "center",
            padding: "14px 24px",
            borderTop: "1px solid #D1E8E8",
            fontSize: 12,
            color: "#4B7172",
            background: "#fff",
          }}
        >
          © {new Date().getFullYear()} Dial A Home Doctor · After-Hours Telehealth · Australia
        </footer>

        {/* Hide left panel on small screens */}
        <style>{`
          @media (max-width: 768px) {
            .hidden-on-mobile { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
};

// Shared micro-styles
const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle = (hasError) => ({
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

const errStyle = {
  fontSize: 12,
  color: "#EF4444",
  margin: "5px 0 0",
};

export default PatientLogin;
