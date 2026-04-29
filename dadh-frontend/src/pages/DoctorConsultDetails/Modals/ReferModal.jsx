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

function ReferModal({ onClose }) {
  const [specialist, setSpecialist] = useState("")
  const [message, setMessage] = useState("")

  const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block" }

  return (
    <ModalShell title="Refer" onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Specialist name or category</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
          <input style={{ ...inputStyle, paddingLeft: 32 }} value={specialist} onChange={e => setSpecialist(e.target.value)} placeholder="Search…" />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Referral message</label>
          <button style={{ background: "none", border: "none", color: "#0D7377", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>AI Generate</button>
        </div>
        <textarea style={{ ...inputStyle, minHeight: 200, resize: "vertical" }} value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <button onClick={onClose} style={{ width: "100%", background: "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        Refer
      </button>
    </ModalShell>
  )
}

export default ReferModal
