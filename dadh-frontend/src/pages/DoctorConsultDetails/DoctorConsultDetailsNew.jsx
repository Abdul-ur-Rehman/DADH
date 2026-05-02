import React, { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"
import PatientHeaderCard from "./components/PatientHeaderCard"
import SupportingInfoPanel from "./components/SupportingInfoPanel"
import PatientNotesPanel from "./components/PatientNotesPanel"
import CommunicationPanel from "./components/ChatHistoryPanel"
import PrescribeModal from "./Modals/PrescribeModal.jsx"
import ReferModal from "./Modals/ReferModal.jsx"
import InvestigateModal from "./Modals/InvestigateModal.jsx"
import CertifyConsultModal from "./Modals/CertifyConsultModal.jsx"
import BillingConsultModal from "./Modals/BillingConsultModal.jsx"
import AddFamilyModal from "./Modals/AddFamilyModal.js"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function DoctorConsultDetailsNew() {
  const { id } = useParams()
  const navigate = useNavigate()
  const consultationId = id || localStorage.getItem("consultationId")

  const doctorData = (() => {
    try { return JSON.parse(localStorage.getItem("data"))?.data || {} } catch { return {} }
  })()
  const doctorId = doctorData._id || ""

  const [patient, setPatient] = useState(null)
  const [notes, setNotes] = useState("")
  const [isScribing, setIsScribing] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [incomplete, setIncomplete] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [certDone, setCertDone] = useState(false)
  const [billDone, setBillDone] = useState(false)
  const [showRequeueConfirm, setShowRequeueConfirm] = useState(false)
  const [requeueLoading, setRequeueLoading] = useState(false)
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
      const doctor_id = JSON.parse(localStorage.getItem("data"))?.data?._id
      let patientId = patient?._id
      if (!patientId) {
        const cRes = await fetch(`${BASE_URL}/consultations/getOneById/${consultationId}`)
        const cData = await cRes.json()
        patientId = cData.data?.patientId
      }
      if (!doctor_id || !patientId) return
      const res = await fetch(`${BASE_URL}/billing/end/consultation/${consultationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id, patientId }),
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

  const handleRequeue = async () => {
    setRequeueLoading(true)
    try {
      let patientId = patient?._id
      if (!patientId) {
        const cRes = await fetch(`${BASE_URL}/consultations/getOneById/${consultationId}`)
        const cData = await cRes.json()
        patientId = cData.data?.patientId
      }
      const res = await fetch(`${BASE_URL}/consultations/requeuePatient`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId, patientId }),
      })
      if (res.ok) {
        localStorage.removeItem("consultationId")
        localStorage.removeItem("patientId")
        localStorage.removeItem("consultPatientData")
        navigate("/doctor")
      }
    } catch (e) {
      console.error("Requeue error:", e)
    } finally {
      setRequeueLoading(false)
      setShowRequeueConfirm(false)
    }
  }

  return (
    <DoctorAppLayout mainStyle={{ padding: 0, overflow: "hidden" }}>
      <div className="dadh-tw-root" style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FAFFFE" }}>

        {/* ── Top bar: back + stop on same row ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 20px", borderBottom: "1px solid #D1E8E8",
          background: "white", flexShrink: 0,
        }}>
          <button
            onClick={() => navigate("/doctor")}
            style={{ background: "none", border: "none", color: "#0D7377", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
          >
            ← Back to all patients
          </button>
          {!stopped && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowRequeueConfirm(true)}
                style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                ↩ Requeue Patient
              </button>
              <button
                onClick={handleStop}
                style={{ background: "#EF4444", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                ⏹ Stop Consultation
              </button>
            </div>
          )}
        </div>

        {/* ── Banners ── */}
        {stopped && (
          <div style={{ background: "#F0FDF4", border: "1px solid #22C55E", borderBottom: "1px solid #22C55E", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ color: "#166534", fontWeight: 500, fontSize: 13 }}>✓ Consultation stopped. Please certify and/or bill before leaving.</span>
            <button onClick={() => navigate("/doctor")} style={{ background: "none", border: "1px solid #64748B", color: "#64748B", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
              Go to Dashboard
            </button>
          </div>
        )}
        {incomplete && (
          <div style={{ background: "#FFF8E1", borderBottom: "1px solid #F59E0B", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "#92400E" }}>⚠ This consultation has incomplete items. They will be flagged in History.</span>
            <button onClick={() => setIncomplete(false)} style={{ background: "none", border: "none", color: "#92400E", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* ── Main content ── */}
        <div style={{ flex: 1, display: "flex", gap: 12, padding: 14, overflow: "hidden", minHeight: 0 }}>

          {/* Left panel */}
          <div style={{ flex: "0 0 calc(63% - 6px)", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden", minHeight: 0 }}>
            {patient && <PatientHeaderCard patient={patient} onAction={handleAction} onAddFamily={() => setActiveModal("addFamily")} />}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "45fr 55fr", gap: 10, overflow: "hidden", minHeight: 0 }}>
              <SupportingInfoPanel
                conditions={patient?.conditions || []}
                medications={patient?.medications || []}
                onInsertTemplate={(s) => setNotes(prev => prev ? prev + "\n" + s : s)}
              />
              <PatientNotesPanel
                notes={notes}
                onChange={setNotes}
                onToggleScribe={() => setIsScribing(s => !s)}
                isScribing={isScribing}
              />
            </div>
          </div>

          {/* Right: communication panel */}
          <CommunicationPanel
            patient={patient}
            consultEnded={stopped}
            consultationId={consultationId}
            doctorId={doctorId}
          />
        </div>
      </div>

      {activeModal === "prescribe" && <PrescribeModal consultationId={consultationId} patientId={patient?._id} onClose={() => setActiveModal(null)} />}
      {activeModal === "refer" && <ReferModal onClose={() => setActiveModal(null)} />}
      {activeModal === "investigate" && <InvestigateModal onClose={() => setActiveModal(null)} />}
      {activeModal === "certify" && <CertifyConsultModal consultationId={consultationId} patient={patient} onClose={() => setActiveModal(null)} />}
      {activeModal === "bill" && <BillingConsultModal consultationId={consultationId} onClose={() => setActiveModal(null)} />}
      {activeModal === "addFamily" && <AddFamilyModal show={true} handleClose={() => setActiveModal(null)} />}

      {showRequeueConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div style={{
            background: "white", borderRadius: 14, padding: 32, maxWidth: 420, width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>↩</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111E1F" }}>
              Requeue this patient?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
              The patient will be released back to the waiting queue and another doctor can accept them. Your progress (notes, prescriptions, certificates) will be preserved.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setShowRequeueConfirm(false)}
                disabled={requeueLoading}
                style={{
                  background: "#F1F5F9", color: "#475569", border: "none",
                  borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600,
                  cursor: requeueLoading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequeue}
                disabled={requeueLoading}
                style={{
                  background: "#F59E0B", color: "white", border: "none",
                  borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600,
                  cursor: requeueLoading ? "not-allowed" : "pointer",
                  opacity: requeueLoading ? 0.7 : 1,
                }}
              >
                {requeueLoading ? "Requeueing…" : "Yes, Requeue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorAppLayout>
  )
}

export default DoctorConsultDetailsNew
