// Rate limiting store (in-memory)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100
const RATE_WINDOW = 60 * 1000

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Only apply to /api/admin/* routes
  if (!path.startsWith('/api/admin/')) return

  // Skip auth routes — they handle their own auth
  if (path.startsWith('/api/admin/auth/')) return

  // Rate limiting per IP
  const ip = getRequestHeader(event, 'x-forwarded-for')
    ?? getRequestHeader(event, 'x-real-ip')
    ?? 'unknown'
  const now = Date.now()
  const rateData = rateLimitStore.get(ip)

  if (rateData && now < rateData.resetAt) {
    if (rateData.count >= RATE_LIMIT) {
      throw createError({ statusCode: 429, message: 'Muitas requisições. Tente novamente em 1 minuto.' })
    }
    rateData.count++
  } else {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
  }

  // Auth check is done inside each route handler via requireAdmin()
  // This middleware only handles rate limiting
})
