import { requireAdmin, getAdminClient, logAdminAction } from '../../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const db = getAdminClient()

  const { data: order } = await db
    .from('orders')
    .select('id, delivery_method, pickup_status')
    .eq('id', id)
    .single()

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  if (order.delivery_method !== 'pickup') throw createError({ statusCode: 400, statusMessage: 'Pedido não é de retirada' })

  const { data, error } = await db
    .from('orders')
    .update({ status: 'delivered', pickup_status: 'picked_up' })
    .eq('id', id)
    .select('id, status, pickup_status')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logAdminAction({
    adminId: admin.id, action: 'update', resourceType: 'order', resourceId: id,
    changes: { after: { status: 'delivered', pickup_status: 'picked_up' } }, event,
  })

  return data
})
