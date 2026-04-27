import React, { useState, useCallback } from "react"
import { NavLink } from "react-router-dom"

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

/**
 * navItems: Array<{ label, href, icon?, end? }>
 * user: { name, role }
 * logo: img src string (optional)
 * headerRight: ReactNode shown in topbar right slot
 * onLogout: () => void
 */
function AppLayout({ navItems = [], user = {}, onLogout, children, logo, headerRight }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const close = useCallback(() => setSidebarOpen(false), [])

  return (
    <div
      className="dadh-tw-root flex h-screen overflow-hidden"
      style={{ background: "#FAFFFE", color: "#111E1F" }}
    >
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-200 ease-in-out md:static md:translate-x-0${sidebarOpen ? " translate-x-0" : " -translate-x-full"}`}
        style={{ background: "#ffffff", borderRight: "1px solid #D1E8E8" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid #D1E8E8" }}
        >
          {logo ? (
            <img src={logo} alt="DADH" style={{ height: 36, objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0D7377" }}>DIAL A HOME</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0D7377" }}>DOCTOR</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={close}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                background: isActive ? "#0D7377" : hovered === item.href ? "#F0FDFA" : "transparent",
                color: isActive ? "#ffffff" : hovered === item.href ? "#0D7377" : "#111E1F",
              })}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
            >
              {item.icon && (
                <span style={{ flexShrink: 0, width: 16, height: 16, display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer + logout */}
        <div
          className="shrink-0 px-3 py-3"
          style={{ borderTop: "1px solid #D1E8E8" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#E6F4F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#0D7377",
                flexShrink: 0,
              }}
            >
              {getInitials(user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111E1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "User"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#4B7172", textTransform: "capitalize" }}>
                {user.role || ""}
              </p>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#4B7172", flexShrink: 0 }}
                title="Sign out"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center gap-3 shrink-0"
          style={{ height: 56, padding: "0 16px", borderBottom: "1px solid #D1E8E8", background: "#ffffff" }}
        >
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#4B7172", padding: 4 }}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div style={{ flex: 1 }} />

          {headerRight && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {headerRight}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ padding: "24px 28px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
export default AppLayout
