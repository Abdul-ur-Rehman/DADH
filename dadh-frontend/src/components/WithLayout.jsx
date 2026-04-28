import React from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "./AdminLayout/index";
import DoctorLayout from "./DoctorLayout";
import PatientAppLayout from "./PatientLayout/PatientAppLayout";

const WithLayout = ({ children }) => {
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin")) return <AdminLayout>{children}</AdminLayout>;
  if (pathname.startsWith("/doctor")) return <DoctorLayout>{children}</DoctorLayout>;
  if (pathname.startsWith("/patient")) return <PatientAppLayout>{children}</PatientAppLayout>;
  return <>{children}</>;
};

export default WithLayout;
