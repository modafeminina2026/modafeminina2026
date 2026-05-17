import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await db
    .from('orders')
    .select('total, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Group by day
  const byDay: Record<string, { revenue: number; orders: number }> = {}

  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    byDay[key] = { revenue: 0, orders: 0 }
  }

  for (const order of data ?? []) {
    const key = order.created_at.split('T')[0]
    if (byDay[key]) {
      byDay[key].revenue += Number(order.total)
      byDay[key].orders += 1
    }
  }

  return Object.entries(byDay).map(([date, stats]) => ({
    date,
    revenue: Math.round(stats.revenue * 100) / 100,
    orders: stats.orders,
  }))
})
