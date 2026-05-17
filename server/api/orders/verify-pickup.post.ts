import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const body = await readBody(event)
  const { orderId, pickupCode } = body as { orderId: string; pickupCode: string }

  if (!orderId || !pickupCode) {
    throw createError({ statusCode: 400, statusMessage: 'orderId e pickupCode são obrigatórios' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  const { data: order, error } = await adminClient
    .from('orders')
    .select('id, pickup_code, pickup_status, status, user_id')
    .eq('id', orderId)
    .single()

  if (error || !order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  // Verify ownership
  if (order.user_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })

  // Verify code matches
  if (order.pickup_code !== pickupCode) {
    throw createError({ statusCode: 400, statusMessage: 'Código de retirada inválido' })
  }

  // Verify order is ready for pickup
  if (order.status !== 'ready_for_pickup') {
    throw createError({ statusCode: 400, statusMessage: 'Pedido ainda não está pronto para retirada' })
  }

  // Mark as picked up
  await adminClient
    .from('orders')
    .update({ pickup_status: 'picked_up', status: 'delivered' })
    .eq('id', orderId)

  return { success: true, message: 'Retirada confirmada com sucesso!' }
})
