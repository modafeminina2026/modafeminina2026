import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()
  const q = getQuery(event)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 20
  const offset = (page - 1) * limit

  let query = db
    .from('orders')
    .select(`
      id, order_number, status, total, delivery_method,
      pickup_code, pickup_status, pickup_ready_by,
      guest_name, guest_email, user_id,
      created_at,
      profiles!orders_user_id_fkey(full_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q.status) query = query.eq('status', q.status as string)
  if (q.delivery_method) query = query.eq('delivery_method', q.delivery_method as string)
  if (q.search) {
    query = query.or(`order_number.ilike.%${q.search}%,guest_name.ilike.%${q.search}%,guest_email.ilike.%${q.search}%`)
  }
  if (q.date_from) query = query.gte('created_at', q.date_from as string)
  if (q.date_to) query = query.lte('created_at', q.date_to as string)

  const { data, error, count } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return {
    orders: data ?? [],
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  }
})
