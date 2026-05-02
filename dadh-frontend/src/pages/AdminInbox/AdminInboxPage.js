import React, { useState, useEffect, useRef, useCallback } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"
import SendbirdChat from "@sendbird/chat"
import { GroupChannelModule, GroupChannelHandler } from "@sendbird/chat/groupChannel"

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID || ""
const HANDLER_KEY = "admin-inbox"

function getAdmin() {
  try { return JSON.parse(localStorage.getItem("data"))?.data || {} }
  catch { return {} }
}

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"
}

function fmtTime(ts) {
  if (!ts) return ""
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" })
}

function getChannelDisplayName(channel, userId) {
  if (channel.name && channel.name !== "Group Channel") return channel.name
  const others = channel.members.filter(m => m.userId !== userId)
  if (others.length === 0) return "Empty Channel"
  if (others.length === 1) return others[0].nickname || others[0].userId
  return others.slice(0, 2).map(m => m.nickname || m.userId).join(", ") +
    (others.length > 2 ? ` +${others.length - 2}` : "")
}

function getChannelSubtitle(channel) {
  const last = channel.lastMessage
  if (!last) return "No messages yet"
  const prefix = last.sender?.nickname ? `${last.sender.nickname}: ` : ""
  const text = last.messageType === "file" ? "📎 File" : (last.message || "")
  const full = prefix + text
  return full.length > 45 ? full.slice(0, 45) + "…" : full
}

function Avatar({ name, size = 36, color = "#0D7377" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#E6F4F4", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.33, fontWeight: 700,
      color, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  )
}

// ─── Outer shell: connect Sendbird ─────────────────────────────────────────────

export default function AdminInboxPage() {
  const admin = getAdmin()
  const userId = admin._id || ""
  const nickname = admin.username || admin.name || "Admin"

  const [sb, setSb] = useState(null)
  const [sdkError, setSdkError] = useState("")

  useEffect(() => {
    if (!APP_ID || !userId) return
    let instance
    const init = async () => {
      try {
        instance = SendbirdChat.init({ appId: APP_ID, modules: [new GroupChannelModule()] })
        await instance.connect(userId)
        try { await instance.updateCurrentUserInfo({ nickname }) } catch {}
        setSb(instance)
      } catch (e) {
        console.error("Admin inbox Sendbird error:", e)
        setSdkError("Failed to connect to chat service.")
      }
    }
    init()
    return () => { if (instance) instance.disconnect().catch(() => {}) }
  }, [userId, nickname])

  return (
    <AdminAppLayout mainStyle={{ padding: 0, overflow: "hidden" }}>
      <div className="dadh-tw-root" style={{ display: "flex", height: "100%", background: "#FAFFFE" }}>
        {!APP_ID && <CenterMsg text="Chat not configured (missing REACT_APP_SENDBIRD_APP_ID)" />}
        {APP_ID && sdkError && <CenterMsg text={sdkError} color="#EF4444" />}
        {APP_ID && !sdkError && !sb && <CenterMsg text="Connecting to chat…" icon="💬" />}
        {sb && <InboxContent sb={sb} userId={userId} />}
      </div>
    </AdminAppLayout>
  )
}

function CenterMsg({ text, icon, color = "#64748B" }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color }}>
        {icon && <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>{icon}</div>}
        <p style={{ margin: 0, fontSize: 13 }}>{text}</p>
      </div>
    </div>
  )
}

// ─── Main inbox UI ─────────────────────────────────────────────────────────────

