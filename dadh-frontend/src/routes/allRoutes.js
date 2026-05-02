import React from "react";
import { Navigate } from "react-router-dom";

// admin — new Phase 6 pages
import AddConsultationCategoryForm from "../pages/AdminConsultationCetgory/AddConsultationCategoryForm";
import EditConsultCategory from "../pages/AdminConsultationCetgory/EditConsultCategory";
import PatientDetailsForm from "../pages/AdminPatientDetails/PatientDetailsForm";
import DoctorRequestForm from "../pages/AdminDoctorRequest/DoctorRequestForm";
import AdminPatientRegisterForm from "../pages/AdminPatientDetails/AdminPatientRegisterForm";

// doctor — new Phase 5 pages
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

// Profile
import UserProfile from "../pages/Authentication/user-profile";

// Pages Calendar
import Calendar from "../pages/Calendar/index";

//Email
import EmailInbox from "../pages/Email/email-inbox";
import EmailRead from "../pages/Email/email-read";
import EmailCompose from "../pages/Email/email-compose";

import Emailtemplatealert from "../pages/EmailTemplate/email-template-alert";
import Emailtemplatebasic from "../pages/EmailTemplate/email-template-basic";
import Emailtemplatebilling from "../pages/EmailTemplate/email-template-billing";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";


//  // Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login";
import Login2 from "../pages/AuthenticationInner/Login2";
import Register1 from "../pages/AuthenticationInner/Register";
import Register2 from "../pages/AuthenticationInner/Register2";
import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
import Recoverpw2 from "../pages/AuthenticationInner/Recoverpw2";
import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen";
import LockScreen2 from "../pages/AuthenticationInner/auth-lock-screen-2";
import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "../pages/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "../pages/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "../pages/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "../pages/AuthenticationInner/auth-two-step-verification-2";

// Dashboard
import Dashboard from "../pages/Dashboard/index";
// Charts
import ChartApex from "../pages/Charts/Apexcharts";
import ChartistChart from "../pages/Charts/ChartistChart";
import ChartjsChart from "../pages/Charts/ChartjsChart";
import EChart from "../pages/Charts/EChart";
import SparklineChart from "../pages/Charts/SparklineChart";

// Maps
import MapsGoogle from "../pages/Maps/MapsGoogle";
import MapsVector from "../pages/Maps/MapsVector";
import MapsLeaflet from "../pages/Maps/MapsLeaflet";

//Icons
import IconDripicons from "../pages/Icons/IconDripicons";
import IconMaterialdesign from "../pages/Icons/IconMaterialdesign";
import TypiconsIcon from "../pages/Icons/IconTypicons";
import IconIon from "../pages/Icons/IconIon";
import ThemifyIcon from "../pages/Icons/IconThemify";
import IconFontawesome from "../pages/Icons/IconFontawesome";

//Tables
import BasicTables from "../pages/Tables/BasicTables";
import DatatableTables from "../pages/Tables/DatatableTables";
import ResponsiveTables from "../pages/Tables/ResponsiveTables";
import EditableTables from "../pages/Tables/EditableTables";

// Forms
import FormElements from "../pages/Forms/FormElements";
import FormAdvanced from "../pages/Forms/FormAdvanced";
import FormEditors from "../pages/Forms/FormEditors";
import FormValidations from "../pages/Forms/FormValidations";
import FormMask from "../pages/Forms/FormMask";
import FormRepeater from "../pages/Forms/FormRepeater";
import FormUpload from "../pages/Forms/FormUpload";
import FormWizard from "../pages/Forms/FormWizard";
import FormXeditable from "../pages/Forms/FormXeditable";

//Ui
import UiAlert from "../pages/Ui/UiAlert";
import UiButtons from "../pages/Ui/UiButtons";
import UiCards from "../pages/Ui/UiCards";
import UiCarousel from "../pages/Ui/UiCarousel";
import UiColors from "../pages/Ui/UiColors";
import UiDropdown from "../pages/Ui/UiDropdown";
import UiGeneral from "../pages/Ui/UiGeneral";
import UiGrid from "../pages/Ui/UiGrid";
import UiImages from "../pages/Ui/UiImages";
import UiLightbox from "../pages/Ui/UiLightbox";
import UiModal from "../pages/Ui/UiModal";
import UiProgressbar from "../pages/Ui/UiProgressbar";
import UiTabsAccordions from "../pages/Ui/UiTabsAccordions";
import UiTypography from "../pages/Ui/UiTypography";
import UiVideo from "../pages/Ui/UiVideo";
// import UiSessionTimeout from "../pages/Ui/UiSessionTimeout";
import UiRating from "../pages/Ui/UiRating";
import UiRangeSlider from "../pages/Ui/UiRangeSlider";
import UiUtilities from "pages/Ui/UiUtilities";
import UiOffcanvas from "pages/Ui/UiOffcanvas";

