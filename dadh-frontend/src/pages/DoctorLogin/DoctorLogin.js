import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "store/auth";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../../store/auth/firebase";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { storeDataInLS } = useAuth();

  const [formData, setFormData] = useState({
    prescriberNumber: "",
    doctorPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login | Doctor Portal";
    const isLoggedIn = localStorage.getItem("isDoctorLoggedIn");
    const userRole = localStorage.getItem("userRole");
    if (isLoggedIn === "true" && userRole === "doctor") {
      navigate("/doctor");
    }
  }, [navigate]);

  useEffect(() => {
    const auth = getAuth(app);
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.replace(/\D/g, ""),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/^\d{3}$/.test(formData.prescriberNumber)) {
      newErrors.prescriberNumber = "Prescriber Number must be 3 digits.";
    }
    if (!/^\d{10,}$/.test(formData.doctorPhone)) {
      newErrors.doctorPhone = "Phone must be exactly 10 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOTP = async (phone) => {
    try {
      const auth = getAuth(app);
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      navigate("/doctor-2fa");
    } catch (error) {
      console.error("OTP Error:", error);
      setApiError("Failed to send OTP. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";
      const response = await fetch(`${backendUrl}/doctor/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          prescriberNumber: Number(formData.prescriberNumber),
        }),
      });

      const res_data = await response.json();

      if (response.ok && res_data.state === true) {
        const data = {
          token: res_data?.token,
          role: "doctor",
          data: res_data?.data,
        };

        localStorage.setItem("sendBirdUserId", data.data._id);
        localStorage.setItem("sendBirdUserName", `${data.data.name} ${data.data.surname}`);
        storeDataInLS(data);
        localStorage.setItem("userRole", "doctor");
        localStorage.setItem("isDoctorLoggedIn", "true");
        localStorage.setItem("doctorId", data.data._id);

        navigate("/doctor-2fa");
        await sendOTP(`+92${formData.doctorPhone}`);
      } else {
        setApiError(
          res_data.message ||
          res_data.extraDetail ||
          "Doctor not found or disabled. Please contact admin."
        );
      }
    } catch (err) {
      console.error("API Error:", err);
      setApiError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dadh-tw-root min-h-screen bg-background flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-primary flex-col items-center justify-center p-10 text-primary-foreground">
        <div className="max-w-sm space-y-6 text-center">
          <div className="text-4xl font-bold leading-tight">
            DIAL A HOME<br />DOCTOR
          </div>
          <p className="text-lg text-primary-foreground/80">
            Australia&rsquo;s after-hours home visiting medical service.
          </p>
          <div className="space-y-3 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-3">
              <span className="text-success text-base">&#10003;</span>
              <span>Secure doctor portal access</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-success text-base">&#10003;</span>
              <span>Two-factor SMS authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-success text-base">&#10003;</span>
              <span>Real-time patient visit management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile-only logo */}
          <div className="md:hidden text-center">
            <div className="text-2xl font-bold text-primary">DIAL A HOME DOCTOR</div>
            <p className="text-sm text-muted-foreground mt-1">Doctor Portal</p>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground">Doctor sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your prescriber number and registered phone to continue.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              {apiError && (
                <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Prescriber Number"
                  htmlFor="prescriberNumber"
                  error={errors.prescriberNumber}
                  helper="3-digit number from AHPRA registration"
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
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  htmlFor="doctorPhone"
                  error={errors.doctorPhone}
                  helper="10-digit mobile number registered with DADH"
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
                  />
                </FormField>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Having trouble?{" "}
            <a href="mailto:admin@dialahomee.com.au" className="text-primary hover:underline">
              Contact DADH admin
            </a>
          </p>
        </div>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
};

export default DoctorLogin;
