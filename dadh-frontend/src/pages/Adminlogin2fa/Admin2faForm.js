import React, { useState } from "react";
import "./OTPVerification.css";

const Admin2faForm = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  

  const handleChange = (index, event) => {
    let value = event.target.value;
    if (isNaN(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input automatically
    if (value !== "" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleSubmit = () => {
    alert(`Entered OTP: ${otp.join("")}`);
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

        <button className="verify-btn" onClick={handleSubmit}>Verify</button>

        <p className="resend">
          Didn't receive a code? <span>Resend OTP</span>
        </p>
      </div>
    </div>
  );
};

export default  Admin2faForm;
