import { getDoctorSessionInvalidation } from "./doctorSessionStatus"

describe("getDoctorSessionInvalidation", () => {
  it("returns a disabled-account message when doctor status is 0", () => {
    expect(getDoctorSessionInvalidation({ status: 0, isApproved: true })).toBe(
      "Your account has been disabled by admin. Please contact support."
    )
  })

  it("returns a disabled-account message when doctor status is the string 0", () => {
    expect(getDoctorSessionInvalidation({ status: "0", isApproved: true })).toBe(
      "Your account has been disabled by admin. Please contact support."
    )
  })

  it("returns a pending-approval message when doctor is not approved", () => {
    expect(getDoctorSessionInvalidation({ status: 1, isApproved: false })).toBe(
      "Your account is pending admin approval. You will be notified once approved."
    )
  })

  it("returns a pending-approval message when isApproved is the string false", () => {
    expect(getDoctorSessionInvalidation({ status: 1, isApproved: "false" })).toBe(
      "Your account is pending admin approval. You will be notified once approved."
    )
  })

  it("returns an empty message for an approved active doctor", () => {
    expect(getDoctorSessionInvalidation({ status: 1, isApproved: true })).toBe("")
  })
})
