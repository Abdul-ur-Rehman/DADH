import React, { useEffect, useState, useRef } from "react"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function calculateAge(DOB) {
  if (!DOB) return "N/A"
  const birth = new Date(DOB)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

function DoctorHistoryNew() {
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split("T")[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0])
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/consultations/incompleteBillings/${doctorId}`)
        const result = await res.json()
        if (!res.ok || !isMountedRef.current) return

        const enriched = await Promise.all(
          (result.data || []).map(async (c) => {
            let patientName = "Unknown"
            let patientAge = "N/A"
            let patientGender = ""
            try {
              const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`)
              const pd = await pr.json()
              if (pr.ok) {
                patientName = pd.data.name || "Unknown"
                patientAge = calculateAge(pd.data.DOB)
                patientGender = pd.data.gender || ""
              }
            } catch {}
            return {
              ...c,
              patientName,
              patientAge,
              patientGender,
              hasCert: !!(c.certificate),
              hasBilling: !!(c.billCodes && c.billCodes.length > 0),
              certRequested: !!(c.certificateRequested),
              date: c.createdAt,
            }
          })
        )
        if (isMountedRef.current) {
          setRows(enriched)
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [doctorId])

  const filtered = rows.filter(r => {
    const d = new Date(r.date)
    const from = new Date(fromDate)
    const to = new Date(toDate); to.setHours(23, 59, 59)
    if (d < from || d > to) return false
    if (search && !r.patientName.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter === "incomplete" && r.hasCert && r.hasBilling) return false
    if (statusFilter === "complete" && (!r.hasCert || !r.hasBilling)) return false
    return true
  })

  const inputStyle = { border: "1px solid #D1E8E8", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", background: "#FAFFFE" }

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Consult History</h2>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="Search patient…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 200 }} />
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
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading…</div>
        ) : (
          <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
                  {["Patient", "Date", "Type", "Status", "Certificate", "Billing", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No consultations found</td></tr>
                )}
                {filtered.map((r, i) => (
                  <tr key={r._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFFFE"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>
                      <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{r.patientAge}, {r.patientGender}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {r.type === "videoCall" ? "Video" : r.type === "phoneCall" ? "Audio" : "Chat"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {(!r.hasCert || !r.hasBilling) ? (
                        <span style={{ fontSize: 11, background: "#FFF8E1", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px" }}>⚠ Incomplete</span>
                      ) : (
                        <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>✓ Complete</span>
                      )}
                      {r.certRequested && !r.hasCert && (
                        <span style={{ fontSize: 11, background: "#FFF8E1", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px", marginLeft: 4 }}>📋 Cert Requested</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: r.hasCert ? "#22C55E" : "#94A3B8" }}>{r.hasCert ? "✓ Issued" : "—"}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: r.hasBilling ? "#22C55E" : "#94A3B8" }}>{r.hasBilling ? "✓ Billed" : "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#0D7377" }}>View</button>
                        {!r.hasCert && <button style={{ background: "none", border: "1px solid #F59E0B", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#92400E" }}>Certify</button>}
                        {!r.hasBilling && <button style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#64748B" }}>Bill</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorAppLayout>
  )
}

export default DoctorHistoryNew
