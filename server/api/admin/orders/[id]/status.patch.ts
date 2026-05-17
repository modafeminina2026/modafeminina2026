import { requireAdmin, getAdminClient, logAdminAction } from '../../../../utils/admin'

const VALID_STATUSES = ['pending','paid','preparing','ready_for_pickup','shipped','delivered','cancelled']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const { status, tracking_number } = await readBody(event)

  if (!VALID_STATUSES.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: `Status inválido. Use: ${VALID_STATUSES.join(', ')}` })
  }

  const db = getAdminClient()
  const { data: before } = await db.from('orders').select('status').eq('id', id).single()
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  const update: Record<string, unknown> = { status }
  if (tracking_number) update.tracking_number = tracking_number

  const { data, error } = await db.from('orders').update(update).eq('id', id).select('id, status').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logAdminAction({
    adminId: admin.id, action: 'update', resourceType: 'order', resourceId: id,
    changes: { before: { status: before.status }, after: { status } }, event,
  })

  return data
})
