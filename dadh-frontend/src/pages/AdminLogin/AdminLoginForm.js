import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card, Container } from "reactstrap";
import { useAuth } from "store/auth";

const AdminLoginForm = () => {
  const navigate = useNavigate();

useEffect(() => {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
  const userRole = localStorage.getItem("userRole");

  if (isLoggedIn === "true" && userRole === "admin") {
    navigate("/admin/doctor-requests/table");
  }
}, []);


  const backgroundImageUrl =
    "https://media.istockphoto.com/id/870027188/photo/hand-of-doctor-reassuring-her-female-patient.jpg?s=1024x1024&w=is&k=20&c=uDCNkqjgQVM2jzCkI0_aeqA5Q0jxiedcUvyAifnv4lA=";

  const [adminLoginData, setAdminLoginData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setAdminLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const { storeDataInLS } = useAuth();
  const api = "/api/admin/auth/login";

  const handleSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};

  if (!adminLoginData.username.trim()) {
    newErrors.username = "Please fill this field";
  } else if (adminLoginData.username.length < 3) {
    newErrors.username = "Username must be at least 3 characters long";
  }

  if (!adminLoginData.password.trim()) {
    newErrors.password = "Please fill this field";
  } else if (adminLoginData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters long";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length !== 0) return;

  try {
    setLoading(true);
    const response = await fetch(`${api}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminLoginData),
    });

    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      storeDataInLS(data);

      const level = data?.data?.level?.toString() || "1"; // Default to sub-admin
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("adminLevel", level);

      navigate("/admin/doctor-requests/table");
    } else {
      setErrors({ general: "Invalid credentials. Please try again." });
    }
  } catch (err) {
    console.log("catch Error : ", err);
    setErrors({ general: "Something went wrong. Please try again." });
    setLoading(false);
  }
};


  return (
    <>
      <style>
        {`
          /* Remove container padding on smaller screens */
          @media (max-width: 991.98px) {
            .container-fluid {
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            /* Remove card border-radius and shadow on small screens for edge-to-edge feel */
            .admin-login-card {
              border-radius: 0 !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        `}
      </style>

      <div
        className="account-pages"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <Container fluid>
          <Row className="vh-100 d-flex justify-content-center align-items-center">
            <Col xs={12} sm={12} md={12} lg={6} xl={5} className="p-0">
              <Card className="admin-login-card overflow-hidden shadow border-0">
                <div className="bg-primary p-4">
                  <h5 className="text-white font-size-20 mb-0">Admin Login</h5>
                </div>
                <CardBody className="p-4">
                  <p className="text-black text-center">
                    Enter your credentials to access the admin panel
                  </p>
                  {errors.general && (
                    <p className="text-danger text-center">{errors.general}</p>
                  )}

                  <form className="mt-4" onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="username">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={adminLoginData.username}
                        onChange={handleInput}
                        placeholder="Enter username"
                      />
                      {errors.username && (
                        <p className="text-danger">{errors.username}</p>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="userpassword">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="userpassword"
                        name="password"
                        value={adminLoginData.password}
                        onChange={handleInput}
                        placeholder="Enter password"
                      />
                      {errors.password && (
                        <p className="text-danger">{errors.password}</p>
                      )}
                    </div>
                    <div className="mb-3 text-center">
                      <button
                        className="btn btn-primary w-100 waves-effect waves-light"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Logging in..." : "Log In"}
                      </button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AdminLoginForm;