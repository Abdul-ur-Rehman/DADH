import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card, Container, Label } from "reactstrap";
import Select from "react-select";

const PatietnRegister = () => {
  document.title = "Register";
  const pendingPatient = JSON.parse(localStorage.getItem("pendingPatient"));
  localStorage.setItem("isNewPatient", "true");
  const [error, setError] = useState("");
  const [patient, setPatient] = useState({
    ...pendingPatient,
    name: "",
    city: "",
    state: "",
    // IRN: "",
    email: "",
    address: "",
    zipCode: "",
    gender: "",
  });

  console.log("patient ", patient);

  const handleInput = e => {
    const { name, value } = e.target;
    setError("");
    setPatient(prev => ({
      ...prev,
      [name]:
        name === "medicareNumber"
          ? String(value) || ""
          : value,
    }));
    console.log(patient);
  };

  const navigate = useNavigate();

  const validateForm = () => {
    // Medicare Number must be exactly 10 digits
    if (
      !/^\d{10}$/.test(patient.medicareNumber)
    ) {
      setError("Medicare Number must be exactly 10 digits.");
      return false;
    }

    // IRN must be exactly 1 digit
    // if (
    //   !/^\d{1}$/.test(patient.IRN)
    // ) {
    //   setError("IRN must be exactly 1 digit.");
    //   return false;
    // }

    setError("");
    return true;
  };


  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const api = `/api/patient/auth/register`;
      const response = await fetch(`${api}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patient),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("patientData", JSON.stringify(data));
        navigate("/patient/login");
        console.log(data)
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };
  const backgroundImageUrl =
    "https://media.istockphoto.com/id/870027188/photo/hand-of-doctor-reassuring-her-female-patient.jpg?s=1024x1024&w=is&k=20&c=uDCNkqjgQVM2jzCkI0_aeqA5Q0jxiedcUvyAifnv4lA=";

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "disclosed", label: "Disclosed" },
  ];

  const handleGender = selectedOption => {
    setPatient(prev => ({
      ...prev,
      gender: selectedOption ? selectedOption.value : '',
    }))
    console.log('patient ', patient);
  }
  return (
    <React.Fragment>
      {/* Fixed Background */}
      <div
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />

      {/* Scrollable Content */}
      <div
        style={{
          minHeight: "100vh",
          padding: "20px 10px",
        }}
      >
        <Container fluid>
          <Row className="justify-content-center">
            <Col xs={12} sm={11} md={10} lg={8} xl={7}>
              <Card className="overflow-hidden shadow border-0">
                <div className="bg-primary p-3">
                  <h5 className="text-white mb-0">Patient Register</h5>
                </div>
                <CardBody className="p-4">
                  <p className="text-center">Enter your details to continue.</p>
                  {error && <p className="text-danger text-center">{error}</p>}

                  <form className="mt-3" onSubmit={handleSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={patient.name}
                          onChange={handleInput}
                          placeholder="Name"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={patient.email}
                          onChange={handleInput}
                          placeholder="Email"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">Gender</label>
                        <Select
                          name="gender"
                          options={genderOptions}
                          value={genderOptions.find((option) => option.value === patient.gender)}
                          onChange={handleGender}
                          placeholder="Select Gender"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">Medicare Number</label>
                        <input
                          type="number"
                          className="form-control"
                          name="medicareNumber"
                          value={patient.medicareNumber}
                          onChange={handleInput}
                          placeholder="Medicare number"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={patient.phone}
                          onChange={handleInput}
                          className="form-control"
                          placeholder="Phone number"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          name="DOB"
                          value={patient.DOB}
                          onChange={handleInput}
                        />
                      </Col>

                      {/* <Col md={6}>
                        <label className="form-label">IRN Number</label>
                        <input
                          type="number"
                          className="form-control"
                          name="IRN"
                          value={patient.IRN}
                          onChange={handleInput}
                          placeholder="IRN number"
                        />
                      </Col> */}

                      <Col md={6}>
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={patient.address}
                          onChange={handleInput}
                          placeholder="Address"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={patient.city}
                          onChange={handleInput}
                          placeholder="City"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">ZIP Code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zipCode"
                          value={patient.zipCode}
                          onChange={handleInput}
                          placeholder="ZIP Code"
                        />
                      </Col>

                      <Col md={6}>
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={patient.state}
                          onChange={handleInput}
                          placeholder="State"
                        />
                      </Col>

                      <Col xs={12}>
                        <button className="btn btn-primary w-100" type="submit">
                          Register
                        </button>
                      </Col>
                    </Row>
                  </form>

                  <div className="text-end mt-3">
                    <p className="mb-0 text-center">
                      Already have an account?{" "}
                      <Link to="/patient/login" className="text-primary fw-bold">
                        login
                      </Link>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PatietnRegister;
