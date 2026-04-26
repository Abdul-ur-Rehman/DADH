import React from "react";
import AdminLayout from "./AdminLayout/index";
import DoctorLayout from "./DoctorLayout";
import PatientLayout from "./PatientLayout";
// import UserLayout from "../layouts/UserLayout";
// import GuestLayout from "../layouts/GuestLayout";

const WithLayout = ({ children }) => {
  const userRole = localStorage.getItem("userRole"); // or get from Redux/Context

  if (userRole === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
 } else if (userRole === "doctor") {
     return <DoctorLayout>{children}</DoctorLayout>;
   }
   else if(userRole === "patient"){
    return <PatientLayout>{children}</PatientLayout>;
  }
};

export default WithLayout;
