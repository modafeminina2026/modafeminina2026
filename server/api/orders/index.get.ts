import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 10

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const query = getQuery(event)
  const cursor = query.cursor as string | undefined

  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  let dbQuery = adminClient
    .from('orders')
    .select('id, order_number, status, total, delivery_method, pickup_code, pickup_status, pickup_ready_by, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (cursor) dbQuery = dbQuery.lt('created_at', cursor)

  const { data, error } = await dbQuery
  if (error) throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar pedidos' })

  const orders = data ?? []
  const nextCursor = orders.length === PAGE_SIZE ? orders[orders.length - 1]?.created_at ?? null : null

  return { orders, nextCursor }
})
