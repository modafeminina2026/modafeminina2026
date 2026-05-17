import { requireAdmin, getAdminClient, logAdminAction } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const db = getAdminClient()

  // Get before state for audit log
  const { data: before } = await db.from('products').select('*').eq('id', id).single()
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  // Build update object (only provided fields)
  const update: Record<string, unknown> = {}
  const allowed = ['name','slug','description','price','original_price','category_id','stock','featured','active','sizes','colors','brand','available_for_pickup','images']
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  if (update.price) update.price = Number(update.price)
  if (update.original_price) update.original_price = Number(update.original_price)
  if (update.stock !== undefined) update.stock = Number(update.stock)

  const { data, error } = await db.from('products').update(update).eq('id', id).select('id, name, slug').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logAdminAction({ adminId: admin.id, action: 'update', resourceType: 'product', resourceId: id, changes: { before, after: update }, event })

  return data
})
