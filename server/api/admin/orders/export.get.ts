import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getAdminClient()
  const q = getQuery(event)

  let query = db
    .from('orders')
    .select('order_number, status, total, delivery_method, pickup_code, guest_name, guest_email, guest_phone, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (q.status) query = query.eq('status', q.status as string)
  if (q.date_from) query = query.gte('created_at', q.date_from as string)
  if (q.date_to) query = query.lte('created_at', q.date_to as string)

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const orders = data ?? []

  // Build CSV
  const headers = ['Número', 'Status', 'Total', 'Entrega', 'Código Retirada', 'Cliente', 'Email', 'Telefone', 'Data']
  const rows = orders.map((o) => [
    o.order_number ?? '',
    o.status,
    Number(o.total).toFixed(2).replace('.', ','),
    o.delivery_method === 'pickup' ? 'Retirada' : 'Entrega',
    o.pickup_code ?? '',
    o.guest_name ?? '',
    o.guest_email ?? '',
    o.guest_phone ?? '',
    new Date(o.created_at).toLocaleDateString('pt-BR'),
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="pedidos-${Date.now()}.csv"`)
  return csv
})
