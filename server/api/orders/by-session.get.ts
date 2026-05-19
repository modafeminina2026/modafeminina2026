import { createClient } from '@supabase/supabase-js'
import { useStripe } from '../../utils/stripe'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id as string

  if (!sessionId) {
    throw createError({ statusCode: 400, message: 'session_id obrigatório' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
  )

  // Try to find order in DB first
  const { data: order } = await adminClient
    .from('orders')
    .select(`
      id, order_number, status, total, subtotal, shipping_cost,
      delivery_method, pickup_code, pickup_status, pickup_ready_by,
      gift_message, gift_wrap, guest_name, guest_email, created_at
    `)
    .eq('stripe_checkout_session_id', sessionId)
    .single()

  if (order) return order

  // Order not in DB yet (webhook not processed) — fetch from Stripe directly
  const stripe = useStripe()
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    throw createError({ statusCode: 404, message: 'Sessão não encontrada' })
  }

  if (session.payment_status !== 'paid') {
    throw createError({ statusCode: 402, message: 'Pagamento ainda não confirmado' })
  }

  // Create order from Stripe session data (webhook fallback)
  const meta = session.metadata ?? {}
  const deliveryMethod = (meta.delivery_method ?? 'shipping') as 'shipping' | 'pickup'
  const items: Array<{ productId: string; quantity: number; size: string; color: string; price: number; name: string }> =
    JSON.parse(meta.items_snapshot ?? '[]')

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingCost = deliveryMethod === 'pickup' ? 0 : 15.9
  const total = subtotal + shippingCost

  const { data: newOrder, error: orderError } = await adminClient
    .from('orders')
    .insert({
      user_id: meta.user_id || null,
      guest_name: meta.guest_name || null,
      guest_email: meta.guest_email || session.customer_email || null,
      guest_cpf: meta.guest_cpf || null,
      guest_phone: meta.guest_phone || null,
      status: 'paid',
      total,
      subtotal,
      shipping_cost: shippingCost,
      delivery_method: deliveryMethod,
      shipping_address: meta.shipping_address ? JSON.parse(meta.shipping_address) : null,
      gift_message: meta.gift_message || null,
      gift_wrap: meta.gift_wrap === 'true',
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .select('id, order_number, status, total, subtotal, shipping_cost, delivery_method, pickup_code, pickup_status, pickup_ready_by, gift_message, gift_wrap, guest_name, guest_email, created_at')
    .single()

  if (orderError) {
    // Order might have been created by a concurrent request — try fetching again
    const { data: existingOrder } = await adminClient
      .from('orders')
      .select('id, order_number, status, total, subtotal, shipping_cost, delivery_method, pickup_code, pickup_status, pickup_ready_by, gift_message, gift_wrap, guest_name, guest_email, created_at')
      .eq('stripe_checkout_session_id', sessionId)
      .single()

    if (existingOrder) return existingOrder
    throw createError({ statusCode: 500, message: 'Erro ao criar pedido' })
  }

  // Re-fetch to get trigger-generated fields (pickup_code, order_number)
  const { data: freshOrder } = await adminClient
    .from('orders')
    .select('id, order_number, status, total, subtotal, shipping_cost, delivery_method, pickup_code, pickup_status, pickup_ready_by, gift_message, gift_wrap, guest_name, guest_email, created_at')
    .eq('id', newOrder.id)
    .single()

  const orderToReturn = freshOrder ?? newOrder

  // Create order items
  for (const item of items) {
    await adminClient.from('order_items').insert({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      size: item.size || null,
      color: item.color || null,
    }).catch(() => {})

    // Decrement stock
    await adminClient.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    }).catch(() => {})
  }

  return orderToReturn
})
