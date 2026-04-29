import React, { useState, useEffect, useRef } from "react"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function SectionCard({ title, children }) {
  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #D1E8E8", fontWeight: 700, fontSize: 15, color: "#111E1F" }}>{title}</div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#111E1F" }

function DoctorSettings() {
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id
  const sendBirdId = localStorage.getItem("sendBirdUserId")
  const apiId = doctorId || sendBirdId

  const [profile, setProfile] = useState({ name: "", surname: "", email: "", phone: "", doctorType: "", qualification: "" })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    if (!apiId) return
    fetch(`${BASE_URL}/doctor-requests/getOneById/${apiId}`)
      .then(r => r.json())
      .then(result => {
        if (isMountedRef.current && result.data) {
          const d = result.data
          setProfile({ name: d.name || "", surname: d.surname || "", email: d.email || "", phone: d.phone || "", doctorType: d.doctorType || "", qualification: d.qualification || "" })
        }
      })
      .catch(() => {})
    return () => { isMountedRef.current = false }
  }, [apiId])

  const saveProfile = async () => {
    if (!apiId) return
    setSaving(true)
    try {
      await fetch(`${BASE_URL}/doctor-requests/update/${apiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const set = (key) => (e) => setProfile(p => ({ ...p, [key]: e.target.value }))

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh", maxWidth: 800 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Settings</h2>

        {saved && (
          <div style={{ background: "#F0FDF4", border: "1px solid #22C55E", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#166534", fontSize: 13 }}>
            ✓ Profile saved
          </div>
        )}

        <SectionCard title="Profile">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="First Name"><input style={inputStyle} value={profile.name} onChange={set("name")} /></Field>
            <Field label="Last Name"><input style={inputStyle} value={profile.surname} onChange={set("surname")} /></Field>
            <Field label="Email"><input style={inputStyle} type="email" value={profile.email} onChange={set("email")} /></Field>
            <Field label="Phone"><input style={inputStyle} value={profile.phone} onChange={set("phone")} /></Field>
            <Field label="Doctor Type">
              <select style={inputStyle} value={profile.doctorType} onChange={set("doctorType")}>
                {["", "General Practitioner", "Specialist", "Hospital Doctor", "Clinic Doctor", "VR", "GP Fellow", "GP Registrar"].map(t => <option key={t} value={t}>{t || "Select…"}</option>)}
              </select>
            </Field>
            <Field label="Qualification"><input style={inputStyle} value={profile.qualification} onChange={set("qualification")} /></Field>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{ background: saving ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </SectionCard>

        <SectionCard title="Availability">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#111E1F" }}>Status:</span>
            <button
              onClick={() => setIsOnline(o => !o)}
              style={{
                background: isOnline ? "#22C55E" : "#94A3B8", color: "white", border: "none",
                borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {isOnline ? "● Online" : "○ Offline"}
            </button>
            <span style={{ fontSize: 12, color: "#64748B" }}>
              {isOnline ? "Patients can book consultations with you" : "You will not appear in the queue"}
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Security">
          <Field label="Current Password"><input style={inputStyle} type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="New Password"><input style={inputStyle} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} /></Field>
            <Field label="Confirm New Password"><input style={inputStyle} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} /></Field>
          </div>
          <button style={{ background: "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
            Change Password
          </button>
        </SectionCard>
      </div>
    </DoctorAppLayout>
  )
}

export default DoctorSettings
