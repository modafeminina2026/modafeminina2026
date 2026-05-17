import { requireAdmin, getAdminClient, logAdminAction } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const db = getAdminClient()

  // Check for existing orders
  const { count } = await db
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)

  if ((count ?? 0) > 0) {
    // Soft delete — has orders, just deactivate
    await db.from('products').update({ active: false }).eq('id', id)
    await logAdminAction({ adminId: admin.id, action: 'unpublish', resourceType: 'product', resourceId: id, event })
    return { deleted: false, deactivated: true, message: 'Produto desativado (possui pedidos vinculados)' }
  }

  // Hard delete
  const { error } = await db.from('products').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') throw createError({ statusCode: 409, statusMessage: 'Produto possui pedidos vinculados' })
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logAdminAction({ adminId: admin.id, action: 'delete', resourceType: 'product', resourceId: id, event })
  return { deleted: true }
})
