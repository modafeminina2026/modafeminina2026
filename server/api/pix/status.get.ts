import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const paymentId = query.payment_id as string

  if (!paymentId) throw createError({ statusCode: 400, message: 'payment_id obrigatório' })

  const mpResponse = await $fetch<{
    id: number
    status: string
    status_detail: string
    metadata: Record<string, string>
    transaction_amount: number
  }>(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${config.mpAccessToken}` },
  })

  // Se aprovado, criar pedido no banco
  if (mpResponse.status === 'approved') {
    const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

    // Verificar se pedido já existe
    const { data: existing } = await adminClient
      .from('orders')
      .select('id, order_number, pickup_code')
      .eq('mp_payment_id', String(paymentId))
      .single()

    if (existing) {
      return { status: 'approved', order_id: existing.id, order_number: existing.order_number, pickup_code: existing.pickup_code }
    }

    // Criar pedido
    const meta = mpResponse.metadata ?? {}
    const deliveryMethod = (meta.delivery_method ?? 'shipping') as 'shipping' | 'pickup'
    const items: Array<{ productId: string; quantity: number; size: string; color: string; price: number; name: string }> =
      JSON.parse(meta.items_snapshot ?? '[]')

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const shippingCost = deliveryMethod === 'pickup' ? 0 : 15.9

    const { data: order } = await adminClient
      .from('orders')
      .insert({
        guest_name: meta.guest_name || null,
        guest_email: meta.guest_email || null,
        guest_phone: meta.guest_phone || null,
        status: 'paid',
        total: subtotal + shippingCost,
        subtotal,
        shipping_cost: shippingCost,
        delivery_method: deliveryMethod,
        gift_message: meta.gift_message || null,
        gift_wrap: meta.gift_wrap === 'true',
        mp_payment_id: String(paymentId),
        payment_method: 'pix',
      })
      .select('id, order_number, pickup_code')
      .single()

    if (order) {
      // Criar itens e decrementar estoque
      for (const item of items) {
        await adminClient.from('order_items').insert({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          size: item.size || null,
          color: item.color || null,
        }).catch(() => {})

        await adminClient.rpc('decrement_stock', {
          p_product_id: item.productId,
          p_quantity: item.quantity,
        }).catch(() => {})
      }

      return { status: 'approved', order_id: order.id, order_number: order.order_number, pickup_code: order.pickup_code }
    }
  }

  return { status: mpResponse.status, status_detail: mpResponse.status_detail }
})
