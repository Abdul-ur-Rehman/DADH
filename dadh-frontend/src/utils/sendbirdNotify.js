import { jsPDF } from "jspdf"

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID || ""

async function getChannel(sb, doctorSbUserId, patientId) {
  const query = sb.groupChannel.createMyGroupChannelListQuery({
    userIdsFilter: { userIds: [doctorSbUserId, patientId], includeMode: true, queryType: "AND" },
    includeEmpty: true,
    limit: 5,
  })
  const channels = await query.next()
  return channels.length > 0 ? channels[0] : null
}

async function getSbInstance(doctorSbUserId) {
  const [{ default: SendbirdChat }, { GroupChannelModule }] = await Promise.all([
    import("@sendbird/chat"),
    import("@sendbird/chat/groupChannel"),
  ])
  const sb = SendbirdChat.init({ appId: APP_ID, modules: [new GroupChannelModule()] })
  if (!sb.currentUser) {
    await sb.connect(doctorSbUserId)
  }
  return sb
}

/** Send a plain text notification message */
export async function sendChatNotification(doctorSbUserId, patientId, message) {
  if (!APP_ID || !doctorSbUserId || !patientId || !message) return
  try {
    const sb = await getSbInstance(doctorSbUserId)
    const channel = await getChannel(sb, doctorSbUserId, patientId)
    if (channel) {
      await new Promise((resolve, reject) => {
        channel.sendUserMessage({ message })
          .onSucceeded(resolve)
          .onFailed(reject)
      })
    }
  } catch (e) {
    console.error("Sendbird notify error:", e)
  }
}

/** Send a File object (e.g. PDF) as a file message */
export async function sendChatFile(doctorSbUserId, patientId, file) {
  if (!APP_ID || !doctorSbUserId || !patientId || !file) return
  try {
    const sb = await getSbInstance(doctorSbUserId)
    const channel = await getChannel(sb, doctorSbUserId, patientId)
    if (channel) {
      await new Promise((resolve, reject) => {
        channel.sendFileMessage({ file, fileName: file.name, mimeType: file.type })
          .onSucceeded(resolve)
          .onFailed(reject)
      })
    }
  } catch (e) {
    console.error("Sendbird file send error:", e)
  }
}

/** Generate a certificate PDF and return it as a File */
export function generateCertificatePDF({ certType, patientName, startDate, endDate, note, doctorName, signature }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const W = 210
  const margin = 20

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(13, 115, 119)
  doc.rect(0, 0, W, 32, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("DIAL A HOME DOCTOR", W / 2, 14, { align: "center" })
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Telemedicine Platform · www.dialahome.com.au", W / 2, 23, { align: "center" })

  let y = 48

  // ── Certificate type ─────────────────────────────────────────────────────────
  doc.setTextColor(13, 115, 119)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(certType.toUpperCase(), W / 2, y, { align: "center" })
  y += 6

  doc.setDrawColor(13, 115, 119)
  doc.setLineWidth(0.5)
  doc.line(margin, y, W - margin, y)
  y += 12

  // ── Details grid ─────────────────────────────────────────────────────────────
  const fmtD = (d) =>
    d ? d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "—"

  const rows = [
    ["Patient", patientName || "—"],
    ["Date Issued", fmtD(new Date())],
    ["Certificate Period", `${fmtD(startDate)}  →  ${fmtD(endDate)}`],
  ]

  doc.setFontSize(11)
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.setTextColor(80, 80, 80)
    doc.text(`${label}:`, margin, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(30, 30, 30)
    doc.text(value, margin + 45, y)
    y += 9
  })

  y += 6

  // ── Clinical note ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(13, 115, 119)
  doc.text("Clinical Note", margin, y)
  y += 2
  doc.setDrawColor(200, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 6

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  const noteLines = doc.splitTextToSize(note || "", W - margin * 2)
  doc.text(noteLines, margin, y)
  y += noteLines.length * 5.5 + 16

  // ── Doctor signature ─────────────────────────────────────────────────────────
  doc.setDrawColor(200, 220, 220)
  doc.line(margin, y, margin + 70, y)
  y += 5

  if (signature) {
    try {
      const imgData = signature.startsWith("data:") ? signature : `data:image/png;base64,${signature}`
      doc.addImage(imgData, "PNG", margin, y - 18, 60, 18)
    } catch {}
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(doctorName || "Doctor", margin, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.text("Dial A Home Doctor", margin, y + 11)

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text(
    "This certificate was issued via the DADH Telemedicine Platform. For verification contact support@dialahome.com.au",
    W / 2,
    285,
    { align: "center" }
  )

  const blob = doc.output("blob")
  const safeName = (patientName || "Patient").replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")
  const safeCert = certType.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")
  const fileName = `${safeName}_${safeCert}.pdf`
  return new File([blob], fileName, { type: "application/pdf" })
}
