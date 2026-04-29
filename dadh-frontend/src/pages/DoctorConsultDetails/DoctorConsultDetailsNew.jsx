import React, { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"
import PatientHeaderCard from "./components/PatientHeaderCard"
import SupportingInfoPanel from "./components/SupportingInfoPanel"
import PatientNotesPanel from "./components/PatientNotesPanel"
import ChatHistoryPanel from "./components/ChatHistoryPanel"
import PrescribeModal from "./modals/PrescribeModal"
import ReferModal from "./modals/ReferModal"
import InvestigateModal from "./modals/InvestigateModal"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function DoctorConsultDetailsNew() {
  const { id } = useParams()
  const navigate = useNavigate()
  const consultationId = id || localStorage.getItem("consultationId")

  const [patient, setPatient] = useState(null)
  const [notes, setNotes] = useState("")
  const [isScribing, setIsScribing] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [incomplete, setIncomplete] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [certDone, setCertDone] = useState(false)
  const [billDone, setBillDone] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const stored = localStorage.getItem("consultPatientData")
    if (stored) {
      try { setPatient(JSON.parse(stored)) } catch {}
    }
    return () => { isMountedRef.current = false }
  }, [])

  const handleStop = async () => {
    try {
      const res = await fetch(`${BASE_URL}/billing/end/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId }),
      })
      if (res.ok) {
        localStorage.removeItem("patientId")
        localStorage.removeItem("consultPatientData")
        setStopped(true)
        if (!certDone && !billDone) setIncomplete(true)
      }
    } catch (e) {
      console.error("Stop error:", e)
    }
  }

  const handleAction = (key) => {
    if (key === "certify") { setCertDone(true); setIncomplete(false) }
    if (key === "bill") { setBillDone(true); setIncomplete(false) }
    setActiveModal(key)
  }

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ background: "#FAFFFE", minHeight: "100vh", padding: "16px 20px" }}>
        <button
          onClick={() => navigate("/doctor")}
          style={{ background: "none", border: "none", color: "#0D7377", fontSize: 14, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
        >
          ← Back to all patients
        </button>

        {!stopped ? (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              onClick={handleStop}
              style={{ background: "#EF4444", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              ⏹ Stop Consultation
            </button>
          </div>
        ) : (
          <div style={{ background: "#F0FDF4", border: "1px solid #22C55E", borderRadius: 8, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#166534", fontWeight: 500 }}>✓ Consultation stopped. Please certify and/or bill before leaving.</span>
            <button onClick={() => navigate("/doctor")} style={{ background: "none", border: "1px solid #64748B", color: "#64748B", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
              Go to Dashboard
            </button>
          </div>
        )}

        {incomplete && (
          <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#92400E" }}>⚠ This consultation has incomplete items. They will be flagged in History.</span>
            <button onClick={() => setIncomplete(false)} style={{ background: "none", border: "none", color: "#92400E", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column", gap: 16 }}>
            {patient && <PatientHeaderCard patient={patient} onAction={handleAction} />}
            <div style={{ display: "grid", gridTemplateColumns: "45fr 55fr", gap: 16 }}>
              <SupportingInfoPanel
                conditions={patient?.conditions || []}
                medications={patient?.medications || []}
                onAddCondition={() => {}}
                onAddMedication={() => {}}
              />
              <PatientNotesPanel
                notes={notes}
                onChange={setNotes}
                onToggleScribe={() => setIsScribing(s => !s)}
                isScribing={isScribing}
              />
            </div>
          </div>

          <ChatHistoryPanel
            patient={patient}
            messages={[]}
            consultEnded={stopped}
          />
        </div>
      </div>

      {activeModal === "prescribe" && <PrescribeModal consultationId={consultationId} onClose={() => setActiveModal(null)} />}
      {activeModal === "refer" && <ReferModal onClose={() => setActiveModal(null)} />}
      {activeModal === "investigate" && <InvestigateModal onClose={() => setActiveModal(null)} />}
    </DoctorAppLayout>
  )
}

export default DoctorConsultDetailsNew
