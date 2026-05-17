/**
 * Preserves the raw request body for Stripe webhook signature verification.
 * Stripe requires the exact raw bytes to validate the signature — any
 * JSON parsing before verification will break it.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path !== '/api/stripe/webhook') return

  // Read raw body and store it in event context before H3 parses it
  const rawBody = await readRawBody(event)
  event.context.stripeRawBody = rawBody ?? ''
})
