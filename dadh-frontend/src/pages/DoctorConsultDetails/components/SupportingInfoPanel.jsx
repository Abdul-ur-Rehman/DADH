import React, { useState } from "react"

function Chevron({ open }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function AccordionRow({ label, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  return (
    <div style={{ borderBottom: "1px solid #E2E8F0" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#111E1F" }}
      >
        {label}
        <Chevron open={open} />
      </button>
      {open && <div style={{ padding: "4px 16px 12px" }}>{children}</div>}
    </div>
  )
}

const TEMPLATE_SNIPPETS = [
  "Patient denies chest pain",
  "No known drug allergies",
  "Vital signs within normal limits",
]

function SupportingInfoPanel({ conditions, medications, onInsertTemplate }) {
  // Templates state
  const [savedTemplates, setSavedTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dadh_templates") || "[]") } catch { return [] }
  })
  const [addingTemplate, setAddingTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState("")

  const handleSaveTemplate = () => {
    const trimmed = newTemplate.trim()
    if (!trimmed) return
    const updated = [...savedTemplates, trimmed]
    setSavedTemplates(updated)
    localStorage.setItem("dadh_templates", JSON.stringify(updated))
    setNewTemplate("")
    setAddingTemplate(false)
  }

  // Conditions state
  const [localConditions, setLocalConditions] = useState([])
  const [addingCondition, setAddingCondition] = useState(false)
  const [newCondition, setNewCondition] = useState("")

  const handleSaveCondition = () => {
    const trimmed = newCondition.trim()
    if (!trimmed) return
    setLocalConditions(prev => [...prev, trimmed])
    setNewCondition("")
    setAddingCondition(false)
  }

  // Medications state
  const [localMeds, setLocalMeds] = useState([])
  const [addingMed, setAddingMed] = useState(false)
  const [newMed, setNewMed] = useState("")

  const handleSaveMed = () => {
    const trimmed = newMed.trim()
    if (!trimmed) return
    setLocalMeds(prev => [...prev, trimmed])
    setNewMed("")
    setAddingMed(false)
  }

  const allConditions = [...(conditions || []), ...localConditions]
  const allMeds = [...(medications || []), ...localMeds]
  const allTemplates = [...TEMPLATE_SNIPPETS, ...savedTemplates]

  const inlineInputStyle = {
    width: "100%", border: "1px solid #D1E8E8", borderRadius: 6,
    padding: "6px 10px", fontSize: 13, color: "#111E1F", outline: "none",
    background: "#F8FFFE", boxSizing: "border-box",
  }

  const btnPrimary = {
    background: "#0D7377", color: "white", border: "none", borderRadius: 6,
    padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  }

  const btnOutline = {
    background: "none", border: "1px solid #D1E8E8", color: "#64748B",
    borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer",
  }

  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #D1E8E8", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111E1F" }}>Supporting Information</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Templates */}
        <AccordionRow label="Templates">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "#64748B" }}>Click a snippet to insert into notes.</div>
            {!addingTemplate && (
              <button onClick={() => setAddingTemplate(true)} style={{ background: "none", border: "none", color: "#0D7377", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Add New
              </button>
            )}
          </div>
          {addingTemplate && (
            <div style={{ marginBottom: 10 }}>
              <textarea
                value={newTemplate}
                onChange={e => setNewTemplate(e.target.value)}
                placeholder="Type your template snippet…"
                rows={2}
                style={{ ...inlineInputStyle, resize: "vertical", marginBottom: 6 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleSaveTemplate} style={btnPrimary}>Save</button>
                <button onClick={() => { setAddingTemplate(false); setNewTemplate("") }} style={btnOutline}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTemplates.map((s, i) => (
              <div
                key={i}
                onClick={() => onInsertTemplate && onInsertTemplate(s)}
                style={{ padding: "5px 10px", background: "#F0FDFA", borderRadius: 6, fontSize: 12, color: "#0D7377", cursor: "pointer", border: "1px solid #D1E8E8" }}
              >
                {s}
              </div>
            ))}
          </div>
        </AccordionRow>

        {/* Results */}
        <AccordionRow label="Results">
          <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>No results uploaded.</div>
        </AccordionRow>

        {/* Conditions */}
        <AccordionRow label="Conditions" defaultOpen>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            {!addingCondition && (
              <button onClick={() => setAddingCondition(true)} style={{ background: "none", border: "none", color: "#0D7377", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Add New
              </button>
            )}
          </div>
          {addingCondition && (
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                placeholder="Condition name…"
                style={{ ...inlineInputStyle, marginBottom: 6 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleSaveCondition} style={btnPrimary}>Save</button>
                <button onClick={() => { setAddingCondition(false); setNewCondition("") }} style={btnOutline}>Cancel</button>
              </div>
            </div>
          )}
          {allConditions.length === 0
            ? <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>None recorded</div>
            : allConditions.map((item, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #F1F5F9", fontSize: 13, color: "#111E1F" }}>
                {item.name || item}
              </div>
            ))
          }
        </AccordionRow>

        {/* Medications */}
        <AccordionRow label="Medications" defaultOpen>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            {!addingMed && (
              <button onClick={() => setAddingMed(true)} style={{ background: "none", border: "none", color: "#0D7377", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Add New
              </button>
            )}
          </div>
          {addingMed && (
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                value={newMed}
                onChange={e => setNewMed(e.target.value)}
                placeholder="Medication name…"
                style={{ ...inlineInputStyle, marginBottom: 6 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleSaveMed} style={btnPrimary}>Save</button>
                <button onClick={() => { setAddingMed(false); setNewMed("") }} style={btnOutline}>Cancel</button>
              </div>
            </div>
          )}
          {allMeds.length === 0
            ? <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>None recorded</div>
            : allMeds.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F1F5F9", fontSize: 13, color: "#111E1F" }}>
                <span>{item.name || item}</span>
                <span style={{ color: "#94A3B8" }}>{item.date}</span>
              </div>
            ))
          }
        </AccordionRow>
      </div>
    </div>
  )
}

export default SupportingInfoPanel
