import React, { useEffect, useState } from "react"
import { TUICallKit, TUICallKitServer, TUICallType } from "@tencentcloud/call-uikit-react"
import * as GenerateTestUserSig from "../../../debug/GenerateTestUserSig-es"

const SDK_APP_ID = 20025898
const SDK_SECRET_KEY = "cc1761e049018cad20a8b11f2214e68460372e9b9d3f9a5c2acada24fb814465"
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function VideoIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

function AudioIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: "visible" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10 19.79 19.79 0 0 1 1.61 1.4a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 6.5a16 16 0 0 0 6 6l.86-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
    </svg>
  )
}

function CallModal({ mode, patient, consultationId, onClose }) {
  const isVideo = mode === "video"
  const color = isVideo ? "#0D7377" : "#14B8A6"
  const label = isVideo ? "Video Call" : "Audio Call"
  const callType = isVideo ? TUICallType.VIDEO_CALL : TUICallType.AUDIO_CALL

  const callerUserID = localStorage.getItem("sendBirdUserId") || ""
  const calleeUserID = patient?._id || ""

  const [status, setStatus] = useState("init") // init | ready | calling | error
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!callerUserID || !calleeUserID) {
      setErrorMsg("Missing caller or patient ID. Please check your session.")
      setStatus("error")
      return
    }
    let cancelled = false
    const init = async () => {
      try {
        const { userSig } = GenerateTestUserSig.genTestUserSig({
          userID: callerUserID,
          SDKAppID: SDK_APP_ID,
          SecretKey: SDK_SECRET_KEY,
        })
        await TUICallKitServer.init({ userID: callerUserID, userSig, SDKAppID: SDK_APP_ID })
        try { await TUICallKitServer.enableFloatWindow(true) } catch {}
        if (!cancelled) setStatus("ready")
      } catch (e) {
        console.error("CallModal init error:", e)
        if (!cancelled) {
          setErrorMsg("Failed to initialize call. Please try again.")
          setStatus("error")
        }
      }
    }
    init()
    return () => { cancelled = true }
  }, [callerUserID, calleeUserID])

  const handleStart = async () => {
    try {
      await fetch(`${BASE_URL}/consultations/update/${consultationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCalling: true }),
      }).catch(() => {})
      await TUICallKitServer.call({ userID: calleeUserID, type: callType })
      setStatus("calling")
    } catch (e) {
      console.error("CallModal start error:", e)
      setErrorMsg("Failed to start the call. Please try again.")
      setStatus("error")
    }
  }

  const handleClose = async () => {
    if (status === "calling") {
      await fetch(`${BASE_URL}/consultations/update/${consultationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCalling: false }),
        keepalive: true,
      }).catch(() => {})
    }
    onClose()
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div style={{ background: "white", borderRadius: 16, width: 480, maxWidth: "94vw", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ background: color, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
            {isVideo ? <VideoIcon size={18} /> : <AudioIcon size={18} />}
            <span style={{ fontWeight: 700, fontSize: 16 }}>{label}</span>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "32px 24px", textAlign: "center" }}>

          {/* Patient info */}
          {patient && (
            <div style={{ marginBottom: 24, padding: "12px 16px", background: "#F0FDFA", borderRadius: 10, border: "1px solid #D1E8E8" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111E1F" }}>{patient.name}</div>
              {patient.phone && <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{patient.phone}</div>}
            </div>
          )}

          {/* States */}
          {status === "init" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 48, height: 48, border: `4px solid ${color}`,
                borderTopColor: "transparent", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 14, color: "#64748B" }}>Initializing {label.toLowerCase()}…</div>
            </div>
          )}

          {status === "ready" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 6px 20px ${color}50`,
                color: "white",
              }}>
                {isVideo ? <VideoIcon size={28} /> : <AudioIcon size={28} />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#111E1F", marginBottom: 4 }}>Ready to connect</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>Click below to start the {label.toLowerCase()} with {patient?.name || "the patient"}</div>
              </div>
              <button
                onClick={handleStart}
                style={{
                  background: color, color: "white", border: "none", borderRadius: 10,
                  padding: "12px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 4px 14px ${color}50`, display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {isVideo ? <VideoIcon size={16} /> : <AudioIcon size={16} />}
                Start {label}
              </button>
            </div>
          )}

          {status === "calling" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 14, height: 14, background: "#22C55E", borderRadius: "50%", boxShadow: "0 0 0 4px #22C55E30" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>Call in progress</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Use the call controls to manage your {label.toLowerCase()}.</div>
            </div>
          )}

          {status === "error" && (
            <div style={{ color: "#EF4444", fontSize: 14 }}>{errorMsg}</div>
          )}
        </div>
      </div>

      {/* TUICallKit renders its own overlay for the active call */}
      <TUICallKit />
    </div>
  )
}

export default CallModal
