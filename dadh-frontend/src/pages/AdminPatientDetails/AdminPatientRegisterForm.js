import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card, Container } from "reactstrap";
import Select from "react-select";
import Swal from 'sweetalert2';
import "./Patient.css";


const AdminPatientRegisterForm = () => {
  document.title = "Register";
  const pendingPatient =
    JSON.parse(localStorage.getItem("pendingPatient")) || {};
  const [error, setError] = useState("");
  const [patient, setPatient] = useState({
    ...pendingPatient,
    name: "",
    email: "",
    medicareNumber: "",
    phone: "",
    DOB: "",
    address: "",
    zipCode: "",
    gender: "",
    role: "patient",
  });

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
  const api = `/api/patient/auth/register`;

 const validateForm = () => {
  if (
    !/^\d{10}$/.test(patient.medicareNumber)
  ) {
    setError("Medicare Number must be exactly 10 digits.");
    return false;
  }
  setError("");
  return true;
};

 const handleSubmit = async e => {
  e.preventDefault();
  if (!validateForm()) return;

  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to register this patient?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, register",
    cancelButtonText: "Cancel",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${api}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patient),
        });

        if (response.ok) {
          Toast.fire({
            icon: "success",
            html: '<span class="toast-title">Patient successfully added</span>',
          });
          navigate("/admin/patient-details/table");
        } else {
          const data = await response.json();
          setError(data.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  });
};


  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "disclosed", label: "Disclosed" },
  ];

  const handleGenderChange = selectedOption => {
    setPatient(prev => ({
      ...prev,
      gender: selectedOption.value,
    }));
  };

  const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'my-toast' // Custom class
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "110px", marginBottom: "80px" }} >
        {/* <Container> */}
          <Row className="justify-content-center">
            <Col md={12} lg={12} xl={12}>
              <Card>
                <h3 className="text-2xl font-semibold text-start mb-3">New Patient Details</h3>
                <CardBody className="p-4">
                  {error && <p className="text-danger text-center">{error}</p>}
                  <form className="mt-1">
                    <Row>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={patient.name}
                          onChange={handleInput}
                          placeholder="Enter Name"
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={patient.email}
                          onChange={handleInput}
                          placeholder="Enter Email"
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">Medicare Number</label>
                        <input
                          type="number"
                          className="form-control"
                          name="medicareNumber"
                          value={patient.medicareNumber}
                          onChange={handleInput}
                          placeholder="Enter Medicare Number"
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={patient.phone}
                          onChange={handleInput}
                          placeholder="Enter Phone Number"
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">Date Of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          name="DOB"
                          value={patient.DOB}
                          onChange={handleInput}
                        />
                      </Col>

                      <Col md={6} xs={6} className="mb-4">
                        <label>Gender</label>
                        <Select
                          options={genderOptions}
                          className="basic-single"
                          placeholder="Select Gender"
                          value={genderOptions.find(
                            g => g.value == patient.gender
                          )}
                          onChange={handleGenderChange}
                          isSearchable={true}
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          className="form-control"
                          placeholder="Enter Address"
                          value={patient.address}
                          onChange={handleInput}
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">Zip Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          className="form-control"
                          placeholder="Enter Zip Code"
                          onChange={handleInput}
                          value={patient.zipCode}
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          onChange={handleInput}
                          value={patient.city}
                          placeholder="Enter City"
                        />
                      </Col>
                      <Col md={6} xs={6} className="mb-4">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          onChange={handleInput}
                          value={patient.state}
                          placeholder="Enter State"
                        />
                      </Col>


                      <Col xs={12} className="text-center mt-4">
                        <button className="btn btn-primary w-100"  type="submit" onClick={handleSubmit} > Register  </button>
                      </Col>
                    </Row>
                  </form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        {/* </Container> */}
      </div>
    </div>
  );
};

export default AdminPatientRegisterForm;
