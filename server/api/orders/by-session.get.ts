import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id as string

  if (!sessionId) {
    throw createError({ statusCode: 400, message: 'session_id obrigatório' })
  }

  const config = useRuntimeConfig()

  // Usar admin client para buscar pedido pelo session_id (funciona para convidados também)
  const adminClient = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
  )

  const { data: order, error } = await adminClient
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total,
      subtotal,
      shipping_cost,
      delivery_method,
      pickup_code,
      pickup_status,
      pickup_ready_by,
      gift_message,
      gift_wrap,
      guest_name,
      guest_email,
      created_at
    `)
    .eq('stripe_checkout_session_id', sessionId)
    .single()

  if (error || !order) {
    throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
  }

  return order
})
