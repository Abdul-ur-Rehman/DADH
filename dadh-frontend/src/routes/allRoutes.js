import React from "react";
import { Navigate } from "react-router-dom";

// Admin — Phase 6 pages
import AddConsultationCategoryForm from "../pages/AdminConsultationCetgory/AddConsultationCategoryForm";
import EditConsultCategory from "../pages/AdminConsultationCetgory/EditConsultCategory";
import PatientDetailsForm from "../pages/AdminPatientDetails/PatientDetailsForm";
import DoctorRequestForm from "../pages/AdminDoctorRequest/DoctorRequestForm";
import AdminPatientRegisterForm from "../pages/AdminPatientDetails/AdminPatientRegisterForm";

// Doctor — Phase 5 pages
import Doctor2faPage from "../pages/Doctor2fa/Doctor2faPage";
import DoctorStartConsultPage from "../pages/DoctorStatConsult/DoctorStartConsultPage";
import DoctorLoginPage from "../pages/DoctorLogin/DoctorLoginPage";
import SupportPage from "../pages/DoctorSupport/SupportPage";
import PatientDetailForm from "../pages/DoctorConsultDetails/Modals/PatientDetailForm";
import DoctorDashboard from "pages/DoctorDashboard/DoctorDashboard";
import DoctorConsultDetailsNew from "pages/DoctorConsultDetails/DoctorConsultDetailsNew";
import DoctorHistoryNew from "pages/DoctorHistory/DoctorHistoryNew";
import DoctorBillingNew from "pages/DoctorBilling/DoctorBillingNew";
import DoctorSettings from "pages/DoctorSettings/DoctorSettings";
import DoctorInboxNew from "pages/DoctorInbox/DoctorInboxNew";

// Patient — Phase 4 pages
import Patient2faPage from "pages/Patient2fa/Patient2faPage";
import ConsultationCategorySelector from "pages/PatientConsultationSelector/ConsultationCategorySelector";
import PatientStep2 from "pages/PatientConsultationSelector/PatientStep2";
import PatientRegisterPage from "../pages/PatientRegister/PatientRegisterPage";
import PatientHome from "pages/PatientHome/PatientHome";
import PatientInboxPage from "pages/PatientInboxPage/PatientInboxPage";
import PatientLoginPage from "pages/PatientLogin/PatientLoginPage";
import PatientHistoryFull from "pages/PatientHistoryPage/PatientHistoryFull";
import DoctorVideoCallPage from "pages/DoctorVideoCall/DoctorVideoCallPage";
import DoctorAudioCallPage from "pages/DoctorAudioCall/DoctorAudioCallPage";
import PatientProfilePage from "pages/PatientProfileAccount/PatientProfilePage";

// Admin models & utilities
import AdminModelPage from "pages/AdminModel/AdminModelPage";
import AdminModelTable from "pages/AdminModel/AdminModelTable";
import AdminDetailsForm from "pages/AdminModel/AdminDetailsForm";
import AdminLoginNew from "pages/AdminLoginNew/AdminLoginNew";
import AdminHomeDashboard from "pages/AdminHomeDashboard/AdminHomeDashboard";
import AdminDoctorsNew from "pages/AdminDoctorsNew/AdminDoctorsNew";
import AdminPatientsNew from "pages/AdminPatientsNew/AdminPatientsNew";
import AdminConsultationsNew from "pages/AdminConsultationsNew/AdminConsultationsNew";
import AdminSettingsNew from "pages/AdminSettingsNew/AdminSettingsNew";
import AdminInboxPage from "pages/AdminInbox/AdminInboxPage";

// Authentication related pages
import Logout from "../pages/Authentication/Logout";

// Utility & Error pages
import PagesMaintenance from "../pages/Utility/pages-maintenance";
import PagesComingsoon from "../pages/Utility/pages-comingsoon";
import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";

// Landing page
import ProjectDetailsPage from "../pages/ProjectDetails/ProjectDetailsPage";

