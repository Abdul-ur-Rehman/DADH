// src/routes/middleware/Authmiddleware.js
import React from "react";
import { Navigate } from "react-router-dom";

const Authmiddleware = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("data")); 
  const role = localStorage.getItem("userRole");

  // Not logged in
  if (!user) {
    if (role === "doctor") return <Navigate to="/doctor/login" replace />;
    if (role === "patient") return <Navigate to="/patient/login" replace />;
    if (role === "admin") return <Navigate to="/admin/login" replace />;
    return <Navigate to="/" replace />; // Default fallback
  }

  const actualRole = user?.role || role;

  // Unauthorized access
  if (allowedRoles && !allowedRoles.includes(actualRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized access - render children
  return <>{children}</>;
};

export default Authmiddleware;