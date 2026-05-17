import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  // Pagination
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 12
  const offset = (page - 1) * limit

  // Filters
  const categoryId = query.category as string | undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const size = query.size as string | undefined
  const pickupOnly = query.pickupOnly === 'true'
  const search = query.search as string | undefined
  const sort = (query.sort as string) || 'featured'
  const featured = query.featured === 'true'

  let dbQuery = client
    .from('products')
    .select(`*, categories(id, name, slug)`, { count: 'exact' })
    .eq('active', true)

  if (categoryId) dbQuery = dbQuery.eq('category_id', categoryId)
  if (minPrice !== undefined) dbQuery = dbQuery.gte('price', minPrice)
  if (maxPrice !== undefined) dbQuery = dbQuery.lte('price', maxPrice)
  if (size) dbQuery = dbQuery.contains('sizes', [size])
  if (pickupOnly) dbQuery = dbQuery.eq('available_for_pickup', true)
  if (search) dbQuery = dbQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  if (featured) dbQuery = dbQuery.eq('featured', true)

  switch (sort) {
    case 'price_asc':  dbQuery = dbQuery.order('price', { ascending: true }); break
    case 'price_desc': dbQuery = dbQuery.order('price', { ascending: false }); break
    case 'name':       dbQuery = dbQuery.order('name', { ascending: true }); break
    case 'newest':     dbQuery = dbQuery.order('created_at', { ascending: false }); break
    default:           dbQuery = dbQuery.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  dbQuery = dbQuery.range(offset, offset + limit - 1)

  const { data: products, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, message: 'Erro ao buscar produtos' })
  }

  return {
    products: products || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (count || 0) > offset + limit,
    },
  }
})
