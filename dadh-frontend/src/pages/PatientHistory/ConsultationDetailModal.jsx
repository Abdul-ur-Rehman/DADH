import React from "react"
import { downloadCertificatePdf, downloadPrescriptionPdf } from "../PatientHome/generatePdf"

const SCROLLBAR_CSS = `
  .dadh-modal-body::-webkit-scrollbar { width: 4px; }
  .dadh-modal-body::-webkit-scrollbar-track { background: transparent; }
  .dadh-modal-body::-webkit-scrollbar-thumb { background: #D1E8E8; border-radius: 4px; }
  .dadh-modal-body::-webkit-scrollbar-thumb:hover { background: #0D7377; }
`

const OVERLAY = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999, padding: 16,
}

const MODAL = {
  background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
  maxHeight: "90vh", display: "flex", flexDirection: "column",
  boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
  fontFamily: "Inter, system-ui, sans-serif",
}

const T = {
  teal: "#0D7377", tealLight: "#F0FDFA", border: "#D1E8E8",
  fg: "#111E1F", muted: "#4B7172", mutedBg: "#F8FFFE",
  badge: { videoCall: ["#EFF6FF","#1D4ED8"], phoneCall: ["#F0FDF4","#15803D"], textChat: ["#FFF7ED","#C2410C"] },
}

function SectionHeader({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase",
      letterSpacing: "0.06em", marginBottom: 10 }}>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: T.muted, minWidth: 130 }}>{label}</span>
      <span style={{ fontSize: 13, color: T.fg, fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function EmptyState({ text }) {
  return <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{text}</p>
}

function TypeBadge({ type }) {
  const labels = { videoCall: "Video Call", phoneCall: "Phone Call", textChat: "Text Chat" }
  const [bg, fg] = T.badge[type] || ["#F1F5F9", "#475569"]
  return (
    <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700,
      borderRadius: 6, padding: "3px 10px", whiteSpace: "nowrap" }}>
      {labels[type] || type}
    </span>
  )
}

export default function ConsultationDetailModal({ consultation, patientName, patientDOB, onClose }) {
  if (!consultation) return null

  const c = consultation
  const doc = c.doctorInfo || {}
  const date = new Date(c.createdAt).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  })

  const pillBtn = {
    background: T.tealLight, color: T.teal, border: `1px solid ${T.border}`,
    borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <style>{SCROLLBAR_CSS}</style>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ background: T.teal, borderRadius: "16px 16px 0 0", padding: "24px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                Consultation Record
              </p>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {c.categoryName || c.consultationCategory || "General Consultation"}
              </h2>
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{date}</span>
                {c.type && <TypeBadge type={c.type} />}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: 8, color: "#fff", width: 32, height: 32, cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="dadh-modal-body"
          style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24,
            overflowY: "auto", flex: 1 }}>

          {/* Doctor */}
          <section>
            <SectionHeader>Doctor</SectionHeader>
            <div style={{ background: T.mutedBg, borderRadius: 10, padding: "14px 16px",
              border: `1px solid ${T.border}` }}>
              <InfoRow label="Name" value={doc.name ? `Dr. ${doc.name}` : null} />
              <InfoRow label="Qualification" value={doc.qualification} />
              <InfoRow label="Prescriber No." value={doc.prescriberNumber} />
            </div>
          </section>

          {/* Symptoms */}
          <section>
            <SectionHeader>Symptoms / Reason for Visit</SectionHeader>
            <div style={{ background: T.mutedBg, borderRadius: 10, padding: "14px 16px",
              border: `1px solid ${T.border}`, fontSize: 14, color: T.fg, lineHeight: 1.7 }}>
              {c.notes || <EmptyState text="No symptoms recorded." />}
            </div>
          </section>

          {/* Doctor Notes */}
          <section>
            <SectionHeader>Doctor's Notes</SectionHeader>
            <div style={{ background: T.mutedBg, borderRadius: 10, padding: "14px 16px",
              border: `1px solid ${T.border}`, fontSize: 14, color: T.fg, lineHeight: 1.7 }}>
              {c.AIScribeNote || <EmptyState text="No notes recorded." />}
            </div>
          </section>

          {/* Medications */}
          <section>
            <SectionHeader>Medications</SectionHeader>
            {c.medications?.length > 0 ? (
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: T.tealLight }}>
                      {["Medication", "Dosage", "Time"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700,
                          color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em",
                          textAlign: "left" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.medications.map((m, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: T.fg, fontWeight: 500 }}>{m.medicineName || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: T.muted }}>{m.dosage || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: T.muted }}>{m.time || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState text="No medications prescribed." />}
          </section>

          {/* Conditions */}
          {c.conditions?.length > 0 && (
            <section>
              <SectionHeader>Conditions</SectionHeader>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {c.conditions.map((cond, i) => {
                  const label = typeof cond === "string"
                    ? cond
                    : cond.condition || cond.name || "—"
                  return (
                    <span key={i} style={{ background: "#EFF6FF", color: "#1D4ED8", fontSize: 12,
                      fontWeight: 600, borderRadius: 6, padding: "4px 12px" }}>
                      {label}
                    </span>
                  )
                })}
              </div>
            </section>
          )}

          {/* Investigations */}
          {c.investigations?.length > 0 && (
            <section>
              <SectionHeader>Investigations</SectionHeader>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                {c.investigations.map((inv, i) => {
                  const type = typeof inv === "string" ? inv : inv.investigationType || inv.investigation || "—"
                  const note = typeof inv === "object" ? inv.note : null
                  return (
                    <div key={i} style={{ padding: "10px 14px", borderTop: i > 0 ? `1px solid ${T.border}` : "none",
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ fontSize: 13, color: T.fg, fontWeight: 500 }}>{type}</span>
                      {note && <span style={{ fontSize: 12, color: T.muted }}>{note}</span>}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Downloads */}
          <section>
            <SectionHeader>Documents</SectionHeader>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {c.medications?.length > 0 ? (
                <button style={pillBtn} onClick={() => downloadPrescriptionPdf({
                  medications: c.medications, doctorInfo: doc, patientName, patientDOB,
                })}>
                  ⬇ Prescription
                </button>
              ) : (
                <span style={{ fontSize: 13, color: "#94a3b8" }}>No prescription</span>
              )}
              {c.certificates?.length > 0 ? (
                <button style={pillBtn} onClick={() => downloadCertificatePdf({
                  certificate: c.certificates[0], doctorInfo: doc, patientName, patientDOB,
                })}>
                  ⬇ Certificate
                </button>
              ) : c.requestedCertificate?.length > 0 ? (
                <span style={{ fontSize: 12, fontWeight: 600, background: "#FFF7ED", color: "#C2410C",
                  border: "1px solid #FED7AA", borderRadius: 6, padding: "5px 12px" }}>
                  ⏳ Certificate Pending
                </span>
              ) : null}
            </div>
          </section>

          {/* Billing */}
          {c.totalAmount && Number(c.totalAmount) > 0 && (
            <section>
              <SectionHeader>Billing</SectionHeader>
              <div style={{ background: T.mutedBg, borderRadius: 10, padding: "14px 16px",
                border: `1px solid ${T.border}` }}>
                <InfoRow label="Total Amount" value={`$${c.totalAmount}`} />
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
