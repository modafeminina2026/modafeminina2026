import { requireAdmin, getAdminClient } from '../../../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { order } = body as { order: { id: string; display_order: number }[] }

  if (!Array.isArray(order)) throw createError({ statusCode: 400, statusMessage: 'order deve ser um array' })

  const db = getAdminClient()

  for (const item of order) {
    await db
      .from('product_images')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
      .eq('product_id', productId)
  }

  return { updated: order.length }
})
