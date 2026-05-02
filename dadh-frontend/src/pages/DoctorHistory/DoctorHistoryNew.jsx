import React, { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"
import { sendChatFile, generateCertificatePDF } from "../../utils/sendbirdNotify"

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

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

// ── Certificate helpers ───────────────────────────────────────────────────────
const CERT_TYPES = ["Medical Certificate", "Specialist Referral", "Return to Work", "Return to School", "Other"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"]

const fmtNoteDate = (d) =>
  d ? d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "DD/MM/YYYY"

const buildNoteTemplate = (certType, patientName, start, end) => {
  const s = fmtNoteDate(start), e = fmtNoteDate(end)
  const n = patientName || "the patient"
  const templates = {
    "Medical Certificate":
      `This is to certify that I have seen ${n} today.\n${n} is unfit to attend work from ${s} to ${e}.`,
    "Specialist Referral":
      `I am referring ${n} to a specialist for further assessment and management.\nThis referral is valid from ${s} to ${e}.`,
    "Return to Work":
      `This is to certify that ${n} is fit to return to work from ${s}.\nModified duties may be required until ${e}.`,
    "Return to School":
      `This is to certify that ${n} is fit to return to school from ${s} to ${e}.`,
    "Other":
      `This is to certify that I have seen ${n}.\nThe period covered is from ${s} to ${e}.`,
  }
  return templates[certType] || templates["Medical Certificate"]
}

const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString()
const inRange = (d, start, end) => {
  if (!start || !end) return false
  const t = d.getTime(), lo = Math.min(start.getTime(), end.getTime()), hi = Math.max(start.getTime(), end.getTime())
  return t >= lo && t <= hi
}

// ── Range Calendar ────────────────────────────────────────────────────────────
function RangeCalendar({ startDate, endDate, onChange }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [pickingEnd, setPickingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (d) => {
    if (!startDate || (startDate && endDate)) {
      onChange(d, null)
      setPickingEnd(true)
    } else {
      const end = d < startDate ? startDate : d
      const start = d < startDate ? d : startDate
      onChange(start, end)
      setPickingEnd(false)
    }
  }

  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(viewYear, viewMonth, day))

  const previewEnd = pickingEnd && hoverDate ? hoverDate : endDate

  const statusText = !startDate
    ? "Please select a date range"
    : !endDate
    ? "Now select the end date"
    : `${fmtNoteDate(startDate)} → ${fmtNoteDate(endDate)}`

  return (
    <div style={{ width: 252, flexShrink: 0 }}>
      {/* Month navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D7377", fontSize: 18, lineHeight: 1, padding: "0 6px" }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#111E1F" }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D7377", fontSize: 18, lineHeight: 1, padding: "0 6px" }}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748B", padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const isStart = sameDay(d, startDate)
          const isEnd = sameDay(d, endDate)
          const isToday = sameDay(d, now)
          const ranged = inRange(d, startDate, previewEnd)
          const isEdge = isStart || isEnd
          return (
            <div
              key={i}
              onClick={() => handleDayClick(d)}
              onMouseEnter={() => pickingEnd && setHoverDate(d)}
              onMouseLeave={() => setHoverDate(null)}
              style={{
                textAlign: "center",
                padding: "5px 0",
                fontSize: 13,
                cursor: "pointer",
                borderRadius: isEdge ? "50%" : 0,
                background: isEdge ? "#0D7377" : ranged ? "#D1E8E8" : "transparent",
                color: isEdge ? "white" : isToday && !ranged ? "#0D7377" : "#111E1F",
                fontWeight: isEdge || isToday ? 700 : 400,
              }}
            >
              {d.getDate()}
            </div>
          )
        })}
      </div>

      {/* Status */}
      <div style={{ marginTop: 10, fontSize: 12, color: endDate ? "#0D7377" : "#64748B", fontWeight: endDate ? 600 : 400 }}>
        {statusText}
      </div>

      {/* Clear */}
      {(startDate || endDate) && (
        <button onClick={() => { onChange(null, null); setPickingEnd(false) }}
          style={{ marginTop: 4, background: "none", border: "none", fontSize: 12, color: "#94A3B8", cursor: "pointer", padding: 0 }}>
          Clear
        </button>
      )}
    </div>
  )
}

// ── Certify Modal ─────────────────────────────────────────────────────────────
function CertifyModal({ consultation, doctorSignature, onClose, onSaved }) {
  const [certType, setCertType] = useState(CERT_TYPES[0])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [note, setNote] = useState(() => buildNoteTemplate(CERT_TYPES[0], consultation.patientName, null, null))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Regenerate note when type or dates change
  useEffect(() => {
    setNote(buildNoteTemplate(certType, consultation.patientName, startDate, endDate))
  }, [certType, startDate, endDate, consultation.patientName])

  const handleRangeChange = (start, end) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleSave = async () => {
    if (!startDate || !endDate) { setError("Please select a date range."); return }
    if (!note.trim()) { setError("Please add a note."); return }
    setSaving(true)
    setError("")
    try {
      const body = {
        certificationType: certType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        note,
        consultationId: consultation._id,
      }
      if (doctorSignature) body.signature = doctorSignature
      const res = await fetch(`${BASE_URL}/consultations/certification/add`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.state) {
        // Generate PDF and send as file to patient chat
        try {
          const storedDoctor = JSON.parse(localStorage.getItem("data"))?.data || {}
          const doctorSbUserId = localStorage.getItem("sendBirdUserId") || storedDoctor._id || ""
          const pdfFile = generateCertificatePDF({
            certType,
            patientName: consultation.patientName,
            startDate,
            endDate,
            note,
            doctorName: `${storedDoctor.name || ""} ${storedDoctor.surname || ""}`.trim(),
            signature: doctorSignature,
          })
          await sendChatFile(doctorSbUserId, consultation.patientId, pdfFile)
        } catch (e) {
          console.error("PDF send error:", e)
        }

        onSaved(consultation._id)
        onClose()
      } else {
        setError(data.message || "Failed to issue certificate.")
      }
    } catch {
      setError("Network error. Please try again.")
    }
    setSaving(false)
  }

  const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#FAFFFE" }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111E1F" }}>Issue Certificate</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{consultation.patientName} · {formatDate(consultation.date)}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>

        {/* Certificate type */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>Certificate type</label>
          <select value={certType} onChange={e => setCertType(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 260 }}>
            {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Two-column: calendar + note */}
        <div style={{ display: "flex", gap: 0, flex: 1, overflow: "hidden" }}>
          {/* Calendar */}
          <div style={{ padding: "20px", borderRight: "1px solid #F1F5F9", flexShrink: 0 }}>
            <RangeCalendar startDate={startDate} endDate={endDate} onChange={handleRangeChange} />
          </div>

          {/* Note */}
          <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: "vertical", flex: 1, fontFamily: "inherit", lineHeight: 1.6 }}
            />
            {doctorSignature && (
              <div>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Signature</div>
                <img
                  src={doctorSignature.startsWith("data:") ? doctorSignature : `data:image/png;base64,${doctorSignature}`}
                  alt="Signature"
                  style={{ height: 44, border: "1px solid #D1E8E8", borderRadius: 6, padding: 4, background: "#FAFFFE" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#EF4444" }}>{error}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#64748B" }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !startDate || !endDate}
              style={{ background: saving || !startDate || !endDate ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "8px 24px", fontSize: 13, fontWeight: 600, cursor: saving || !startDate || !endDate ? "not-allowed" : "pointer" }}
            >
              {saving ? "Issuing…" : "Issue Certificate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
function DoctorHistoryNew() {
  const navigate = useNavigate()
  const stored = (() => { try { return JSON.parse(localStorage.getItem("data"))?.data || {} } catch { return {} } })()
  const doctorId = stored._id
  const doctorSignature = stored.signature || ""

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split("T")[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0])
  const [certifyModal, setCertifyModal] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/consultations/incompleteBillings/${doctorId}`)
        const result = await res.json()
        if (!res.ok || !isMountedRef.current) return

        const enriched = await Promise.all(
          (result.data || []).map(async (c) => {
            let patientName = "Unknown", patientAge = "N/A", patientGender = ""
            try {
              const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`)
              const pd = await pr.json()
              if (pr.ok && pd.data) {
                patientName = pd.data.name || "Unknown"
                patientAge = calculateAge(pd.data.DOB)
                patientGender = pd.data.gender || ""
              }
            } catch {}
            const hasCert = !!(c.certificates && c.certificates.length > 0)
            const hasBilling = !!(c.billCodes && c.billCodes.length > 0)
            const certRequired = !!(c.requiresMedicalCertificate) ||
              !!(c.requestedCertificate && c.requestedCertificate.length > 0)
            return {
              ...c,
              patientName,
              patientAge,
              patientGender,
              hasCert,
              hasBilling,
              certRequired,
              date: c.createdAt,
            }
          })
        )
        if (isMountedRef.current) { setRows(enriched); setLoading(false) }
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [doctorId])

  const handleCertSaved = (consultationId) => {
    setRows(prev => prev.map(r => r._id === consultationId ? { ...r, hasCert: true, certRequired: false } : r))
  }

  const filtered = rows.filter(r => {
    const d = new Date(r.date)
    const from = new Date(fromDate)
    const to = new Date(toDate); to.setHours(23, 59, 59)
    if (d < from || d > to) return false
    if (search && !r.patientName.toLowerCase().includes(search.toLowerCase())) return false
    const isComplete = r.hasBilling && (!r.certRequired || r.hasCert)
    if (statusFilter === "incomplete" && isComplete) return false
    if (statusFilter === "complete" && !isComplete) return false
    return true
  })

  const inputStyle = { border: "1px solid #D1E8E8", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", background: "#FAFFFE" }

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Consult History</h2>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="Search patient…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 200 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, color: "#64748B" }}>From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, color: "#64748B" }}>To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
            <option value="all">All</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading…</div>
        ) : (
          <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
                  {["Patient", "Date", "Type", "Status", "Certificate", "Billing", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No consultations found</td></tr>
                )}
                {filtered.map((r, i) => (
                  <tr key={r._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFFFE"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>
                      <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{r.patientAge}, {r.patientGender}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {r.type === "videoCall" ? "Video" : r.type === "phoneCall" ? "Audio" : "Chat"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {r.hasBilling && (!r.certRequired || r.hasCert) ? (
                          <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>✓ Complete</span>
                        ) : (
                          <span style={{ fontSize: 11, background: "#FFF8E1", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px" }}>⚠ Incomplete</span>
                        )}
                        {r.certRequired && !r.hasCert && (
                          <span style={{ fontSize: 11, background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px" }}>📋 Cert Required</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: r.hasCert ? "#22C55E" : "#94A3B8" }}>{r.hasCert ? "✓ Issued" : "—"}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: r.hasBilling ? "#22C55E" : "#94A3B8" }}>{r.hasBilling ? "✓ Billed" : "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => navigate(`/doctor/start-consult/${r._id}/details`)}
                          style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#0D7377" }}
                        >
                          View
                        </button>
                        {!r.hasCert && (
                          <button
                            onClick={() => setCertifyModal(r)}
                            style={{ background: "none", border: "1px solid #F59E0B", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#92400E" }}
                          >
                            Certify
                          </button>
                        )}
                        {!r.hasBilling && (
                          <button
                            onClick={() => navigate("/doctor/billing")}
                            style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#64748B" }}
                          >
                            Bill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {certifyModal && (
        <CertifyModal
          consultation={certifyModal}
          doctorSignature={doctorSignature}
          onClose={() => setCertifyModal(null)}
          onSaved={handleCertSaved}
        />
      )}
    </DoctorAppLayout>
  )
}

export default DoctorHistoryNew
