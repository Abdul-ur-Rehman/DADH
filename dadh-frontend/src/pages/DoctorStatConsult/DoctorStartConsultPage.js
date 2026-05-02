import React, { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function calculateAge(DOB) {
  if (!DOB) return "N/A"
  const b = new Date(DOB), t = new Date()
  let age = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--
  return age
}

function formatDateTime(ts) {
  if (!ts) return "N/A"
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatDate(ts) {
  if (!ts) return "N/A"
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
      <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#111E1F", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  )
}

function DoctorStartConsultPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [consult, setConsult] = useState(null)
  const [patient, setPatient] = useState(null)
  const [category, setCategory] = useState(null)
  const [pastConsults, setPastConsults] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async () => {
      try {
        const cRes = await fetch(`${BASE_URL}/consultations/getOneById/${id}`)
        const cData = await cRes.json()
        if (!isMountedRef.current || !cRes.ok) return
        const c = cData.data
        setConsult(c)

        const [patientRes, catRes] = await Promise.all([
          c.patientId ? fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`) : null,
          c.consultationCategory
            ? fetch(`${BASE_URL}/consultationCategory/getOneByKey`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: c.consultationCategory }),
              })
            : null,
        ])

        if (patientRes && patientRes.ok) {
          const pData = await patientRes.json()
          if (isMountedRef.current && pData.data) {
            setPatient(pData.data)
            const pcRes = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${c.patientId}`)
            if (pcRes.ok) {
              const pcData = await pcRes.json()
              if (isMountedRef.current) setPastConsults(pcData.data || [])
            }
          }
        }

        if (catRes && catRes.ok) {
          const catData = await catRes.json()
          if (isMountedRef.current) setCategory(catData.data)
        }

        if (isMountedRef.current) setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [id])

  const handleStart = async () => {
    setStarting(true)
    try {
      const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id
      localStorage.setItem("consultationId", id)
      localStorage.setItem("patientId", consult.patientId)
      localStorage.setItem("consultPatientData", JSON.stringify(patient))

      const res = await fetch(`${BASE_URL}/consultations/assignDoctor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, consultationId: consult._id, isConsulting: true, patientId: consult.patientId }),
      })

      if (res.ok) {
        const data = await res.json()
        const stored = JSON.parse(localStorage.getItem("data"))
        stored.data.activeConsultationId = data.consultation._id
        localStorage.setItem("data", JSON.stringify(stored))
        navigate("details")
      }
    } catch (e) {
      console.error("Start error:", e)
    }
    setStarting(false)
  }

  const typeLabel = consult?.type === "videoCall" ? "Video Call" : consult?.type === "phoneCall" ? "Phone Call" : "Chat"
  const alreadyAssigned = !!(consult?.doctorId)

  const typeBadge = (t) => {
    const label = t === "videoCall" ? "Video" : t === "phoneCall" ? "Audio" : "Chat"
    return (
      <span style={{ fontSize: 11, background: "#F0FDFA", color: "#0D7377", border: "1px solid #D1E8E8", borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>
        {label}
      </span>
    )
  }

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <button
          onClick={() => navigate("/doctor")}
          style={{ background: "none", border: "none", color: "#0D7377", fontSize: 14, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
        >
          ← Back to all patients
        </button>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>Loading…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

            {/* ── Patient details card ─────────────────────────────────────── */}
            <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "#F0FDFA", padding: "16px 20px", borderBottom: "1px solid #D1E8E8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#111E1F" }}>
                    {patient?.name || "Patient"}{patient?.surname ? ` ${patient.surname}` : ""}
                    <span style={{ fontSize: 14, fontWeight: 400, color: "#64748B", marginLeft: 8 }}>
                      ({calculateAge(patient?.DOB)}, {patient?.gender || "—"})
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{patient?.city || ""}</div>
                </div>
                {typeBadge(consult?.type)}
              </div>

              {/* Details */}
              <div style={{ padding: "6px 20px" }}>
                <Row label="Date of Birth" value={patient?.DOB ? new Date(patient.DOB).toLocaleDateString("en-AU") : "—"} />
                <Row label="Consult Type" value={typeLabel} />
                <Row label="Request Time" value={formatDateTime(consult?.createdAt)} />
                <Row label="Symptom / Condition" value={category?.category || consult?.consultationCategory || "—"} />
                <Row label="Additional Info" value={consult?.notes || "—"} />
                {patient?.allergies && <Row label="Allergies" value={patient.allergies} />}
                {patient?.address && <Row label="Address" value={patient.address} />}
              </div>

              {/* Action */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid #F1F5F9" }}>
                {alreadyAssigned ? (
                  <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#92400E", textAlign: "center" }}>
                    ⚠ This consultation is already assigned to a doctor.
                  </div>
                ) : (
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    style={{
                      width: "100%", background: starting ? "#94A3B8" : "#0D7377", color: "white",
                      border: "none", borderRadius: 8, padding: "13px", fontSize: 15, fontWeight: 700,
                      cursor: starting ? "not-allowed" : "pointer",
                    }}
                  >
                    {starting ? "Starting…" : "Start Consultation"}
                  </button>
                )}
              </div>
            </div>

            {/* ── Past consultations ───────────────────────────────────────── */}
            <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #D1E8E8", fontWeight: 700, fontSize: 15, color: "#111E1F" }}>
                Past Consultations
              </div>

              {pastConsults.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No past consultations found.</div>
              ) : (
                <div style={{ padding: "8px 0" }}>
                  {pastConsults.map((c, i) => (
                    <div key={c._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <div
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F0FDFA"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0D7377" }}>
                            {c.type === "videoCall" ? "📹" : c.type === "phoneCall" ? "📞" : "💬"} {formatDate(c.createdAt)}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                            {c.isCompleted ? "✓ Completed" : "⚠ Incomplete"} · {c.type === "videoCall" ? "Video" : c.type === "phoneCall" ? "Audio" : "Chat"}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{expandedIdx === i ? "▲" : "▼"}</span>
                      </div>

                      {expandedIdx === i && (
                        <div style={{ padding: "8px 18px 14px", background: "#FAFFFE", fontSize: 12, color: "#64748B", display: "flex", flexDirection: "column", gap: 4 }}>
                          {c.notes && <div><strong>Notes:</strong> {c.notes}</div>}
                          {c.medicines?.length > 0 && (
                            <div><strong>Prescriptions:</strong> {c.medicines.length} item(s)</div>
                          )}
                          {c.certificates?.length > 0 && (
                            <div><strong>Certificates:</strong> {c.certificates.length} issued</div>
                          )}
                          {c.billCodes?.length > 0 && (
                            <div><strong>Billing:</strong> {c.billCodes.length} code(s)</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </DoctorAppLayout>
  )
}

export default DoctorStartConsultPage
