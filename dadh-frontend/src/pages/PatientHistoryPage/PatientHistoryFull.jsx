import React, { useEffect, useState, useCallback } from "react"
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
      const completed = (res.data || []).filter((c) => c.isCompleted)

      const enriched = await Promise.all(
        completed.map(async (c) => {
          let doctorInfo = { name: "Unknown", qualification: "", prescriberNumber: "", signature: "" }
          if (c.doctorId) {
            try {
              const dr = await fetchJSON(`${BASE_URL}/doctor-requests/getOneById/${c.doctorId}`)
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

          let categoryName = c.consultationCategory
          try {
            const cat = await fetchJSON(`${BASE_URL}/consultationCategory/getOneByKey`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: c.consultationCategory }),
            })
            if (cat.state) categoryName = cat.data.category
          } catch {}

          return { ...c, doctorInfo, categoryName }
        })
      )

      enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setConsultations(enriched)
    } catch (e) {
      console.error("PatientHistoryFull fetch error:", e)
    } finally {
      setLoading(false)
    }
  }, [patientId, fetchJSON])

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
