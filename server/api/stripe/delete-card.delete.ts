import { serverSupabaseUser } from '#supabase/server'
import { useStripe } from '../../utils/stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const query = getQuery(event)
  const cardId = query.id as string
  if (!cardId) throw createError({ statusCode: 400, statusMessage: 'id do cartão obrigatório' })

  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  // Verify card belongs to this user
  const { data: card, error: fetchError } = await adminClient
    .from('payment_cards')
    .select('id, stripe_payment_method_id, is_default, user_id')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !card) throw createError({ statusCode: 404, statusMessage: 'Cartão não encontrado' })

  const stripe = useStripe()

  // Detach from Stripe
  try {
    await stripe.paymentMethods.detach(card.stripe_payment_method_id)
  } catch (err) {
    console.error('[delete-card] Stripe detach error:', err)
    // Continue with soft-delete even if Stripe fails
  }

  // Soft-delete — keep for fiscal records
  await adminClient
    .from('payment_cards')
    .update({ is_active: false, is_default: false })
    .eq('id', cardId)

  // If deleted card was default, promote the most recent active card
  if (card.is_default) {
    const { data: next } = await adminClient
      .from('payment_cards')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (next) {
      await adminClient.from('payment_cards').update({ is_default: true }).eq('id', next.id)
    }
  }

  return { success: true }
})
