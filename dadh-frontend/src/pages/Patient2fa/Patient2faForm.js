import React, { useState, useEffect, useRef } from "react";
import "./OTPVerification.css";
import { useNavigate, useLocation } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber, getAuth } from "firebase/auth";

const auth = getAuth();

const Patient2faForm = () => {
  const location = useLocation();
  const isConsulting = location.state?.isConsulting;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    console.log("isConsulting prop value:", location.state);
  }, [isConsulting]);

  useEffect(() => {
    const storedData = localStorage.getItem("patientData");
    if (storedData) {
      const toJSON = JSON.parse(storedData);
      setPatientId(toJSON?.data?._id || "");
    }
  }, []);

  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved", response);
          },
        }
      );
    }
  }, []);

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
    let value = event.target.value;
    if (isNaN(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const addconsultation = async () => {
    const teleHealthOptions = localStorage.getItem("teleHealthOptions");
    const categoryDescription = localStorage.getItem("CategoryDescription");
    const selectedCategory = localStorage.getItem("selectedCategory");

    const consultBody = {
      consultationCategory: selectedCategory,
      patientId: patientId,
      notes: categoryDescription,
      type: teleHealthOptions,
      doctorId: "",
    };
    try {
      const addConsult = await fetch("http://localhost:5001/api/consultations/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultBody),
      });

      const consultResponse = await addConsult.json();

      if (addConsult.ok) {
        localStorage.setItem("ConsultationId", consultResponse?.data?._id);
        localStorage.setItem("patientId", patientId);
      } else {
        console.error("Consultation create failed", consultResponse.message);
      }
    } catch (error) {
      console.log("consultation error", error);
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(otpCode);
      console.log("OTP verified:", result.user);

      if (!patientId) {
        console.error("Patient ID is missing");
        return;
      }

      if (isConsulting) {
        await addconsultation();
      }

      navigate("/patient", { state: { patientId: patientId } });
    } catch (error) {
      console.error("OTP verification failed", error);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      localStorage.removeItem("selectedCategory");
      localStorage.removeItem("CategoryDescription");
      localStorage.removeItem("teleHealthOptions");
    }
  };

  const handleResendOTP = async () => {
    const phone = "+92" + localStorage.getItem("patientPhone");

    try {
      setCanResend(false);
      setTimer(30);

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaRef.current
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
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" style={{ position: "absolute", left: "-9999px" }} />

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

        {error && <p className="error-message">{error}</p>}

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
      </div>
    </div>
  );
};

export default Patient2faForm;



// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { RecaptchaVerifier, signInWithPhoneNumber, getAuth } from "firebase/auth";


// const auth = getAuth();

// const Patient2faForm = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const isConsulting = location.state?.isConsulting;
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [error, setError] = useState("");
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const [verifying, setVerifying] = useState(false);

//   const patientId = JSON.parse(localStorage.getItem("patientData"))?.data?._id;
//   const phone = localStorage.getItem("phoneForOtp");

//   useEffect(() => {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//         size: "invisible",
//         callback: () => console.log("Recaptcha resolved"),
//       });
//     }
//   }, []);

//   useEffect(() => {
//     if (timer > 0) {
//       const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(countdown);
//     } else setCanResend(true);
//   }, [timer]);

//   const handleChange = (index, event) => {
//     const value = event.target.value;
//     if (!isNaN(value)) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);
//       if (index < 5) document.getElementById(`otp-input-${index + 1}`).focus();
//     }
//   };

//   const handleSubmit = async () => {
//     if (verifying) return;
//     setVerifying(true);
//     const code = otp.join("");

//     if (code.length !== 6) {
//       setError("Please enter full 6-digit code");
//       setVerifying(false);
//       return;
//     }

//     try {
//       const result = await window.confirmationResult.confirm(code);
//       const firebaseToken = await result.user.getIdToken();

//       // ✅ Send Firebase token to backend for final verification
//       const res = await fetch("http://localhost:5001/api/patient/auth/verify-otp-token", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${firebaseToken}`,
//         },
//       });

//       const data = await res.json();
//       if (res.ok) {
//         localStorage.setItem("token", data.token);
//         if (isConsulting) await addConsultation();
//         navigate("/patient", { state: { patientId } });
//       } else {
//         throw new Error(data.message || "Backend verification failed");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Invalid or expired OTP");
//     } finally {
//       localStorage.removeItem("selectedCategory");
//       localStorage.removeItem("CategoryDescription");
//       localStorage.removeItem("teleHealthOptions");
//       setVerifying(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     setCanResend(false);
//     setTimer(30);

//     const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
//     window.confirmationResult = confirmationResult;
//     alert("OTP resent");
//   };

//   const addConsultation = async () => {
//     const selectedCategory = localStorage.getItem("selectedCategory");
//     const notes = localStorage.getItem("CategoryDescription");
//     const type = localStorage.getItem("teleHealthOptions");

//     const response = await fetch("http://localhost:5001/api/consultations/add", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ consultationCategory: selectedCategory, patientId, notes, type }),
//     });

//     const result = await response.json();
//     if (response.ok) {
//       localStorage.setItem("ConsultationId", result?.data?._id);
//     }
//   };

//   return (
//     <>
//       <div id="recaptcha-container" style={{ position: "absolute", left: "-9999px" }} />
//       <div className="otp-box">
//         <h2>Enter OTP Code</h2>
//         <div className="otp-inputs">
//           {otp.map((digit, i) => (
//             <input key={i} maxLength="1" id={`otp-input-${i}`} value={digit} onChange={(e) => handleChange(i, e)} />
//           ))}
//         </div>
//         {error && <p className="error-message">{error}</p>}
//         <button className="verify-btn" onClick={handleSubmit} disabled={verifying}>
//           {verifying ? "Verifying..." : "Verify"}
//         </button>
//         <p className="resend">
//           Didn’t get code?
//           {canResend ? (
//             <span onClick={handleResendOTP} style={{ color: "blue", cursor: "pointer" }}> Resend</span>
//           ) : (
//             <span style={{ color: "gray" }}> Resend in {timer}s</span>
//           )}
//         </p>
//       </div>
//     </>
//   );
// };

// export default Patient2faForm;
