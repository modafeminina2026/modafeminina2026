import { requireAdmin, getAdminClient, logAdminAction } from '../../../../../utils/admin'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const productId = getRouterParam(event, 'id')!
  const imageId = getRouterParam(event, 'imageId')!
  const config = useRuntimeConfig()
  const db = getAdminClient()

  // Get image record
  const { data: img } = await db
    .from('product_images')
    .select('id, storage_path, public_url, product_id')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single()

  if (!img) throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada' })

  // Delete from Storage
  const storageClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)
  await storageClient.storage.from('product-images').remove([img.storage_path])

  // Delete from product_images
  await db.from('product_images').delete().eq('id', imageId)

  // Update products.images array
  const { data: product } = await db.from('products').select('images').eq('id', productId).single()
  if (product) {
    const images = (product.images ?? []).filter((url: string) => url !== img.public_url)
    await db.from('products').update({ images }).eq('id', productId)
  }

  await logAdminAction({ adminId: admin.id, action: 'delete', resourceType: 'image', resourceId: imageId, event })

  return { deleted: true }
})
