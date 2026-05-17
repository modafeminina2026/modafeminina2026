import { requireAdmin, getAdminClient, logAdminAction } from '../../../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const productId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { public_url, storage_path, file_size } = body

  if (!public_url || !storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'public_url e storage_path obrigatórios' })
  }

  const db = getAdminClient()

  // Verify product exists
  const { data: product } = await db.from('products').select('id, images').eq('id', productId).single()
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  const { count } = await db
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  const { data: img, error } = await db
    .from('product_images')
    .insert({
      product_id: productId,
      storage_path,
      public_url,
      display_order: count ?? 0,
      is_primary: (count ?? 0) === 0,
      file_size: file_size ?? null,
      uploaded_by: admin.id,
    })
    .select('id, public_url, display_order, is_primary')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Update products.images array
  const images = [...(product.images ?? []), public_url]
  await db.from('products').update({ images }).eq('id', productId)

  await logAdminAction({ adminId: admin.id, action: 'upload', resourceType: 'image', resourceId: img.id, event })

  return img
})
