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

// ── Profile picture ──────────────────────────────────────────────────────────
function ProfilePicture({ currentPhoto, onSave }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(currentPhoto || "")
  const [photoSaving, setPhotoSaving] = useState(false)
  const [photoSaved, setPhotoSaved] = useState(false)
  const [changed, setChanged] = useState(false)

  // sync if parent loads photo after mount
  const prevPhoto = useRef(currentPhoto)
  if (currentPhoto !== prevPhoto.current && !changed) {
    prevPhoto.current = currentPhoto
    setPreview(currentPhoto || "")
  }

  const resizeAndConvert = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 300
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width; canvas.height = height
        canvas.getContext("2d").drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL("image/jpeg", 0.85).replace("data:image/jpeg;base64,", ""))
      }
      img.src = url
    })
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const base64 = await resizeAndConvert(file)
    setPreview(base64)
    setChanged(true)
  }

  const handleSave = async () => {
    setPhotoSaving(true)
    await onSave(preview)
    setPhotoSaving(false)
    setPhotoSaved(true)
    setChanged(false)
    setTimeout(() => setPhotoSaved(false), 3000)
  }

  const initials = ""

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {/* Avatar */}
      <div
        onClick={() => fileRef.current.click()}
        style={{
          width: 96, height: 96, borderRadius: "50%", cursor: "pointer",
          border: "2px solid #D1E8E8", overflow: "hidden", flexShrink: 0,
          background: preview ? "transparent" : "#F0FDFA",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
        title="Click to change photo"
      >
        {preview ? (
          <img
            src={preview.startsWith("data:") ? preview : `data:image/jpeg;base64,${preview}`}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 32, color: "#0D7377" }}>👤</span>
        )}
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, background: "rgba(13,115,119,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <span style={{ color: "white", fontSize: 11, fontWeight: 600 }}>Change</span>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: "none" }} onChange={handleFile} />

      <div>
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>
          Click the avatar to pick a new photo. JPG or PNG, max 5 MB. Resized automatically to 300 × 300.
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={handleSave}
            disabled={photoSaving || !changed}
            style={{ background: photoSaving || !changed ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: photoSaving || !changed ? "not-allowed" : "pointer" }}
          >
            {photoSaving ? "Saving…" : "Save Photo"}
          </button>
          {photoSaved && <span style={{ fontSize: 13, color: "#166534" }}>✓ Photo saved</span>}
        </div>
      </div>
    </div>
  )
}

