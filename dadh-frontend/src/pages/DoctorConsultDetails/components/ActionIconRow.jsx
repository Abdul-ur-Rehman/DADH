import React from "react"

const actions = [
  {
    key: "prescribe", label: "Prescribe", color: "#22C55E",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    key: "refer", label: "Refer", color: "#8B5CF6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "investigate", label: "Investigate", color: "#EF4444",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: "certify", label: "Certify", color: "#F59E0B",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: "bill", label: "Bill", color: "#0D7377",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
]

function ActionIconRow({ onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "16px 0", borderBottom: "1px solid #D1E8E8" }}>
      {actions.map(a => (
        <button
          key={a.key}
          onClick={() => onAction(a.key)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "6px 12px" }}
        >
          <div
            style={{ width: 48, height: 48, borderRadius: "50%", border: `1.5px solid ${a.color}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = `${a.color}18`}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {a.icon}
          </div>
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{a.label}</span>
        </button>
      ))}
    </div>
  )
}

export default ActionIconRow
