import React, { useEffect, useState, useCallback, useRef } from "react"
import RecentHistoryTable from "../PatientHome/RecentHistoryTable"
import ConsultationDetailModal from "../PatientHistory/ConsultationDetailModal"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function HistorySkeleton() {
  return (
    <div style={{ animationName: "pulse", animationDuration: "2s", animationIterationCount: "infinite" }}>
      <div style={{ height: 28, width: 200, background: "#E6F4F4", borderRadius: 8, marginBottom: 8 }} />
      <div style={{ height: 16, width: 280, background: "#E6F4F4", borderRadius: 4, marginBottom: 28 }} />
      <div style={{ height: 220, width: "100%", background: "#E6F4F4", borderRadius: 12 }} />
    </div>
  )
}

function PatientHistoryFull() {
  const patient = (() => {
    try { return JSON.parse(localStorage.getItem("patientData"))?.data || {} }
    catch { return {} }
  })()

  const patientId = patient._id
  const patientName = patient.name || ""
  const patientDOB = patient.DOB || patient.dob || ""

  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestingId, setRequestingId] = useState(null)
  const [detailConsult, setDetailConsult] = useState(null)

  const doctorCacheRef = useRef({})
  const categoryCacheRef = useRef({})

  const fetchData = useCallback(async () => {
    if (!patientId) { setLoading(false); return }
    try {
      const res = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const completed = (json.data || []).filter((c) => c.isCompleted)

      // Show list immediately, enrich in background
      completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setConsultations(completed)
      setLoading(false)

      const uniqueDoctorIds = [...new Set(completed.map((c) => c.doctorId).filter(Boolean))]
      const uniqueCategoryKeys = [...new Set(completed.map((c) => c.consultationCategory).filter(Boolean))]

      await Promise.all([
        ...uniqueDoctorIds.filter((id) => !doctorCacheRef.current[id]).map(async (id) => {
          try {
            const dr = await fetch(`${BASE_URL}/doctor-requests/getOneById/${id}`).then((r) => r.json())
            if (dr.state) doctorCacheRef.current[id] = { name: dr.data.name || "Unknown", qualification: dr.data.qualification || "", prescriberNumber: dr.data.prescriberNumber || "", signature: dr.data.signature || "" }
          } catch {}
        }),
        ...uniqueCategoryKeys.filter((key) => !categoryCacheRef.current[key]).map(async (key) => {
          try {
            const cat = await fetch(`${BASE_URL}/consultationCategory/getOneByKey`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) }).then((r) => r.json())
            if (cat.state) categoryCacheRef.current[key] = cat.data.category
          } catch {}
        }),
      ])

      setConsultations(
        completed.map((c) => ({
          ...c,
          doctorInfo: doctorCacheRef.current[c.doctorId] || { name: c.doctorId ? "Unknown" : "—", qualification: "", prescriberNumber: "", signature: "" },
          categoryName: categoryCacheRef.current[c.consultationCategory] || c.consultationCategory,
        }))
      )
    } catch (e) {
      console.error("PatientHistoryFull fetch error:", e)
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRequestCertificate = async (consultationId) => {
    if (requestingId) return
    setRequestingId(consultationId)
    try {
      const res = await fetch(`${BASE_URL}/consultations/request-certificate/${consultationId}`, { method: "PATCH" })
      const json = await res.json()
      if (res.ok && json.state) {
        setConsultations((prev) =>
          prev.map((c) =>
            c._id === consultationId
              ? { ...c, requestedCertificate: [{ requestedAt: new Date(), status: "pending" }] }
              : c
          )
        )
      }
    } catch {}
    finally { setRequestingId(null) }
  }

  return (
    <div className="dadh-tw-root">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", margin: 0, lineHeight: 1.3 }}>
          Consultation History
        </h1>
        <p style={{ fontSize: 13, color: "#4B7172", marginTop: 4, marginBottom: 0 }}>
          All your completed consultations, newest first.
        </p>
      </div>

      {loading ? (
        <HistorySkeleton />
      ) : (
        <RecentHistoryTable
          consultations={consultations}
          patientName={patientName}
          patientDOB={patientDOB}
          onRequestCertificate={handleRequestCertificate}
          onViewDetails={setDetailConsult}
        />
      )}

      {detailConsult && (
        <ConsultationDetailModal
          consultation={detailConsult}
          patientName={patientName}
          patientDOB={patientDOB}
          onClose={() => setDetailConsult(null)}
        />
      )}
    </div>
  )
}

export default PatientHistoryFull
