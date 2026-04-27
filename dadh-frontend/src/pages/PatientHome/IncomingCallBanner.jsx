import React from "react"

const PULSE_CSS = `
  @keyframes dadh-call-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.92; }
  }
`

export default function IncomingCallBanner({ doctorName, callType, onAnswer, onDecline }) {
  return (
    <>
      <style>{PULSE_CSS}</style>
      <div
        role="alert"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: "linear-gradient(90deg, #15803d 0%, #16a34a 100%)",
          color: "#fff",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          animation: "dadh-call-pulse 1.8s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {callType === "videoCall" ? "📹" : "📞"}&nbsp; Incoming{" "}
          {callType === "videoCall" ? "Video" : "Phone"} Call — Dr. {doctorName}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onAnswer}
            style={{
              background: "#fff",
              color: "#16a34a",
              border: "none",
              borderRadius: 6,
              padding: "7px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Answer
          </button>
          <button
            onClick={onDecline}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.55)",
              borderRadius: 6,
              padding: "7px 20px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </>
  )
}
