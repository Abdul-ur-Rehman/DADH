import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../ui/AppLayout"
import logo from "../../assets/images/logo-dark.png"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

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

const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M2 14c0-2.76 2.686-5 6-5s6 2.24 6 5" />
  </svg>
)

const NAV_ITEMS = [
  { label: "Home",    href: "/patient",          end: true, icon: <HomeIcon /> },
  { label: "Inbox",   href: "/patient/inbox",              icon: <InboxIcon /> },
  { label: "History", href: "/patient/history",            icon: <HistoryIcon /> },
  { label: "Profile", href: "/patient/profile",            icon: <ProfileIcon /> },
]

const readPatient = () => {
  try { return JSON.parse(localStorage.getItem("patientData"))?.data || {} }
  catch { return {} }
}

function PatientAppLayout({ children }) {
  const navigate = useNavigate()

  const [patientData, setPatientData] = useState(readPatient)
  const patientId = patientData._id

  useEffect(() => {
    const refresh = () => setPatientData(readPatient())
    window.addEventListener("patientProfileUpdated", refresh)
    return () => window.removeEventListener("patientProfileUpdated", refresh)
  }, [])

  const [bookHovered, setBookHovered] = useState(false)
  const [hasActiveConsult, setHasActiveConsult] = useState(false)

  useEffect(() => {
    if (!patientId) return
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`)
        const data = await res.json()
        if (!cancelled) {
          const list = data.data || []
          setHasActiveConsult(list.some(c => !c.isCompleted))
        }
      } catch {}
    }
    check()
    const id = setInterval(check, 8000)
    return () => { cancelled = true; clearInterval(id) }
  }, [patientId])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/patient/login")
  }

  const bookButton = hasActiveConsult ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        fontSize: 12, color: "#92400E", background: "#FEF3C7",
        border: "1px solid #F59E0B", borderRadius: 6,
        padding: "4px 10px", fontWeight: 600, whiteSpace: "nowrap",
      }}>
        Consultation in progress
      </span>
      <button
        disabled
        style={{
          background: "#CBD5E1", color: "#94A3B8", border: "none",
          borderRadius: 8, padding: "9px 18px", fontSize: 14, fontWeight: 600,
          cursor: "not-allowed", whiteSpace: "nowrap",
        }}
      >
        + Book Consultation
      </button>
    </div>
  ) : (
    <button
      onClick={() => navigate("/consult/patient")}
      onMouseEnter={() => setBookHovered(true)}
      onMouseLeave={() => setBookHovered(false)}
      style={{
        background: bookHovered ? "#0A5F62" : "#0D7377",
        color: "#ffffff",
        border: "none",
        borderRadius: 8,
        padding: "9px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 0.15s",
      }}
    >
      + Book Consultation
    </button>
  )

  return (
    <AppLayout
      navItems={NAV_ITEMS}
      user={{ name: patientData.name || "Patient", role: "Patient" }}
      onLogout={handleLogout}
      logo={logo}
      headerRight={bookButton}
    >
      {children}
    </AppLayout>
  )
}

export default PatientAppLayout
