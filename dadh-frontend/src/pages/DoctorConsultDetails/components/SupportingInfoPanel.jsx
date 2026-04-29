import React, { useState } from "react"

function AccordionRow({ label, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  return (
    <div style={{ borderBottom: "1px solid #E2E8F0" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#111E1F" }}
      >
        {label}
        <span style={{ color: "#94A3B8", fontSize: 16 }}>{open ? "∨" : "›"}</span>
      </button>
      {open && <div style={{ padding: "4px 16px 12px" }}>{children}</div>}
    </div>
  )
}

function AddableList({ items, onAdd, renderItem }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={onAdd} style={{ background: "none", border: "none", color: "#0D7377", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Add New
        </button>
      </div>
      {items.length === 0
        ? <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>None recorded</div>
        : items.map((item, i) => <div key={i}>{renderItem(item)}</div>)
      }
    </div>
  )
}

const TEMPLATE_SNIPPETS = [
  "Patient denies chest pain",
  "No known drug allergies",
  "Vital signs within normal limits",
]

function SupportingInfoPanel({ conditions, medications, onAddCondition, onAddMedication, onInsertTemplate }) {
  return (
    <div style={{ background: "white", border: "1px solid #D1E8E8", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #D1E8E8" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111E1F" }}>Supporting Information</span>
      </div>

      <AccordionRow label="Templates">
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>Click a snippet to insert into notes.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEMPLATE_SNIPPETS.map((s, i) => (
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

      <AccordionRow label="Results">
        <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>No results uploaded.</div>
      </AccordionRow>

      <AccordionRow label="Conditions" defaultOpen>
        <AddableList
          items={conditions || []}
          onAdd={onAddCondition}
          renderItem={item => (
            <div style={{ padding: "6px 0", borderBottom: "1px solid #F1F5F9", fontSize: 13, color: "#111E1F" }}>
              {item.name || item}
            </div>
          )}
        />
      </AccordionRow>

      <AccordionRow label="Medications" defaultOpen>
        <AddableList
          items={medications || []}
          onAdd={onAddMedication}
          renderItem={item => (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F1F5F9", fontSize: 13, color: "#111E1F" }}>
              <span>{item.name || item}</span>
              <span style={{ color: "#94A3B8" }}>{item.date}</span>
            </div>
          )}
        />
      </AccordionRow>
    </div>
  )
}

export default SupportingInfoPanel
