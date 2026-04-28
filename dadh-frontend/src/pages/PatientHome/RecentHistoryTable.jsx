import React from "react"
import { downloadCertificatePdf, downloadPrescriptionPdf } from "./generatePdf"

const pillBtn = {
  background: "#F0FDFA",
  color: "#0D7377",
  border: "1px solid #D1E8E8",
  borderRadius: 6,
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
}

const naText = { fontSize: 12, color: "#94a3b8" }

const TH = ["Date", "Doctor", "Symptoms", "Doctor Notes", "Prescription", "Certificate", ""]

export default function RecentHistoryTable({
  consultations,
  patientName,
  patientDOB,
  onRequestCertificate,
  onViewDetails,
}) {
  if (!consultations.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px dashed #D1E8E8",
          borderRadius: 12,
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 46, marginBottom: 12, opacity: 0.65 }}>📋</div>
        <p style={{ color: "#111E1F", fontWeight: 600, margin: 0, fontSize: 15 }}>
          No consultation history yet
        </p>
        <p style={{ color: "#4B7172", fontSize: 13, marginTop: 6, marginBottom: 0 }}>
          Completed consultations will appear here.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #D1E8E8",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(13, 115, 119, 0.07)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "#F0FDFA", borderBottom: "1px solid #D1E8E8" }}>
              {TH.map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4B7172",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consultations.map((c, i) => (
              <tr
                key={c._id || i}
                style={{
                  borderBottom: i < consultations.length - 1 ? "1px solid #F8FFFE" : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFFFE")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Date */}
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#111E1F", whiteSpace: "nowrap" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Doctor */}
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#111E1F", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Dr. {c.doctorInfo?.name || "—"}
                </td>

                {/* Symptoms = patient's notes field */}
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#4B7172",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={c.notes || c.categoryName || ""}
                >
                  {c.notes || c.categoryName || "—"}
                </td>

                {/* Doctor Notes = AI scribe */}
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#4B7172",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={c.AIScribeNote || ""}
                >
                  {c.AIScribeNote || "—"}
                </td>

                {/* Prescription */}
                <td style={{ padding: "14px 16px" }}>
                  {c.medications?.length > 0 ? (
                    <button
                      style={pillBtn}
                      onClick={() =>
                        downloadPrescriptionPdf({
                          medications: c.medications,
                          doctorInfo: c.doctorInfo,
                          patientName,
                          patientDOB,
                        })
                      }
                    >
                      ⬇ Download
                    </button>
                  ) : (
                    <span style={naText}>Not available</span>
                  )}
                </td>

                {/* Certificate */}
                <td style={{ padding: "14px 16px" }}>
                  {c.certificates?.length > 0 ? (
                    <button
                      style={pillBtn}
                      onClick={() =>
                        downloadCertificatePdf({
                          certificate: c.certificates[0],
                          doctorInfo: c.doctorInfo,
                          patientName,
                          patientDOB,
                        })
                      }
                    >
                      ⬇ Download
                    </button>
                  ) : c.requestedCertificate?.length > 0 ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#FFF7ED",
                        color: "#C2410C",
                        border: "1px solid #FED7AA",
                        borderRadius: 6,
                        padding: "4px 10px",
                        display: "inline-block",
                      }}
                    >
                      ⏳ Pending
                    </span>
                  ) : onRequestCertificate ? (
                    <button
                      style={{ ...pillBtn, background: "#F0FDFA", color: "#0D7377", border: "1px solid #D1E8E8" }}
                      onClick={() => onRequestCertificate(c._id)}
                    >
                      + Request
                    </button>
                  ) : (
                    <span style={naText}>Not available</span>
                  )}
                </td>

                {/* View Details */}
                <td style={{ padding: "14px 16px" }}>
                  {onViewDetails && (
                    <button
                      style={{
                        background: "#0D7377",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => onViewDetails(c)}
                    >
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
