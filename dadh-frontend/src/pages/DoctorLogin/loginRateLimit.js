export const AUTH_LOCKOUT_WINDOW_MS = 15 * 60 * 1000

const parseSeconds = (value) => {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

export function formatLockoutCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export function getRateLimitRetryAt(headers, now = Date.now()) {
  const rateLimitHeader = headers.get("ratelimit")
  const resetFromRateLimit = rateLimitHeader && rateLimitHeader.match(/reset=(\d+)/i)
  if (resetFromRateLimit) {
    return now + Number(resetFromRateLimit[1]) * 1000
  }

  const resetSeconds = parseSeconds(headers.get("ratelimit-reset"))
  if (resetSeconds) return now + resetSeconds * 1000

  const retryAfter = headers.get("retry-after")
  const retryAfterSeconds = parseSeconds(retryAfter)
  if (retryAfterSeconds) return now + retryAfterSeconds * 1000

  const retryAfterDate = Date.parse(retryAfter)
  if (!Number.isNaN(retryAfterDate) && retryAfterDate > now) return retryAfterDate

  return now + AUTH_LOCKOUT_WINDOW_MS
}
