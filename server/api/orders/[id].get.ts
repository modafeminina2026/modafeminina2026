import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do pedido obrigatório' })

  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  const { data, error } = await adminClient
    .from('orders')
    .select(`
      *,
      order_items (
        id, product_name, quantity, unit_price, size, color,
        products ( id, images )
      ),
      payment_transactions (
        card_brand, card_last4, card_type, receipt_url, status, amount
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  return data
})
