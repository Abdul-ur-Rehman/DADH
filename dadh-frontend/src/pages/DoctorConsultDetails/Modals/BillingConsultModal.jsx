import React, { useState, useEffect } from "react"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
}

function BillingConsultModal({ consultationId, patient, onClose }) {
  const [availableCodes, setAvailableCodes] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await fetch(`${BASE_URL}/billing/getAllBilling`)
        const json = await res.json()
        const codes = Array.isArray(json) ? json : (json.data || [])
        setAvailableCodes(codes)
      } catch {
        setError("Could not load billing codes.")
      } finally {
        setLoading(false)
      }
    }
    fetchCodes()
  }, [])

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
    if (selected.size === 0) return
    setSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/consultations/billing/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billCodes: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Failed to save billing codes.")
        setSaving(false)
        return
      }
      onClose()
    } catch {
      setError("Network error. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, width: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111E1F" }}>Add Billing Codes</div>
            {patient?.name && (
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                {patient.name} · {formatDate(new Date())}
              </div>
            )}
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
          {loading && (
            <div style={{ padding: 24, textAlign: "center", color: "#64748B", fontSize: 13 }}>Loading billing codes…</div>
          )}
          {!loading && error && (
            <div style={{ padding: 24, textAlign: "center", color: "#EF4444", fontSize: 13 }}>{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No billing codes found</div>
          )}
          {!loading && filtered.map(code => {
            const checked = selected.has(code._id)
            return (
              <div
                key={code._id}
                onClick={() => toggle(code._id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 20px", cursor: "pointer",
                  background: checked ? "#F0FDFA" : "white",
                  borderLeft: checked ? "3px solid #0D7377" : "3px solid transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `2px solid ${checked ? "#0D7377" : "#CBD5E1"}`,
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
            <button
              onClick={onClose}
              style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#64748B" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selected.size === 0}
              style={{
                background: saving || selected.size === 0 ? "#94A3B8" : "#0D7377",
                color: "white", border: "none", borderRadius: 8,
                padding: "8px 20px", fontSize: 13, fontWeight: 600,
                cursor: saving || selected.size === 0 ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingConsultModal
