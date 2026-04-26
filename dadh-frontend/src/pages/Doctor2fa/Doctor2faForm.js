import React, { useState, useEffect } from "react";
import "./OTPVerification.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../store/auth/firebase"; // make sure this is correctly exporting auth
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

const Doctor2faForm = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    const confirmationResult = window.confirmationResult;

    // if (!confirmationResult) {
    //   alert("OTP session expired. Please resend OTP.");
    //   return;
    // }

    try {
      // await confirmationResult.confirm(o tpCode); 
      // alert("Phone verified successfully!");
      navigate("/doctor");
    } catch (error) {
      console.error("OTP verification failed", error);
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    const phone = "+92" + localStorage.getItem("doctorPhone");

    try {
      setCanResend(false);
      setTimer(30);

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA solved", response);
            },
          },
          auth
        );
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      alert("OTP resent successfully!");
    } catch (err) {
      console.error("Error resending OTP:", err);
      alert("Failed to resend OTP. Try again.");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Enter the Verification Code</h2>
        <p>We have sent a code to your registered phone number.</p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e)}
            />
          ))}
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button className="verify-btn" onClick={handleSubmit}>
          Verify
        </button>

        <p className="resend">
          Didn’t receive a code?
          {canResend ? (
            <span
              onClick={handleResendOTP}
              style={{ color: "blue", cursor: "pointer" }}
            >
              {" "}
              Resend OTP
            </span>
          ) : (
            <span style={{ color: "gray" }}> Resend in {timer}s</span>
          )}
        </p>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default Doctor2faForm;
