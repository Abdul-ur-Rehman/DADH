import React, { useEffect, useState, useRef } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"
import { useNavigate } from "react-router-dom"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white", border: "1px solid #D1E8E8", borderRadius: 12, padding: "20px 24px",
        flex: 1, cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,115,119,0.12)" }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none" }}
    >
      <div style={{ fontSize: 30, fontWeight: 800, color: color || "#0D7377" }}>{value}</div>
      <div style={{ fontSize: 14, color: "#111E1F", fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

function AdminHomeDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ doctors: 0, patients: 0, consultations: 0, revenue: 0 })
  const [recentConsults, setRecentConsults] = useState([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async () => {
      try {
        const [docRes, patRes, consultRes] = await Promise.all([
          fetch(`${BASE_URL}/doctor-requests/getAll`),
          fetch(`${BASE_URL}/patient/auth/getAll`),
          fetch(`${BASE_URL}/consultations/getConsultations`),
        ])
        const [docData, patData, consultData] = await Promise.all([
          docRes.json(), patRes.json(), consultRes.json(),
        ])
        if (!isMountedRef.current) return

        const doctors = docData.data?.length || 0
        const patients = patData.data?.length || 0
        const consults = consultData.data || []
        const revenue = consults.reduce((sum, c) => {
          if (c.billCodes?.length) sum += c.billCodes.length * 50
          return sum
        }, 0)

        setStats({ doctors, patients, consultations: consults.length, revenue })
        setRecentConsults(consults.slice(-10).reverse())
        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [])

  return (
    <AdminAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Dashboard</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>Loading…</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              <StatCard label="Total Doctors" value={stats.doctors} color="#0D7377" onClick={() => navigate("/admin/doctorRequests/table")} />
              <StatCard label="Total Patients" value={stats.patients} color="#14B8A6" onClick={() => navigate("/admin/patientDetails/table")} />
              <StatCard label="Total Consultations" value={stats.consultations} color="#8B5CF6" onClick={() => navigate("/admin/Consultations")} />
              <StatCard label="Est. Revenue" value={`$${stats.revenue.toLocaleString()}`} sub="based on billed codes" color="#22C55E" />
            </div>

            <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #D1E8E8", fontWeight: 700, fontSize: 15, color: "#111E1F" }}>
                Recent Consultations
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
                    {["Patient", "Doctor", "Type", "Date", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentConsults.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No consultations yet</td></tr>
                  )}
                  {recentConsults.map((c, i) => (
                    <tr key={c._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>{c.patientId?.name || c.patientId || "—"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>{c.doctorId?.name || c.doctorId || "—"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                        {c.type === "videoCall" ? "Video" : c.type === "phoneCall" ? "Audio" : "Chat"}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{formatDate(c.createdAt)}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {c.isCompleted
                          ? <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>✓ Completed</span>
                          : <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #93C5FD", borderRadius: 10, padding: "2px 8px" }}>● Active</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminAppLayout>
  )
}

export default AdminHomeDashboard
