import { requireAdmin, getAdminClient, logAdminAction } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const { name, slug, description, price, original_price, category_id, stock, featured, active, sizes, colors, brand, available_for_pickup, images } = body

  if (!name || !slug || price === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'name, slug e price são obrigatórios' })
  }

  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .insert({
      name, slug, description, price: Number(price),
      original_price: original_price ? Number(original_price) : null,
      category_id: category_id || null,
      stock: Number(stock) || 0,
      featured: !!featured,
      active: active !== false,
      sizes: sizes || null,
      colors: colors || null,
      brand: brand || null,
      available_for_pickup: available_for_pickup !== false,
      images: images || [],
    })
    .select('id, name, slug')
    .single()

  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Slug já existe' })
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logAdminAction({ adminId: admin.id, action: 'create', resourceType: 'product', resourceId: data.id, changes: { after: body }, event })

  return data
})
