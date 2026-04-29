import React, { useEffect, useRef } from "react"

function IntakeCard({ label, value }) {
  if (!value) return null
  return (
    <div style={{ background: "#F0FDFA", border: "1px solid #D1E8E8", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#111E1F", fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function ChatHistoryPanel({ patient, messages, consultEnded }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const consultType = patient?.type === "videoCall" ? "Video" : patient?.type === "phoneCall" ? "Audio" : "Chat"

  return (
    <div style={{ width: "35%", flexShrink: 0, background: "white", border: "1px solid #D1E8E8", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #D1E8E8", fontWeight: 700, fontSize: 15, color: "#111E1F" }}>
        Chat history
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        <div style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Your consult has started</div>

        {patient && (
          <>
            <IntakeCard label="Date of birth" value={patient.DOB} />
            <IntakeCard label="Symptom or Condition" value={patient.consultationCategory} />
            <IntakeCard label="Additional information" value={patient.notes} />
            <IntakeCard label="Allergies" value={patient.allergies} />
            <IntakeCard label="Consultation type" value={consultType} />
          </>
        )}

        {(messages || []).map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{m.senderName}</div>
            <div style={{ background: m.isDoctor ? "#F0FDFA" : "white", border: "1px solid #D1E8E8", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111E1F" }}>
              {m.text}
            </div>
          </div>
        ))}

        {consultEnded && (
          <div style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 12, padding: "8px 0", borderTop: "1px solid #E2E8F0" }}>
            Dr has ended the consult
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default ChatHistoryPanel
