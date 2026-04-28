import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoDark from "../../assets/images/logo-dark.png";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";

const T = {
  teal:      "#0D7377",
  tealDark:  "#0A5F62",
  tealLight: "#F0FDFA",
  border:    "#D1E8E8",
  fg:        "#111E1F",
  muted:     "#4B7172",
  mutedBg:   "#E6F4F4",
  white:     "#ffffff",
  error:     "#EF4444",
  success:   "#22C55E",
};

const STYLES = `
  @keyframes s2-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes s2-spin {
    to { transform: rotate(360deg); }
  }
`;

const TELEHEALTH_OPTIONS = [
  { value: "videoCall",  label: "Video Call",  icon: "📹", desc: "Face-to-face consultation" },
  { value: "phoneCall",  label: "Phone Call",  icon: "📞", desc: "Audio-only consultation" },
  { value: "textChat",   label: "Text Chat",   icon: "💬", desc: "Chat with your doctor" },
];

function TelehealthOption({ option, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${selected ? T.teal : hovered ? T.teal : T.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        background: selected ? T.tealLight : hovered ? "#F8FFFE" : T.white,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flex: 1,
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{option.icon}</span>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: selected ? T.teal : T.fg }}>{option.label}</p>
        <p style={{ margin: 0, fontSize: 11, color: T.muted }}>{option.desc}</p>
      </div>
    </div>
  );
}

export default function PatientStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory } = location.state || {};

  const [description, setDescription]       = useState("");
  const [teleHealthOption, setTeleHealthOption] = useState("videoCall");
  const [error, setError]                   = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [success, setSuccess]               = useState(false);

  const getPatientId = () => {
    try {
      return (
        JSON.parse(localStorage.getItem("patientData"))?.data?._id ||
        JSON.parse(localStorage.getItem("data"))?.data?._id ||
        ""
      );
    } catch { return ""; }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) { setError("No category selected. Please go back."); return; }
    if (!description.trim()) { setError("Please describe your symptoms or reason for consultation."); return; }

    const patientId = getPatientId();

    if (!patientId) {
      localStorage.setItem("CategoryDescription", description);
      localStorage.setItem("teleHealthOptions", teleHealthOption);
      navigate("/patient/login", { state: { description, teleHealthOption } });
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/consultations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationCategory: selectedCategory,
          notes: description,
          type: teleHealthOption,
          patientId,
          doctorId: "",
        }),
      });
      const data = await res.json();

      if (res.ok && data.state !== false) {
        localStorage.setItem("consultationId", data?.data?._id);
        setSuccess(true);
        setTimeout(() => navigate("/patient"), 1800);
      } else {
        setError(data?.message || "Failed to submit consultation. Please try again.");
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="dadh-tw-root"
      style={{ minHeight: "100vh", background: "#F8FFFE", padding: "32px 16px" }}
    >
      <style>{STYLES}</style>

      <div style={{ maxWidth: 600, margin: "0 auto", animation: "s2-fade-up 0.4s ease-out both" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={logoDark} alt="DADH" style={{ height: 40, marginBottom: 20 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.fg, margin: "0 0 6px" }}>
            Tell Us More
          </h1>
          <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
            Help your doctor prepare for your consultation.
          </p>
        </div>

        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px", boxShadow: "0 2px 12px rgba(13,115,119,0.07)" }}>

          {/* Category badge */}
          {selectedCategory && (
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10, background: T.tealLight, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px" }}>
              <span style={{ fontSize: 16 }}>🏷️</span>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Selected Category</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.teal }}>{selectedCategory}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Describe Your Symptoms *
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
              placeholder="Describe your condition, symptoms, how long you've had them, and anything else your doctor should know…"
              rows={5}
              style={{
                width: "100%",
                border: `1.5px solid ${error && !description.trim() ? T.error : T.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: T.fg,
                fontFamily: "Inter, system-ui, sans-serif",
                resize: "vertical",
                outline: "none",
                lineHeight: 1.6,
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = T.teal)}
              onBlur={(e) => (e.target.style.borderColor = T.border)}
            />
            <p style={{ margin: "5px 0 0", fontSize: 12, color: T.muted }}>
              Be as specific as possible to help your doctor.
            </p>
          </div>

          {/* Consultation type */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Preferred Consultation Type
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {TELEHEALTH_OPTIONS.map((opt) => (
                <TelehealthOption
                  key={opt.value}
                  option={opt}
                  selected={teleHealthOption === opt.value}
                  onClick={() => setTeleHealthOption(opt.value)}
                />
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: T.muted, fontStyle: "italic" }}>
              Note: the doctor may recommend a different mode based on your symptoms.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#991B1B" }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
              <span>✓</span> Consultation booked! Redirecting to your dashboard…
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            style={{
              width: "100%",
              padding: "14px",
              background: success ? T.success : submitting ? T.muted : T.teal,
              color: T.white,
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting || success ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!submitting && !success) e.target.style.background = T.tealDark; }}
            onMouseLeave={(e) => { if (!submitting && !success) e.target.style.background = T.teal; }}
          >
            {submitting ? (
              <>
                <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "s2-spin 0.7s linear infinite", display: "inline-block" }} />
                Submitting…
              </>
            ) : success ? "✓ Booked!" : "Book Consultation"}
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}
