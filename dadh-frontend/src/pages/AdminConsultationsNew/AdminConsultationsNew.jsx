import React, { useEffect, useState, useRef } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function CertViewer({ cert, doctor, patient, patientDOB, onClose }) {
  const today = new Date().toLocaleDateString("en-AU")
  const formattedDOB = patientDOB ? new Date(patientDOB).toLocaleDateString("en-AU") : "N/A"
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 12, padding: 40, width: 700, maxWidth: "95%", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>DADH</div>
          <div style={{ textAlign: "right", fontSize: 13, color: "#64748B" }}>
            <div>Fax: (07) 3835 1012</div>
            <div>{today}</div>
          </div>
        </div>
        <h2 style={{ textAlign: "center", marginBottom: 24, color: "#111E1F" }}>{cert.certificationType}</h2>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#111E1F", marginBottom: 32 }}>
          <p><strong>Re:</strong> {patient}, {formattedDOB}</p>
          {cert.note && <p><strong>Note:</strong> {cert.note}</p>}
        </div>
        <div style={{ marginTop: 40 }}>
          {doctor.signature && <img src={`data:image/png;base64,${doctor.signature}`} alt="signature" style={{ width: 140, height: "auto", marginBottom: 8 }} />}
          <div style={{ fontSize: 13, color: "#64748B" }}>
            <div>Dr {doctor.name}</div>
            <div>Qualification: {doctor.qualification}</div>
            <div>Prescriber No: {doctor.prescriberNumber}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={() => window.print()} style={{ background: "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>Print</button>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", color: "#64748B" }}>Close</button>
        </div>
      </div>
    </div>
  )
}

function AdminConsultationsNew() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [certModal, setCertModal] = useState(null)
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split("T")[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0])
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/consultations/getConsultations`)
        const data = await res.json()
        if (!isMountedRef.current) return

        const enriched = await Promise.all((data.data || []).map(async c => {
          let patientName = "N/A", patientDOB = null, patientAge = "N/A"
          let doctorName = "N/A", doctorInfo = {}
          let totalAmount = 0

          try {
            if (c.patientId && typeof c.patientId === "string") {
              const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`)
              const pd = await pr.json()
              if (pr.ok && pd.data) {
                patientName = pd.data.name || "N/A"
                patientDOB = pd.data.DOB
                const birth = new Date(pd.data.DOB)
                patientAge = isNaN(birth) ? "N/A" : new Date().getFullYear() - birth.getFullYear()
              }
            }
          } catch {}

          try {
            if (c.doctorId && typeof c.doctorId === "string") {
              const dr = await fetch(`${BASE_URL}/doctor-requests/getOneById/${c.doctorId}`)
              const dd = await dr.json()
              if (dr.ok && dd.data) { doctorName = dd.data.name || "N/A"; doctorInfo = dd.data }
            }
          } catch {}

          for (const code of c.billCodes || []) {
            try {
              const br = await fetch(`${BASE_URL}/billing/getOneById/${code}`)
              const bd = await br.json()
              if (br.ok && bd.data?.amount) totalAmount += parseFloat(bd.data.amount)
            } catch {}
          }

          return { ...c, patientName, patientDOB, patientAge, doctorName, doctorInfo, totalAmount }
        }))

        if (isMountedRef.current) {
          setConsultations(enriched.reverse())
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [])

  const filtered = consultations.filter(c => {
    const d = new Date(c.createdAt)
    const from = new Date(fromDate)
    const to = new Date(toDate); to.setHours(23, 59, 59)
    if (d < from || d > to) return false
    if (search && !c.patientName.toLowerCase().includes(search.toLowerCase()) && !c.doctorName.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter === "completed" && !c.isCompleted) return false
    if (statusFilter === "active" && c.isCompleted) return false
    return true
  })

  const inputStyle = { border: "1px solid #D1E8E8", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", background: "#FAFFFE" }

  return (
    <AdminAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Consultations</h2>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="Search patient or doctor…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 220 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, color: "#64748B" }}>From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, color: "#64748B" }}>To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
          </select>
          <span style={{ fontSize: 13, color: "#64748B", marginLeft: "auto" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>Loading consultations…</div>
        ) : (
          <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
                  {["Doctor", "Patient", "Age", "Date", "Type", "Status", "Billing", "Certificates"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No consultations found</td></tr>
                )}
                {filtered.map((c, i) => (
                  <tr key={c._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111E1F" }}>{c.doctorName}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>{c.patientName}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{c.patientAge}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {c.type === "videoCall" ? "Video" : c.type === "phoneCall" ? "Audio" : "Chat"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {c.isCompleted
                        ? <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>✓ Completed</span>
                        : <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #93C5FD", borderRadius: 10, padding: "2px 8px" }}>● Active</span>
                      }
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: c.totalAmount > 0 ? "#22C55E" : "#F59E0B", fontWeight: 600 }}>
                      {c.totalAmount > 0 ? `$${c.totalAmount.toFixed(2)}` : "Pending"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {(c.certificates || []).map((cert, j) => (
                        <button key={j} onClick={() => setCertModal({ cert, doctor: c.doctorInfo, patient: c.patientName, patientDOB: c.patientDOB })}
                          style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#0D7377", marginRight: 4 }}>
                          📄 {cert.certificationType || "Cert"}
                        </button>
                      ))}
                      {(!c.certificates || c.certificates.length === 0) && <span style={{ fontSize: 12, color: "#94A3B8" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {certModal && (
        <CertViewer
          cert={certModal.cert}
          doctor={certModal.doctor}
          patient={certModal.patient}
          patientDOB={certModal.patientDOB}
          onClose={() => setCertModal(null)}
        />
      )}
    </AdminAppLayout>
  )
}

export default AdminConsultationsNew
