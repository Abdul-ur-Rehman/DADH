import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card, Container } from "reactstrap";
import { useAuth } from "store/auth";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../../store/auth/firebase";

const auth = getAuth(app); // ✅ Initialize Firebase auth
let isConsulting = false;
const PatientLogin = () => {
  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;
  const { storeDataInLS } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isPatientLoggedIn");
    const userRole = localStorage.getItem("userRole");

    if (isLoggedIn === "true" && userRole === "patient") {
      navigate("/patient");
    }
  }, []);

  const [patientLoginData, setPatientLoginData] = useState({
    medicareNumber: "",
    phone: "",
    DOB: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!/^\d{10,}$/.test(patientLoginData.medicareNumber)) {
      newErrors.medicareNumber = "Medicare Number must be exactly 10 digits";
    }

    if (!/^\d{10,}$/.test(patientLoginData.phone)) {
      newErrors.phone = "Phone Number must be at least 10 digits";
    }

    if (!patientLoginData.DOB) {
      newErrors.DOB = "Date of Birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...patientLoginData,
          medicareNumber: String(patientLoginData.medicareNumber), // ✅ convert only this
        }),
      });

      const data = await response.json();

      if (data.message === "Patient not found") {
        setApiError("Patient not found");
        return;
      }

      // ✅ Setup invisible Recaptcha
      // window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      //   size: "invisible",
      //   callback: () => console.log("Recaptcha resolved"),
      // });

      // const appVerifier = window.recaptchaVerifier;

      // let rawPhone = patientLoginData.phone.replace(/^0+/, "");
      // const formattedPhone = `+92${rawPhone.slice(-10)}`;

      // const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

      // window.confirmationResult = confirmationResult;
      storeDataInLS(data);
      // Ensure token exists to prevent layout errors
      const storedData = JSON.parse(localStorage.getItem("data"));
      if (!storedData.token) {
        storedData.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.dummy";
        localStorage.setItem("data", JSON.stringify(storedData));
      }
      localStorage.setItem("userRole", "patient");
      localStorage.setItem("isPatientLoggedIn", "true");
      localStorage.setItem("sendBirdUserName", data.data.name);
      localStorage.setItem("sendBirdUserId", data.data._id);
      // localStorage.setItem("phoneForOtp", formattedPhone);
      localStorage.setItem("patientData", JSON.stringify(data));
      localStorage.setItem("PatientId", data.data._id);

      await goPatientOnline(data.data._id);

      // const isConsulting = !!localStorage.getItem("selectedCategory"); // ✅ check flag

      // navigate("/patient/2fa", { state: { isConsulting } });
      navigate("/patient");

    } catch (error) {
      console.error("Login error:", error);
      setApiError("Login failed or network issue.");
    }
  }

  const handleInput = (e) => {
    const { name, value } = e.target;

    setPatientLoginData((prev) => ({
      ...prev,
      [name]: name === "medicareNumber" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const goPatientOnline = async (id) => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/set-online/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline: true }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Set online:", result);
        localStorage.setItem("isOnline", true);
      }
    } catch (err) {
      console.log("Online error:", err);
    }
  };

  return (
    <div
      className="account-pages"
      style={{
        backgroundImage: `url(https://media.istockphoto.com/id/870027188/photo/hand-of-doctor-reassuring-her-female-patient.jpg?s=1024x1024&w=is&k=20&c=uDCNkqjgQVM2jzCkI0_aeqA5Q0jxiedcUvyAifnv4lA=)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
      }}
    >
      <Container fluid>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="overflow-hidden shadow border-0">
              <div className="bg-primary text-center p-4">
                <h5 className="text-white m-0">Patient Login</h5>
              </div>
              <CardBody className="p-4">
                <p className="text-black text-center">
                  Enter your Medicare Number, Phone Number, and DOB to access the portal.
                </p>

                {apiError && <div className="alert alert-danger">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Medicare Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.medicareNumber ? "is-invalid" : ""}`}
                      name="medicareNumber"
                      placeholder="Enter 10-digit Medicare number"
                      value={patientLoginData.medicareNumber}
                      onChange={handleInput}
                    />
                    {errors.medicareNumber && <div className="invalid-feedback">{errors.medicareNumber}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      placeholder="Enter phone number"
                      value={patientLoginData.phone}
                      onChange={handleInput}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      className={`form-control ${errors.DOB ? "is-invalid" : ""}`}
                      name="DOB"
                      value={patientLoginData.DOB}
                      onChange={handleInput}
                    />
                    {errors.DOB && <div className="invalid-feedback">{errors.DOB}</div>}
                  </div>

                  <div className="text-center">
                    <button className="btn btn-primary w-100" type="submit">
                      Log In
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    If you don't have an account,{" "}
                    <Link to="/patient/register" className="text-primary fw-bold">
                      Sign up now
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 🔐 Required for Firebase */}
      {/* <div id="recaptcha-container"></div> */}
    </div>
  );
};

export default PatientLogin;

// src/pages/patient/PatientLogin.js


// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Row, Col, CardBody, Card, Container } from "reactstrap";
// import { useAuth } from "store/auth";
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// import { app } from "../../store/auth/firebase";

// const auth = getAuth(app);
// const PatientLogin = () => {
//   const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;
//   const { storeDataInLS } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const isLoggedIn = localStorage.getItem("isPatientLoggedIn");
//     const userRole = localStorage.getItem("userRole");
//     if (isLoggedIn === "true" && userRole === "patient") {
//       navigate("/patient");
//     }
//   }, []);

