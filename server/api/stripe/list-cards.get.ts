import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  const { data, error } = await adminClient
    .from('payment_cards')
    .select('id, card_type, card_brand, card_last4, card_exp_month, card_exp_year, cardholder_name, is_default')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: 'Erro ao listar cartões' })

  // NEVER return encrypted CPF or sensitive data to client
  return data ?? []
})
