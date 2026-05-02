import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber, getAuth } from "firebase/auth";
import logoDark from "../../assets/images/logo-dark.png";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";
const auth = getAuth();

const T = {
  teal:      "#0D7377",
  tealDark:  "#0A5F62",
  border:    "#D1E8E8",
  fg:        "#111E1F",
  muted:     "#4B7172",
  white:     "#ffffff",
  error:     "#EF4444",
};

const STYLES = `
  @keyframes otp-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes otp-spin {
    to { transform: rotate(360deg); }
  }
`;

export default function Patient2faForm() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const isConsulting = location.state?.isConsulting;

  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [error, setError]       = useState("");
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer]       = useState(30);
  const [canResend, setCanResend] = useState(false);

  const recaptchaRef = useRef(null);
  const inputRefs    = useRef([]);

  const patientId = (() => {
    try { return JSON.parse(localStorage.getItem("patientData"))?.data?._id || "" }
    catch { return "" }
  })();

  // ── Init invisible reCAPTCHA ─────────────────────────────────────────────
  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // ── OTP input handling ────────────────────────────────────────────────────
  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    setError("");
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Add consultation after OTP verification ───────────────────────────────
  const addConsultation = async () => {
    const selectedCategory = localStorage.getItem("selectedCategory");
    const notes            = localStorage.getItem("CategoryDescription");
    const type             = localStorage.getItem("teleHealthOptions");

    try {
      const res = await fetch(`${BASE_URL}/consultations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationCategory: selectedCategory, patientId, notes, type, doctorId: "" }),
      });
      const json = await res.json();
      if (res.ok) localStorage.setItem("ConsultationId", json?.data?._id);
    } catch {}
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter the complete 6-digit code."); return; }
    if (verifying) return;

    setVerifying(true);
    setError("");
    try {
      await window.confirmationResult.confirm(code);
      if (!patientId) { setError("Patient session not found. Please log in again."); return; }
      if (isConsulting) await addConsultation();
      localStorage.removeItem("selectedCategory");
      localStorage.removeItem("CategoryDescription");
      localStorage.removeItem("teleHealthOptions");
      navigate("/patient", { state: { patientId } });
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    const phone = "+61" + (localStorage.getItem("patientPhone") || "");
    try {
      setCanResend(false);
      setTimer(30);
      const result = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
      window.confirmationResult = result;
    } catch {
      setError("Failed to resend code. Please try again.");
      setCanResend(true);
    }
  };

  return (
    <div
      className="dadh-tw-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 50%, #14B8A6 100%)`,
        padding: "24px",
      }}
    >
      <style>{STYLES}</style>
      <div id="recaptcha-container" style={{ position: "absolute", left: "-9999px" }} />

      <div style={{
        background: T.white,
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        animation: "otp-fade-up 0.4s ease-out both",
        textAlign: "center",
      }}>
        <img src={logoDark} alt="DADH" style={{ height: 40, marginBottom: 24 }} />

        <div style={{ width: 56, height: 56, background: "#E6F4F4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>
          📱
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.fg, margin: "0 0 8px" }}>
          Verify Your Number
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 32px", lineHeight: 1.6 }}>
          Enter the 6-digit code sent to your registered phone number.
        </p>

        {/* OTP input boxes */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 48,
                height: 56,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                border: `2px solid ${digit ? T.teal : T.border}`,
                borderRadius: 10,
                color: T.fg,
                outline: "none",
                fontFamily: "inherit",
                background: digit ? "#F0FDFA" : T.white,
                transition: "border-color 0.15s, background 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = T.teal)}
              onBlur={(e) => (e.target.style.borderColor = digit ? T.teal : T.border)}
            />
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: T.error, marginBottom: 16, fontWeight: 500 }}>{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            width: "100%",
            padding: "13px",
            background: verifying ? T.muted : T.teal,
            color: T.white,
            border: "none",
            borderRadius: 9,
            fontSize: 15,
            fontWeight: 700,
            cursor: verifying ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {verifying ? (
            <>
              <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "otp-spin 0.7s linear infinite", display: "inline-block" }} />
              Verifying…
            </>
          ) : "Verify Code"}
        </button>

        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
          Didn't receive a code?{" "}
          {canResend ? (
            <button
              onClick={handleResend}
              style={{ background: "none", border: "none", color: T.teal, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}
            >
              Resend
            </button>
          ) : (
            <span style={{ color: "#94a3b8" }}>Resend in {timer}s</span>
          )}
        </p>
      </div>
    </div>
  );
}
