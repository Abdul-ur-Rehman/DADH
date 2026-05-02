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

function InvestigateModal({ onClose }) {
  const [type, setType] = useState("Radiology")
  const [investigations, setInvestigations] = useState("")
  const [note, setNote] = useState("")

  const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block" }

  return (
    <ModalShell title="Investigate" onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Investigation type</label>
        <select style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
          <option>Radiology</option><option>Pathology</option><option>Cardiology</option><option>Other</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Investigations</label>
          <textarea style={{ ...inputStyle, minHeight: 180, resize: "vertical" }} value={investigations} onChange={e => setInvestigations(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Note</label>
          <textarea style={{ ...inputStyle, minHeight: 180, resize: "vertical" }} value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <button onClick={onClose} style={{ width: "100%", background: "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        Order
      </button>
    </ModalShell>
  )
}

export default InvestigateModal
