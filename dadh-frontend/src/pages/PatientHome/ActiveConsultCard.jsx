import React from "react"

const STATUS = {
  calling: {
    label: "In Progress",
    dot: "#14B8A6",
    bg: "#F0FDFA",
    color: "#0D7377",
    border: "#D1E8E8",
  },
  accepted: {
    label: "Doctor Accepted",
    dot: "#22C55E",
    bg: "#F0FDF4",
    color: "#15803D",
    border: "#BBF7D0",
  },
  queued: {
    label: "In Queue",
    dot: "#F59E0B",
    bg: "#FFFBEB",
    color: "#92400E",
    border: "#FDE68A",
  },
}

function resolveStatus(c) {
  if (c.isCalling && !c.isCompleted) return STATUS.calling
  if (c.doctorId) return STATUS.accepted
  return STATUS.queued
}

export default function ActiveConsultCard({ consultation, onAnswerCall }) {
  if (!consultation) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px dashed #D1E8E8",
          borderRadius: 12,
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 46, marginBottom: 12, opacity: 0.65 }}>🩺</div>
        <p style={{ color: "#111E1F", fontWeight: 600, margin: 0, fontSize: 15 }}>
          No active consultations
        </p>
        <p style={{ color: "#4B7172", fontSize: 13, marginTop: 6, marginBottom: 0 }}>
          When you book a consultation, it will appear here.
        </p>
      </div>
    )
  }

  const status = resolveStatus(consultation)
  const startTime = consultation.createdAt
    ? new Date(consultation.createdAt).toLocaleString("en-AU", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—"

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #D1E8E8",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        boxShadow: "0 1px 6px rgba(13, 115, 119, 0.07)",
      }}
    >
      {/* Doctor info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            background: "#F0FDFA",
            border: "1px solid #D1E8E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          👨‍⚕️
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "#111E1F", margin: 0, fontSize: 16, lineHeight: 1.3 }}>
            {consultation.doctorId
              ? `Dr. ${consultation.doctorInfo?.name || "Loading..."}`
              : "Waiting for a doctor"}
          </p>
          <p style={{ color: "#4B7172", margin: "3px 0 0", fontSize: 13 }}>
            {consultation.categoryName || consultation.consultationCategory || "General Consultation"}
          </p>
          <p style={{ color: "#94a3b8", margin: "3px 0 0", fontSize: 12 }}>
            Requested {startTime}
          </p>
        </div>
      </div>

      {/* Status + action */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span
          style={{
            background: status.bg,
            color: status.color,
            border: `1px solid ${status.border}`,
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: status.dot,
              display: "inline-block",
            }}
          />
          {status.label}
        </span>

        {consultation.isCalling && (
          <button
            onClick={onAnswerCall}
            style={{
              background: "#0D7377",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📹 Answer Call
          </button>
        )}
      </div>
    </div>
  )
}