//   const [patientLoginData, setPatientLoginData] = useState({
//     medicareNumber: "",
//     phone: "",
//     DOB: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState("");

//   const validateForm = () => {
//     const newErrors = {};
//     if (!/^\d{10,}$/.test(patientLoginData.medicareNumber)) {
//       newErrors.medicareNumber = "Medicare Number must be 10 digits";
//     }
//     if (!/^\d{10,}$/.test(patientLoginData.phone)) {
//       newErrors.phone = "Phone Number must be at least 10 digits";
//     }
//     if (!patientLoginData.DOB) {
//       newErrors.DOB = "Date of Birth is required";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(patientLoginData),
//       });

//       const data = await response.json();

//       if (data.message === "Patient not found") {
//         setApiError("Patient not found");
//         return;
//       }

//       // ✅ Recaptcha
//       if (!window.recaptchaVerifier) {
//         window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//           size: "invisible",
//           callback: (response) => console.log("Recaptcha solved"),
//         });
//       }

//       let rawPhone = patientLoginData.phone.replace(/^0+/, "");
//       const formattedPhone = `+92${rawPhone.slice(-10)}`;
//       const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);

//       window.confirmationResult = confirmationResult;

//       // Store data
//       storeDataInLS(data);
//       localStorage.setItem("userRole", "patient");
//       localStorage.setItem("isPatientLoggedIn", "true");
//       localStorage.setItem("sendBirdUserName", data.data.name);
//       localStorage.setItem("sendBirdUserId", data.data._id);
//       localStorage.setItem("phoneForOtp", formattedPhone);
//       localStorage.setItem("patientData", JSON.stringify(data));
//       localStorage.setItem("PatientId", data.data._id);

//       await goPatientOnline(data.data._id);
//       const isConsulting = !!localStorage.getItem("selectedCategory");
//       navigate("/patient/2fa", { state: { isConsulting } });

//     } catch (error) {
//       console.error("Login error:", error);
//       setApiError("OTP sending failed or network issue.");
//     }
//   };

//   const handleInput = (e) => {
//     const { name, value } = e.target;
//     setPatientLoginData((prev) => ({
//       ...prev,
//       [name]: name === "medicareNumber" ? value.replace(/\D/g, "").slice(0, 10) : value,
//     }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//     setApiError("");
//   };

//   const goPatientOnline = async (id) => {
//     try {
//       await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/set-online/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isOnline: true }),
//       });
//       localStorage.setItem("isOnline", true);
//     } catch (err) {
//       console.log("Online error:", err);
//     }
//   };

//   return (
//     <div
//       className="account-pages"
//       style={{
//         backgroundImage: `url(https://media.istockphoto.com/id/870027188/photo/hand-of-doctor-reassuring-her-female-patient.jpg?s=1024x1024&w=is&k=20&c=uDCNkqjgQVM2jzCkI0_aeqA5Q0jxiedcUvyAifnv4lA=)`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         width: "100vw",
//         height: "100vh",
//         position: "fixed",
//         top: "0",
//         left: "0",
//       }}
//     >
//       <Container fluid>
//         <Row className="vh-100 d-flex justify-content-center align-items-center">
//           <Col xs={12} sm={10} md={8} lg={6} xl={5}>
//             <Card className="overflow-hidden shadow border-0">
//               <div className="bg-primary text-center p-4">
//                 <h5 className="text-white m-0">Patient Login</h5>
//               </div>
//               <CardBody className="p-4">
//                 <p className="text-black text-center">
//                   Enter your Medicare Number, Phone Number, and DOB to access the portal.
//                 </p>

//                 {apiError && <div className="alert alert-danger">{apiError}</div>}

//                 <form onSubmit={handleSubmit}>
//                   <div className="mb-3">
//                     <label className="form-label">Medicare Number</label>
//                     <input
//                       type="text"
//                       className={`form-control ${errors.medicareNumber ? "is-invalid" : ""}`}
//                       name="medicareNumber"
//                       placeholder="Enter 10-digit Medicare number"
//                       value={patientLoginData.medicareNumber}
//                       onChange={handleInput}
//                     />
//                     {errors.medicareNumber && <div className="invalid-feedback">{errors.medicareNumber}</div>}
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Phone</label>
//                     <input
//                       type="text"
//                       className={`form-control ${errors.phone ? "is-invalid" : ""}`}
//                       name="phone"
//                       placeholder="Enter phone number"
//                       value={patientLoginData.phone}
//                       onChange={handleInput}
//                     />
//                     {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Date of Birth (DOB)</label>
//                     <input
//                       type="date"
//                       className={`form-control ${errors.DOB ? "is-invalid" : ""}`}
//                       name="DOB"
//                       value={patientLoginData.DOB}
//                       onChange={handleInput}
//                     />
//                     {errors.DOB && <div className="invalid-feedback">{errors.DOB}</div>}
//                   </div>

//                   <div className="text-center">
//                     <button className="btn btn-primary w-100" type="submit">
//                       Log In
//                     </button>
//                   </div>
//                 </form>

//                 <div className="text-center mt-3">
//                   <p className="mb-0">
//                     If you don't have an account,{" "}
//                     <Link to="/patient/register" className="text-primary fw-bold">
//                       Sign up now
//                     </Link>
//                   </p>
//                 </div>
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </Container>

//       {/* 🔐 Required for Firebase */}
//       <div id="recaptcha-container"></div>
//     </div>
//   );
// };

// export default PatientLogin;
