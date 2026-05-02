import { formatLockoutCountdown, getRateLimitRetryAt } from "./loginRateLimit"

const headers = (values) => ({
  get: (name) => values[name.toLowerCase()] || null,
})

describe("login rate-limit helpers", () => {
  it("formats remaining lockout time as m:ss", () => {
    expect(formatLockoutCountdown(15 * 60 * 1000)).toBe("15:00")
    expect(formatLockoutCountdown(61 * 1000)).toBe("1:01")
    expect(formatLockoutCountdown(0)).toBe("0:00")
  })

  it("uses the standard RateLimit reset value when available", () => {
    expect(getRateLimitRetryAt(headers({ ratelimit: "limit=5, remaining=0, reset=900" }), 1000)).toBe(901000)
  })

  it("falls back to a 15-minute lockout when the response has no reset metadata", () => {
    expect(getRateLimitRetryAt(headers({}), 1000)).toBe(901000)
  })
})
