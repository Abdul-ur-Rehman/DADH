import React from "react"

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)

const AudioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
  </svg>
)

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

function getTypeIcon(type) {
  if (type === "videoCall") return <VideoIcon />
  if (type === "phoneCall") return <AudioIcon />
  return <ChatIcon />
}

function PatientQueueRow({ patient, isFirst, onClick }) {
  const desc = patient.notes || ""
  const truncated = desc.length > 100 ? desc.slice(0, 100) + "…" : desc
  const category = patient.consultationCategoryName || "General"
  const label = truncated ? `${category}: ${truncated}` : category

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: isFirst ? "#F0FDFA" : "white",
        border: isFirst ? "1px solid #0D7377" : "1px solid #E2E8F0",
        borderLeft: isFirst ? "3px solid #0D7377" : "3px solid transparent",
        borderRadius: 8, padding: "12px 14px", cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,115,119,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ flexShrink: 0, width: 28, display: "flex", justifyContent: "center" }}>
        {getTypeIcon(patient.type)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#111E1F" }}>
            {patient.patientName}{patient.patientAge ? `, ${patient.patientAge}` : ""}{patient.patientGender ? `, ${patient.patientGender}` : ""}
          </span>
          {patient.consultationCategory === "medicalCertificate" && (
            <span style={{ fontSize: 11, background: "#F0FDFA", color: "#0D7377", border: "1px solid #0D7377", borderRadius: 12, padding: "1px 8px", fontWeight: 600 }}>Express</span>
          )}
          {patient.requiresMedicalCertificate && (
            <span style={{ fontSize: 11, background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 12, padding: "1px 8px", fontWeight: 600 }}>📋 Med Certificate</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </div>
      </div>

      <div style={{ flexShrink: 0, fontSize: 12, color: "#64748B", marginRight: 8, whiteSpace: "nowrap" }}>
        {patient.timeAgo}
      </div>

      <div style={{ flexShrink: 0, color: "#94A3B8", fontSize: 18 }}>›</div>
    </div>
  )
}

export default PatientQueueRow
