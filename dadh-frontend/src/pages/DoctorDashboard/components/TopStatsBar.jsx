import React, { useState } from "react"

function TopStatsBar({ billingEarned, billingPending, patientsToday, patientsTotal, queueCount, onSearch }) {
  const [searchVal, setSearchVal] = useState("")

  const handleSearch = (e) => {
    setSearchVal(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "white", borderBottom: "1px solid #D1E8E8",
      padding: "10px 24px", flexShrink: 0,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#22C55E" }}>
          ${(billingEarned || 0).toFixed(2)}{" "}
          <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 14 }}>
            / ${(billingPending || 0).toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Billings</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0D7377" }}>
          {patientsToday}{" "}
          <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 14 }}>/ {patientsTotal}</span>
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Patients</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: queueCount > 0 ? "#F59E0B" : "#22C55E" }}>
            {queueCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Queue</div>
        </div>
        <input
          type="text"
          placeholder="Search patient…"
          value={searchVal}
          onChange={handleSearch}
          style={{
            border: "1px solid #D1E8E8", borderRadius: 8,
            padding: "7px 12px", fontSize: 13, outline: "none",
            background: "#FAFFFE", color: "#111E1F", width: 180,
          }}
        />
      </div>
    </div>
  )
}

export default TopStatsBar
