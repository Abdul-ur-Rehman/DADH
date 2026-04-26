import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card, Container } from "reactstrap";
import { useAuth } from "store/auth";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../../store/auth/firebase";

const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

const DoctorLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Doctor Portal";

    // Redirect if already logged in
    const isLoggedIn = localStorage.getItem("isDoctorLoggedIn");
    const userRole = localStorage.getItem("userRole");

    if (isLoggedIn === "true" && userRole === "doctor") {
      // alert("You are already logged in!");
      navigate("/doctor");
    }
  }, [navigate]);

  const { storeDataInLS } = useAuth();
  const [formData, setFormData] = useState({
    prescriberNumber: "",
    doctorPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "prescriberNumber" ? value.replace(/\D/g, "") : value.replace(/\D/g, ""),
    }));
    setErrors(prev => ({ ...prev, [name]: "" }));
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

  const setupRecaptcha = () => {
    const auth = getAuth(app);
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved");
        },
      });
      window.recaptchaVerifier.render();
    }
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

    setLoading(true); // Show loading while processing

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/doctor/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

        // ✅ Store local data
        localStorage.setItem("sendBirdUserId", data.data._id);
        const sendbirdUsername = data.data.name + " " + data.data.surname;
        localStorage.setItem("sendBirdUserName", sendbirdUsername);
        storeDataInLS(data);
        localStorage.setItem("userRole", "doctor");
        localStorage.setItem("isDoctorLoggedIn", "true");
        localStorage.setItem("doctorId", data.data._id);

        // ✅ First navigate, then send OTP
        navigate("/doctor-2fa");

        await sendOTP(`+92${formData.doctorPhone}`);
      } else {
        // ❌ Handle disabled or invalid doctor
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

  useEffect(() => {
    const auth = getAuth(app);
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved:", response);
        },
      });
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  }, []);


  return (
    <div
      className="account-pages p-3 p-md-5 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(https://media.istockphoto.com/id/870027188/photo/hand-of-doctor-reassuring-her-female-patient.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Card className="overflow-hidden shadow-sm">
              <div className="bg-primary">
                <div className="text-center p-4">
                  <h5 className="text-white">Doctor Login</h5>
                </div>
              </div>
              <CardBody className="p-4">
                {apiError && <div className="alert alert-danger">{apiError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Prescriber Number</label>
                    <input
                      type="text"
                      name="prescriberNumber"
                      value={formData.prescriberNumber}
                      onChange={handleChange}
                      className={`form-control ${errors.prescriberNumber ? "is-invalid" : ""}`}
                    />
                    {errors.prescriberNumber && (
                      <div className="invalid-feedback">{errors.prescriberNumber}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="doctorPhone"
                      value={formData.doctorPhone}
                      onChange={handleChange}
                      className={`form-control ${errors.doctorPhone ? "is-invalid" : ""}`}
                    />
                    {errors.doctorPhone && (
                      <div className="invalid-feedback">{errors.doctorPhone}</div>
                    )}
                  </div>

                  <div className="mb-3 text-center">
                    <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                      {loading ? "Processing..." : "Login"}
                    </button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default DoctorLogin;