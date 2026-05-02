import React, { useEffect, useState, useRef, useCallback } from "react"
import IncomingCallBanner from "./IncomingCallBanner"
import ActiveConsultCard from "./ActiveConsultCard"
import RecentHistoryTable from "./RecentHistoryTable"
import PatientCallPage from "pages/PatientCall/PatientCallPage"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function PatientHome() {
  const patient = (() => {
    try { return JSON.parse(localStorage.getItem("patientData"))?.data || {} }
    catch { return {} }
  })()

  const patientId = patient._id
  const patientName = patient.name || "there"
  const patientDOB = patient.DOB || patient.dob || ""

  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [callState, setCallState] = useState({
    isReceivingCall: false,
    callingDoctor: null,
    consultationId: null,
    callType: null,
  })
  const [callModalOpen, setCallModalOpen] = useState(false)

  // Ref tracks active call consultation to avoid stale closure in polling interval
  const callConsultIdRef = useRef(null)
  const doctorCacheRef = useRef({})
  const categoryCacheRef = useRef({})

  // Single-attempt fetch for enrichment data — no retries to avoid blocking the render
  const fetchEnrich = useCallback(async (url, opts = {}) => {
    const res = await fetch(url, opts)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }, [])

  const fetchData = useCallback(async () => {
    if (!patientId) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const list = json.data || []

      // Show content immediately with placeholder doctor names — enrich after
      setConsultations((prev) => {
        const prevMap = Object.fromEntries(prev.map((c) => [c._id, c]))
        return list.map((c) => ({ ...prevMap[c._id], ...c }))
      })
      setLoading(false)

      // Detect call state from raw data right away
      for (const c of list) {
        if (c.isCalling && !c.isCompleted) {
          if (callConsultIdRef.current !== c._id) {
            callConsultIdRef.current = c._id
            setCallState({ isReceivingCall: true, callingDoctor: null, consultationId: c._id, callType: c.type })
          }
        } else if (callConsultIdRef.current === c._id && !c.isCalling) {
          callConsultIdRef.current = null
          setCallState({ isReceivingCall: false, callingDoctor: null, consultationId: null, callType: null })
        }
      }

      // Enrich in background — deduplicate doctor & category lookups
      const uniqueDoctorIds = [...new Set(list.map((c) => c.doctorId).filter(Boolean))]
      const uniqueCategoryKeys = [...new Set(list.map((c) => c.consultationCategory).filter(Boolean))]

      await Promise.all([
        ...uniqueDoctorIds
          .filter((id) => !doctorCacheRef.current[id])
          .map(async (id) => {
            try {
              const dr = await fetchEnrich(`${BASE_URL}/doctor-requests/getOneById/${id}`)
              if (dr.state) doctorCacheRef.current[id] = { name: dr.data.name || "Unknown", qualification: dr.data.qualification || "", prescriberNumber: dr.data.prescriberNumber || "", signature: dr.data.signature || "" }
            } catch {}
          }),
        ...uniqueCategoryKeys
          .filter((key) => !categoryCacheRef.current[key])
          .map(async (key) => {
            try {
              const cat = await fetchEnrich(`${BASE_URL}/consultationCategory/getOneByKey`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) })
              if (cat.state) categoryCacheRef.current[key] = cat.data.category
            } catch {}
          }),
      ])

      // Apply enrichment to the list
      const enriched = list.map((c) => ({
        ...c,
        doctorInfo: doctorCacheRef.current[c.doctorId] || { name: c.doctorId ? "Unknown" : "Assigning...", qualification: "", prescriberNumber: "", signature: "" },
        categoryName: categoryCacheRef.current[c.consultationCategory] || c.consultationCategory,
      }))

      // Update call state with resolved doctor name
      for (const c of enriched) {
        if (callConsultIdRef.current === c._id && c.doctorInfo?.name) {
          setCallState((p) => ({ ...p, callingDoctor: c.doctorInfo.name }))
        }
      }

      setConsultations(enriched)
    } catch (e) {
      console.error("PatientHome fetch error:", e)
      setLoading(false)
    }
  }, [patientId, fetchEnrich])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 15000)
    return () => clearInterval(id)
  }, [fetchData])

  const handleAnswerCall = () => {
    setCallModalOpen(true)
    setCallState((p) => ({ ...p, isReceivingCall: false }))
  }

  const handleDeclineCall = async () => {
    const id = callState.consultationId
    callConsultIdRef.current = null
    setCallState({ isReceivingCall: false, callingDoctor: null, consultationId: null, callType: null })
    if (id) {
      try {
        await fetch(`${BASE_URL}/consultations/update/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCalling: false }),
        })
      } catch {}
    }
  }

  const handleEndCall = async () => {
    const id = callState.consultationId || localStorage.getItem("consultationId")
    setCallModalOpen(false)
    if (id) {
      try {
        await fetch(`${BASE_URL}/consultations/update/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCalling: false }),
        })
      } catch {}
    }
  }

  // Active = most recent non-completed; History = last 3 completed (newest first)
  const activeConsultation = consultations.find((c) => !c.isCompleted) || null
  const recentHistory = consultations
    .filter((c) => c.isCompleted)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  if (loading) {
    return (
      <div className="dadh-tw-root">
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="dadh-tw-root">
      {/* Incoming call banner — fixed, full-viewport */}
      {callState.isReceivingCall && !callModalOpen && (
        <IncomingCallBanner
          doctorName={callState.callingDoctor}
          callType={callState.callType}
          onAnswer={handleAnswerCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Full-screen call overlay */}
      {callModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
            <button
              onClick={handleEndCall}
              style={{
                background: "#EF4444",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "9px 22px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              End Call
            </button>
          </div>
          <PatientCallPage />
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", margin: 0, lineHeight: 1.3 }}>
          {getGreeting()}, {patientName.split(" ")[0]}
        </h1>
        <p style={{ fontSize: 13, color: "#4B7172", marginTop: 4, marginBottom: 0 }}>
          Here's an overview of your health activity.
        </p>
      </div>

      {/* Current Consultation */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Current Consultation
        </h2>
        <ActiveConsultCard
          consultation={activeConsultation}
          onAnswerCall={handleAnswerCall}
        />
      </section>

      {/* Recent Consultations */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Recent Consultations
        </h2>
        <RecentHistoryTable
          consultations={recentHistory}
          patientName={patientName}
          patientDOB={patientDOB}
        />
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="h-10 w-44 bg-muted rounded-lg shrink-0" />
      </div>
      <div className="h-5 w-44 bg-muted rounded mb-3" />
      <div className="h-28 w-full bg-muted rounded-xl mb-8" />
      <div className="h-5 w-52 bg-muted rounded mb-3" />
      <div className="h-52 w-full bg-muted rounded-xl" />
    </div>
  )
}

export default PatientHome
