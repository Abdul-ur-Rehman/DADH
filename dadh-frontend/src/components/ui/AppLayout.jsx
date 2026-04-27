import React, { useState, useCallback } from "react"
import { NavLink } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar"

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/**
 * navItems: Array<{ label: string, href: string, icon?: ReactNode, end?: boolean }>
 * user: { name: string, role: string, avatarUrl?: string }
 * onLogout: () => void
 */
function AppLayout({ navItems = [], user = {}, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const close = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="dadh-tw-root flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-card border-r border-border transition-transform duration-200 ease-in-out",
          "md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border shrink-0">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-primary">DIAL A HOME</span>
            <span className="text-xs font-semibold text-primary">DOCTOR</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {item.icon && (
                <span className="shrink-0 w-4 h-4">{item.icon}</span>
              )}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-border px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role || ""}</p>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
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
        {/* Top bar */}
        <header className="flex items-center gap-3 h-14 px-4 border-b border-border bg-card shrink-0">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right slot — can be extended per-page via portal or prop */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
export default AppLayout
