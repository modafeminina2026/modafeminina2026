import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function useStripe(): Stripe {
  if (_stripe) return _stripe

  const config = useRuntimeConfig()
  if (!config.stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  _stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  })

  return _stripe
}
