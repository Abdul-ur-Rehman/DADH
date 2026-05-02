import React from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "./AdminLayout/index";
import DoctorLayout from "./DoctorLayout";
import PatientAppLayout from "./PatientLayout/PatientAppLayout";

// Doctor paths that still use the OLD DoctorLayout (not yet migrated to DoctorAppLayout)
const OLD_DOCTOR_LAYOUT_PATHS = [
  "/doctor/support",
  "/doctor/support-card",
];

const WithLayout = ({ children }) => {
  const { pathname } = useLocation();

  // All admin pages now use AdminAppLayout internally — skip old AdminLayout
  if (pathname.startsWith("/admin")) return <>{children}</>;

  if (pathname.startsWith("/doctor")) {
    // Old pages without their own layout shell still need DoctorLayout
    const needsOldLayout = OLD_DOCTOR_LAYOUT_PATHS.includes(pathname);

    if (needsOldLayout) return <DoctorLayout>{children}</DoctorLayout>;
    return <>{children}</>;
  }

  if (pathname.startsWith("/patient")) return <PatientAppLayout>{children}</PatientAppLayout>;
  return <>{children}</>;
};

export default WithLayout;
