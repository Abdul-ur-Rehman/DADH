# Phase 6 — Admin Portal Redesign Implementation Plan

**Goal:** Redesign all admin-facing pages using the Tailwind/teal design system and deliver real analytics, the doctor approval workflow, and settings management.

**Architecture:** Same as Phase 4/5 — each page gets a new component file; old files stay in place; routes are swapped in Task 8. Shared layout shell `AdminAppLayout` mirrors `DoctorAppLayout`.

**Colors / rules:** Inline styles for all colors. `dadh-tw-root` wrapper on every page. No `eslint-disable-next-line react-hooks/exhaustive-deps`. `isMountedRef` for async cleanup. Relative imports only.

---

## Key Patterns

```js
// Admin auth check
const isAdmin = localStorage.getItem("isAdminLoggedIn") === "true"
// BASE_URL
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"
```

## API Endpoints (confirmed from existing code)

| Resource | Endpoint |
|---|---|
| Admin login | `POST /api/admin/auth/login` `{ username, password }` |
| All doctors | `GET /api/doctor-requests/getAll` |
| Approve doctor | `PATCH /api/doctor-requests/approve-doctor/:id` `{ isApproved, prescriberNumber, providerNumber }` |
| Toggle doctor active | `PATCH /api/doctor-requests/toggleActive/:id` `{ status: 0|1 }` |
| Delete doctor | `DELETE /api/doctor-requests/deleteById/:id` |
| Check prescriber | `GET /api/doctor-requests/check-prescriber/:number` |
| Check provider | `GET /api/doctor-requests/check-provider/:number` |
| Update doctor | `PATCH /api/doctor-requests/update-doctor/:id` |
| All patients | `GET /api/patient/auth/getAll` |
| All consultations | `GET /api/consultations/getConsultations` |
| All billing codes | `GET /api/billing/getAllBilling` |
| Update billing code | `PATCH /api/billing/updateById/:id` |
| Add billing code | `POST /api/billing/create` |
| All categories | `GET /api/consultationCategory/getAll` |
| Add category | `POST /api/consultationCategory/add` |
| Update category | `PATCH /api/consultationCategory/updateOneById/:id` |
| Delete category | `DELETE /api/consultationCategory/deleteById/:id` |

---

## Task 1: Foundation — tailwind.config.js + AdminAppLayout

**Files:**
- Modify: `dadh-frontend/tailwind.config.js`
- Create: `dadh-frontend/src/components/AdminLayout/AdminAppLayout.jsx`

### Step 1: Add content paths to tailwind.config.js

Add these entries to the `content` array:

```js
"./src/pages/AdminHomeDashboard/**/*.{js,jsx}",
"./src/pages/AdminDoctorsNew/**/*.{js,jsx}",
"./src/pages/AdminPatientsNew/**/*.{js,jsx}",
"./src/pages/AdminConsultationsNew/**/*.{js,jsx}",
"./src/pages/AdminSettingsNew/**/*.{js,jsx}",
"./src/pages/AdminLoginNew/**/*.{js,jsx}",
"./src/components/AdminLayout/**/*.{js,jsx}",
```

### Step 2: Create AdminAppLayout.jsx

```jsx
// src/components/AdminLayout/AdminAppLayout.jsx
import React from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../ui/AppLayout"
import logo from "../../assets/images/logo-dark.png"

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
)
const DoctorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" />
  </svg>
)
const PatientIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="3" /><path d="M1 14c0-2.761 2.239-5 5-5h2" />
    <path d="M12 10v4M10 12h4" />
  </svg>
)
const ConsultIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2" width="13" height="12" rx="1" /><path d="M5 6h6M5 9h4" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
  </svg>
)
const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" /><path d="M1.5 6.5l6.5 4 6.5-4" />
  </svg>
)

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/admin/home",                    end: true, icon: <DashboardIcon /> },
  { label: "Doctors",       href: "/admin/doctorRequests/table",               icon: <DoctorIcon /> },
  { label: "Patients",      href: "/admin/patientDetails/table",               icon: <PatientIcon /> },
  { label: "Consultations", href: "/admin/Consultations",                      icon: <ConsultIcon /> },
  { label: "Settings",      href: "/admin/settings",                           icon: <SettingsIcon /> },
  { label: "Inbox",         href: "/admin/inbox",                              icon: <InboxIcon /> },
]

function AdminAppLayout({ children }) {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.clear()
    navigate("/admin/login")
  }

  return (
    <AppLayout
      navItems={NAV_ITEMS}
      user={{ name: "Admin", role: "Administrator" }}
      onLogout={handleLogout}
      logo={logo}
    >
      {children}
    </AppLayout>
  )
}

export default AdminAppLayout
```

### Step 3: Commit

```bash
git add dadh-frontend/tailwind.config.js dadh-frontend/src/components/AdminLayout/AdminAppLayout.jsx
git commit -m "feat(phase6): add AdminAppLayout shell and tailwind content paths"
```

---

## Task 2: Admin Login — AdminLoginNew

**Files:**
- Create: `dadh-frontend/src/pages/AdminLoginNew/AdminLoginNew.jsx`

```jsx
// src/pages/AdminLoginNew/AdminLoginNew.jsx
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/images/logo-dark.png"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function AdminLoginNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("isAdminLoggedIn") === "true" && localStorage.getItem("userRole") === "admin") {
      navigate("/admin/home")
    }
  }, [navigate])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await res.json()
      if (res.ok && result.state) {
        localStorage.setItem("isAdminLoggedIn", "true")
        localStorage.setItem("userRole", "admin")
        if (result.data) localStorage.setItem("adminData", JSON.stringify(result.data))
        navigate("/admin/home")
      } else {
        setError(result.message || "Invalid credentials.")
      }
    } catch {
      setError("Network error. Please try again.")
    }
    setLoading(false)
  }

  const inputStyle = {
    width: "100%", border: "1px solid #D1E8E8", borderRadius: 8, padding: "11px 14px",
    fontSize: 14, outline: "none", color: "#111E1F", background: "#FAFFFE", boxSizing: "border-box",
  }

  return (
    <div className="dadh-tw-root" style={{ minHeight: "100vh", display: "flex", background: "#FAFFFE" }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: "linear-gradient(145deg, #0D7377 0%, #14B8A6 100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 48, color: "white" }}>
        <img src={logo} alt="DADH" style={{ height: 56, marginBottom: 32, filter: "brightness(0) invert(1)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Admin Portal</h1>
        <p style={{ fontSize: 16, opacity: 0.85, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          Manage doctors, patients, and platform operations from one place.
        </p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111E1F", marginBottom: 8 }}>Sign in</h2>
          <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32 }}>Enter your admin credentials to continue.</p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #EF4444", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>Username</label>
              <input style={inputStyle} value={form.username} onChange={set("username")} placeholder="admin" autoComplete="username" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>Password</label>
              <input style={inputStyle} type="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#94A3B8" : "#0D7377", color: "white", border: "none", borderRadius: 8, padding: "13px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginNew
```

### Commit

```bash
git add dadh-frontend/src/pages/AdminLoginNew/
git commit -m "feat(phase6): add AdminLoginNew redesigned login page"
```

---

## Task 3: Admin Dashboard — AdminHomeDashboard

**Files:**
- Create: `dadh-frontend/src/pages/AdminHomeDashboard/AdminHomeDashboard.jsx`

Replace the hardcoded mock cards in `AdminHome.js` with real API data.

```jsx
// src/pages/AdminHomeDashboard/AdminHomeDashboard.jsx
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
```

### Commit

```bash
git add dadh-frontend/src/pages/AdminHomeDashboard/
git commit -m "feat(phase6): add AdminHomeDashboard with real API stats"
```

---

## Task 4: Admin Doctors — AdminDoctorsNew

**Files:**
- Create: `dadh-frontend/src/pages/AdminDoctorsNew/AdminDoctorsNew.jsx`

Port all logic from `DoctorRequestTable.js` into the new design system. Replace SweetAlert dialogs with inline confirm states.

```jsx
// src/pages/AdminDoctorsNew/AdminDoctorsNew.jsx
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
          {/* Prescriber / Provider */}
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

          {/* Read-only fields */}
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

  const toggleActive = async (id, currentStatus, name) => {
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
                            onClick={() => toggleActive(doc._id, doc.status, doc.name)}
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

            {/* Pagination */}
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
```

### Commit

```bash
git add dadh-frontend/src/pages/AdminDoctorsNew/
git commit -m "feat(phase6): add AdminDoctorsNew with approval workflow"
```

---

## Task 5: Admin Patients — AdminPatientsNew

**Files:**
- Create: `dadh-frontend/src/pages/AdminPatientsNew/AdminPatientsNew.jsx`

```jsx
// src/pages/AdminPatientsNew/AdminPatientsNew.jsx
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
```

### Commit

```bash
git add dadh-frontend/src/pages/AdminPatientsNew/
git commit -m "feat(phase6): add AdminPatientsNew with view and delete"
```

---

## Task 6: Admin Consultations — AdminConsultationsNew

**Files:**
- Create: `dadh-frontend/src/pages/AdminConsultationsNew/AdminConsultationsNew.jsx`

Port `BillingDetails.js` — fix hardcoded BASE_URL, add search + date filter, keep certificate viewer.

```jsx
// src/pages/AdminConsultationsNew/AdminConsultationsNew.jsx
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
```

### Commit

```bash
git add dadh-frontend/src/pages/AdminConsultationsNew/
git commit -m "feat(phase6): add AdminConsultationsNew with search, date filter, cert viewer"
```

---

## Task 7: Admin Settings — AdminSettingsNew

**Files:**
- Create: `dadh-frontend/src/pages/AdminSettingsNew/AdminSettingsNew.jsx`

Two tabs: Consultation Categories, Billing Codes.

```jsx
// src/pages/AdminSettingsNew/AdminSettingsNew.jsx
import React, { useState, useEffect, useRef } from "react"
import AdminAppLayout from "../../components/AdminLayout/AdminAppLayout"

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"

function AdminSettingsNew() {
  const [tab, setTab] = useState("categories")

  // Categories state
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [newCatName, setNewCatName] = useState("")
  const [newCatKey, setNewCatKey] = useState("")
  const [catSaving, setCatSaving] = useState(false)

  // Billing codes state
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

        {/* Tabs */}
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
            {/* Add form */}
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
            {/* Add form */}
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
```

### Commit

```bash
git add dadh-frontend/src/pages/AdminSettingsNew/
git commit -m "feat(phase6): add AdminSettingsNew with categories and billing codes management"
```

---

## Task 8: Wire routes in allRoutes.js

**Files:**
- Modify: `dadh-frontend/src/routes/allRoutes.js`

### Step 1: Add imports (after existing admin imports)

```js
import AdminLoginNew from "pages/AdminLoginNew/AdminLoginNew";
import AdminHomeDashboard from "pages/AdminHomeDashboard/AdminHomeDashboard";
import AdminDoctorsNew from "pages/AdminDoctorsNew/AdminDoctorsNew";
import AdminPatientsNew from "pages/AdminPatientsNew/AdminPatientsNew";
import AdminConsultationsNew from "pages/AdminConsultationsNew/AdminConsultationsNew";
import AdminSettingsNew from "pages/AdminSettingsNew/AdminSettingsNew";
```

### Step 2: Replace admin routes in userRoutes

Find the existing ADMIN block and replace it with:

```js
// ADMIN
{ path: "/admin/dashboard", component: <AdminHomeDashboard />, allowedRoles: ['admin'] },
{ path: "/admin/home", component: <AdminHomeDashboard />, allowedRoles: ['admin'] },
{ path: "/admin/Consultations", component: <AdminConsultationsNew />, allowedRoles: ['admin'] },
{ path: "/admin/inbox", component: <AdminInboxPage />, allowedRoles: ['admin'] },
{ path: "/admin/doctorRequests/table", component: <AdminDoctorsNew />, allowedRoles: ['admin'] },
{ path: "/admin/patientDetails/table", component: <AdminPatientsNew />, allowedRoles: ['admin'] },
{ path: "/admin/patientdetailsForm/:id", component: <PatientDetailsForm />, allowedRoles: ['admin'] },
{ path: "/add/patient-register/", component: <AdminPatientRegisterForm />, allowedRoles: ['admin'] },
{ path: "/admin/billingCode/table", component: <AdminSettingsNew />, allowedRoles: ['admin'] },
{ path: "/admin/consultationCategory/table", component: <AdminSettingsNew />, allowedRoles: ['admin'] },
{ path: "/admin/settings", component: <AdminSettingsNew />, allowedRoles: ['admin'] },
{ path: "/admin/doctorDetails/form/:id", component: <DoctorRequestForm />, allowedRoles: ['admin'] },
{ path: "/add/consultationCategory", component: <AddConsultationCategoryForm />, allowedRoles: ['admin'] },
{ path: "/edit-category/:id", component: <EditConsultCategory />, allowedRoles: ['admin'] },
{ path: "/admin/register/form", component: <AdminModelPage />, allowedRoles: ['admin'] },
{ path: "/admin/details/table", component: <AdminModelTable />, allowedRoles: ['admin'] },
{ path: "/admin/detail-form/:id", component: <AdminDetailsForm />, allowedRoles: ['admin'] },
```

### Step 3: Replace admin login route in authRoutes

```js
{ path: "/admin/login", component: <AdminLoginNew />, allowedRoles: ['patient'] },
```

### Step 4: Commit

```bash
git add dadh-frontend/src/routes/allRoutes.js
git commit -m "feat(phase6): wire all admin routes to Phase 6 redesigned pages"
```

---

## Acceptance Checklist

- [ ] `/admin/login` → new teal split-panel login (no external image URL)
- [ ] `/admin/home` → real stat cards (doctors/patients/consultations counts from API)
- [ ] `/admin/doctorRequests/table` → new table with Approve/Update/Disable/Delete; detail panel for prescriber + provider numbers
- [ ] `/admin/patientDetails/table` → new table with view detail panel + delete
- [ ] `/admin/Consultations` → new table with date filter, search, cert viewer; no hardcoded localhost URL
- [ ] `/admin/settings` → categories tab + billing codes tab; inline edit for billing amounts
- [ ] `yarn build` passes with no new errors