function InboxContent({ sb, userId }) {
  const [channels, setChannels] = useState([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [text, setText] = useState("")
  const [search, setSearch] = useState("")
  // Track local unread counts separately (channel objects are mutable)
  const [unreadMap, setUnreadMap] = useState({})

  const queryRef = useRef(null)
  const handlerKeyRef = useRef(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const isMounted = useRef(true)

  useEffect(() => { return () => { isMounted.current = false } }, [])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Load channel list ──────────────────────────────────────────────────────
  const loadChannels = useCallback(async (reset = false) => {
    if (!isMounted.current) return
    setLoadingChannels(true)
    try {
      if (reset || !queryRef.current) {
        queryRef.current = sb.groupChannel.createMyGroupChannelListQuery({
          includeEmpty: true,
          limit: 20,
          order: "latest_last_message",
        })
      }
      if (!queryRef.current.hasNext && !reset) { setLoadingChannels(false); return }
      const result = await queryRef.current.next()
      if (!isMounted.current) return
      setChannels(prev => reset ? result : [...prev, ...result])
      setHasMore(queryRef.current.hasNext)
      // Seed unread map from channel data
      const initial = {}
      result.forEach(ch => { initial[ch.url] = ch.unreadMessageCount || 0 })
      setUnreadMap(prev => ({ ...initial, ...prev }))
    } catch (e) {
      console.error("Load channels error:", e)
    } finally {
      if (isMounted.current) setLoadingChannels(false)
    }
  }, [sb])

  useEffect(() => {
    loadChannels(true)
  }, [loadChannels])

  // ── Real-time channel list updates ─────────────────────────────────────────
  useEffect(() => {
    const key = HANDLER_KEY + "-list"
    handlerKeyRef.current = key
    sb.groupChannel.addGroupChannelHandler(key, new GroupChannelHandler({
      onMessageReceived: (channel) => {
        if (!isMounted.current) return
        setChannels(prev => {
          const existing = prev.find(c => c.url === channel.url)
          if (existing) return [channel, ...prev.filter(c => c.url !== channel.url)]
          return [channel, ...prev]
        })
        // Increment unread only if this channel is not currently open
        setSelected(sel => {
          if (!sel || sel.url !== channel.url) {
            setUnreadMap(prev => ({ ...prev, [channel.url]: (prev[channel.url] || 0) + 1 }))
          }
          return sel
        })
      },
      onChannelChanged: (channel) => {
        if (!isMounted.current) return
        setChannels(prev => prev.map(c => c.url === channel.url ? channel : c))
      },
    }))
    return () => { sb.groupChannel.removeGroupChannelHandler(key) }
  }, [sb])

  // ── Load messages for selected channel ─────────────────────────────────────
  const loadMessages = useCallback(async (channel) => {
    setLoadingMsgs(true)
    setMessages([])
    try {
      const q = channel.createPreviousMessageListQuery({ limit: 60, reverse: false })
      const msgs = await q.load()
      if (isMounted.current) setMessages(msgs)
      await channel.markAsRead()
      setUnreadMap(prev => ({ ...prev, [channel.url]: 0 }))
    } catch (e) {
      console.error("Load messages error:", e)
    } finally {
      if (isMounted.current) setLoadingMsgs(false)
    }
  }, [])

  // ── Register message handler for active chat ───────────────────────────────
  useEffect(() => {
    if (!selected) return
    const key = HANDLER_KEY + "-msg"
    sb.groupChannel.addGroupChannelHandler(key, new GroupChannelHandler({
      onMessageReceived: (channel, message) => {
        if (!isMounted.current) return
        if (channel.url === selected.url) {
          setMessages(prev => [...prev, message])
          channel.markAsRead().catch(() => {})
        }
      },
    }))
    return () => { sb.groupChannel.removeGroupChannelHandler(key) }
  }, [sb, selected])

  const handleSelect = useCallback((channel) => {
    setSelected(channel)
    loadMessages(channel)
  }, [loadMessages])

  const send = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || !selected) return
    setText("")
    selected.sendUserMessage({ message: trimmed })
      .onSucceeded((msg) => {
        if (isMounted.current) setMessages(prev => [...prev, msg])
      })
      .onFailed((err) => {
        console.error("Send failed:", err)
        setText(trimmed)
      })
  }, [text, selected])

  // Filter channels by search
  const filtered = channels.filter(ch => {
    if (!search) return true
    const name = getChannelDisplayName(ch, userId).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div style={{ display: "flex", flex: 1, height: "100%", overflow: "hidden" }}>
      {/* ── Left: Channel list ── */}
      <div style={{
        width: 300, flexShrink: 0, borderRight: "1px solid #D1E8E8",
        display: "flex", flexDirection: "column", background: "white",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #D1E8E8" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#111E1F" }}>Inbox</h2>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F8FFFE", border: "1px solid #D1E8E8", borderRadius: 8, padding: "6px 10px",
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5" /><path d="M12 12l2.5 2.5" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111E1F" }}
            />
          </div>
        </div>

        {/* Channel list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingChannels && channels.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: "#94A3B8" }}>Loading…</div>
          )}
          {!loadingChannels && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>💬</div>
              <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>No channels</p>
            </div>
          )}
          {filtered.map(ch => {
            const name = getChannelDisplayName(ch, userId)
            const subtitle = getChannelSubtitle(ch)
            const ts = ch.lastMessage?.createdAt
            const unread = unreadMap[ch.url] ?? (ch.unreadMessageCount || 0)
            const isActive = selected?.url === ch.url
            return (
              <div
                key={ch.url}
                onClick={() => handleSelect(ch)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer",
                  background: isActive ? "#E6F4F4" : "transparent",
                  borderLeft: isActive ? "3px solid #0D7377" : "3px solid transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#F8FFFE" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
              >
                <Avatar name={name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111E1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </span>
                    <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0, marginLeft: 6 }}>
                      {fmtTime(ts)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {subtitle}
                    </span>
                    {unread > 0 && (
                      <span style={{
                        background: "#EF4444", color: "white", borderRadius: "50%",
                        minWidth: 18, height: 18, fontSize: 10, fontWeight: 700,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        padding: "0 4px", marginLeft: 6, flexShrink: 0,
                      }}>{unread > 99 ? "99+" : unread}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {hasMore && (
            <div style={{ padding: "10px", textAlign: "center" }}>
              <button
                onClick={() => loadChannels(false)}
                style={{ fontSize: 12, color: "#0D7377", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Chat window ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#94A3B8" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, opacity: 0.4 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Select a conversation</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>Choose from the list to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: "12px 20px", borderBottom: "1px solid #D1E8E8",
              background: "white", display: "flex", alignItems: "center", gap: 10,
            }}>
              <Avatar name={getChannelDisplayName(selected, userId)} size={34} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111E1F" }}>
                  {getChannelDisplayName(selected, userId)}
                </div>
                <div style={{ fontSize: 11, color: "#64748B" }}>
                  {selected.members.length} member{selected.members.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {loadingMsgs && (
                <div style={{ textAlign: "center", fontSize: 13, color: "#94A3B8", padding: 20 }}>Loading messages…</div>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <div style={{ textAlign: "center", fontSize: 13, color: "#94A3B8", padding: 20 }}>No messages yet</div>
              )}
              {messages.map((m, i) => {
                const isMe = m.sender?.userId === userId
                const text = m.message || (m.messageType === "file" ? `📎 ${m.name}` : "")
                if (!text) return null
                return (
                  <div key={m.messageId ?? i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
                    {!isMe && (
                      <span style={{ fontSize: 11, color: "#94A3B8", paddingLeft: 4 }}>
                        {m.sender?.nickname || m.sender?.userId || "User"}
                      </span>
                    )}
                    <div style={{
                      maxWidth: "65%", padding: "8px 12px",
                      borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isMe ? "#0D7377" : "#F0FDFA",
                      color: isMe ? "white" : "#111E1F",
                      fontSize: 13, lineHeight: 1.5, wordBreak: "break-word",
                    }}>
                      {text}
                    </div>
                    <span style={{ fontSize: 10, color: "#94A3B8" }}>{fmtTime(m.createdAt)}</span>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 16px", borderTop: "1px solid #D1E8E8", background: "white" }}>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 8,
                background: "#F8FFFE", border: "1.5px solid #D1E8E8", borderRadius: 12, padding: "8px 8px 8px 14px",
              }}>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Type a message…"
                  rows={1}
                  style={{
                    flex: 1, border: "none", background: "transparent", outline: "none",
                    fontSize: 13, color: "#111E1F", resize: "none", maxHeight: 100,
                    lineHeight: 1.5, fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={send}
                  disabled={!text.trim()}
                  style={{
                    background: text.trim() ? "#0D7377" : "#D1E8E8",
                    border: "none", borderRadius: 8, width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: text.trim() ? "pointer" : "default", flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p style={{ margin: "4px 0 0 4px", fontSize: 11, color: "#94A3B8" }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
