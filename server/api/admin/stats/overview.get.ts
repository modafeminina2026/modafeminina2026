import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { count: totalProducts },
    { data: ordersThisMonth },
    { data: ordersLastMonth },
    { count: pendingPickups },
    { data: recentOrders },
    { data: lowStock },
    { data: readyPickups },
  ] = await Promise.all([
    db.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
    db.from('orders').select('total').gte('created_at', startOfMonth).neq('status', 'cancelled'),
    db.from('orders').select('total').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth).neq('status', 'cancelled'),
    db.from('orders').select('id', { count: 'exact', head: true }).eq('delivery_method', 'pickup').eq('pickup_status', 'waiting'),
    db.from('orders').select('id, order_number, status, total, delivery_method, pickup_code, guest_name, guest_email, created_at').order('created_at', { ascending: false }).limit(10),
    db.from('products').select('id, name, stock, images').lt('stock', 10).eq('active', true).order('stock', { ascending: true }).limit(10),
    db.from('orders').select('id, order_number, pickup_code, guest_name, guest_email, pickup_ready_by').eq('delivery_method', 'pickup').eq('pickup_status', 'ready').order('pickup_ready_by', { ascending: true }),
  ])

  const revenueThisMonth = (ordersThisMonth ?? []).reduce((s, o) => s + Number(o.total), 0)
  const revenueLastMonth = (ordersLastMonth ?? []).reduce((s, o) => s + Number(o.total), 0)

  return {
    totalProducts: totalProducts ?? 0,
    totalOrders: (ordersThisMonth ?? []).length,
    pendingPickups: pendingPickups ?? 0,
    revenueThisMonth,
    revenueLastMonth,
    ordersLastMonth: (ordersLastMonth ?? []).length,
    recentOrders: recentOrders ?? [],
    lowStock: lowStock ?? [],
    readyPickups: readyPickups ?? [],
  }
})
