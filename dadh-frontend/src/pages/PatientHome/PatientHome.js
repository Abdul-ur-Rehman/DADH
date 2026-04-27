import React, { useEffect, useState, useRef, useCallback } from "react"
import IncomingCallBanner from "./IncomingCallBanner"
import ActiveConsultCard from "./ActiveConsultCard"
import RecentHistoryTable from "./RecentHistoryTable"
import CertificateModal from "./CertificateModal"
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
  const [certModal, setCertModal] = useState({
    show: false,
    certificate: null,
    doctorInfo: {},
    patientName,
    patientDOB,
  })

  // Ref tracks active call consultation to avoid stale closure in polling interval
  const callConsultIdRef = useRef(null)
  const isFirstLoad = useRef(true)

  const fetchJSON = useCallback(async (url, opts = {}) => {
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(url, opts)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
      } catch (e) {
        if (i === 2) throw e
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!patientId) return

    try {
      const res = await fetchJSON(
        `${BASE_URL}/consultations/getConsulationByPatient/${patientId}`
      )
      const list = res.data || []

      const enriched = await Promise.all(
        list.map(async (c) => {
          // Doctor info
          let doctorInfo = {
            name: "Assigning...",
            qualification: "",
            prescriberNumber: "",
            signature: "",
          }
          if (c.doctorId) {
            try {
              const dr = await fetchJSON(
                `${BASE_URL}/doctor-requests/getOneById/${c.doctorId}`
              )
              if (dr.state) {
                doctorInfo = {
                  name: dr.data.name || "Unknown",
                  qualification: dr.data.qualification || "",
                  prescriberNumber: dr.data.prescriberNumber || "",
                  signature: dr.data.signature || "",
                }
              }
            } catch {}
          }

          // Incoming call detection — use ref to avoid stale closure
          if (c.isCalling && !c.isCompleted) {
            if (callConsultIdRef.current !== c._id) {
              callConsultIdRef.current = c._id
              setCallState({
                isReceivingCall: true,
                callingDoctor: doctorInfo.name,
                consultationId: c._id,
                callType: c.type,
              })
            }
          } else if (callConsultIdRef.current === c._id && !c.isCalling) {
            callConsultIdRef.current = null
            setCallState({
              isReceivingCall: false,
              callingDoctor: null,
              consultationId: null,
              callType: null,
            })
          }

          // Category name
          let categoryName = c.consultationCategory
          try {
            const cat = await fetchJSON(
              `${BASE_URL}/consultationCategory/getOneByKey`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: c.consultationCategory }),
              }
            )
            if (cat.state) categoryName = cat.data.category
          } catch {}

          return { ...c, doctorInfo, categoryName }
        })
      )

      setConsultations(enriched)
    } catch (e) {
      console.error("PatientHome fetch error:", e)
    } finally {
      if (isFirstLoad.current) {
        setLoading(false)
        isFirstLoad.current = false
      }
    }
  }, [patientId, fetchJSON])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 10000)
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
    .slice(-3)
    .reverse()

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
          onViewCertificate={(cert, doctorInfo) =>
            setCertModal({ show: true, certificate: cert, doctorInfo, patientName, patientDOB })
          }
        />
      </section>

      {/* Certificate modal */}
      <CertificateModal
        {...certModal}
        onClose={() => setCertModal((m) => ({ ...m, show: false }))}
      />
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
