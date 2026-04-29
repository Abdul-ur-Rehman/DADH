import React from "react"

function PatientNotesPanel({ notes, onChange, onToggleScribe, isScribing }) {
  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #D1E8E8" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111E1F" }}>Patient notes</span>
        <button
          onClick={onToggleScribe}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: isScribing ? "#EF4444" : "#0D7377" }}
        >
          {isScribing ? "⏹ Stop Scribe" : "🎙 AI Scribe"}
        </button>
      </div>
      {isScribing && (
        <div style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8", padding: "6px 16px", fontSize: 12, color: "#0D7377" }}>
          ● Recording — speak clearly…
        </div>
      )}
      <textarea
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder="Start typing clinical notes here…"
        style={{ flex: 1, border: "none", outline: "none", resize: "none", padding: "14px 16px", fontSize: 14, color: "#111E1F", background: "transparent", minHeight: 240, fontFamily: "inherit" }}
      />
    </div>
  )
}

export default PatientNotesPanel
