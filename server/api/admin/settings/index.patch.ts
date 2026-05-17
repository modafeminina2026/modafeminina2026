import { requireAdmin, getAdminClient, logAdminAction } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event) as Record<string, unknown>
  const db = getAdminClient()

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value: typeof value === 'object' ? value : value,
    updated_at: new Date().toISOString(),
    updated_by: admin.id,
  }))

  for (const update of updates) {
    await db.from('settings').upsert(update, { onConflict: 'key' })
  }

  await logAdminAction({
    adminId: admin.id, action: 'update', resourceType: 'setting',
    changes: { after: body }, event,
  })

  return { updated: updates.length }
})
