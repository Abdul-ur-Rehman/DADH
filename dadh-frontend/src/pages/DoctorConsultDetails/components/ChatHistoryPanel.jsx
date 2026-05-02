import React, { useState, useEffect, useRef, useCallback } from "react"
import SendbirdChat from "@sendbird/chat"
import { GroupChannelModule, GroupChannelHandler } from "@sendbird/chat/groupChannel"
import CallModal from "../Modals/CallModal"

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID || ""

// ── Icons ──────────────────────────────────────────────────────────────────────

function VideoIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

function AudioIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: "visible" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10 19.79 19.79 0 0 1 1.61 1.4a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 6.5a16 16 0 0 0 6 6l.86-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
    </svg>
  )
}

function ChatIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ── Chip ───────────────────────────────────────────────────────────────────────

function Chip({ label, value }) {
  if (!value) return null
  return (
    <div style={{ background: "#F0FDFA", border: "1px solid #D1E8E8", borderRadius: 6, padding: "3px 8px", flexShrink: 0 }}>
      <span style={{ fontSize: 10, color: "#64748B" }}>{label}: </span>
      <span style={{ fontSize: 11, color: "#0D7377", fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// ── Call launch card ───────────────────────────────────────────────────────────

function CallLaunchCard({ mode, onLaunch }) {
  const isVideo = mode === "video"
  const color = isVideo ? "#0D7377" : "#14B8A6"
  const label = isVideo ? "Video Call" : "Audio Call"
  const subtitle = isVideo
    ? "Start a Tencent TRTC video session with the patient"
    : "Start a Tencent TRTC audio session with the patient"

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 14px ${color}40`,
      }}>
        {isVideo
          ? <VideoIcon size={26} color="white" />
          : <AudioIcon size={26} color="white" />}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111E1F", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#64748B", maxWidth: 200 }}>{subtitle}</div>
      </div>
      <button
        onClick={onLaunch}
        style={{
          background: color, color: "white", border: "none", borderRadius: 8,
          padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          boxShadow: `0 2px 8px ${color}40`,
        }}
      >
        Launch {label}
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

function CommunicationPanel({ patient, consultEnded, consultationId, doctorId }) {
  const [mode, setMode] = useState("chat")
  const [callModalMode, setCallModalMode] = useState(null) // "video" | "audio" | null
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [connected, setConnected] = useState(false)
  const [channelReady, setChannelReady] = useState(false)

  const sbRef = useRef(null)
  const channelRef = useRef(null)
  const bottomRef = useRef(null)
  const isMounted = useRef(true)

  const sbUserId = localStorage.getItem("sendBirdUserId") || doctorId || ""
  const patientId = patient?._id || ""

  useEffect(() => { return () => { isMounted.current = false } }, [])

  useEffect(() => {
    const refresh = async () => {
      if (!channelRef.current || !isMounted.current) return
      try {
        const q = channelRef.current.createPreviousMessageListQuery({ limit: 60, reverse: false })
        const history = await q.load()
        if (isMounted.current) setMessages(history)
      } catch {}
    }
    window.addEventListener("consultChatRefresh", refresh)
    return () => window.removeEventListener("consultChatRefresh", refresh)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!APP_ID || !sbUserId || !patientId) return
    let mounted = true
    const HANDLER_KEY = "consult-comm-panel"

    const init = async () => {
      try {
        const sb = SendbirdChat.init({ appId: APP_ID, modules: [new GroupChannelModule()] })
        sbRef.current = sb
        await sb.connect(sbUserId)
        if (!mounted) return

        // Find the doctor-patient channel
        const query = sb.groupChannel.createMyGroupChannelListQuery({
          userIdsFilter: { userIds: [sbUserId, patientId], includeMode: true, queryType: "AND" },
          includeEmpty: true,
          limit: 5,
        })
        const channels = await query.next()
        if (!mounted) return

        if (channels.length > 0) {
          const ch = channels[0]
          channelRef.current = ch
          const q = ch.createPreviousMessageListQuery({ limit: 60, reverse: false })
          const history = await q.load()
          if (mounted) {
            setMessages(history)
            setChannelReady(true)
          }
          ch.markAsRead().catch(() => {})
        }

        sb.groupChannel.addGroupChannelHandler(HANDLER_KEY, new GroupChannelHandler({
          onMessageReceived: (channel, message) => {
            if (!mounted) return
            if (channelRef.current && channel.url === channelRef.current.url) {
              setMessages(prev => [...prev, message])
              channel.markAsRead().catch(() => {})
            }
          },
        }))

        if (mounted) setConnected(true)
      } catch (e) {
        console.error("CommunicationPanel Sendbird error:", e)
        if (mounted) setConnected(false)
      }
    }

    init()
    return () => {
      mounted = false
      if (sbRef.current) sbRef.current.groupChannel.removeGroupChannelHandler("consult-comm-panel")
    }
  }, [sbUserId, patientId])

  const send = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || !channelRef.current) return
    setText("")
    channelRef.current.sendUserMessage({ message: trimmed })
      .onSucceeded(msg => { if (isMounted.current) setMessages(prev => [...prev, msg]) })
      .onFailed(() => setText(trimmed))
  }, [text])

  const tabStyle = (t) => ({
    flex: 1, padding: "7px 0", border: "none", background: "none",
    fontSize: 11, fontWeight: 600, cursor: "pointer",
    color: mode === t ? "#0D7377" : "#64748B",
    borderBottom: mode === t ? "2px solid #0D7377" : "2px solid transparent",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    textTransform: "uppercase", letterSpacing: 0.3,
  })

  const canSend = connected && channelReady && text.trim().length > 0

  return (
    <>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0,
        background: "white", border: "1px solid #D1E8E8", borderRadius: 12,
      }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #D1E8E8", background: "#FAFFFE", flexShrink: 0 }}>
          <button style={{ ...tabStyle("video"), overflow: "visible" }} onClick={() => setMode("video")}>
            <VideoIcon size={12} /> Video
          </button>
          <button style={{ ...tabStyle("audio"), overflow: "visible" }} onClick={() => setMode("audio")}>
            <AudioIcon size={12} /> Audio
          </button>
          <button style={{ ...tabStyle("chat"), overflow: "visible" }} onClick={() => setMode("chat")}>
            <ChatIcon size={12} /> Chat
          </button>
        </div>

        {/* Patient intake chips */}
        {patient && (
          <div style={{ padding: "7px 12px", borderBottom: "1px solid #D1E8E8", display: "flex", flexWrap: "wrap", gap: 5, flexShrink: 0 }}>
            <Chip label="Condition" value={patient.consultationCategory} />
            <Chip label="Allergies" value={patient.allergies} />
            {patient.notes && <Chip label="Notes" value={patient.notes.slice(0, 30) + (patient.notes.length > 30 ? "…" : "")} />}
          </div>
        )}

        {/* ── Video / Audio launch ── */}
        {(mode === "video" || mode === "audio") && (
          <CallLaunchCard mode={mode} onLaunch={() => setCallModalMode(mode)} />
        )}

        {/* ── Chat ── */}
        {mode === "chat" && (
          <>
            <style>{`
              .dadh-chat-messages::-webkit-scrollbar { width: 4px; }
              .dadh-chat-messages::-webkit-scrollbar-track { background: transparent; }
              .dadh-chat-messages::-webkit-scrollbar-thumb { background: #B2D8D8; border-radius: 4px; }
              .dadh-chat-messages::-webkit-scrollbar-thumb:hover { background: #0D7377; }
              .dadh-chat-messages { scrollbar-width: thin; scrollbar-color: #B2D8D8 transparent; }
            `}</style>
            <div className="dadh-chat-messages" style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
              <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Your consult has started</div>

              {!APP_ID && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8" }}>Chat not configured (missing APP_ID)</p>
              )}
              {APP_ID && !patientId && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8" }}>Loading patient info…</p>
              )}
              {APP_ID && patientId && !connected && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8" }}>Connecting to chat…</p>
              )}
              {connected && !channelReady && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8" }}>No chat channel found with this patient</p>
              )}
              {connected && channelReady && messages.length === 0 && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8" }}>No messages yet</p>
              )}

              {messages.map((m, i) => {
                const isMe = m.sender?.userId === sbUserId
                const isFile = m.messageType === "file"
                const txt = isFile ? null : (m.message || "")
                if (!isFile && !txt) return null

                // Date separator
                const msgDate = m.createdAt ? new Date(m.createdAt) : null
                const prevDate = i > 0 && messages[i - 1]?.createdAt ? new Date(messages[i - 1].createdAt) : null
                const showDateSep = msgDate && (
                  !prevDate ||
                  msgDate.toDateString() !== prevDate.toDateString()
                )
                const fmtSepDate = (d) => {
                  const today = new Date()
                  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
                  if (d.toDateString() === today.toDateString()) return "Today"
                  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
                  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" })
                }

                return (
                  <React.Fragment key={m.messageId ?? i}>
                    {showDateSep && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 4px" }}>
                        <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: "#94A3B8",
                          background: "white", padding: "2px 10px",
                          border: "1px solid #E2E8F0", borderRadius: 10, whiteSpace: "nowrap",
                        }}>
                          {fmtSepDate(msgDate)}
                        </span>
                        <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "82%", padding: "6px 10px",
                        borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        background: isMe ? "#0D7377" : "#F0FDFA",
                        color: isMe ? "white" : "#111E1F",
                        fontSize: 13, lineHeight: 1.4, wordBreak: "break-word",
                      }}>
                        {isFile ? (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: isMe ? "white" : "#0D7377", textDecoration: "underline", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            📄 {m.name || "File"}
                          </a>
                        ) : txt}
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}

              {consultEnded && (
                <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 8, paddingTop: 8, borderTop: "1px solid #E2E8F0" }}>
                  Consultation ended
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!consultEnded && (
              <div style={{ padding: "8px 10px", borderTop: "1px solid #D1E8E8", flexShrink: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#F8FFFE", border: "1.5px solid #D1E8E8", borderRadius: 20, padding: "4px 6px 4px 12px",
                }}>
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                    placeholder={channelReady ? "Message patient…" : "Connecting…"}
                    disabled={!canSend && !text}
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111E1F" }}
                  />
                  <button
                    onClick={send}
                    disabled={!canSend}
                    style={{
                      background: canSend ? "#0D7377" : "#D1E8E8",
                      border: "none", borderRadius: "50%", width: 28, height: 28,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: canSend ? "pointer" : "default", flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Call modal — renders over the consultation page */}
      {callModalMode && (
        <CallModal
          mode={callModalMode}
          patient={patient}
          consultationId={consultationId}
          onClose={() => setCallModalMode(null)}
        />
      )}
    </>
  )
}

export default CommunicationPanel
