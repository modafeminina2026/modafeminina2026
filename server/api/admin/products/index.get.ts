import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()
  const q = getQuery(event)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 20
  const offset = (page - 1) * limit

  let query = db
    .from('products')
    .select('id, name, slug, price, original_price, stock, featured, active, images, category_id, categories(name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q.category) query = query.eq('category_id', q.category as string)
  if (q.active !== undefined) query = query.eq('active', q.active === 'true')
  if (q.low_stock === 'true') query = query.lt('stock', 10)
  if (q.search) query = query.ilike('name', `%${q.search}%`)

  const { data, error, count } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return {
    products: data ?? [],
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  }
})
