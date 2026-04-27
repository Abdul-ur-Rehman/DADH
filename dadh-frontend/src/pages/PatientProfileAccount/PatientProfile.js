import React, { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"
const STATIC_URL = BASE_URL.replace(/\/api$/, "")

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"
}

function fmtDate(d) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) }
  catch { return "—" }
}

function fmtDateInput(d) {
  if (!d) return ""
  try { return new Date(d).toISOString().split("T")[0] }
  catch { return "" }
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  teal:      "#0D7377",
  tealLight: "#F0FDFA",
  border:    "#D1E8E8",
  fg:        "#111E1F",
  muted:     "#4B7172",
  mutedBg:   "#E6F4F4",
  white:     "#ffffff",
  success:   "#22C55E",
}

// ─── Field component (view or input) ─────────────────────────────────────────
function Field({ label, value, editValue, editMode, type = "text", onChange, options, span }) {
  const inputBase = {
    width: "100%",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    color: T.fg,
    outline: "none",
    fontFamily: "inherit",
    background: T.white,
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  }

  return (
    <div style={{ gridColumn: span === 2 ? "span 2" : undefined }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      {editMode ? (
        options ? (
          <select
            value={editValue || ""}
            onChange={(e) => onChange(e.target.value)}
            style={inputBase}
          >
            <option value="">Select…</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={type === "date" ? fmtDateInput(editValue) : (editValue || "")}
            onChange={(e) => onChange(e.target.value)}
            style={inputBase}
            onFocus={(e) => (e.target.style.borderColor = T.teal)}
            onBlur={(e) => (e.target.style.borderColor = T.border)}
          />
        )
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: T.fg, fontWeight: 500, minHeight: 22 }}>
          {type === "date" ? fmtDate(value) : (value || "—")}
        </p>
      )}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children, action }) {
  return (
    <div style={{ background: T.white, borderRadius: 12, border: `1px solid ${T.border}`, padding: "24px 28px", marginBottom: 20, boxShadow: "0 1px 4px rgba(13,115,119,0.06)" }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {title && (
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {title}
            </p>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", disabled, style: extraStyle }) {
  const [hovered, setHovered] = useState(false)
  const base = {
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.15s",
    fontFamily: "inherit",
    opacity: disabled ? 0.6 : 1,
    ...extraStyle,
  }
  const styles = {
    primary: { background: hovered && !disabled ? "#0A5F62" : T.teal, color: T.white },
    ghost:   { background: hovered && !disabled ? T.tealLight : "transparent", color: T.teal, border: `1px solid ${T.border}` },
    danger:  { background: hovered && !disabled ? "#DC2626" : "#EF4444", color: T.white },
    success: { background: hovered && !disabled ? "#16A34A" : T.success, color: T.white },
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...styles[variant] }}
    >
      {children}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PatientProfile() {
  const location = useLocation()
  const passedId = location.state?.patientId
  const [patientId] = useState(() => passedId || localStorage.getItem("PatientId") || "")

  const [patientData, setPatientData] = useState({})
  const [editedPatient, setEditedPatient] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)

  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [avatarHovered, setAvatarHovered] = useState(false)
  const fileInputRef = useRef(null)

  const set = (field) => (value) => setEditedPatient((p) => ({ ...p, [field]: value }))

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!patientId) { setError("Patient ID not found."); setLoading(false); return }
    fetch(`${BASE_URL}/patient/auth/getOneById/${patientId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.state || !json.data) throw new Error("Failed to load profile")
        setPatientData(json.data)
        setEditedPatient(json.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [patientId])

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaveOk(false)
    try {
      const res = await fetch(`${BASE_URL}/patient/auth/update/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedPatient.name,
          email: editedPatient.email,
          phone: editedPatient.phone,
          city: editedPatient.city,
          state: editedPatient.state,
          DOB: editedPatient.DOB,
          medicareNumber: editedPatient.medicareNumber,
          gender: editedPatient.gender,
          zipCode: editedPatient.zipCode,
          address: editedPatient.address,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.state) throw new Error(json.message || `Save failed`)
      setPatientData(json.data || editedPatient)
      setEditedPatient(json.data || editedPatient)
      setEditMode(false)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (e) {
      alert(`Save failed: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert("Photo must be under 5 MB."); return }

    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploadingPhoto(true)
    try {
      const form = new FormData()
      form.append("profileImage", file)
      const res = await fetch(`${BASE_URL}/patient/auth/upload-photo/${patientId}`, {
        method: "PATCH",
        body: form,
      })
      const json = await res.json()
      if (!res.ok || !json.state) throw new Error(json.message || "Upload failed")
      setPatientData((p) => ({ ...p, profileImage: json.data.profileImage }))
      setPhotoPreview(null)
    } catch (e) {
      alert(`Photo upload failed: ${e.message}`)
      setPhotoPreview(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dadh-tw-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ textAlign: "center", color: T.muted }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTopColor: T.teal, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: 13 }}>Loading profile…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dadh-tw-root" style={{ padding: 32, textAlign: "center", color: "#EF4444" }}>
        <p style={{ fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  const avatarSrc = photoPreview || (patientData.profileImage ? `${STATIC_URL}${patientData.profileImage}` : null)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dadh-tw-root" style={{ maxWidth: 780, margin: "0 auto" }}>

      {/* ── Profile header card ── */}
      <SectionCard>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>

          {/* Avatar with upload overlay */}
          <div
            style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
            title="Click to change photo"
          >
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: T.mutedBg, border: `3px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {uploadingPhoto ? (
                <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.teal, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : avatarSrc ? (
                <img src={avatarSrc} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 700, color: T.teal }}>{getInitials(patientData.name)}</span>
              )}
            </div>
            {/* Hover overlay */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.42)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: avatarHovered && !uploadingPhoto ? 1 : 0, transition: "opacity 0.2s",
            }}>
              <span style={{ fontSize: 18 }}>📷</span>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 600, marginTop: 2 }}>Change</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.fg }}>{patientData.name || "—"}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.muted }}>Patient</span>
              {patientData.medicareNumber && (
                <span style={{ fontSize: 11, background: T.mutedBg, color: T.teal, padding: "2px 10px", borderRadius: 12, fontWeight: 600 }}>
                  Medicare: {patientData.medicareNumber}
                </span>
              )}
              {saveOk && (
                <span style={{ fontSize: 11, background: "#DCFCE7", color: "#16A34A", padding: "2px 10px", borderRadius: 12, fontWeight: 600 }}>
                  ✓ Profile saved
                </span>
              )}
            </div>
          </div>

        </div>
      </SectionCard>

      {/* ── Personal information ── */}
      <SectionCard title="Personal Information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>
          <Field label="Full Name"      value={patientData.name}          editValue={editedPatient.name}    editMode={editMode} onChange={set("name")} />
          <Field label="Email Address"  value={patientData.email}         editValue={editedPatient.email}   editMode={editMode} onChange={set("email")} type="email" />
          <Field label="Phone Number"   value={patientData.phone}         editValue={editedPatient.phone}   editMode={editMode} onChange={set("phone")} type="tel" />
          <Field label="Gender"         value={patientData.gender}        editValue={editedPatient.gender}  editMode={editMode} onChange={set("gender")}
            options={[
              { value: "male",        label: "Male" },
              { value: "female",      label: "Female" },
              { value: "undisclosed", label: "Prefer not to say" },
            ]}
          />
          <Field label="Date of Birth"    value={patientData.DOB}           editValue={editedPatient.DOB}     editMode={editMode} onChange={set("DOB")} type="date" />
          <Field label="Medicare Number"  value={patientData.medicareNumber} editValue={editedPatient.medicareNumber} editMode={editMode} onChange={set("medicareNumber")} />
        </div>
      </SectionCard>

      {/* ── Address ── */}
      <SectionCard title="Address">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>
          <div style={{ gridColumn: "span 2" }}>
            <Field label="Street Address"  value={patientData.address}  editValue={editedPatient.address}  editMode={editMode} onChange={set("address")} />
          </div>
          <Field label="City"     value={patientData.city}    editValue={editedPatient.city}    editMode={editMode} onChange={set("city")} />
          <Field label="State"    value={patientData.state}   editValue={editedPatient.state}   editMode={editMode} onChange={set("state")} />
          <div style={{ gridColumn: "span 2" }}>
            <Field label="Postcode"  value={patientData.zipCode}  editValue={editedPatient.zipCode}  editMode={editMode} onChange={set("zipCode")} />
          </div>
        </div>
      </SectionCard>

      {/* Action bar — toggles between Edit and Save/Cancel */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 16 }}>
        {editMode ? (
          <>
            <Btn variant="ghost" onClick={() => { setEditMode(false); setEditedPatient(patientData) }}>Cancel</Btn>
            <Btn variant="success" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Btn>
          </>
        ) : (
          <Btn onClick={() => setEditMode(true)}>Edit Profile</Btn>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
