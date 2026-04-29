import React, { useState, useRef, useEffect } from "react"

function ChatPanel({ activePatientName }) {
  const [activeTab, setActiveTab] = useState("clinical")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    { from: "patient", text: "Hi doctor, I have a headache." },
    { from: "doctor", text: "How long have you had it?" },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    setMessages(prev => [...prev, { from: "doctor", text: trimmed }])
    setMessage("")
  }

  const tabStyle = (tab) => ({
    flex: 1, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600,
    cursor: "pointer", color: activeTab === tab ? "#0D7377" : "#64748B",
    background: "none", border: "none",
    borderBottom: activeTab === tab ? "2px solid #0D7377" : "2px solid transparent",
  })

  return (
    <div style={{
      width: 280, flexShrink: 0, background: "white",
      border: "1px solid #D1E8E8", borderRadius: 12,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ display: "flex", borderBottom: "1px solid #D1E8E8", background: "#FAFFFE" }}>
        <button style={tabStyle("clinical")} onClick={() => setActiveTab("clinical")}>CLINICAL</button>
        <button style={tabStyle("dispatcher")} onClick={() => setActiveTab("dispatcher")}>DISPATCHER</button>
      </div>

      {activeTab === "clinical" && activePatientName && (
        <div style={{ padding: "8px 12px", borderBottom: "1px solid #D1E8E8", background: "#F0FDFA" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0D7377" }}>{activePatientName}</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>Active consultation</div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "doctor" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "6px 10px",
              borderRadius: m.from === "doctor" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.from === "doctor" ? "#0D7377" : "#F0FDFA",
              color: m.from === "doctor" ? "white" : "#111E1F",
              fontSize: 13,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "8px 10px", borderTop: "1px solid #D1E8E8" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#F8FFFE", border: "1.5px solid #D1E8E8", borderRadius: 20, padding: "4px 6px 4px 12px",
        }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type a message…"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111E1F" }}
          />
          <button
            onClick={send}
            style={{ background: "#0D7377", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
