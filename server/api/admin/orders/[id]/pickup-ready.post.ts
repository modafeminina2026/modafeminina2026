import { requireAdmin, getAdminClient, logAdminAction } from '../../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const db = getAdminClient()

  const { data: order } = await db
    .from('orders')
    .select('id, delivery_method, pickup_code, status, guest_email, guest_name')
    .eq('id', id)
    .single()

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  if (order.delivery_method !== 'pickup') throw createError({ statusCode: 400, statusMessage: 'Pedido não é de retirada' })

  const { data, error } = await db
    .from('orders')
    .update({ status: 'ready_for_pickup', pickup_status: 'ready' })
    .eq('id', id)
    .select('id, status, pickup_code, pickup_status')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logAdminAction({
    adminId: admin.id, action: 'update', resourceType: 'order', resourceId: id,
    changes: { after: { status: 'ready_for_pickup', pickup_status: 'ready' } }, event,
  })

  // TODO: send email notification to customer with pickup code
  // For now, return the data so admin can notify manually

  return {
    ...data,
    customer_email: order.guest_email,
    customer_name: order.guest_name,
    message: 'Pedido marcado como pronto para retirada',
  }
})
