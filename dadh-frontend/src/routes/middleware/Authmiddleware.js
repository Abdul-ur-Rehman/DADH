// src/routes/middleware/Authmiddleware.js
import React from "react";
import { Navigate } from "react-router-dom";

// Each portal sets its own flag on login; these are never overwritten by other portals.
const isPatientLoggedIn = () =>
  localStorage.getItem("isPatientLoggedIn") === "true" &&
  !!localStorage.getItem("patientData");

const isDoctorLoggedIn = () =>
  localStorage.getItem("isDoctorLoggedIn") === "true";

const isAdminLoggedIn = () =>
  localStorage.getItem("isAdminLoggedIn") === "true";

const SESSION_VALID = {
  patient: isPatientLoggedIn,
  doctor: isDoctorLoggedIn,
  admin: isAdminLoggedIn,
};

const LOGIN_REDIRECT = {
  patient: "/patient/Login",
  doctor: "/doctor/login",
  admin: "/admin/login",
};

const Authmiddleware = ({ children, allowedRoles }) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Find the first allowed role for which the user has a valid session.
  const matchedRole = allowedRoles.find(
    (role) => SESSION_VALID[role] && SESSION_VALID[role]()
  );

  if (!matchedRole) {
    // Redirect to the login page of the first allowed role on this route.
    const redirect = LOGIN_REDIRECT[allowedRoles[0]] || "/";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export default Authmiddleware;