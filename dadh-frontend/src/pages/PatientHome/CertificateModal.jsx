import React from "react"

export default function CertificateModal({
  show,
  onClose,
  certificate,
  doctorInfo = {},
  patientName,
  patientDOB,
}) {
  if (!show || !certificate) return null

  const today = new Date().toLocaleDateString("en-AU")
  const formattedDOB = patientDOB
    ? new Date(patientDOB).toLocaleDateString("en-AU")
    : "N/A"

  const handlePrint = () => {
    const content = document.getElementById("dadh-cert-content").innerHTML
    const orig = document.body.innerHTML
    document.body.innerHTML = content
    window.print()
    document.body.innerHTML = orig
    window.location.reload()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9998,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        id="dadh-cert-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: "40px 44px",
          width: 760,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 12,
          fontFamily: "Arial, sans-serif",
          color: "#000",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #0D7377",
            paddingBottom: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0D7377", letterSpacing: "-0.3px" }}>
              DIAL A HOME DOCTOR
            </div>
            <div style={{ fontSize: 13, color: "#4B7172", marginTop: 4 }}>
              After-Hours Home Visiting Medical Service
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
            <div>Fax: (07) 3835 1012</div>
            <div>DHB-5AN</div>
            <div style={{ marginTop: 4 }}>{today}</div>
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "#111E1F",
            marginBottom: 28,
          }}
        >
          {certificate.certificationType}
        </h2>

        {/* Body */}
        <div style={{ fontSize: 15, lineHeight: 1.85, color: "#333" }}>
          <p style={{ margin: "0 0 10px" }}>
            <strong>Patient:</strong> {patientName || "N/A"} &nbsp;|&nbsp; DOB: {formattedDOB}
          </p>
          {certificate.note && (
            <p style={{ margin: "0 0 10px" }}>
              <strong>Note:</strong> {certificate.note}
            </p>
          )}
        </div>

        {/* Signature */}
        <div style={{ marginTop: 56 }}>
          {doctorInfo?.signature && (
            <img
              src={`data:image/png;base64,${doctorInfo.signature}`}
              alt="Doctor signature"
              style={{ height: 60, marginBottom: 8, display: "block" }}
            />
          )}
          <div style={{ fontWeight: 700, fontSize: 15 }}>Dr {doctorInfo?.name || "—"}</div>
          {doctorInfo?.qualification && (
            <div style={{ color: "#555", fontSize: 13, marginTop: 2 }}>
              {doctorInfo.qualification}
            </div>
          )}
          {doctorInfo?.prescriberNumber && (
            <div style={{ color: "#555", fontSize: 13 }}>
              Prescriber No: {doctorInfo.prescriberNumber}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              background: "#0D7377",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              color: "#555",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
