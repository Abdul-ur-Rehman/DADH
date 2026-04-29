import React, { useState } from "react"

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

function PrescribeModal({ onClose, consultationId }) {
  const [searchType, setSearchType] = useState("product")
  const [medication, setMedication] = useState("")
  const [dose, setDose] = useState("")
  const [quantity, setQuantity] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")
  const [instructions, setInstructions] = useState("")
  const [brandName, setBrandName] = useState(false)

  const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block" }

  const handlePrescribe = () => {
    // TODO: wire to backend prescribe endpoint when available
    alert(`Prescribing: ${medication} ${dose}`)
    onClose()
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
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Instructions (optional)</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={instructions} onChange={e => setInstructions(e.target.value)} />
      </div>
      <button onClick={handlePrescribe} style={{ width: "100%", background: "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        Prescribe
      </button>
    </ModalShell>
  )
}

export default PrescribeModal
