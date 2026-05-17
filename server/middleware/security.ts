// In-memory rate limit store: ip → { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100
const WINDOW_MS  = 60_000 // 1 minute

export default defineEventHandler((event) => {
  // ── Security headers ──────────────────────────────────────────────────────
  setResponseHeaders(event, {
    'X-Content-Type-Options':    'nosniff',
    'X-Frame-Options':           'DENY',
    'X-XSS-Protection':          '1; mode=block',
    'Referrer-Policy':           'strict-origin-when-cross-origin',
    'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  })

  // ── Rate limiting (API routes only) ───────────────────────────────────────
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const ip = (
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ??
    getRequestHeader(event, 'x-real-ip') ??
    'unknown'
  )

  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  entry.count++

  if (entry.count > RATE_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests — tente novamente em 1 minuto',
    })
  }
})
