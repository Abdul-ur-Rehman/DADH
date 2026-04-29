import React from "react"
import ActionIconRow from "./ActionIconRow"

function PatientHeaderCard({ patient, onAction }) {
  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #D1E8E8" }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0D7377", textDecoration: "underline", cursor: "pointer" }}>
            {patient.name}
          </span>
          {patient.age && (
            <span style={{ fontSize: 15, color: "#64748B", marginLeft: 10 }}>{patient.age}</span>
          )}
          {patient.gender && (
            <span style={{ fontSize: 15, color: "#64748B", marginLeft: 6 }}>{patient.gender}</span>
          )}
          {patient.phone && (
            <span style={{ fontSize: 13, color: "#64748B", marginLeft: 10 }}>{patient.phone}</span>
          )}
        </div>
        <button style={{ background: "none", border: "1px solid #0D7377", color: "#0D7377", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
          + Add family
        </button>
      </div>

      <ActionIconRow onAction={onAction} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "14px 20px" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Address</div>
          <div style={{ background: "#F8FFFE", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#111E1F", minHeight: 48 }}>
            {patient.address || "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Allergies</div>
          <div style={{ background: "#F8FFFE", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#111E1F", minHeight: 48 }}>
            {patient.allergies || "NKDA"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientHeaderCard
