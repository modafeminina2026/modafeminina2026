import { requireAdmin, getAdminClient, logAdminAction } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = getAdminClient()
  const config = useRuntimeConfig()

  // Parse multipart form
  const formData = await readMultipartFormData(event)
  if (!formData?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })
  }

  const fileField = formData.find((f) => f.name === 'file')
  const productIdField = formData.find((f) => f.name === 'product_id')

  if (!fileField?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "file" obrigatório' })
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const mimeType = fileField.type ?? 'application/octet-stream'
  if (!allowedTypes.includes(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' })
  }

  // Validate file size (5MB)
  if (fileField.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo muito grande. Máximo 5MB.' })
  }

  // Generate unique filename
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const filename = `${timestamp}-${random}.${ext}`
  const storagePath = `products/${filename}`

  // Upload to Supabase Storage using admin client
  const { createClient } = await import('@supabase/supabase-js')
  const storageClient = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
  )

  const { error: uploadError } = await storageClient.storage
    .from('product-images')
    .upload(storagePath, fileField.data, {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: `Erro no upload: ${uploadError.message}` })
  }

  // Get public URL
  const { data: urlData } = storageClient.storage
    .from('product-images')
    .getPublicUrl(storagePath)

  const publicUrl = urlData.publicUrl

  // Save to product_images table if product_id provided
  let imageRecord: { id: string } | null = null
  const productId = productIdField?.data?.toString()

  if (productId) {
    // Count existing images to set display_order
    const { count } = await db
      .from('product_images')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)

    const { data: img, error: imgError } = await db
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: storagePath,
        public_url: publicUrl,
        display_order: count ?? 0,
        is_primary: (count ?? 0) === 0, // First image is primary
        file_size: fileField.data.length,
        uploaded_by: admin.id,
      })
      .select('id')
      .single()

    if (!imgError && img) {
      imageRecord = img

      // Update products.images array for compatibility
      const { data: product } = await db
        .from('products')
        .select('images')
        .eq('id', productId)
        .single()

      if (product) {
        const images = [...(product.images ?? []), publicUrl]
        await db.from('products').update({ images }).eq('id', productId)
      }
    }
  }

  await logAdminAction({
    adminId: admin.id,
    action: 'upload',
    resourceType: 'image',
    resourceId: imageRecord?.id,
    changes: { after: { filename, product_id: productId } },
    event,
  })

  return {
    id: imageRecord?.id ?? null,
    public_url: publicUrl,
    storage_path: storagePath,
    file_size: fileField.data.length,
  }
})