//Pages
// import PagesStarter from "../pages/Utility/pages-starter";
import PagesMaintenance from "../pages/Utility/pages-maintenance";
import PagesComingsoon from "../pages/Utility/pages-comingsoon";


import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";
// import PatientLoginPage from "pages/PatientLogin/PatientLoginPage";
import Patient2faPage from "pages/Patient2fa/Patient2faPage";
import ConsultationCategorySelector from "pages/PatientConsultationSelector/ConsultationCategorySelector";
import PatientStep2 from "pages/PatientConsultationSelector/PatientStep2";
import PatientRegisterPage from "../pages/PatientRegister/PatientRegisterPage";
import PatientHome from "pages/PatientHome/PatientHome";
import AdminInboxPage from "pages/AdminInbox/AdminInboxPage";
import PatientInboxPage from "pages/PatientInboxPage/PatientInboxPage";

// import TRTCChat from "pages/DoctorHome/TRTCChat";
import PatientLoginPage from "pages/PatientLogin/PatientLoginPage";
import PatientHistoryFull from "pages/PatientHistoryPage/PatientHistoryFull";
import DoctorVideoCallPage from "pages/DoctorVideoCall/DoctorVideoCallPage";
import DoctorAudioCallPage from "pages/DoctorAudioCall/DoctorAudioCallPage";
import PatientProfilePage from "pages/PatientProfileAccount/PatientProfilePage";
// import PatientCertifyPage from "pages/PatientCertify/PatientCertifyPage";
// import PatientConsultHistoryPage from "pages/PatientConsult/PatientConsultHistoryPage";
import AdminModelPage from "pages/AdminModel/AdminModelPage";
import AdminModelTable from "pages/AdminModel/AdminModelTable";
import AdminDetailsForm from "pages/AdminModel/AdminDetailsForm";
import AdminLoginNew from "pages/AdminLoginNew/AdminLoginNew";
import AdminHomeDashboard from "pages/AdminHomeDashboard/AdminHomeDashboard";
import AdminDoctorsNew from "pages/AdminDoctorsNew/AdminDoctorsNew";
import AdminPatientsNew from "pages/AdminPatientsNew/AdminPatientsNew";
import AdminConsultationsNew from "pages/AdminConsultationsNew/AdminConsultationsNew";
import AdminSettingsNew from "pages/AdminSettingsNew/AdminSettingsNew";


// import PatientFamilyPage from "pages/PatientFamily/PatientFamilyPage";





const userRoutes = [


  // ADMIN

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



  // DOCTOR
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


  // PATIENT
  { path: "/patient", component: <PatientHome />, allowedRoles: ['patient'] },
  { path: "/patient/inbox", component: <PatientInboxPage />, allowedRoles: ['patient'] },
  { path: "/patient/detail-form", component: <PatientDetailForm />, allowedRoles: ['patient'] },
  { path: "/patient/history", component: <PatientHistoryFull />, allowedRoles: ['patient'] },
  { path: "/patient/profile", component: <PatientProfilePage />, allowedRoles: ['patient'] },
  // { path: "/patient/consulthistory", component: <PatientConsultHistoryPage />, allowedRoles: ['patient'] },


  // this route should be at the end of all other routes
  { path: "/", component: <Dashboard /> },
];

const authRoutes = [
  { path: "/admin/login", component: <AdminLoginNew />, allowedRoles: ['patient'] },

  { path: "/doctor/login", component: <DoctorLoginPage />, allowedRoles: ['doctor'] },
  { path: "/doctor-2fa", component: <Navigate to="/doctor/login" replace />, allowedRoles: ['doctor'] },


  { path: "/patient/login", component: <PatientLoginPage />, allowedRoles: ['patient'] },
  { path: "/patient/2fa", component: <Patient2faPage />, allowedRoles: ['patient'] },
  { path: "/patient/register", component: <PatientRegisterPage />, allowedRoles: ['patient'] },
  { path: "/consult/patient", component: <ConsultationCategorySelector />, allowedRoles: ['patient'] },
  { path: "/patient/descriptions", component: <PatientStep2 />, allowedRoles: ['patient'] },

  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },


  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },

  { path: "/pages-maintenance", component: <PagesMaintenance /> },
  { path: "/pages-comingsoon", component: <PagesComingsoon /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  // Authentication Inner
  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-login-2", component: <Login2 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/pages-register-2", component: <Register2 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/page-recoverpw-2", component: <Recoverpw2 /> },
  { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
  { path: "/auth-lock-screen-2", component: <LockScreen2 /> },
  { path: "/page-confirm-mail", component: <ConfirmMail /> },
  { path: "/page-confirm-mail-2", component: <ConfirmMail2 /> },
  { path: "/auth-email-verification", component: <EmailVerification /> },
  { path: "/auth-email-verification-2", component: <EmailVerification2 /> },
  { path: "/auth-two-step-verification", component: <TwostepVerification /> },
  { path: "/auth-two-step-verification-2", component: <TwostepVerification2 />, },

];

export { userRoutes, authRoutes, };
