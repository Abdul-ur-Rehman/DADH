import React, { useState } from "react"
import { sendChatNotification } from "../../../utils/sendbirdNotify"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111E1F" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  )
}

function PrescribeModal({ onClose, consultationId, patientId }) {
  const [searchType, setSearchType] = useState("product")
  const [medication, setMedication] = useState("")
  const [dose, setDose] = useState("")
  const [quantity, setQuantity] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")
  const [instructions, setInstructions] = useState("")
  const [brandName, setBrandName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block" }

  const handlePrescribe = async () => {
    if (!medication.trim() || !dose.trim() || !quantity.trim() || !frequency || !duration) {
      setError("Please fill in all required fields.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`${BASE_URL}/consultations/prescribtion/add/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_id: medication,
          dose,
          quantity,
          frequency,
          duration,
          instruction: instructions,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Failed to save prescription.")
        setSaving(false)
        return
      }

      // Send Sendbird notification to patient
      const doctorSbUserId = localStorage.getItem("sendBirdUserId") || ""
      const parts = [`💊 Prescription: ${medication} ${dose}`]
      if (quantity) parts.push(`Qty: ${quantity}`)
      if (frequency) parts.push(frequency)
      if (duration) parts.push(duration)
      if (instructions) parts.push(`Note: ${instructions}`)
      await sendChatNotification(doctorSbUserId, patientId, parts.join(" · "))
      window.dispatchEvent(new CustomEvent("consultChatRefresh"))

      onClose()
    } catch (e) {
      setError("Network error. Please try again.")
    }
    setSaving(false)
  }

  return (
    <ModalShell title="Prescribe Medication" onClose={onClose}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center" }}>
        {["product", "ingredient"].map(t => (
          <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <input type="radio" value={t} checked={searchType === t} onChange={() => setSearchType(t)} />
            {t === "product" ? "Product Name" : "Active Ingredient"}
          </label>
        ))}
        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={brandName} onChange={e => setBrandName(e.target.checked)} />
          Include brand name on script
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Search a medication</label>
        <input style={inputStyle} value={medication} onChange={e => setMedication(e.target.value)} placeholder="Start typing…" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Dose</label>
          <input style={inputStyle} value={dose} onChange={e => setDose(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Quantity</label>
          <input style={inputStyle} value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Frequency</label>
          <select style={inputStyle} value={frequency} onChange={e => setFrequency(e.target.value)}>
            <option value="">Select…</option>
            <option>Once daily</option><option>Twice daily</option><option>Three times daily</option>
            <option>Four times daily</option><option>As needed (PRN)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Duration</label>
          <select style={inputStyle} value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="">Select…</option>
            <option>3 days</option><option>5 days</option><option>7 days</option>
            <option>14 days</option><option>1 month</option><option>3 months</option><option>6 months</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Instructions (optional)</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={instructions} onChange={e => setInstructions(e.target.value)} />
      </div>

      {error && <div style={{ marginBottom: 12, fontSize: 13, color: "#EF4444" }}>{error}</div>}

      <button
        onClick={handlePrescribe}
        disabled={saving}
        style={{ width: "100%", background: saving ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
      >
        {saving ? "Saving…" : "Prescribe"}
      </button>
    </ModalShell>
  )
}

export default PrescribeModal