const userRoutes = [
  // ADMIN ROUTES
  { path: "/admin", component: <Navigate to="/admin/home" replace />, allowedRoles: ['admin'] },
  { path: "/admin/dashboard", component: <AdminHomeDashboard />, allowedRoles: ['admin'] },
  { path: "/admin/home", component: <AdminHomeDashboard />, allowedRoles: ['admin'] },
  { path: "/admin/consultations", component: <AdminConsultationsNew />, allowedRoles: ['admin'] },
  { path: "/admin/inbox", component: <AdminInboxPage />, allowedRoles: ['admin'] },
  { path: "/admin/doctor-requests/table", component: <AdminDoctorsNew />, allowedRoles: ['admin'] },
  { path: "/admin/patient-details/table", component: <AdminPatientsNew />, allowedRoles: ['admin'] },
  { path: "/admin/patient-details-form/:id", component: <PatientDetailsForm />, allowedRoles: ['admin'] },
  { path: "/add/patient-register/", component: <AdminPatientRegisterForm />, allowedRoles: ['admin'] },
  { path: "/admin/billing-code/table", component: <AdminSettingsNew />, allowedRoles: ['admin'] },
  { path: "/admin/consultation-category/table", component: <AdminSettingsNew />, allowedRoles: ['admin'] },
  { path: "/admin/settings", component: <AdminSettingsNew />, allowedRoles: ['admin'] },
  { path: "/admin/doctor-details/form/:id", component: <DoctorRequestForm />, allowedRoles: ['admin'] },
  { path: "/add/consultation-category", component: <AddConsultationCategoryForm />, allowedRoles: ['admin'] },
  { path: "/edit-category/:id", component: <EditConsultCategory />, allowedRoles: ['admin'] },
  { path: "/admin/register/form", component: <AdminModelPage />, allowedRoles: ['admin'] },
  { path: "/admin/details/table", component: <AdminModelTable />, allowedRoles: ['admin'] },
  { path: "/admin/detail-form/:id", component: <AdminDetailsForm />, allowedRoles: ['admin'] },

  // DOCTOR ROUTES
  { path: "/doctor", component: <DoctorDashboard />, allowedRoles: ['doctor'] },
  { path: "/doctor/inbox", component: <DoctorInboxNew />, allowedRoles: ['doctor'] },
  { path: "/doctor/consult-history", component: <DoctorHistoryNew />, allowedRoles: ['doctor'] },
  { path: "/doctor/my-account", component: <DoctorSettings />, allowedRoles: ['doctor'] },
  { path: "/doctor/settings", component: <DoctorSettings />, allowedRoles: ['doctor'] },
  { path: "/doctor/billing", component: <DoctorBillingNew />, allowedRoles: ['doctor'] },
  { path: "/doctor/support", component: <SupportPage />, allowedRoles: ['doctor'] },
  { path: "/doctor/start-consult/:id", component: <DoctorStartConsultPage />, allowedRoles: ['doctor'] },
  { path: "/doctor/start-consult/:id/details", component: <DoctorConsultDetailsNew />, allowedRoles: ['doctor'] },
  { path: "/doctor/start-consult/:id/details/video", component: <DoctorVideoCallPage />, allowedRoles: ['doctor'] },
  { path: "/doctor/start-consult/:id/details/audio", component: <DoctorAudioCallPage />, allowedRoles: ['doctor'] },
  { path: "/doctor/support-card", component: <SupportPage />, allowedRoles: ['doctor'] },

  // PATIENT ROUTES
  { path: "/patient", component: <PatientHome />, allowedRoles: ['patient'] },
  { path: "/patient/inbox", component: <PatientInboxPage />, allowedRoles: ['patient'] },
  { path: "/patient/detail-form", component: <PatientDetailForm />, allowedRoles: ['patient'] },
  { path: "/patient/history", component: <PatientHistoryFull />, allowedRoles: ['patient'] },
  { path: "/patient/profile", component: <PatientProfilePage />, allowedRoles: ['patient'] },

  // Landing page — must be at the end
  { path: "/", component: <ProjectDetailsPage /> },
];

const authRoutes = [
  // Admin auth
  { path: "/admin/login", component: <AdminLoginNew />, allowedRoles: ['patient'] },

  // Doctor auth
  { path: "/doctor/login", component: <DoctorLoginPage />, allowedRoles: ['doctor'] },
  { path: "/doctor-2fa", component: <Navigate to="/doctor/login" replace />, allowedRoles: ['doctor'] },

  // Patient auth
  { path: "/patient/login", component: <PatientLoginPage />, allowedRoles: ['patient'] },
  { path: "/patient/2fa", component: <Patient2faPage />, allowedRoles: ['patient'] },
  { path: "/patient/register", component: <PatientRegisterPage />, allowedRoles: ['patient'] },
  { path: "/consult/patient", component: <ConsultationCategorySelector />, allowedRoles: ['patient'] },
  { path: "/patient/descriptions", component: <PatientStep2 />, allowedRoles: ['patient'] },

  // Logout
  { path: "/logout", component: <Logout /> },

  // Utility pages
  { path: "/pages-maintenance", component: <PagesMaintenance /> },
  { path: "/pages-comingsoon", component: <PagesComingsoon /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  // Legacy routes — redirect to landing page
  { path: "/login", component: <Navigate to="/" replace /> },
  { path: "/register", component: <Navigate to="/" replace /> },
  { path: "/forgot-password", component: <Navigate to="/" replace /> },
  { path: "/pages-login", component: <Navigate to="/" replace /> },
  { path: "/pages-login-2", component: <Navigate to="/" replace /> },
  { path: "/pages-register", component: <Navigate to="/" replace /> },
  { path: "/pages-register-2", component: <Navigate to="/" replace /> },
  { path: "/page-recoverpw", component: <Navigate to="/" replace /> },
  { path: "/page-recoverpw-2", component: <Navigate to="/" replace /> },
  { path: "/pages-forgot-pwd", component: <Navigate to="/" replace /> },
  { path: "/auth-lock-screen", component: <Navigate to="/" replace /> },
  { path: "/auth-lock-screen-2", component: <Navigate to="/" replace /> },
  { path: "/page-confirm-mail", component: <Navigate to="/" replace /> },
  { path: "/page-confirm-mail-2", component: <Navigate to="/" replace /> },
  { path: "/auth-email-verification", component: <Navigate to="/" replace /> },
  { path: "/auth-email-verification-2", component: <Navigate to="/" replace /> },
  { path: "/auth-two-step-verification", component: <Navigate to="/" replace /> },
  { path: "/auth-two-step-verification-2", component: <Navigate to="/" replace /> },
];

export { userRoutes, authRoutes };
