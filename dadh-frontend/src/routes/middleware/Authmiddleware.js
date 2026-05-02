// src/routes/middleware/Authmiddleware.js
import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  clearDoctorSession,
  getDoctorSessionInvalidation,
} from "../../components/DoctorLayout/doctorSessionStatus";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";

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
  patient: "/patient/login",
  doctor: "/doctor/login",
  admin: "/admin/login",
};

const readDoctorId = () => {
  try {
    const storedDoctor = JSON.parse(localStorage.getItem("data"));
    return (storedDoctor && storedDoctor.data && storedDoctor.data._id) || localStorage.getItem("doctorId") || "";
  } catch {
    return localStorage.getItem("doctorId") || "";
  }
};

const Authmiddleware = ({ children, allowedRoles }) => {
  const [forcedRedirect, setForcedRedirect] = useState("");
  const forcedLogoutRef = useRef(false);

  useEffect(() => {
    if (!allowedRoles || !allowedRoles.includes("doctor")) return undefined;
    if (!isDoctorLoggedIn()) return undefined;

    const doctorId = readDoctorId();
    if (!doctorId) return undefined;

    let cancelled = false;

    const checkDoctorSession = async () => {
      if (cancelled || forcedLogoutRef.current) return;

      try {
        const response = await fetch(`${BASE_URL}/doctor-requests/getOneById/${doctorId}`);
        const result = await response.json();
        if (cancelled || forcedLogoutRef.current || !response.ok) return;

        const message = getDoctorSessionInvalidation(result.data);
        if (!message) return;

        forcedLogoutRef.current = true;
        clearDoctorSession(message);
        setForcedRedirect("/doctor/login");
      } catch {
        // Keep the current session during transient network/API failures.
      }
    };

    checkDoctorSession();
    const interval = setInterval(checkDoctorSession, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [allowedRoles]);

  if (forcedRedirect) {
    return <Navigate to={forcedRedirect} replace />;
  }

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
