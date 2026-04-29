import React from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../ui/AppLayout"
import logo from "../../assets/images/logo-dark.png"

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
)
const DoctorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" />
  </svg>
)
const PatientIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="3" /><path d="M1 14c0-2.761 2.239-5 5-5h2" />
    <path d="M12 10v4M10 12h4" />
  </svg>
)
const ConsultIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2" width="13" height="12" rx="1" /><path d="M5 6h6M5 9h4" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
  </svg>
)
const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" /><path d="M1.5 6.5l6.5 4 6.5-4" />
  </svg>
)

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/admin/home",                  end: true, icon: <DashboardIcon /> },
  { label: "Doctors",       href: "/admin/doctorRequests/table",             icon: <DoctorIcon /> },
  { label: "Patients",      href: "/admin/patientDetails/table",             icon: <PatientIcon /> },
  { label: "Consultations", href: "/admin/Consultations",                    icon: <ConsultIcon /> },
  { label: "Settings",      href: "/admin/settings",                         icon: <SettingsIcon /> },
  { label: "Inbox",         href: "/admin/inbox",                            icon: <InboxIcon /> },
]

function AdminAppLayout({ children }) {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.clear()
    navigate("/admin/login")
  }

  return (
    <AppLayout
      navItems={NAV_ITEMS}
      user={{ name: "Admin", role: "Administrator" }}
      onLogout={handleLogout}
      logo={logo}
    >
      {children}
    </AppLayout>
  )
}

export default AdminAppLayout
