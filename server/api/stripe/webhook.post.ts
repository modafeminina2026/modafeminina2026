import { useStripe } from '../../utils/stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const stripe = useStripe()
  const config = useRuntimeConfig()

  const sig = getRequestHeader(event, 'stripe-signature')
  const rawBody = event.context.stripeRawBody as string

  if (!sig || !rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing signature or body' })
  }

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret as string)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid webhook signature' })
  }

  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  // ── checkout.session.completed ────────────────────────────────────────────
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    if (session.payment_status !== 'paid') return { received: true }

    const meta = session.metadata ?? {}
    const userId = meta.user_id || null  // null para convidados
    const guestName = meta.guest_name || null
    const guestEmail = meta.guest_email || session.customer_email || null
    const guestCpf = meta.guest_cpf || null
    const guestPhone = meta.guest_phone || null
    const deliveryMethod = meta.delivery_method as 'shipping' | 'pickup'
    const items: Array<{ productId: string; quantity: number; size: string; color: string; price: number; name: string }> =
      JSON.parse(meta.items_snapshot ?? '[]')
    const shippingAddress = meta.shipping_address ? JSON.parse(meta.shipping_address) : null
    const giftMessage = meta.gift_message || null
    const giftWrap = meta.gift_wrap === 'true'

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const shippingCost = deliveryMethod === 'pickup' ? 0 : 15.9
    const total = subtotal + shippingCost

    // Create order (user_id pode ser null para convidados)
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        user_id: userId || null,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_cpf: guestCpf,
        guest_phone: guestPhone,
        status: 'paid',
        total,
        subtotal,
        shipping_cost: shippingCost,
        delivery_method: deliveryMethod,
        shipping_address: shippingAddress,
        gift_message: giftMessage,
        gift_wrap: giftWrap,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .select('id, pickup_code, pickup_ready_by')
      .single()

    if (orderError) {
      console.error('[webhook] order insert error:', orderError)
      throw createError({ statusCode: 500, statusMessage: 'Order creation failed' })
    }

    // Create order items + decrement stock
    for (const item of items) {
      await adminClient.from('order_items').insert({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        size: item.size || null,
        color: item.color || null,
      })

      await adminClient.rpc('decrement_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity,
      }).then(() => {}).catch(() => {
        // Fallback manual decrement if RPC not available
        adminClient
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single()
          .then(({ data }) => {
            if (data) {
              adminClient
                .from('products')
                .update({ stock: Math.max(0, data.stock - item.quantity) })
                .eq('id', item.productId)
            }
          })
      })
    }

    // Save card data for fiscal audit
    await saveCardFromSession(session, userId, order.id, adminClient, stripe)
  }

  // ── payment_intent.payment_failed ─────────────────────────────────────────
  if (stripeEvent.type === 'payment_intent.payment_failed') {
    const pi = stripeEvent.data.object
    const userId = pi.metadata?.user_id
    if (!userId) return { received: true }

    // Find order by payment intent
    const { data: order } = await adminClient
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', pi.id)
      .single()

    if (order) {
      await adminClient
        .from('payment_transactions')
        .insert({
          order_id: order.id,
          user_id: userId,
          stripe_payment_intent_id: pi.id,
          amount: (pi.amount ?? 0) / 100,
          currency: pi.currency ?? 'brl',
          status: 'failed',
          failure_reason: pi.last_payment_error?.message ?? 'Unknown',
          ip_address: getRequestHeader(event, 'x-forwarded-for') ?? null,
          user_agent: getRequestHeader(event, 'user-agent') ?? null,
        })
    }
  }

  return { received: true }
})

// ── Helper: save card data from checkout session ───────────────────────────
async function saveCardFromSession(
  session: Record<string, unknown>,
  userId: string,
  orderId: string,
  adminClient: ReturnType<typeof createClient>,
  stripe: ReturnType<typeof useStripe>,
) {
  try {
    const piId = session.payment_intent as string
    if (!piId) return

    const pi = await stripe.paymentIntents.retrieve(piId, {
      expand: ['payment_method', 'latest_charge'],
    })

    const pm = pi.payment_method as import('stripe').Stripe.PaymentMethod | null
    const charge = pi.latest_charge as import('stripe').Stripe.Charge | null
    if (!pm?.card) return

    const card = pm.card
    const billing = pm.billing_details

    // Upsert card by fingerprint to avoid duplicates
    const { data: existing } = await adminClient
      .from('payment_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('card_fingerprint', card.fingerprint ?? '')
      .single()

    if (!existing) {
      await adminClient.from('payment_cards').insert({
        user_id: userId,
        stripe_customer_id: (pi.customer as string) ?? '',
        stripe_payment_method_id: pm.id,
        card_type: card.funding === 'debit' ? 'debit' : 'credit',
        card_brand: card.brand,
        card_last4: card.last4,
        card_first6: (card as Record<string, unknown>).iin as string ?? null,
        card_exp_month: card.exp_month,
        card_exp_year: card.exp_year,
        cardholder_name: billing?.name ?? '',
        card_fingerprint: card.fingerprint,
        card_country: card.country,
        card_funding: card.funding,
        billing_address: billing?.address ?? null,
        is_default: false,
        is_active: true,
        last_used_at: new Date().toISOString(),
      })
    }

    // Save payment transaction for fiscal audit
    await adminClient.from('payment_transactions').insert({
      order_id: orderId,
      user_id: userId,
      stripe_payment_intent_id: piId,
      stripe_charge_id: charge?.id ?? null,
      amount: (pi.amount ?? 0) / 100,
      currency: pi.currency ?? 'brl',
      status: 'succeeded',
      card_brand: card.brand,
      card_last4: card.last4,
      card_type: card.funding === 'debit' ? 'debit' : 'credit',
      cardholder_name: billing?.name ?? '',
      billing_address: billing?.address ?? null,
      receipt_url: charge?.receipt_url ?? null,
      ip_address: null,
      user_agent: null,
    })
  } catch (err) {
    console.error('[webhook] saveCardFromSession error:', err)
  }
}
