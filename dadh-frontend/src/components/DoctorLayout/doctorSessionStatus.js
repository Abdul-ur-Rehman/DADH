export const DOCTOR_FORCED_LOGOUT_MESSAGE_KEY = "doctorForcedLogoutMessage"

export const DISABLED_DOCTOR_MESSAGE =
  "Your account has been disabled by admin. Please contact support."

export const PENDING_DOCTOR_APPROVAL_MESSAGE =
  "Your account is pending admin approval. You will be notified once approved."

export function getDoctorSessionInvalidation(doctor) {
  if (!doctor) return ""
  if (Number(doctor.status) === 0) return DISABLED_DOCTOR_MESSAGE
  if (doctor.isApproved === false || doctor.isApproved === "false") return PENDING_DOCTOR_APPROVAL_MESSAGE
  return ""
}

export function clearDoctorSession(message) {
  localStorage.removeItem("token")
  localStorage.removeItem("authToken")
  localStorage.removeItem("isDoctorLoggedIn")
  localStorage.removeItem("userRole")
  localStorage.removeItem("doctorId")
  localStorage.removeItem("data")
  localStorage.removeItem("consultationId")
  localStorage.removeItem("patientId")
  localStorage.removeItem("consultPatientData")
  localStorage.removeItem("sendBirdUserId")
  localStorage.removeItem("sendBirdUserName")
  localStorage.removeItem("incompleteConsultation")
  localStorage.removeItem("patientConsultations")
  if (message) localStorage.setItem(DOCTOR_FORCED_LOGOUT_MESSAGE_KEY, message)
}
