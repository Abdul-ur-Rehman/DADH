import React from "react";
import AdminLayout from "./AdminLayout/index";
import DoctorLayout from "./DoctorLayout";
import PatientAppLayout from "./PatientLayout/PatientAppLayout";

const WithLayout = ({ children }) => {
  const userRole = localStorage.getItem("userRole");

  if (userRole === "admin") return <AdminLayout>{children}</AdminLayout>;
  if (userRole === "doctor") return <DoctorLayout>{children}</DoctorLayout>;
  if (userRole === "patient") return <PatientAppLayout>{children}</PatientAppLayout>;
  return <>{children}</>;
};

export default WithLayout;
