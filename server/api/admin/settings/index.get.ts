import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()

  const { data, error } = await db.from('settings').select('key, value').order('key')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Convert array to object for easier use
  const settings: Record<string, unknown> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }
  return settings
})
