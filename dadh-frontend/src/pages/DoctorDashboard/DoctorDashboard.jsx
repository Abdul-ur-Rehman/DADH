import React, { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"
import TopStatsBar from "./components/TopStatsBar"
import PatientQueueRow from "./components/PatientQueueRow"
import ChatPanel from "./components/ChatPanel"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function calculateAge(DOB) {
  if (!DOB) return "N/A"
  const birth = new Date(DOB)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getTimeAgo(date) {
  const diffMs = Math.abs(new Date() - new Date(date))
  const mins = Math.floor(diffMs / 60000)
  const hrs = Math.floor(diffMs / 3600000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  if (hrs === 1) return "an hr"
  return `${hrs} hrs`
}

function DoctorDashboard() {
  const navigate = useNavigate()
  const doctorData = (() => {
    try { return JSON.parse(localStorage.getItem("data"))?.data || {} }
    catch { return {} }
  })()
  const doctorId = doctorData._id

  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [consultationId, setConsultationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showActiveWarning, setShowActiveWarning] = useState(false)
  const isMountedRef = useRef(true)

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/consultations/getAll`)
      const result = await res.json()
      if (!res.ok || !isMountedRef.current) return

      const all = result.data || []

      const active = all.find(c => c.doctorId === doctorId && !c.isCompleted)
      if (active) {
        setConsultationId(active._id)
        localStorage.setItem("consultationId", active._id)
      } else {
        setConsultationId(null)
      }

      const waiting = all.filter(c => !c.doctorId || c.doctorId === "")
      const enriched = await Promise.all(
        waiting.map(async (c) => {
          let patientData = {}
          let categoryName = c.consultationCategory || "General"
          try {
            const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`)
            if (pr.ok) { const pd = await pr.json(); patientData = pd.data || {} }
          } catch {}
          try {
            const cr = await fetch(`${BASE_URL}/consultationCategory/getOneByKey`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: c.consultationCategory }),
            })
            if (cr.ok) { const cd = await cr.json(); categoryName = cd.data?.category || categoryName }
          } catch {}
          return {
            ...c,
            consultationId: c._id,
            patientName: patientData.name || "Unknown",
            patientAge: calculateAge(patientData.DOB),
            patientGender: patientData.gender || "",
            consultationCategoryName: categoryName,
            timeAgo: getTimeAgo(c.createdAt),
          }
        })
      )

      if (isMountedRef.current) {
        setPatients(enriched.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
        setLoading(false)
      }
    } catch (e) {
      console.error("fetchData error:", e)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [doctorId])

  const handleReturnToConsult = async () => {
    try {
      const res = await fetch(`${BASE_URL}/consultations/getOneById/${consultationId}`)
      const result = await res.json()
      const data = result.data
      localStorage.setItem("consultationId", data._id)
      localStorage.setItem("patientId", data.patientId)
      localStorage.setItem("doctorId", data.doctorId)
      const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${data.patientId}`)
      if (pr.ok) {
        const pd = await pr.json()
        localStorage.setItem("consultPatientData", JSON.stringify(pd.data))
      }
      navigate(`/doctor/start-consult/${consultationId}/details`)
    } catch (e) {
      console.error("Return to consult error:", e)
    }
  }

  const handleRowClick = async (patient) => {
    if (consultationId) {
      setShowActiveWarning(true)
      return
    }
    localStorage.setItem("consultPatientData", JSON.stringify({
      name: patient.patientName,
      age: patient.patientAge,
      gender: patient.patientGender,
    }))
    navigate(`/doctor/start-consult/${patient.consultationId}`)
  }

  const filtered = patients.filter(p =>
    searchQuery === "" || p.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const h = new Date().getHours()
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  const todayStr = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })

  return (
    <DoctorAppLayout mainStyle={{ padding: 0, overflow: "hidden" }}>
      <div className="dadh-tw-root" style={{ display: "flex", flexDirection: "column", height: "100%", background: "#FAFFFE" }}>
        <TopStatsBar
          billingEarned={0}
          billingPending={0}
          patientsToday={patients.length}
          patientsTotal={patients.length}
          queueCount={patients.length}
          onSearch={setSearchQuery}
        />

        <div style={{ display: "flex", flex: 1, gap: 16, padding: 16, overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111E1F", margin: 0 }}>Patients Waiting</h2>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{greeting}, Dr. {doctorData.name} — {todayStr}</div>
            </div>

            {consultationId && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 8,
                padding: "10px 14px", marginBottom: 12,
              }}>
                <span style={{ fontSize: 14, color: "#92400E", fontWeight: 500 }}>You have an active consultation</span>
                <button
                  onClick={handleReturnToConsult}
                  style={{ background: "#0D7377", color: "white", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Return to Consult
                </button>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {loading && (
                <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 14 }}>Loading patients…</div>
              )}
              {!loading && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🩺</div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>No patients waiting</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>New consultations appear here automatically</div>
                </div>
              )}
              {filtered.map((p, i) => (
                <PatientQueueRow key={p.consultationId} patient={p} isFirst={i === 0} onClick={() => handleRowClick(p)} />
              ))}
            </div>
          </div>

          <ChatPanel doctorId={doctorId} />
        </div>
      </div>

      {showActiveWarning && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div style={{
            background: "white", borderRadius: 14, padding: 32, maxWidth: 420, width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111E1F" }}>
              Active Consultation Running
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
              You already have a consultation in progress. Please complete or requeue it before accepting another patient.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setShowActiveWarning(false)}
                style={{
                  background: "#F1F5F9", color: "#475569", border: "none",
                  borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => { setShowActiveWarning(false); handleReturnToConsult() }}
                style={{
                  background: "#0D7377", color: "white", border: "none",
                  borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Return to Consult
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorAppLayout>
  )
}

export default DoctorDashboard
