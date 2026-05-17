import { requireAdmin, getAdminClient } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()
  const q = getQuery(event)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 50
  const offset = (page - 1) * limit

  let query = db
    .from('activity_logs')
    .select(`
      id, action, resource_type, resource_id, ip_address, created_at,
      admin_users!activity_logs_admin_user_id_fkey(
        user_id,
        profiles!admin_users_user_id_fkey(full_name, email)
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q.action) query = query.eq('action', q.action as string)
  if (q.resource_type) query = query.eq('resource_type', q.resource_type as string)
  if (q.date_from) query = query.gte('created_at', q.date_from as string)
  if (q.date_to) query = query.lte('created_at', q.date_to as string)

  const { data, error, count } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return {
    logs: data ?? [],
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  }
})
