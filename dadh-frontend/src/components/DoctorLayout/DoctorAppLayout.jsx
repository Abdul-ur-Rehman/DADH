import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../ui/AppLayout"
import logo from "../../assets/images/logo-dark.png"

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7.5L8 2l6 5.5V14a.5.5 0 01-.5.5h-3.75V10h-3.5v4.5H2.5A.5.5 0 012 14V7.5z" />
  </svg>
)

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" />
    <path d="M1.5 6.5l6.5 4 6.5-4" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3.5l2 2" />
  </svg>
)

const BillingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3" width="13" height="10" rx="1" />
    <path d="M1.5 6.5h13M5 9.5h2M9 9.5h2" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
  </svg>
)

const NAV_ITEMS = [
  { label: "Home",     href: "/doctor",                end: true, icon: <HomeIcon /> },
  { label: "Inbox",    href: "/doctor/inbox",                     icon: <InboxIcon /> },
  { label: "History",  href: "/doctor/consult-history",            icon: <HistoryIcon /> },
  { label: "Billing",  href: "/doctor/billing",                   icon: <BillingIcon /> },
  { label: "Settings", href: "/doctor/settings",                  icon: <SettingsIcon /> },
]

const readDoctorData = () => {
  try { return JSON.parse(localStorage.getItem("data"))?.data || {} }
  catch { return {} }
}

function DoctorAppLayout({ children, mainStyle }) {
  const navigate = useNavigate()
  const [doctorData, setDoctorData] = useState(readDoctorData)

  useEffect(() => {
    const refresh = () => setDoctorData(readDoctorData())
    window.addEventListener("doctorProfileUpdated", refresh)
    return () => window.removeEventListener("doctorProfileUpdated", refresh)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/doctor/login")
  }

  const photoSrc = doctorData.photo
    ? (doctorData.photo.startsWith("data:") ? doctorData.photo : `data:image/jpeg;base64,${doctorData.photo}`)
    : ""

  return (
    <AppLayout
      navItems={NAV_ITEMS}
      user={{ name: doctorData.name || "Doctor", role: "Doctor", photo: photoSrc }}
      onLogout={handleLogout}
      logo={logo}
      mainStyle={mainStyle}
    >
      {children}
    </AppLayout>
  )
}

export default DoctorAppLayout
