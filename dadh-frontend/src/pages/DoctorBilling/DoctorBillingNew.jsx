import React, { useEffect, useState, useRef } from "react"
import DoctorAppLayout from "../../components/DoctorLayout/DoctorAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, padding: "18px 22px", flex: 1 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#111E1F" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{label}</div>
    </div>
  )
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

function DoctorBillingNew() {
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
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
            try {
              const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`)
              const pd = await pr.json()
              if (pr.ok) patientName = pd.data.name || "Unknown"
            } catch {}
            return { ...c, patientName, date: c.createdAt, hasBilling: !!(c.billCodes && c.billCodes.length > 0) }
          })
        )
        if (isMountedRef.current) { setRows(enriched); setLoading(false) }
      } catch { setLoading(false) }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [doctorId])

  const billed = rows.filter(r => r.hasBilling).length
  const unbilled = rows.filter(r => !r.hasBilling).length

  return (
    <DoctorAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Billing</h2>

        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <StatCard label="Billed this period" value={billed} color="#22C55E" />
          <StatCard label="Pending billing" value={unbilled} color="#F59E0B" />
          <StatCard label="Total consultations" value={rows.length} color="#0D7377" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading…</div>
        ) : (
          <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
                  {["Patient", "Date", "Type", "Billing Codes", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No billing records found</td></tr>
                )}
                {rows.map((r, i) => (
                  <tr key={r._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111E1F" }}>{r.patientName}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{formatDate(r.date)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {r.type === "videoCall" ? "Video" : r.type === "phoneCall" ? "Audio" : "Chat"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {r.billCodes?.join(", ") || "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {r.hasBilling
                        ? <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>✓ Billed</span>
                        : <span style={{ fontSize: 11, background: "#FFF8E1", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px" }}>Pending</span>
                      }
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {!r.hasBilling && (
                        <button style={{ background: "#0D7377", color: "white", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
                          Add Billing Code
                        </button>
                      )}
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

export default DoctorBillingNew
