import React, { useState } from "react"
import ActionIconRow from "./ActionIconRow"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function PatientHeaderCard({ patient, onAction, onAddFamily }) {
  const [allergies, setAllergies] = useState(patient.allergies || "NKDA")
  const [saving, setSaving] = useState(false)

  const handleAllergyBlur = async (e) => {
    e.target.style.borderColor = "#D1E8E8"
    const trimmed = allergies.trim()
    if (trimmed === (patient.allergies || "")) return
    setSaving(true)
    try {
      await fetch(`${BASE_URL}/patient/auth/update/${patient._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergies: trimmed }),
      })
    } catch (e) {
      console.error("Allergy update error:", e)
    }
    setSaving(false)
  }

  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
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
            <a href={`tel:${patient.phone}`} style={{ color: "#0D7377", textDecoration: "none", fontWeight: 500, fontSize: 13, marginLeft: 10 }}>
              {patient.phone}
            </a>
          )}
        </div>
        <button onClick={onAddFamily} style={{ background: "none", border: "1px solid #0D7377", color: "#0D7377", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
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
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            Allergies
            {saving && <span style={{ fontSize: 10, color: "#94A3B8" }}>saving…</span>}
          </div>
          <input
            type="text"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            onBlur={handleAllergyBlur}
            placeholder="NKDA"
            style={{
              width: "100%", background: "#F8FFFE", border: "1px solid #D1E8E8", borderRadius: 6,
              padding: "8px 12px", fontSize: 13, color: "#111E1F", minHeight: 48,
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
            onFocus={e => { e.target.style.borderColor = "#0D7377" }}
          />
        </div>
      </div>
    </div>
  )
}

export default PatientHeaderCard
