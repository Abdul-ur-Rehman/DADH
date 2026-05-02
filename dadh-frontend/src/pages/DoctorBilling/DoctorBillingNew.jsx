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

// ── Billing code picker modal ─────────────────────────────────────────────────
function BillingModal({ consultation, availableCodes, onClose, onSave }) {
  const existing = consultation.billCodes || []
  const [selected, setSelected] = useState(new Set(existing))
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filtered = availableCodes.filter(c =>
    !search ||
    String(c.billCode).toLowerCase().includes(search.toLowerCase()) ||
    (c.shortDescription || "").toLowerCase().includes(search.toLowerCase())
  )

  const total = availableCodes
    .filter(c => selected.has(c._id))
    .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)

  const handleSave = async () => {
    setSaving(true)
    await onSave(consultation._id, Array.from(selected))
    setSaving(false)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111E1F" }}>Add Billing Codes</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{consultation.patientName} · {formatDate(consultation.date)}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <input
            type="text"
            placeholder="Search code or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", border: "1px solid #D1E8E8", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Code list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No billing codes found</div>
          )}
          {filtered.map(code => {
            const checked = selected.has(code._id)
            return (
              <div
                key={code._id}
                onClick={() => toggle(code._id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", cursor: "pointer",
                  background: checked ? "#F0FDFA" : "white",
                  borderLeft: checked ? "3px solid #0D7377" : "3px solid transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#0D7377" : "#CBD5E1"}`,
                  background: checked ? "#0D7377" : "white", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checked && <span style={{ color: "white", fontSize: 11, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0D7377" }}>{code.billCode}</span>
                  <span style={{ fontSize: 13, color: "#111E1F", marginLeft: 8 }}>{code.shortDescription}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#22C55E" }}>${parseFloat(code.amount || 0).toFixed(2)}</div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 12, color: "#64748B" }}>{selected.size} code{selected.size !== 1 ? "s" : ""} selected · </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#22C55E" }}>Total: ${total.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#64748B" }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selected.size === 0}
              style={{ background: saving || selected.size === 0 ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: saving || selected.size === 0 ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
function DoctorBillingNew() {
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableCodes, setAvailableCodes] = useState([])
  const [billingModal, setBillingModal] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async () => {
      try {
        const [consultRes, codesRes] = await Promise.all([
          fetch(`${BASE_URL}/consultations/incompleteBillings/${doctorId}`),
          fetch(`${BASE_URL}/billing/getAllBilling`),
        ])
        const [consultData, codesData] = await Promise.all([consultRes.json(), codesRes.json()])
        if (!isMountedRef.current) return

        setAvailableCodes(codesData.data || [])

        const enriched = await Promise.all(
          (consultData.data || []).map(async (c) => {
            let patientName = "Unknown"
            try {
              const pr = await fetch(`${BASE_URL}/patient/auth/getOneById/${c.patientId}`)
              const pd = await pr.json()
              if (pr.ok && pd.data) patientName = pd.data.name || "Unknown"
            } catch {}
            const locked = c.billingLockedAt
              ? (Date.now() - new Date(c.billingLockedAt).getTime()) > 12 * 60 * 60 * 1000
              : false
            return { ...c, patientName, date: c.createdAt, hasBilling: !!(c.billCodes && c.billCodes.length > 0), billingLocked: locked }
          })
        )
        if (isMountedRef.current) { setRows(enriched); setLoading(false) }
      } catch { setLoading(false) }
    }
    load()
    return () => { isMountedRef.current = false }
  }, [doctorId])

  const handleSaveBilling = async (consultationId, selectedIds) => {
    try {
      const res = await fetch(`${BASE_URL}/consultations/billing/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billCodes: selectedIds }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        const updated = data.data
        const locked = updated.billingLockedAt
          ? (Date.now() - new Date(updated.billingLockedAt).getTime()) > 12 * 60 * 60 * 1000
          : false
        setRows(prev => prev.map(r =>
          r._id === consultationId
            ? { ...r, billCodes: updated.billCodes, hasBilling: updated.billCodes.length > 0, billingLockedAt: updated.billingLockedAt, billingLocked: locked }
            : r
        ))
        setBillingModal(null)
      } else {
        alert(data.message || "Failed to save billing codes.")
      }
    } catch {}
  }

  const billed = rows.filter(r => r.hasBilling).length
  const unbilled = rows.filter(r => !r.hasBilling).length

  const resolveCodeLabel = (billCodes) => {
    if (!billCodes || billCodes.length === 0) return "—"
    return billCodes.map(id => {
      const code = availableCodes.find(c => c._id === id)
      return code ? code.billCode : id
    }).join(", ")
  }

  const resolveCodeTotal = (billCodes) => {
    if (!billCodes || billCodes.length === 0) return null
    const total = billCodes.reduce((sum, id) => {
      const code = availableCodes.find(c => c._id === id)
      return sum + parseFloat(code?.amount || 0)
    }, 0)
    return total.toFixed(2)
  }

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
                  {["Patient", "Date", "Type", "Billing Codes", "Value ($)", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No billing records found</td></tr>
                )}
                {rows.map((r, i) => (
                  <tr key={r._id || i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111E1F" }}>{r.patientName}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{formatDate(r.date)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {r.type === "videoCall" ? "Video" : r.type === "phoneCall" ? "Audio" : "Chat"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      {resolveCodeLabel(r.billCodes)}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#22C55E" }}>
                      {resolveCodeTotal(r.billCodes) !== null ? `$${resolveCodeTotal(r.billCodes)}` : "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {r.hasBilling
                        ? <span style={{ fontSize: 11, background: "#F0FDF4", color: "#166534", border: "1px solid #22C55E", borderRadius: 10, padding: "2px 8px" }}>✓ Billed</span>
                        : <span style={{ fontSize: 11, background: "#FFF8E1", color: "#92400E", border: "1px solid #F59E0B", borderRadius: 10, padding: "2px 8px" }}>Pending</span>
                      }
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {r.billingLocked ? (
                        <span style={{ fontSize: 11, color: "#94A3B8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          🔒 Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => setBillingModal(r)}
                          style={{ background: r.hasBilling ? "none" : "#0D7377", color: r.hasBilling ? "#0D7377" : "white", border: r.hasBilling ? "1px solid #D1E8E8" : "none", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}
                        >
                          {r.hasBilling ? "Edit Codes" : "Add Billing Code"}
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

      {billingModal && (
        <BillingModal
          consultation={billingModal}
          availableCodes={availableCodes}
          onClose={() => setBillingModal(null)}
          onSave={handleSaveBilling}
        />
      )}
    </DoctorAppLayout>
  )
}

export default DoctorBillingNew
