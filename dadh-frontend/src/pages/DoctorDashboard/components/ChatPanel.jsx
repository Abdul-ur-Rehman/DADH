import React, { useState, useRef, useEffect, useCallback } from "react"

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID || ""
const CLINICAL_URL = "dadh-clinical"
const HANDLER_KEY = "dashboard-chat-panel"

function getDispatcherUrl(userId) {
  return `dadh-dispatcher-${userId}`
}

function TabBadge({ count }) {
  if (!count) return null
  return (
    <span style={{
      background: "#EF4444", color: "#fff", borderRadius: "50%",
      minWidth: 16, height: 16, fontSize: 10, fontWeight: 700,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "0 3px", marginLeft: 4, lineHeight: 1,
    }}>
      {count > 99 ? "99+" : count}
    </span>
  )
}

function MsgBubble({ msg, isMe }) {
  const text = msg.message || (msg.messageType === "file" ? `📎 ${msg.name}` : "")
  if (!text) return null
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
      {!isMe && (
        <span style={{ fontSize: 10, color: "#94A3B8", paddingLeft: 4 }}>
          {msg.sender?.nickname || msg.sender?.userId?.slice(-6) || "Doctor"}
        </span>
      )}
      <div style={{
        maxWidth: "78%", padding: "6px 10px",
        borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        background: isMe ? "#0D7377" : "#F0FDFA",
        color: isMe ? "white" : "#111E1F",
        fontSize: 13, lineHeight: 1.4, wordBreak: "break-word",
      }}>
        {text}
      </div>
    </div>
  )
}

function ChatPanel({ doctorId }) {
  const sbUserId = localStorage.getItem("sendBirdUserId") || doctorId || ""

  const [activeTab, setActiveTab] = useState("clinical")
  const [msgs, setMsgs] = useState({ clinical: [], dispatcher: [] })
  const [unread, setUnread] = useState({ clinical: 0, dispatcher: 0 })
  const [chReady, setChReady] = useState({ clinical: false, dispatcher: false })
  const [text, setText] = useState("")
  const [status, setStatus] = useState("init") // "init" | "connecting" | "ready" | "error"

  const sbRef = useRef(null)
  const channelsRef = useRef({ clinical: null, dispatcher: null })
  const bottomRef = useRef(null)
  const activeTabRef = useRef("clinical")

  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs, activeTab])

  const loadChannel = useCallback(async (sb, url, tabKey) => {
    try {
      const ch = await sb.groupChannel.getChannel(url)
      channelsRef.current[tabKey] = ch
      const q = ch.createPreviousMessageListQuery({ limit: 50, reverse: false })
      const history = await q.load()
      setMsgs(prev => ({ ...prev, [tabKey]: history }))
      setUnread(prev => ({ ...prev, [tabKey]: ch.unreadMessageCount }))
      setChReady(prev => ({ ...prev, [tabKey]: true }))
    } catch {
      // Channel not set up in Sendbird yet
    }
  }, [])

  useEffect(() => {
    if (!APP_ID || !sbUserId) { setStatus("error"); return }

    let mounted = true
    setStatus("connecting")

    const init = async () => {
      try {
        const [{ default: SendbirdChat }, { GroupChannelModule, GroupChannelHandler }] = await Promise.all([
          import("@sendbird/chat"),
          import("@sendbird/chat/groupChannel"),
        ])
        const sb = SendbirdChat.init({ appId: APP_ID, modules: [new GroupChannelModule()] })
        sbRef.current = sb
        await sb.connect(sbUserId)
        if (!mounted) return

        await Promise.all([
          loadChannel(sb, CLINICAL_URL, "clinical"),
          loadChannel(sb, getDispatcherUrl(sbUserId), "dispatcher"),
        ])

        sb.groupChannel.addGroupChannelHandler(HANDLER_KEY, new GroupChannelHandler({
          onMessageReceived: (channel, message) => {
            if (!mounted) return
            let key = null
            if (channel.url === CLINICAL_URL) key = "clinical"
            else if (channel.url === getDispatcherUrl(sbUserId)) key = "dispatcher"
            if (!key) return

            setMsgs(prev => ({ ...prev, [key]: [...prev[key], message] }))
            if (activeTabRef.current !== key) {
              setUnread(prev => ({ ...prev, [key]: prev[key] + 1 }))
            }
          },
        }))

        if (mounted) setStatus("ready")
      } catch (e) {
        console.error("ChatPanel Sendbird error:", e)
        if (mounted) setStatus("error")
      }
    }

    init()

    return () => {
      mounted = false
      if (sbRef.current) {
        sbRef.current.groupChannel.removeGroupChannelHandler(HANDLER_KEY)
      }
    }
  }, [sbUserId, loadChannel])

  const handleTabSwitch = useCallback((tab) => {
    setActiveTab(tab)
    setUnread(prev => ({ ...prev, [tab]: 0 }))
    const ch = channelsRef.current[tab]
    if (ch) ch.markAsRead().catch(() => {})
  }, [])

  const send = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    const ch = channelsRef.current[activeTab]
    if (!ch) return
    setText("")
    ch.sendUserMessage({ message: trimmed })
      .onSucceeded((msg) => {
        setMsgs(prev => ({ ...prev, [activeTab]: [...prev[activeTab], msg] }))
      })
      .onFailed((err) => {
        console.error("Send failed:", err)
        setText(trimmed)
      })
  }, [text, activeTab])

  const canSend = status === "ready" && chReady[activeTab] && text.trim().length > 0
  const currentMsgs = msgs[activeTab] || []

  const tabStyle = (tab) => ({
    flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 600,
    cursor: "pointer", background: "none", border: "none",
    color: activeTab === tab ? "#0D7377" : "#64748B",
    borderBottom: activeTab === tab ? "2px solid #0D7377" : "2px solid transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
  })

  return (
    <div style={{
      width: 280, flexShrink: 0, background: "white",
      border: "1px solid #D1E8E8", borderRadius: 12,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Tabs with unread badges */}
      <div style={{ display: "flex", borderBottom: "1px solid #D1E8E8", background: "#FAFFFE" }}>
        {[["clinical", "CLINICAL"], ["dispatcher", "DISPATCHER"]].map(([tab, label]) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => handleTabSwitch(tab)}>
            {label}
            <TabBadge count={unread[tab]} />
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {status === "connecting" && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "20px 0" }}>Connecting…</p>
        )}
        {status === "error" && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "20px 0" }}>
            {!APP_ID ? "Chat not configured" : "Chat unavailable"}
          </p>
        )}
        {status === "ready" && !chReady[activeTab] && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "20px 0" }}>
            {activeTab === "clinical" ? "Clinical channel not set up" : "Dispatcher channel not set up"}
          </p>
        )}
        {status === "ready" && chReady[activeTab] && currentMsgs.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "20px 0" }}>No messages yet</p>
        )}
        {currentMsgs.map((m, i) => (
          <MsgBubble key={m.messageId ?? i} msg={m} isMe={m.sender?.userId === sbUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid #D1E8E8" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#F8FFFE", border: "1.5px solid #D1E8E8", borderRadius: 20, padding: "4px 6px 4px 12px",
        }}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={status === "ready" && chReady[activeTab] ? "Type a message…" : "Unavailable"}
            disabled={status !== "ready" || !chReady[activeTab]}
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
