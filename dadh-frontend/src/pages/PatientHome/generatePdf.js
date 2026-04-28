import { jsPDF } from "jspdf"
import logoDark from "../../assets/images/logo-dark.png"

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Normalise signature to a usable data URI.
// The backend stores signatures as raw base64; handle both that and full data URIs.
function normaliseSignature(sig) {
  if (!sig || typeof sig !== "string" || sig.trim() === "") return null
  return sig.startsWith("data:") ? sig : `data:image/png;base64,${sig}`
}

async function buildHeader(doc, W, margin) {
  let y = 48

  // Logo
  try {
    const img = await loadImage(logoDark)
    const ratio = img.naturalWidth / img.naturalHeight
    const logoH = 36
    const logoW = logoH * ratio
    doc.addImage(img, "PNG", margin, y - 28, logoW, logoH)
  } catch {
    // Logo failed to load — fall back to text only
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(13, 115, 119)
    doc.text("DIAL A HOME DOCTOR", margin, y)
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(75, 113, 114)
  doc.text("After-Hours Home Visiting Medical Service", margin, y + 14)

  const today = new Date().toLocaleDateString("en-AU")
  doc.setFontSize(9)
  doc.setTextColor(85, 85, 85)
  doc.text("Fax: (07) 3835 1012", W - margin, y, { align: "right" })
  doc.text("DHB-5AN", W - margin, y + 12, { align: "right" })
  doc.text(today, W - margin, y + 24, { align: "right" })

  y += 44
  doc.setDrawColor(13, 115, 119)
  doc.setLineWidth(1.5)
  doc.line(margin, y, W - margin, y)

  return y + 32
}

async function buildDoctorFooter(doc, margin, y, doctorInfo = {}) {
  const sig = normaliseSignature(doctorInfo.signature)
  if (sig) {
    try {
      const sigImg = await loadImage(sig)
      const ratio = sigImg.naturalWidth / sigImg.naturalHeight
      const sigH = 48
      const sigW = Math.min(sigH * ratio, 160)
      doc.addImage(sigImg, "PNG", margin, y - sigH - 4, sigW, sigH)
    } catch {}
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(17, 30, 31)
  doc.text(`Dr ${doctorInfo.name || "—"}`, margin, y)

  if (doctorInfo.qualification) {
    y += 16
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(85, 85, 85)
    doc.text(doctorInfo.qualification, margin, y)
  }
  if (doctorInfo.prescriberNumber) {
    y += 14
    doc.text(`Prescriber No: ${doctorInfo.prescriberNumber}`, margin, y)
  }
}

export async function downloadCertificatePdf({ certificate, doctorInfo = {}, patientName, patientDOB }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = await buildHeader(doc, W, margin)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(17, 30, 31)
  const title = certificate.certificationType || "Medical Certificate"
  doc.text(title, W / 2, y, { align: "center" })

  y += 36
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(51, 51, 51)
  const dob = patientDOB ? new Date(patientDOB).toLocaleDateString("en-AU") : "N/A"
  doc.text(`Patient: ${patientName || "N/A"}    |    DOB: ${dob}`, margin, y)

  if (certificate.startDate || certificate.endDate) {
    y += 20
    const start = certificate.startDate
      ? new Date(certificate.startDate).toLocaleDateString("en-AU")
      : "—"
    const end = certificate.endDate
      ? new Date(certificate.endDate).toLocaleDateString("en-AU")
      : "—"
    doc.text(`Period: ${start} – ${end}`, margin, y)
  }

  if (certificate.note) {
    y += 20
    const lines = doc.splitTextToSize(`Note: ${certificate.note}`, W - margin * 2)
    doc.text(lines, margin, y)
    y += (lines.length - 1) * 14
  }

  await buildDoctorFooter(doc, margin, y + 80, doctorInfo)

  doc.save(`certificate-${title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
}

export async function downloadPrescriptionPdf({ medications = [], doctorInfo = {}, patientName, patientDOB }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = await buildHeader(doc, W, margin)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(17, 30, 31)
  doc.text("Prescription", W / 2, y, { align: "center" })

  y += 36
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(51, 51, 51)
  const dob = patientDOB ? new Date(patientDOB).toLocaleDateString("en-AU") : "N/A"
  doc.text(`Patient: ${patientName || "N/A"}    |    DOB: ${dob}`, margin, y)

  y += 28
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(75, 113, 114)
  doc.text("MEDICATION", margin, y)
  doc.text("DOSAGE", margin + 220, y)
  doc.text("TIME", margin + 360, y)

  y += 6
  doc.setDrawColor(209, 232, 232)
  doc.setLineWidth(0.5)
  doc.line(margin, y, W - margin, y)
  y += 16

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(17, 30, 31)

  medications.forEach((med) => {
    doc.text(med.medicineName || "—", margin, y)
    doc.text(med.dosage || "—", margin + 220, y)
    doc.text(med.time || "—", margin + 360, y)
    y += 22
    doc.setDrawColor(240, 253, 250)
    doc.setLineWidth(0.5)
    doc.line(margin, y - 8, W - margin, y - 8)
  })

  await buildDoctorFooter(doc, margin, y + 48, doctorInfo)

  const safeName = (patientName || "patient").replace(/\s+/g, "-").toLowerCase()
  doc.save(`prescription-${safeName}.pdf`)
}
