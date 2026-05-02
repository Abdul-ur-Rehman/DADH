import React, { useState } from "react"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

const CATEGORIES = [
  "Medical Certificate Only", "Urgent Repeat Scripts Only", "Respiratory Related",
  "Skin Related", "Gut Related", "Mental Health / Sleep / Headache",
  "Musculoskeletal", "Women's Health", "Men's Health",
]
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"]
const CALL_TYPES = [
  { value: "videoCall", label: "Video Call" },
  { value: "textChat", label: "Text Chat" },
  { value: "phoneCall", label: "Phone Call" },
]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"]

const inputStyle = {
  width: "100%", border: "1px solid #D1E8E8", borderRadius: 6,
  padding: "8px 10px", fontSize: 13, outline: "none",
  boxSizing: "border-box", background: "#FAFFFE", color: "#111E1F", fontFamily: "inherit",
}
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

// ── Single-date bottom-sheet calendar ─────────────────────────────────────────

function DOBCalendarSheet({ value, onChange, onClose }) {
  const today = new Date()
  const init = value ? new Date(value + "T00:00:00") : new Date(2000, 0, 1)
  const [viewYear, setViewYear] = useState(init.getFullYear())
  const [viewMonth, setViewMonth] = useState(init.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d))

  const selectedDate = value ? new Date(value + "T00:00:00") : null
  const isSame = (d) => selectedDate && d.toDateString() === selectedDate.toDateString()
  const isFuture = (d) => d > today

  const selectDay = (d) => {
    if (isFuture(d)) return
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    onChange(`${yyyy}-${mm}-${dd}`)
    onClose()
  }

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100 }} />

      {/* sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1101,
        background: "white", borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        padding: "0 0 24px",
        maxWidth: 420, margin: "0 auto",
      }}>
        {/* drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, background: "#D1E8E8", borderRadius: 2 }} />
        </div>

        {/* title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 20px 14px" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111E1F" }}>Select Date of Birth</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>

        {/* month/year nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px" }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D7377", fontSize: 20, lineHeight: 1, padding: "0 8px" }}>‹</button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={viewMonth}
              onChange={e => setViewMonth(Number(e.target.value))}
              style={{ border: "none", background: "none", fontSize: 14, fontWeight: 700, color: "#111E1F", cursor: "pointer", outline: "none" }}
            >
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={viewYear}
              onChange={e => setViewYear(Number(e.target.value))}
              style={{ border: "none", background: "none", fontSize: 14, fontWeight: 700, color: "#111E1F", cursor: "pointer", outline: "none" }}
            >
              {Array.from({ length: 120 }, (_, i) => today.getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D7377", fontSize: 20, lineHeight: 1, padding: "0 8px" }}>›</button>
        </div>

        {/* day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 16px", marginBottom: 4 }}>
          {DAYS_SHORT.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748B", padding: "2px 0" }}>{d}</div>
          ))}
        </div>

        {/* day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, padding: "0 16px" }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const selected = isSame(d)
            const future = isFuture(d)
            return (
              <div
                key={i}
                onClick={() => selectDay(d)}
                style={{
                  textAlign: "center", padding: "7px 0", fontSize: 13,
                  cursor: future ? "default" : "pointer",
                  borderRadius: "50%",
                  background: selected ? "#0D7377" : "transparent",
                  color: selected ? "white" : future ? "#CBD5E1" : "#111E1F",
                  fontWeight: selected ? 700 : 400,
                }}
              >
                {d.getDate()}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

function AddFamilyModal({ show, handleClose, onClose }) {
  const close = onClose || handleClose

  const currentPatient = (() => {
    try { return JSON.parse(localStorage.getItem("consultPatientData")) || {} } catch { return {} }
  })()
  const doctorId = (() => {
    try { return JSON.parse(localStorage.getItem("data"))?.data?._id || "" } catch { return "" }
  })()

  const [form, setForm] = useState({
    name: "", email: "",
    phone: currentPatient.phone || "",
    DOB: "",
    gender: "",
    medicareNumber: currentPatient.medicareNumber || "",
    address: currentPatient.address || "",
    city: currentPatient.city || "",
    state: currentPatient.state || "",
    zipCode: currentPatient.zipCode || "",
  })
  const [consultCategory, setConsultCategory] = useState("")
  const [consultType, setConsultType] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showDOBPicker, setShowDOBPicker] = useState(false)

  if (!show) return null

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const fmtDOB = (iso) => {
    if (!iso) return ""
    const [y, m, d] = iso.split("-")
    return `${d} ${MONTHS[parseInt(m, 10) - 1]} ${y}`
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name is required."); return }
    if (!form.email.trim()) { setError("Email is required."); return }
    if (!form.DOB) { setError("Date of birth is required."); return }
    if (!form.gender) { setError("Gender is required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`${BASE_URL}/patient/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(), email: form.email.trim(),
          phone: form.phone.trim(), DOB: form.DOB,
          gender: form.gender.toLowerCase(),
          medicareNumber: form.medicareNumber,
          address: form.address.trim(), city: form.city.trim(),
          state: form.state.trim(), zipCode: form.zipCode.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || "Failed to register family member."); setSaving(false); return }

      const newPatientId = data.data?._id
      if (newPatientId && consultCategory && consultType) {
        await fetch(`${BASE_URL}/consultations/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: newPatientId, doctorId, consultationCategory: consultCategory, type: consultType, notes: "Consultation for family member" }),
        })
      }
      setSuccess(true)
    } catch {
      setError("Network error. Please try again.")
    }
    setSaving(false)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111E1F" }}>Add Family Member</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Register a new patient linked to this consultation</div>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111E1F", marginBottom: 6 }}>Family member registered</div>
              {consultCategory && <div style={{ fontSize: 13, color: "#64748B" }}>Consultation created for {form.name}.</div>}
              <button onClick={close} style={{ marginTop: 20, background: "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Done
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ fontSize: 12, fontWeight: 700, color: "#0D7377", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: -4 }}>Personal Details</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Full Name *">
                  <input style={inputStyle} type="text" value={form.name} onChange={set("name")} placeholder="Jane Smith" />
                </Field>
                <Field label="Email *">
                  <input style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" />
                </Field>
                <Field label="Phone">
                  <input style={inputStyle} type="tel" value={form.phone} onChange={set("phone")} placeholder="+61 4xx xxx xxx" />
                </Field>

                {/* DOB with calendar icon */}
                <Field label="Date of Birth *">
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer", paddingRight: 36,
                        color: form.DOB ? "#111E1F" : "#94A3B8",
                      }}
                      onClick={() => setShowDOBPicker(true)}
                    >
                      {form.DOB ? fmtDOB(form.DOB) : "Select date of birth"}
                    </div>
                    <button
                      onClick={() => setShowDOBPicker(true)}
                      style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#0D7377", display: "flex", alignItems: "center", padding: 0,
                      }}
                    >
                      <CalendarIcon />
                    </button>
                  </div>
                </Field>

                <Field label="Gender *">
                  <select style={inputStyle} value={form.gender} onChange={set("gender")}>
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Medicare Number">
                  <input style={inputStyle} type="text" value={form.medicareNumber} onChange={set("medicareNumber")} placeholder="xxxx xxxxx x" />
                </Field>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: "#0D7377", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: -4 }}>Address</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Street Address">
                    <input style={inputStyle} type="text" value={form.address} onChange={set("address")} placeholder="123 Main St" />
                  </Field>
                </div>
                <Field label="City">
                  <input style={inputStyle} type="text" value={form.city} onChange={set("city")} placeholder="Sydney" />
                </Field>
                <Field label="State">
                  <input style={inputStyle} type="text" value={form.state} onChange={set("state")} placeholder="NSW" />
                </Field>
                <Field label="Postcode">
                  <input style={inputStyle} type="text" value={form.zipCode} onChange={set("zipCode")} placeholder="2000" />
                </Field>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: "#0D7377", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: -4 }}>
                Consultation <span style={{ fontWeight: 400, color: "#94A3B8", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Category">
                  <select style={inputStyle} value={consultCategory} onChange={e => setConsultCategory(e.target.value)}>
                    <option value="">No consultation</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Type">
                  <select style={inputStyle} value={consultType} onChange={e => setConsultType(e.target.value)} disabled={!consultCategory}>
                    <option value="">Select type</option>
                    {CALL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#EF4444" }}>{error}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={close} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#64748B" }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  background: saving ? "#94A3B8" : "#0D7377",
                  color: "white", border: "none", borderRadius: 8,
                  padding: "8px 24px", fontSize: 13, fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Registering…" : "Register Member"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DOB bottom sheet — rendered above the modal */}
      {showDOBPicker && (
        <DOBCalendarSheet
          value={form.DOB}
          onChange={(iso) => setForm(prev => ({ ...prev, DOB: iso }))}
          onClose={() => setShowDOBPicker(false)}
        />
      )}
    </div>
  )
}

export default AddFamilyModal
