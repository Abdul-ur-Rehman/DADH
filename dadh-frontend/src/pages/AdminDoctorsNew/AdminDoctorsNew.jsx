import React, { useState, useEffect, useRef } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function StatusBadge({ approved, active }) {
  if (!approved) return <span style={{ fontSize: 11, background: "#FFF8E1", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px" }}>Pending</span>
  if (active === 0) return <span style={{ fontSize: 11, background: "#FEF2F2", color: "#DC2626", border: "1px solid #EF4444", borderRadius: 10, padding: "2px 8px" }}>Inactive</span>
  return <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>Active</span>
}

function DoctorDetailPanel({ doctor, onClose, onApprove, onUpdate }) {
  const [prescriberNumber, setPrescriberNumber] = useState(doctor.prescriberNumber || "")
  const [providerNumber, setProviderNumber] = useState(doctor.providerNumber || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const isApproved = !!doctor.isApproved
  const canAction = prescriberNumber && providerNumber

  const inputStyle = { width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }

  const handleAction = async () => {
    setSaving(true)
    setError("")
    if (isApproved) {
      await onUpdate(doctor._id, prescriberNumber, providerNumber)
    } else {
      const err = await onApprove(doctor._id, prescriberNumber, providerNumber)
      if (err) setError(err)
    }
    setSaving(false)
  }

  const fields = [
    ["Name", doctor.name], ["Surname", doctor.surname], ["Email", doctor.email],
    ["Phone", doctor.phone], ["Gender", doctor.gender], ["Qualification", doctor.qualification],
    ["Type", doctor.doctorType || doctor.workType], ["City", doctor.city],
    ["Start Date", doctor.startDate ? doctor.startDate.split("T")[0] : "N/A"],
    ["Home Visit", doctor.isHomeVisit || "N/A"],
  ]

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111E1F" }}>Doctor Details</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, background: "#F0FDFA", borderRadius: 8, padding: 14 }}>
            <div>
              <label style={labelStyle}>Prescriber Number</label>
              <input style={inputStyle} type="number" value={prescriberNumber} onChange={e => setPrescriberNumber(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Provider Number</label>
              <input style={inputStyle} type="number" value={providerNumber} onChange={e => setProviderNumber(e.target.value)} />
            </div>
          </div>

          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            {fields.map(([k, v]) => v ? (
              <div key={k} style={{ display: "flex", borderBottom: "1px solid #F1F5F9", fontSize: 13 }}>
                <div style={{ width: 140, padding: "8px 12px", fontWeight: 600, color: "#64748B", background: "#F8FFFE", flexShrink: 0 }}>{k}</div>
                <div style={{ padding: "8px 12px", color: "#111E1F" }}>{v}</div>
              </div>
            ) : null)}
          </div>

          {error && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          {!canAction && <p style={{ fontSize: 12, color: "#F59E0B", marginBottom: 12 }}>Fill both Prescriber and Provider numbers to enable {isApproved ? "update" : "approval"}.</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleAction}
              disabled={!canAction || saving}
              style={{ background: !canAction || saving ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: !canAction || saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving…" : isApproved ? "Update" : "Approve"}
            </button>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", color: "#64748B" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminDoctorsNew() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 20
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    fetch(`${BASE_URL}/doctor-requests/getAll`)
      .then(r => r.json())
      .then(d => {
        if (!isMountedRef.current) return
        const sorted = (d.data || []).sort((a, b) =>
          new Date(parseInt(b._id.substring(0, 8), 16) * 1000) - new Date(parseInt(a._id.substring(0, 8), 16) * 1000)
        )
        setDoctors(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => { isMountedRef.current = false }
  }, [])

  const filtered = doctors.filter(d =>
    [d.name, d.email, d.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    try {
      const res = await fetch(`${BASE_URL}/doctor-requests/toggleActive/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setDoctors(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d))
      }
    } catch (e) { console.error(e) }
  }

  const deleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor permanently?")) return
    try {
      const res = await fetch(`${BASE_URL}/doctor-requests/deleteById/${id}`, { method: "DELETE" })
      if (res.ok) setDoctors(prev => prev.filter(d => d._id !== id))
    } catch (e) { console.error(e) }
  }

  const handleApprove = async (id, prescriberNumber, providerNumber) => {
    try {
      const pCheck = await fetch(`${BASE_URL}/doctor-requests/check-prescriber/${prescriberNumber}`)
      if (!pCheck.ok) { const e = await pCheck.json(); return e.message || "Invalid prescriber number." }
      const vCheck = await fetch(`${BASE_URL}/doctor-requests/check-provider/${providerNumber}`)
      if (!vCheck.ok) { const e = await vCheck.json(); return e.message || "Invalid provider number." }

      const res = await fetch(`${BASE_URL}/doctor-requests/approve-doctor/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true, prescriberNumber: Number(prescriberNumber), providerNumber: Number(providerNumber) }),
      })
      const data = await res.json()
      if (res.ok) {
        setDoctors(prev => prev.map(d => d._id === id ? data.data : d))
        setSelected(null)
        return null
      }
      return data.message || "Approval failed."
    } catch { return "Network error." }
  }

  const handleUpdate = async (id, prescriberNumber, providerNumber) => {
    try {
      const res = await fetch(`${BASE_URL}/doctor-requests/update-doctor/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriberNumber: Number(prescriberNumber), providerNumber: Number(providerNumber) }),
      })
      const data = await res.json()
      if (res.ok) {
        setDoctors(prev => prev.map(d => d._id === id ? data.data : d))
        setSelected(null)
      }
    } catch (e) { console.error(e) }
  }

  const inputStyle = { border: "1px solid #D1E8E8", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", background: "#FAFFFE" }

  return (
    <AdminAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F" }}>Doctors</h2>
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
                    {["Name", "Email", "Phone", "Type", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No doctors found</td></tr>
                  )}
                  {paginated.map(doc => (
                    <tr key={doc._id} style={{ borderBottom: "1px solid #F1F5F9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FAFFFE"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111E1F" }}>
                        Dr {doc.name} {doc.surname}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B" }}>{doc.email}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B" }}>{doc.phone}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{doc.doctorType || doc.workType || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <StatusBadge approved={doc.isApproved} active={doc.status} />
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setSelected(doc)}
                            style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#0D7377" }}
                          >
                            {doc.isApproved ? "Edit" : "Review"}
                          </button>
                          <button
                            onClick={() => toggleActive(doc._id, doc.status)}
                            style={{ background: "none", border: `1px solid ${doc.status === 1 ? "#EF4444" : "#22C55E"}`, borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: doc.status === 1 ? "#EF4444" : "#22C55E" }}
                          >
                            {doc.status === 1 ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => deleteDoctor(doc._id)}
                            style={{ background: "none", border: "1px solid #EF4444", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#EF4444" }}
                          >
                            Delete
                          </button>
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

      {selected && (
        <DoctorDetailPanel
          doctor={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onUpdate={handleUpdate}
        />
      )}
    </AdminAppLayout>
  )
}

export default AdminDoctorsNew
