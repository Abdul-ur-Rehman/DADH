import React, { useEffect, useState, useRef } from "react"
import SendbirdChat from "@sendbird/chat"
import { GroupChannelModule, GroupChannelHandler } from "@sendbird/chat/groupChannel"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID || ""

function timeLabel(ts) {
  if (!ts) return ""
  return new Date(ts).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
}

function DoctorInboxNew() {
  const doctorUserId = localStorage.getItem("sendBirdUserId") || ""

  const [sb, setSb] = useState(null)
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loadingChannels, setLoadingChannels] = useState(true)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const bottomRef = useRef(null)
  const sbRef = useRef(null)
  const handlerKeyRef = useRef(null)

  useEffect(() => {
    if (!APP_ID || !doctorUserId) return
    let isMounted = true
    const init = async () => {
      try {
        const instance = SendbirdChat.init({ appId: APP_ID, modules: [new GroupChannelModule()] })
        await instance.connect(doctorUserId)
        sbRef.current = instance
        if (isMounted) {
          setSb(instance)
          loadChannels(instance)
        }
      } catch (e) {
        console.error("Sendbird init error:", e)
        if (isMounted) setLoadingChannels(false)
      }
    }
    init()
    return () => { isMounted = false }
  }, [doctorUserId])

  const loadChannels = async (instance) => {
    try {
      const query = instance.groupChannel.createMyGroupChannelListQuery({ limit: 20, includeEmpty: true })
      const result = await query.next()
      setChannels(result || [])
    } catch (e) {
      console.error("loadChannels error:", e)
    }
    setLoadingChannels(false)
  }

  const openChannel = async (channel) => {
    if (handlerKeyRef.current && sbRef.current) {
      sbRef.current.groupChannel.removeGroupChannelHandler(handlerKeyRef.current)
    }

    setActiveChannel(channel)
    try {
      const params = { prevResultSize: 30, nextResultSize: 0 }
      const msgs = await channel.getMessagesByTimestamp(Date.now(), params)
      setMessages(msgs)
    } catch (e) {
      console.error("getMessages error:", e)
    }

    if (sbRef.current) {
      const handlerKey = `doctor-inbox-${channel.url}-${Date.now()}`
      handlerKeyRef.current = handlerKey
      sbRef.current.groupChannel.addGroupChannelHandler(handlerKey, new GroupChannelHandler({
        onMessageReceived(ch, msg) {
          if (ch?.url !== channel.url) return
          setMessages(prev => [...prev, msg])
        },
      }))
    }

    return () => {
      if (handlerKeyRef.current && sbRef.current) {
        sbRef.current.groupChannel.removeGroupChannelHandler(handlerKeyRef.current)
      }
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => () => {
    if (handlerKeyRef.current && sbRef.current) {
      sbRef.current.groupChannel.removeGroupChannelHandler(handlerKeyRef.current)
    }
  }, [sb])

  const sendText = async () => {
    const trimmed = text.trim()
    if (!trimmed || !activeChannel) return
    try {
      const msg = await activeChannel.sendUserMessage({ message: trimmed })
      setMessages(prev => [...prev, msg])
      setText("")
      if (textareaRef.current) { textareaRef.current.style.height = "auto" }
    } catch (e) {
      console.error("sendUserMessage error:", e)
    }
  }

  const sendFile = async (file) => {
    if (!activeChannel || !file) return
    try {
      const msg = await activeChannel.sendFileMessage({ file, fileName: file.name, mimeType: file.type })
      setMessages(prev => [...prev, msg])
    } catch (e) {
      console.error("sendFileMessage error:", e)
    }
  }

  const handleInput = (e) => {
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
    setText(e.target.value)
  }

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ display: "flex", height: "calc(100vh - 64px)", background: "#FAFFFE" }}>
        <div style={{ width: 280, borderRight: "1px solid #D1E8E8", display: "flex", flexDirection: "column", background: "white" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D1E8E8", fontWeight: 700, fontSize: 15, color: "#111E1F" }}>Inbox</div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingChannels && <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Loading…</div>}
            {!loadingChannels && channels.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Your Inbox is Empty</div>
            )}
            {channels.map(ch => (
              <div
                key={ch.url}
                onClick={() => openChannel(ch)}
                style={{
                  padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #F1F5F9",
                  background: activeChannel?.url === ch.url ? "#F0FDFA" : "transparent",
                  borderLeft: activeChannel?.url === ch.url ? "3px solid #0D7377" : "3px solid transparent",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: "#111E1F", marginBottom: 2 }}>{ch.name || ch.url}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ch.lastMessage?.message || "No messages yet"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!activeChannel ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 15 }}>
              Select a conversation
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #D1E8E8", fontWeight: 600, fontSize: 15, color: "#111E1F", background: "white" }}>
                {activeChannel.name || activeChannel.url}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => {
                  const isMe = m.sender?.userId === doctorUserId
                  return (
                    <div key={m.messageId || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "70%", padding: "8px 12px", borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        background: isMe ? "#0D7377" : "white",
                        border: isMe ? "none" : "1px solid #D1E8E8",
                        color: isMe ? "white" : "#111E1F", fontSize: 14,
                      }}>
                        {m.messageType === "file" ? (
                          <a href={m.url} target="_blank" rel="noreferrer" style={{ color: isMe ? "white" : "#0D7377" }}>
                            📎 {m.name}
                          </a>
                        ) : m.message}
                        <div style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.6)" : "#94A3B8", marginTop: 4, textAlign: "right" }}>
                          {timeLabel(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <div style={{ padding: "10px 16px", borderTop: "1px solid #D1E8E8", background: "white" }}>
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "#F8FFFE", border: "1.5px solid #D1E8E8", borderRadius: 16, padding: "8px 10px 8px 14px" }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = "#0D7377"}
                  onBlurCapture={e => e.currentTarget.style.borderColor = "#D1E8E8"}
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4, flexShrink: 0 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onInput={handleInput}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText() } }}
                    placeholder="Type a message…"
                    rows={1}
                    style={{ flex: 1, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: 14, color: "#111E1F", overflowY: "hidden", maxHeight: 120, fontFamily: "inherit" }}
                  />
                  <button
                    onClick={sendText}
                    style={{ background: "#0D7377", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={e => sendFile(e.target.files[0])} />
              </div>
            </>
          )}
        </div>
      </div>
    </DoctorAppLayout>
  )
}

export default DoctorInboxNew
