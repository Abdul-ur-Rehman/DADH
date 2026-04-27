import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "store/auth";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../../store/auth/firebase";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

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
          <span className="text-sm font-bold text-primary tracking-wide">DIAL A HOME DOCTOR</span>
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
          className="hidden md:flex md:w-[52%] flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(140deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)" }}
        >
          {/* Decorative spinning ring */}
          <div className="absolute top-8 right-8 dadh-spin-slow opacity-10">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="2" strokeDasharray="12 8"/>
            </svg>
          </div>
          <div className="absolute bottom-16 left-6 dadh-spin-slow opacity-10" style={{animationDirection:"reverse"}}>
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              <circle cx="70" cy="70" r="60" stroke="white" strokeWidth="2" strokeDasharray="8 6"/>
            </svg>
          </div>

          {/* Brand */}
          <div className="relative z-10 dadh-fade-up-1">
            <div className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              DIAL A HOME<br />DOCTOR
            </div>
            <p className="mt-3 text-blue-100 text-base leading-relaxed max-w-xs">
              Australia&rsquo;s trusted after-hours home visiting medical service.
            </p>
          </div>

          {/* Animated illustration */}
          <div className="relative z-10 flex justify-center my-4">
            {/* Pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="dadh-pulse-ring h-44 w-44 rounded-full border-2 border-white/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{animationDelay:"1.1s"}}>
              <div className="dadh-pulse-ring h-36 w-36 rounded-full border-2 border-white/20" />
            </div>

            {/* Central doctor icon */}
            <div className="dadh-float relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/30 shadow-2xl">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Doctor figure */}
                <circle cx="32" cy="16" r="10" fill="white" opacity="0.9"/>
                <path d="M14 52 C14 38 50 38 50 52" fill="white" opacity="0.9"/>
                {/* Stethoscope */}
                <path d="M24 30 Q20 36 22 42 Q24 48 30 48 Q36 48 38 42 Q40 36 36 30" stroke="white" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
                <circle cx="30" cy="49" r="3" fill="white" opacity="0.7"/>
              </svg>
            </div>

            {/* Floating mini-cards */}
            <div className="dadh-float-card1 absolute -left-4 top-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-lg">
              <div className="h-7 w-7 rounded-lg bg-success/15 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Verified Portal</p>
                <p className="text-[10px] text-gray-400">Secure access</p>
              </div>
            </div>

            <div className="dadh-float-card2 absolute -right-6 top-0 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-lg">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#1E40AF" strokeWidth="1.5"/>
                  <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">SMS 2FA</p>
                <p className="text-[10px] text-gray-400">Always protected</p>
              </div>
            </div>

            <div className="dadh-float-card3 absolute -bottom-4 left-0 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-lg">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="#2563EB" strokeWidth="1.5"/>
                  <path d="M7 4.5V7l1.5 1.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Real-time Queue</p>
                <p className="text-[10px] text-gray-400">Live patient updates</p>
              </div>
            </div>
          </div>

          {/* Feature bullets */}
          <div className="relative z-10 space-y-3 dadh-fade-up-2">
            {[
              "Secure, encrypted doctor portal",
              "Two-factor SMS authentication",
              "Real-time patient visit management",
              "AI-assisted medical scribing",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm text-blue-50">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-gray-50">
          {/* Mobile logo */}
          <div className="md:hidden mb-8 text-center">
            <img src={logoLight} alt="DADH logo" className="h-10 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Doctor Portal</p>
          </div>

          <div className="w-full max-w-sm dadh-fade-up-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Doctor sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your credentials to access the portal.
              </p>
            </div>

            {apiError && (
              <div className="mb-5 flex items-start gap-3 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
                <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#DC2626" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-border p-7 dadh-fade-up-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  label="Prescriber Number"
                  htmlFor="prescriberNumber"
                  error={errors.prescriberNumber}
                  helper="3-digit AHPRA registration number"
                >
                  <Input
                    id="prescriberNumber"
                    name="prescriberNumber"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={formData.prescriberNumber}
                    onChange={handleChange}
                    placeholder="e.g. 123"
                    className="mt-1.5 bg-gray-50 focus:bg-white transition-colors"
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  htmlFor="doctorPhone"
                  error={errors.doctorPhone}
                  helper="Mobile number registered with DADH"
                >
                  <Input
                    id="doctorPhone"
                    name="doctorPhone"
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={formData.doctorPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0412345678"
                    className="mt-1.5 bg-gray-50 focus:bg-white transition-colors"
                  />
                </FormField>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Verifying…
                    </span>
                  ) : "Sign in"}
                </Button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Having trouble?{" "}
              <a href="mailto:admin@dialahomee.com.au" className="text-primary hover:underline font-medium">
                Contact DADH admin
              </a>
            </p>
          </div>
        </div>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
};

export default DoctorLogin;
