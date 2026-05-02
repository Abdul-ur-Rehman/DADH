import React, { useEffect, useState } from "react"
import { generateCertificatePDF, sendChatFile } from "../../../utils/sendbirdNotify"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

// ── Helpers ───────────────────────────────────────────────────────────────────

const CERT_TYPES = ["Medical Certificate", "Specialist Referral", "Return to Work", "Return to School", "Other"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"]

const fmtNoteDate = (d) =>
  d ? d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "DD/MM/YYYY"

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D7377", fontSize: 18, lineHeight: 1, padding: "0 6px" }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#111E1F" }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D7377", fontSize: 18, lineHeight: 1, padding: "0 6px" }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748B", padding: "2px 0" }}>{d}</div>
        ))}
      </div>

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
                textAlign: "center", padding: "5px 0", fontSize: 13, cursor: "pointer",
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

      <div style={{ marginTop: 10, fontSize: 12, color: endDate ? "#0D7377" : "#64748B", fontWeight: endDate ? 600 : 400 }}>
        {statusText}
      </div>
      {(startDate || endDate) && (
        <button onClick={() => { onChange(null, null); setPickingEnd(false) }}
          style={{ marginTop: 4, background: "none", border: "none", fontSize: 12, color: "#94A3B8", cursor: "pointer", padding: 0 }}>
          Clear
        </button>
      )}
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

function CertifyConsultModal({ consultationId, patient, onClose }) {
  const patientName = patient?.name || "the patient"
  const patientId = patient?._id || ""

  const storedDoctor = (() => { try { return JSON.parse(localStorage.getItem("data"))?.data || {} } catch { return {} } })()
  const doctorSignature = storedDoctor.signature || ""
  const doctorSbUserId = localStorage.getItem("sendBirdUserId") || storedDoctor._id || ""

  const [certType, setCertType] = useState(CERT_TYPES[0])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [note, setNote] = useState(() => buildNoteTemplate(CERT_TYPES[0], patientName, null, null))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setNote(buildNoteTemplate(certType, patientName, startDate, endDate))
  }, [certType, startDate, endDate, patientName])

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
        consultationId,
      }
      if (doctorSignature) body.signature = doctorSignature
      const res = await fetch(`${BASE_URL}/consultations/certification/add`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.state) {
        try {
          const pdfFile = generateCertificatePDF({
            certType,
            patientName,
            startDate,
            endDate,
            note,
            doctorName: `${storedDoctor.name || ""} ${storedDoctor.surname || ""}`.trim(),
            signature: doctorSignature,
          })
          await sendChatFile(doctorSbUserId, patientId, pdfFile)
          window.dispatchEvent(new CustomEvent("consultChatRefresh"))
        } catch (e) {
          console.error("PDF send error:", e)
        }
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
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{patientName} · {formatDate(new Date())}</div>
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
          <div style={{ padding: "20px", borderRight: "1px solid #F1F5F9", flexShrink: 0 }}>
            <RangeCalendar startDate={startDate} endDate={endDate} onChange={handleRangeChange} />
          </div>
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
              style={{
                background: saving || !startDate || !endDate ? "#94A3B8" : "#0D7377",
                color: "white", border: "none", borderRadius: 8, padding: "8px 24px",
                fontSize: 13, fontWeight: 600,
                cursor: saving || !startDate || !endDate ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Issuing…" : "Issue Certificate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertifyConsultModal
