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
      <div style={{ flex: 1, background: "linear-gradient(145deg, #0D7377 0%, #14B8A6 100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 48, color: "white" }}>
        <img src={logo} alt="DADH" style={{ height: 56, marginBottom: 32, filter: "brightness(0) invert(1)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Admin Portal</h1>
        <p style={{ fontSize: 16, opacity: 0.85, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          Manage doctors, patients, and platform operations from one place.
        </p>
      </div>

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
