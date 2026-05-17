import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const db = getAdminClient()

  const { data, error } = await db
    .from('orders')
    .select(`
      *,
      profiles!orders_user_id_fkey(full_name, email, phone),
      order_items(
        id, product_name, quantity, unit_price, size, color,
        products!order_items_product_id_fkey(id, images)
      ),
      payment_transactions(
        id, status, amount, card_brand, card_last4, card_type,
        cardholder_name, receipt_url, created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  return data
})
