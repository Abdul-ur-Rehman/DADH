import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoDark from "../../assets/images/logo-dark.png";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";

const STYLES = `
  @keyframes pr-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const T = {
  teal:      "#0D7377",
  tealDark:  "#0A5F62",
  tealLight: "#F0FDFA",
  border:    "#D1E8E8",
  fg:        "#111E1F",
  muted:     "#4B7172",
  white:     "#ffffff",
  error:     "#EF4444",
};

const inputBase = {
  width: "100%",
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  color: T.fg,
  outline: "none",
  fontFamily: "Inter, system-ui, sans-serif",
  background: T.white,
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: T.error }}>{error}</p>}
    </div>
  );
}

const GENDER_OPTIONS = [
  { value: "male",       label: "Male" },
  { value: "female",     label: "Female" },
  { value: "disclosed",  label: "Prefer not to say" },
];

export default function PatientRegister() {
  const navigate = useNavigate();
  const pendingPatient = (() => {
    try { return JSON.parse(localStorage.getItem("pendingPatient")) || {} }
    catch { return {} }
  })();

  localStorage.setItem("isNewPatient", "true");

  const [patient, setPatient] = useState({
    name:           "",
    email:          "",
    phone:          pendingPatient.phone || "",
    gender:         "",
    DOB:            "",
    medicareNumber: String(pendingPatient.medicareNumber || ""),
    address:        "",
    city:           "",
    state:          "",
    zipCode:        "",
  });

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const set = (field) => (value) => {
    setApiError("");
    setErrors((e) => ({ ...e, [field]: "" }));
    setPatient((p) => ({ ...p, [field]: value }));
  };

  const validate = () => {
    const e = {};
    if (!patient.name.trim())   e.name = "Name is required";
    if (!patient.email.trim())  e.email = "Email is required";
    if (!/^\d{10,}$/.test(patient.phone)) e.phone = "Must be at least 10 digits";
    if (!patient.gender)        e.gender = "Please select a gender";
    if (!patient.DOB)           e.DOB = "Date of birth is required";
    if (!/^\d{10}$/.test(patient.medicareNumber))
      e.medicareNumber = "Must be exactly 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/patient/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient),
      });
      const data = await res.json();
      if (res.ok && data.state !== false) {
        localStorage.setItem("patientData", JSON.stringify(data));
        navigate("/patient/login");
      } else {
        setApiError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setApiError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dadh-tw-root" style={{ minHeight: "100vh", display: "flex", background: "#FAFFFE" }}>
      <style>{STYLES}</style>

      {/* ── Left hero panel ── */}
      <div style={{
        width: "38%",
        background: `linear-gradient(160deg, ${T.tealDark} 0%, ${T.teal} 60%, #14B8A6 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 36px",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}>
        <img src={logoDark} alt="DADH" style={{ height: 52, marginBottom: 32, filter: "brightness(0) invert(1)" }} />
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 10px", textAlign: "center", lineHeight: 1.3 }}>
          Join DADH Today
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 36px", textAlign: "center", lineHeight: 1.6 }}>
          Quality healthcare from the comfort of your home.
        </p>
        {[
          { icon: "🩺", label: "Book consultations anytime" },
          { icon: "💊", label: "Digital prescriptions" },
          { icon: "📋", label: "Medical certificates" },
          { icon: "🔒", label: "Secure & private" },
        ].map((f) => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, alignSelf: "stretch" }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
              {f.icon}
            </div>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560, animation: "pr-fade-up 0.4s ease-out both" }}>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.fg, margin: "0 0 4px" }}>Create Account</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: "0 0 28px" }}>
            Already registered?{" "}
            <Link to="/patient/login" style={{ color: T.teal, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>

          {apiError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#991B1B" }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" }}>

              <Field label="Full Name" error={errors.name}>
                <input
                  style={{ ...inputBase, borderColor: errors.name ? T.error : T.border }}
                  value={patient.name}
                  onChange={(e) => set("name")(e.target.value)}
                  placeholder="Full name"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.name ? T.error : T.border)}
                />
              </Field>

              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  style={{ ...inputBase, borderColor: errors.email ? T.error : T.border }}
                  value={patient.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="you@example.com"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? T.error : T.border)}
                />
              </Field>

              <Field label="Phone Number" error={errors.phone}>
                <input
                  type="tel"
                  style={{ ...inputBase, borderColor: errors.phone ? T.error : T.border }}
                  value={patient.phone}
                  onChange={(e) => set("phone")(e.target.value.replace(/\D/g, ""))}
                  placeholder="04XXXXXXXX"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.phone ? T.error : T.border)}
                />
              </Field>

              <Field label="Gender" error={errors.gender}>
                <select
                  style={{ ...inputBase, borderColor: errors.gender ? T.error : T.border }}
                  value={patient.gender}
                  onChange={(e) => set("gender")(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.gender ? T.error : T.border)}
                >
                  <option value="">Select gender…</option>
                  {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Date of Birth" error={errors.DOB}>
                <input
                  type="date"
                  style={{ ...inputBase, borderColor: errors.DOB ? T.error : T.border }}
                  value={patient.DOB}
                  onChange={(e) => set("DOB")(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.DOB ? T.error : T.border)}
                />
              </Field>

              <Field label="Medicare Number" error={errors.medicareNumber}>
                <input
                  type="text"
                  inputMode="numeric"
                  style={{ ...inputBase, borderColor: errors.medicareNumber ? T.error : T.border }}
                  value={patient.medicareNumber}
                  onChange={(e) => set("medicareNumber")(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 digits"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.medicareNumber ? T.error : T.border)}
                />
              </Field>

              <div style={{ gridColumn: "span 2" }}>
                <Field label="Street Address">
                  <input
                    style={inputBase}
                    value={patient.address}
                    onChange={(e) => set("address")(e.target.value)}
                    placeholder="123 Main Street"
                    onFocus={(e) => (e.target.style.borderColor = T.teal)}
                    onBlur={(e) => (e.target.style.borderColor = T.border)}
                  />
                </Field>
              </div>

              <Field label="City">
                <input
                  style={inputBase}
                  value={patient.city}
                  onChange={(e) => set("city")(e.target.value)}
                  placeholder="City"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = T.border)}
                />
              </Field>

              <Field label="State">
                <input
                  style={inputBase}
                  value={patient.state}
                  onChange={(e) => set("state")(e.target.value)}
                  placeholder="State"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = T.border)}
                />
              </Field>

              <Field label="Postcode">
                <input
                  style={inputBase}
                  value={patient.zipCode}
                  onChange={(e) => set("zipCode")(e.target.value)}
                  placeholder="Postcode"
                  onFocus={(e) => (e.target.style.borderColor = T.teal)}
                  onBlur={(e) => (e.target.style.borderColor = T.border)}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 28,
                width: "100%",
                padding: "13px",
                background: loading ? T.muted : T.teal,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = T.tealDark }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = T.teal }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 20, lineHeight: 1.6 }}>
            By registering you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
