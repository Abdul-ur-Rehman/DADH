import React, { useState, useEffect, useRef, useCallback } from "react"
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider"
import { useSendbirdStateContext } from "@sendbird/uikit-react"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"
const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPatient() {
  try { return JSON.parse(localStorage.getItem("patientData"))?.data || {} }
  catch { return {} }
}

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"
}

function fmtTime(ts) {
  if (!ts) return ""
  return new Date(ts).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(ts) {
  if (!ts) return ""
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

// ─── Outer wrapper (provides Sendbird context) ─────────────────────────────────
export default function PatientInbox() {
  const patient = getPatient()
  const userId = localStorage.getItem("sendBirdUserId") || patient._id || ""
  const nickname = patient.name || "Patient"

  if (!APP_ID) {
    return (
      <div className="dadh-tw-root" style={{ padding: 32, textAlign: "center", color: "#4B7172" }}>
        Chat service is not configured (missing REACT_APP_SENDBIRD_APP_ID).
      </div>
    )
  }

  return (
    <SendbirdProvider appId={APP_ID} userId={userId} nickname={nickname}>
      <InboxContent patient={patient} userId={userId} />
    </SendbirdProvider>
  )
}

// ─── Inner component — has SDK access ─────────────────────────────────────────
function InboxContent({ patient, userId }) {
  const { stores } = useSendbirdStateContext()
  const sb = stores?.sdkStore?.sdk
  const sdkReady = !!(sb?.groupChannel)

  const patientId = patient._id

  const [conversations, setConversations] = useState([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const bottomRef = useRef(null)
  const handlerKeyRef = useRef(null)
  const textareaRef = useRef(null)
  const hasAutoSelectedRef = useRef(false)

  // ── Load conversations when SDK is ready ─────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!sdkReady || !patientId) return
    setLoadingConvs(true)
    try {
      const res = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`)
      const json = await res.json()
      const list = (json.data || []).filter((c) => c.doctorId)

      // Group by doctorId — keep most recent consultation per doctor
      const byDoctor = {}
      for (const c of list) {
        if (!byDoctor[c.doctorId] || new Date(c.createdAt) > new Date(byDoctor[c.doctorId].createdAt)) {
          byDoctor[c.doctorId] = c
        }
      }

      const enriched = await Promise.all(
        Object.values(byDoctor).map(async (c) => {
          let doctorName = "Doctor"
          const doctorSbId = c.doctorId // MongoDB _id == Sendbird user ID for doctors

          try {
            const drRes = await fetch(`${BASE_URL}/doctor-requests/getOneById/${c.doctorId}`)
            const drJson = await drRes.json()
            if (drJson.state && drJson.data) {
              doctorName = drJson.data.name || "Doctor"
            }
          } catch {}

          let channel = null
          try {
            const q = sb.groupChannel.createMyGroupChannelListQuery({
              userIdsFilter: {
                userIds: [userId, doctorSbId],
                includeMode: true,
                queryType: "AND",
              },
              includeEmpty: true,
              limit: 5,
            })
            const channels = await q.next()
            if (channels.length > 0) {
              channel = channels[0]
            } else if (!c.isCompleted) {
              // Only auto-create a channel if consultation is still active
              channel = await sb.groupChannel.createChannel({
                invitedUserIds: [userId, doctorSbId],
                name: `Chat with Dr. ${doctorName}`,
              })
            }
          } catch {}

          return {
            key: c.doctorId,
            consultationId: c._id,
            isCompleted: c.isCompleted,
            doctorName,
            date: c.createdAt,
            channel,
          }
        })
      )

      const valid = enriched.filter((c) => c.channel)
      valid.sort((a, b) => {
        const at = a.channel?.lastMessage?.createdAt || new Date(a.date).getTime()
        const bt = b.channel?.lastMessage?.createdAt || new Date(b.date).getTime()
        return bt - at
      })

      setConversations(valid)
      if (valid.length > 0 && !hasAutoSelectedRef.current) {
        hasAutoSelectedRef.current = true
        setSelectedConv(valid[0])
      }
    } catch (e) {
      console.error("PatientInbox loadConversations:", e)
    } finally {
      setLoadingConvs(false)
    }
  }, [sdkReady, patientId, sb, userId])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Open a conversation and load its messages ──────────────────────────
  const openConversation = (conv, showMobileChat = true) => {
    setSelectedConv(conv)
    if (showMobileChat) setMobileShowChat(true)
  }

  useEffect(() => {
    if (!selectedConv?.channel || !sb?.groupChannel) return

    setMessages([])
    setLoadingMsgs(true)
    setText("")

    const channel = selectedConv.channel

    // Remove old real-time handler
    if (handlerKeyRef.current) {
      sb.groupChannel.removeGroupChannelHandler(handlerKeyRef.current)
    }

    // Fetch message history
    const query = channel.createPreviousMessageListQuery({ limit: 50, reverse: false })
    query.load()
      .then((msgs) => {
        setMessages(msgs)
        setLoadingMsgs(false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 60)
      })
      .catch((err) => {
        console.error("PatientInbox load messages:", err)
        setLoadingMsgs(false)
      })

    // Register real-time handler for new messages
    const handlerKey = `patient-inbox-${channel.url}-${Date.now()}`
    handlerKeyRef.current = handlerKey
    sb.groupChannel.addGroupChannelHandler(handlerKey, {
      onMessageReceived(ch, msg) {
        if (ch.url !== channel.url) return
        setMessages((prev) => [...prev, msg])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60)
      },
    })

    return () => {
      sb.groupChannel.removeGroupChannelHandler(handlerKey)
    }
  }, [selectedConv, sb])

  // Cleanup on unmount
  useEffect(() => () => {
    if (handlerKeyRef.current && sb?.groupChannel) {
      sb.groupChannel.removeGroupChannelHandler(handlerKeyRef.current)
    }
  }, [sb])

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const msg = text.trim()
    if (!msg || !selectedConv?.channel || selectedConv.isCompleted || sending) return
    setSending(true)
    setText("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    selectedConv.channel.sendUserMessage({ message: msg })
      .onSucceeded((sentMsg) => {
        setMessages((prev) => [...prev, sentMsg])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60)
        setSending(false)
      })
      .onFailed((err) => {
        console.error("PatientInbox send:", err)
        setText(msg) // restore on failure
        setSending(false)
      })
  }, [text, selectedConv, sending])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (!sdkReady) {
    return (
      <div className="dadh-tw-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320 }}>
        <div style={{ textAlign: "center", color: "#4B7172" }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>💬</div>
          <p style={{ margin: 0, fontSize: 13 }}>Connecting to chat…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="dadh-tw-root"
      style={{
        display: "flex",
        height: "calc(100vh - 108px)",
        minHeight: 400,
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #D1E8E8",
        boxShadow: "0 1px 8px rgba(13,115,119,0.07)",
        overflow: "hidden",
      }}
    >
      {/* ── Left: Conversation list ── */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          borderRight: "1px solid #D1E8E8",
          display: mobileShowChat ? "none" : "flex",
          flexDirection: "column",
        }}
        className="md:flex!"
      >
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #D1E8E8", flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111E1F" }}>Messages</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#4B7172" }}>Your consultation chats</p>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConvs ? <ConvListSkeleton /> : conversations.length === 0 ? <EmptyConvList /> : (
            conversations.map((conv) => (
              <ConvItem
                key={conv.key}
                conv={conv}
                isSelected={selectedConv?.key === conv.key}
                onClick={() => openConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right: Chat window ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: (!mobileShowChat && window.innerWidth < 768) ? "none" : "flex",
          flexDirection: "column",
        }}
      >
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div style={{ padding: "13px 20px", borderBottom: "1px solid #D1E8E8", display: "flex", alignItems: "center", gap: 12, background: "#fff", flexShrink: 0 }}>
              {/* Mobile back button */}
              <button
                onClick={() => setMobileShowChat(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4B7172", padding: "4px 8px 4px 0", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}
                className="md:hidden!"
              >
                ← Back
              </button>

              {/* Doctor avatar */}
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#E6F4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0D7377", flexShrink: 0 }}>
                {getInitials(selectedConv.doctorName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111E1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Dr. {selectedConv.doctorName}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#4B7172" }}>{fmtDate(selectedConv.date)}</p>
              </div>
              <StatusBadge completed={selectedConv.isCompleted} />
            </div>

            {/* Ended banner */}
            {selectedConv.isCompleted && (
              <div style={{ background: "#FFF7ED", borderBottom: "1px solid #FED7AA", padding: "8px 20px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <span style={{ fontSize: 12, color: "#92400E" }}>
                  This consultation has ended. You can view chat history but cannot send new messages.
                </span>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
              {loadingMsgs ? (
                <MessagesSkeleton />
              ) : messages.length === 0 ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#4B7172", minHeight: 200 }}>
                  <span style={{ fontSize: 36, marginBottom: 8, opacity: 0.45 }}>💬</span>
                  <p style={{ margin: 0, fontSize: 13 }}>No messages yet.</p>
                  {!selectedConv.isCompleted && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>Type a message below to start the conversation.</p>
                  )}
                </div>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble key={msg.messageId || i} msg={msg} isOwn={msg.sender?.userId === userId} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop: "1px solid #D1E8E8", padding: "12px 16px", background: "#fff", flexShrink: 0 }}>
              {selectedConv.isCompleted ? (
                <p style={{ margin: 0, textAlign: "center", fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>
                  Chat is read-only — consultation has ended.
                </p>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    style={{
                      flex: 1,
                      border: "1px solid #D1E8E8",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "#111E1F",
                      resize: "none",
                      outline: "none",
                      fontFamily: "Inter, system-ui, sans-serif",
                      lineHeight: 1.5,
                      maxHeight: 100,
                      overflowY: "auto",
                      background: "#FAFFFE",
                    }}
                    onInput={(e) => {
                      e.target.style.height = "auto"
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#0D7377" }}
                    onBlur={(e) => { e.target.style.borderColor = "#D1E8E8" }}
                  />
                  <SendButton onClick={handleSend} disabled={!text.trim() || sending} />
                </div>
              )}
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#4B7172" }}>
            <span style={{ fontSize: 48, marginBottom: 12, opacity: 0.35 }}>💬</span>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111E1F" }}>Your messages</p>
            <p style={{ margin: "6px 0 0", fontSize: 13 }}>Select a conversation from the list.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ConvItem({ conv, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const lastMsg = conv.channel?.lastMessage

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "14px 20px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        cursor: "pointer",
        borderLeft: isSelected ? "3px solid #0D7377" : "3px solid transparent",
        background: isSelected ? "#F0FDFA" : hovered ? "#F8FFFE" : "transparent",
        transition: "background 0.12s",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: isSelected ? "#CCEDEE" : "#E6F4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#0D7377", flexShrink: 0 }}>
        {getInitials(conv.doctorName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#111E1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Dr. {conv.doctorName}
          </span>
          <span style={{ fontSize: 11, color: "#4B7172", flexShrink: 0, marginLeft: 8 }}>
            {lastMsg ? fmtTime(lastMsg.createdAt) : fmtDate(conv.date)}
          </span>
        </div>
        <p style={{ margin: "0 0 5px", fontSize: 12, color: "#4B7172", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lastMsg?.message || "No messages yet"}
        </p>
        <StatusBadge completed={conv.isCompleted} small />
      </div>
    </div>
  )
}

function StatusBadge({ completed, small }) {
  return (
    <span style={{
      fontSize: small ? 10 : 11,
      fontWeight: 600,
      padding: small ? "2px 7px" : "3px 10px",
      borderRadius: 20,
      background: completed ? "#F1F5F9" : "#DCFCE7",
      color: completed ? "#64748B" : "#16A34A",
      display: "inline-block",
    }}>
      {completed ? "Completed" : "Active"}
    </span>
  )
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", marginBottom: 14 }}>
      <div style={{ maxWidth: "72%" }}>
        {!isOwn && (
          <p style={{ margin: "0 0 4px 4px", fontSize: 11, color: "#4B7172", fontWeight: 600 }}>
            {msg.sender?.nickname || "Doctor"}
          </p>
        )}
        <div style={{
          background: isOwn ? "#0D7377" : "#F1F5F9",
          color: isOwn ? "#fff" : "#111E1F",
          borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "10px 14px",
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}>
          {msg.message}
        </div>
        <p style={{ margin: "4px 4px 0", fontSize: 11, color: "#94a3b8", textAlign: isOwn ? "right" : "left" }}>
          {fmtTime(msg.createdAt)}
        </p>
      </div>
    </div>
  )
}

function SendButton({ onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: disabled ? "#E2E8F0" : hovered ? "#0A5F62" : "#0D7377",
        color: disabled ? "#94a3b8" : "#fff",
        border: "none",
        borderRadius: 10,
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Send
    </button>
  )
}

function ConvListSkeleton() {
  return (
    <div style={{ padding: "16px 20px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 22, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E6F4F4", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 13, width: "60%", background: "#E6F4F4", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 11, width: "80%", background: "#E6F4F4", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MessagesSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start", marginBottom: 16 }}>
          <div style={{ width: `${40 + i * 8}%`, height: 44, background: "#E6F4F4", borderRadius: 12 }} />
        </div>
      ))}
    </div>
  )
}

function EmptyConvList() {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.45 }}>💬</div>
      <p style={{ margin: 0, fontWeight: 600, color: "#111E1F", fontSize: 14 }}>No conversations yet</p>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#4B7172", lineHeight: 1.6 }}>
        When a doctor accepts your consultation and starts a chat, it will appear here.
      </p>
    </div>
  )
}