// ── Signature pad ────────────────────────────────────────────────────────────
function SignaturePad({ onSave, currentSignature }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [tab, setTab] = useState("draw") // "draw" | "upload"
  const [sigSaving, setSigSaving] = useState(false)
  const [sigSaved, setSigSaved] = useState(false)
  const fileRef = useRef(null)
  const lastPos = useRef(null)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    lastPos.current = pos
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#111E1F"
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    setHasStrokes(true)
  }

  const stopDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Scale to fit canvas keeping aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const x = (canvas.width - img.width * scale) / 2
        const y = (canvas.height - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        setHasStrokes(true)
        setTab("draw")
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const saveSignature = async () => {
    const canvas = canvasRef.current
    // Export only the drawn portion as PNG, stripping the data:image/png;base64, prefix
    const dataUrl = canvas.toDataURL("image/png")
    const base64 = dataUrl.replace("data:image/png;base64,", "")
    setSigSaving(true)
    await onSave(base64)
    setSigSaving(false)
    setSigSaved(true)
    setTimeout(() => setSigSaved(false), 3000)
  }

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        background: "none", border: "none", padding: "8px 16px", fontSize: 13, fontWeight: 600,
        cursor: "pointer", color: tab === key ? "#0D7377" : "#64748B",
        borderBottom: tab === key ? "2px solid #0D7377" : "2px solid transparent",
        marginBottom: -1,
      }}
    >{label}</button>
  )

  return (
    <div>
      {/* Current signature preview */}
      {currentSignature && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Current Signature</div>
          <div style={{ border: "1px solid #D1E8E8", borderRadius: 8, padding: 12, background: "#F8FFFE", display: "inline-block" }}>
            <img
              src={`data:image/png;base64,${currentSignature}`}
              alt="Current signature"
              style={{ height: 60, display: "block" }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #D1E8E8", marginBottom: 16, display: "flex" }}>
        {tabBtn("draw", "Draw Signature")}
        {tabBtn("upload", "Upload Image")}
      </div>

      {tab === "draw" && (
        <div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Draw your signature in the box below using your mouse or touchscreen.</div>
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            style={{
              border: "1.5px dashed #0D7377", borderRadius: 8, cursor: "crosshair",
              background: "white", display: "block", width: "100%", maxWidth: 560, touchAction: "none",
            }}
          />
        </div>
      )}

      {tab === "upload" && (
        <div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Upload a PNG or JPG image of your signature.</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current.click()}
            style={{ border: "1.5px dashed #0D7377", borderRadius: 8, padding: "28px 40px", background: "#F0FDFA", cursor: "pointer", fontSize: 13, color: "#0D7377", fontWeight: 600, width: "100%", maxWidth: 560 }}
          >
            Click to choose an image file
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        <button
          onClick={saveSignature}
          disabled={sigSaving || !hasStrokes}
          style={{ background: sigSaving || !hasStrokes ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 14, fontWeight: 600, cursor: sigSaving || !hasStrokes ? "not-allowed" : "pointer" }}
        >
          {sigSaving ? "Saving…" : "Save Signature"}
        </button>
        {tab === "draw" && (
          <button
            onClick={clearCanvas}
            style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: "#64748B" }}
          >
            Clear
          </button>
        )}
        {sigSaved && <span style={{ fontSize: 13, color: "#166534" }}>✓ Signature saved</span>}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
function DoctorSettings() {
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id
  const sendBirdId = localStorage.getItem("sendBirdUserId")
  const apiId = doctorId || sendBirdId

  const [profile, setProfile] = useState({ name: "", surname: "", email: "", phone: "", doctorType: "", qualification: "" })
  const [currentPhoto, setCurrentPhoto] = useState("")
  const [currentSignature, setCurrentSignature] = useState("")
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
          setCurrentPhoto(d.photo || "")
          setCurrentSignature(d.signature || "")
        }
      })
      .catch(() => {})
    return () => { isMountedRef.current = false }
  }, [apiId])

  const saveProfile = async () => {
    if (!apiId) return
    setSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/doctor-requests/update-doctor/${apiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        try {
          const stored = JSON.parse(localStorage.getItem("data")) || {}
          stored.data = { ...(stored.data || {}), name: profile.name, surname: profile.surname }
          localStorage.setItem("data", JSON.stringify(stored))
          window.dispatchEvent(new CustomEvent("doctorProfileUpdated"))
        } catch {}
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const savePhoto = async (base64) => {
    if (!apiId) return
    try {
      const res = await fetch(`${BASE_URL}/doctor-requests/update-doctor/${apiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: base64 }),
      })
      if (res.ok) {
        setCurrentPhoto(base64)
        try {
          const stored = JSON.parse(localStorage.getItem("data")) || {}
          stored.data = { ...(stored.data || {}), photo: base64 }
          localStorage.setItem("data", JSON.stringify(stored))
          window.dispatchEvent(new CustomEvent("doctorProfileUpdated"))
        } catch {}
      }
    } catch {}
  }

  const saveSignature = async (base64) => {
    if (!apiId) return
    try {
      await fetch(`${BASE_URL}/doctor-requests/update-doctor/${apiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: base64 }),
      })
      setCurrentSignature(base64)
    } catch {}
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

        <SectionCard title="Profile Picture">
          <ProfilePicture currentPhoto={currentPhoto} onSave={savePhoto} />
        </SectionCard>

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

        <SectionCard title="Signature">
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16, marginTop: 0 }}>
            Your signature will appear on medical certificates you generate for patients. Draw it freehand or upload an image.
          </p>
          <SignaturePad onSave={saveSignature} currentSignature={currentSignature} />
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
