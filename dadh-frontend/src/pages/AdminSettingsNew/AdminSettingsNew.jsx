import React, { useState, useEffect, useRef } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function AdminSettingsNew() {
  const [tab, setTab] = useState("categories")

  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [newCatName, setNewCatName] = useState("")
  const [newCatKey, setNewCatKey] = useState("")
  const [catSaving, setCatSaving] = useState(false)

  const [billing, setBilling] = useState([])
  const [billLoading, setBillLoading] = useState(true)
  const [newBillCode, setNewBillCode] = useState("")
  const [newBillDesc, setNewBillDesc] = useState("")
  const [newBillAmount, setNewBillAmount] = useState("")
  const [billSaving, setBillSaving] = useState(false)
  const [editingBill, setEditingBill] = useState(null)

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    Promise.all([
      fetch(`${BASE_URL}/consultationCategory/getAll`).then(r => r.json()),
      fetch(`${BASE_URL}/billing/getAllBilling`).then(r => r.json()),
    ]).then(([catData, billData]) => {
      if (!isMountedRef.current) return
      setCategories(catData.data || [])
      setBilling(billData.data || [])
      setCatLoading(false)
      setBillLoading(false)
    }).catch(() => { setCatLoading(false); setBillLoading(false) })
    return () => { isMountedRef.current = false }
  }, [])

  const addCategory = async () => {
    if (!newCatName.trim() || !newCatKey.trim()) return
    setCatSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/consultationCategory/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCatName, key: newCatKey }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        setCategories(prev => [...prev, data.data])
        setNewCatName("")
        setNewCatKey("")
      }
    } catch (e) { console.error(e) }
    setCatSaving(false)
  }

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return
    try {
      const res = await fetch(`${BASE_URL}/consultationCategory/deleteById/${id}`, { method: "DELETE" })
      if (res.ok) setCategories(prev => prev.filter(c => c._id !== id))
    } catch (e) { console.error(e) }
  }

  const addBillingCode = async () => {
    if (!newBillCode.trim() || !newBillAmount) return
    setBillSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/billing/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billCode: newBillCode, shortDescription: newBillDesc, amount: Number(newBillAmount) }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        setBilling(prev => [...prev, data.data])
        setNewBillCode("")
        setNewBillDesc("")
        setNewBillAmount("")
      }
    } catch (e) { console.error(e) }
    setBillSaving(false)
  }

  const saveBillingEdit = async (item) => {
    try {
      const res = await fetch(`${BASE_URL}/billing/updateById/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billCode: item.billCode, shortDescription: item.shortDescription, amount: Number(item.amount) }),
      })
      if (res.ok) {
        setBilling(prev => prev.map(b => b._id === item._id ? item : b))
        setEditingBill(null)
      }
    } catch (e) { console.error(e) }
  }

  const inputStyle = { border: "1px solid #D1E8E8", borderRadius: 6, padding: "8px 10px", fontSize: 13, outline: "none", background: "#FAFFFE", boxSizing: "border-box" }

  return (
    <AdminAppLayout>
      <div className="dadh-tw-root" style={{ padding: 24, background: "#FAFFFE", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111E1F", marginBottom: 20 }}>Settings</h2>

        <div style={{ display: "flex", borderBottom: "2px solid #D1E8E8", marginBottom: 24 }}>
          {[["categories", "Consultation Categories"], ["billing", "Billing Codes"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: "none", border: "none", padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              color: tab === key ? "#0D7377" : "#64748B",
              borderBottom: tab === key ? "2px solid #0D7377" : "2px solid transparent",
              marginBottom: -2,
            }}>{label}</button>
          ))}
        </div>

        {tab === "categories" && (
          <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #D1E8E8", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Category Name</label>
                <input style={{ ...inputStyle, width: 200 }} value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. General Consult" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Key (no spaces)</label>
                <input style={{ ...inputStyle, width: 160 }} value={newCatKey} onChange={e => setNewCatKey(e.target.value)} placeholder="e.g. general_consult" />
              </div>
              <button onClick={addCategory} disabled={catSaving || !newCatName || !newCatKey}
                style={{ background: catSaving || !newCatName || !newCatKey ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: catSaving || !newCatName || !newCatKey ? "not-allowed" : "pointer" }}>
                {catSaving ? "Adding…" : "+ Add"}
              </button>
            </div>
            {catLoading ? (
              <div style={{ padding: 32, textAlign: "center", color: "#64748B" }}>Loading…</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F0FDFA" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>Category Name</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>Key</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No categories yet</td></tr>
                  )}
                  {categories.map(cat => (
                    <tr key={cat._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>{cat.category}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748B", fontFamily: "monospace" }}>{cat.key}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <button onClick={() => deleteCategory(cat._id)}
                          style={{ background: "none", border: "1px solid #EF4444", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#EF4444" }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "billing" && (
          <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #D1E8E8", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Bill Code</label>
                <input style={{ ...inputStyle, width: 120 }} value={newBillCode} onChange={e => setNewBillCode(e.target.value)} placeholder="e.g. 23" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Description</label>
                <input style={{ ...inputStyle, width: 240 }} value={newBillDesc} onChange={e => setNewBillDesc(e.target.value)} placeholder="Short description" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Amount ($)</label>
                <input style={{ ...inputStyle, width: 100 }} type="number" value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} placeholder="0.00" />
              </div>
              <button onClick={addBillingCode} disabled={billSaving || !newBillCode || !newBillAmount}
                style={{ background: billSaving || !newBillCode || !newBillAmount ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: billSaving || !newBillCode || !newBillAmount ? "not-allowed" : "pointer" }}>
                {billSaving ? "Adding…" : "+ Add"}
              </button>
            </div>
            {billLoading ? (
              <div style={{ padding: 32, textAlign: "center", color: "#64748B" }}>Loading…</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F0FDFA" }}>
                    {["Code", "Description", "Amount", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0D7377" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billing.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No billing codes yet</td></tr>
                  )}
                  {billing.map(b => (
                    <tr key={b._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {editingBill?._id === b._id ? (
                        <>
                          <td style={{ padding: "6px 14px" }}><input style={{ ...inputStyle, width: 80 }} value={editingBill.billCode} onChange={e => setEditingBill(p => ({ ...p, billCode: e.target.value }))} /></td>
                          <td style={{ padding: "6px 14px" }}><input style={{ ...inputStyle, width: 200 }} value={editingBill.shortDescription} onChange={e => setEditingBill(p => ({ ...p, shortDescription: e.target.value }))} /></td>
                          <td style={{ padding: "6px 14px" }}><input style={{ ...inputStyle, width: 80 }} type="number" value={editingBill.amount} onChange={e => setEditingBill(p => ({ ...p, amount: e.target.value }))} /></td>
                          <td style={{ padding: "6px 14px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => saveBillingEdit(editingBill)} style={{ background: "#0D7377", color: "white", border: "none", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer" }}>Save</button>
                              <button onClick={() => setEditingBill(null)} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#64748B" }}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0D7377" }}>{b.billCode}</td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "#111E1F" }}>{b.shortDescription}</td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "#22C55E", fontWeight: 600 }}>${parseFloat(b.amount || 0).toFixed(2)}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <button onClick={() => setEditingBill({ ...b })} style={{ background: "none", border: "1px solid #D1E8E8", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#0D7377" }}>Edit</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AdminAppLayout>
  )
}

export default AdminSettingsNew
