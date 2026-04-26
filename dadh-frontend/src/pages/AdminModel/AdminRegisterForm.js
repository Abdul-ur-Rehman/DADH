import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card } from "reactstrap";
import Select from "react-select";
import Swal from 'sweetalert2';

const AdminRegisterForm = () => {
  document.title = "Register";
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: "",
    level: "",      // superadmin | subadmin
    status: 1,      // default = enabled (not shown in form)
    role: "admin",  // fixed
  });

  const levelOptions = [
    { value: "superadmin", label: "Super Admin" },
    { value: "subadmin", label: "Sub Admin" },
  ];

  const handleSelectChange = (selectedOption) => {
    setAdmin((prev) => ({
      ...prev,
      level: selectedOption.value,
    }));
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setError("");
    setAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidForm = () => {
    const { username, email, password, level } = admin;
    if (!username || !email || !password || !level) return false;
    if (!/^\S+@\S+\.\S+$/.test(email)) return false;
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidForm()) {
      setError("Please fill all required fields correctly.");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to register this admin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, register",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/admin/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(admin),
          });

          const resultData = await response.json();

          if (response.ok) {
            Swal.fire("Registered!", "Admin registered successfully.", "success");
            navigate("/admin/details/table");
          } else {
            Swal.fire("Error", resultData.message || "Registration failed.", "error");
          }
        } catch (err) {
          Swal.fire("Error", `Network error: ${err.message}`, "error");
        }
      }
    });
  };


  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }} >
        <Row className="justify-content-center">
          <Col md={12}>
            <Card>
              <h3 className="text-2xl font-semibold text-start p-4 pb-0">New Admin Registration</h3>
              <CardBody className="p-4">
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-4">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-control" name="username" value={admin.username} onChange={handleInput} placeholder="Enter Username" />
                    </Col>

                    <Col md={6} className="mb-4">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" name="email" value={admin.email} onChange={handleInput} placeholder="Enter Email" />
                    </Col>

                    <Col md={6} className="mb-4">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" name="password" value={admin.password} onChange={handleInput} placeholder="Enter Password" />
                    </Col>

                    <Col md={6} className="mb-4">
                      <label className="form-label">Level</label>
                      <Select
                        options={levelOptions}
                        placeholder="Select Level"
                        value={levelOptions.find(opt => opt.value === admin.level)}
                        onChange={handleSelectChange}
                        isSearchable
                      />
                    </Col>

                    <Col xs={12} className="text-center mt-4">
                      <button className="btn btn-primary w-100" type="submit">
                        Register Admin
                      </button>
                    </Col>
                  </Row>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminRegisterForm;
