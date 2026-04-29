import React, { useState, useEffect, useRef } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"

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

function PatientDetailPanel({ patient, onClose }) {
  const rows = [
    ["Name", patient.name], ["Email", patient.email], ["Phone", patient.phone],
    ["Date of Birth", patient.DOB ? new Date(patient.DOB).toLocaleDateString("en-AU") : "N/A"],
    ["Age", calculateAge(patient.DOB)], ["Gender", patient.gender],
    ["Address", patient.address], ["Allergies", patient.allergies],
  ]
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 480, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111E1F" }}>Patient Details</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          {patient.photo && (
            <img src={patient.photo} alt="Profile" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: "2px solid #D1E8E8" }} />
          )}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
            {rows.map(([k, v]) => v ? (
              <div key={k} style={{ display: "flex", borderBottom: "1px solid #F1F5F9", fontSize: 13 }}>
                <div style={{ width: 130, padding: "8px 12px", fontWeight: 600, color: "#64748B", background: "#F8FFFE", flexShrink: 0 }}>{k}</div>
                <div style={{ padding: "8px 12px", color: "#111E1F" }}>{String(v)}</div>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminPatientsNew() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 20
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    fetch(`${BASE_URL}/patient/auth/getAll`)
      .then(r => r.json())
      .then(d => {
        if (!isMountedRef.current) return
        const sorted = (d.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setPatients(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => { isMountedRef.current = false }
  }, [])

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient permanently?")) return
    try {
      const res = await fetch(`${BASE_URL}/patient/auth/deleteById/${id}`, { method: "DELETE" })
      if (res.ok) setPatients(prev => prev.filter(p => p._id !== id))
    } catch (e) { console.error(e) }
  }

  const filtered = patients.filter(p =>
    [p.name, p.email, p.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const inputStyle = { border: "1px solid #D1E8E8", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", background: "#FAFFFE" }

  return (
    <AdminAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F" }}>Patients</h2>
          <input type="text" placeholder="Search by name, email, phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ ...inputStyle, width: 260 }} />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>Loading…</div>
        ) : (
          <>
            <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
                    {["Name", "Email", "Phone", "Age", "Gender", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No patients found</td></tr>
                  )}
                  {paginated.map(p => (
                    <tr key={p._id} style={{ borderBottom: "1px solid #F1F5F9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FAFFFE"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111E1F" }}>{p.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B" }}>{p.email}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B" }}>{p.phone}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B" }}>{calculateAge(p.DOB)}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B" }}>{p.gender || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setSelected(p)} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#0D7377" }}>View</button>
                          <button onClick={() => deletePatient(p._id)} style={{ background: "none", border: "1px solid #EF4444", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#EF4444" }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Showing {paginated.length} of {filtered.length}</span>
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ border: "1px solid #D1E8E8", borderRadius: 5, padding: "4px 10px", fontSize: 12, cursor: page === 1 ? "not-allowed" : "pointer", background: "white", color: page === 1 ? "#94A3B8" : "#0D7377" }}>Prev</button>
                <span style={{ fontSize: 12, color: "#64748B" }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} style={{ border: "1px solid #D1E8E8", borderRadius: 5, padding: "4px 10px", fontSize: 12, cursor: page === totalPages ? "not-allowed" : "pointer", background: "white", color: page === totalPages ? "#94A3B8" : "#0D7377" }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
      {selected && <PatientDetailPanel patient={selected} onClose={() => setSelected(null)} />}
    </AdminAppLayout>
  )
}

export default AdminPatientsNew
