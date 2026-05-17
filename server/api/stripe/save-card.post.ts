import { serverSupabaseUser } from '#supabase/server'
import { useStripe } from '../../utils/stripe'
import { encryptData } from '../../utils/encryption'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const body = await readBody(event)
  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  // Handle set-default-only request
  if (body.setDefaultId) {
    await adminClient.from('payment_cards').update({ is_default: false }).eq('user_id', user.id)
    await adminClient.from('payment_cards').update({ is_default: true }).eq('id', body.setDefaultId).eq('user_id', user.id)
    return { success: true }
  }

  const { paymentMethodId, cardholderCpf, isDefault = false } = body as {
    paymentMethodId: string
    cardholderCpf?: string
    isDefault?: boolean
  }

  if (!paymentMethodId) throw createError({ statusCode: 400, statusMessage: 'paymentMethodId obrigatório' })

  const stripe = useStripe()

  // Get or create Stripe customer
  const { data: profile } = await adminClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  let customerId: string
  const { data: existingCard } = await adminClient
    .from('payment_cards')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existingCard?.stripe_customer_id) {
    customerId = existingCard.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? '',
      name: profile?.full_name ?? '',
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
  }

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

  // Retrieve full card details
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
  if (!pm.card) throw createError({ statusCode: 400, statusMessage: 'Método de pagamento inválido' })

  const card = pm.card
  const billing = pm.billing_details

  // Check for duplicate by fingerprint
  const { data: duplicate } = await adminClient
    .from('payment_cards')
    .select('id')
    .eq('user_id', user.id)
    .eq('card_fingerprint', card.fingerprint ?? '')
    .single()

  if (duplicate) {
    return { success: true, cardId: duplicate.id, duplicate: true }
  }

  // If setting as default, unset previous default
  if (isDefault) {
    await adminClient.from('payment_cards').update({ is_default: false }).eq('user_id', user.id)
  }

  // Encrypt CPF before storing
  const encryptedCpf = cardholderCpf ? encryptData(cardholderCpf) : null

  const { data: newCard, error } = await adminClient.from('payment_cards').insert({
    user_id: user.id,
    stripe_customer_id: customerId,
    stripe_payment_method_id: paymentMethodId,
    card_type: card.funding === 'debit' ? 'debit' : 'credit',
    card_brand: card.brand,
    card_last4: card.last4,
    card_first6: (card as Record<string, unknown>).iin as string ?? null,
    card_exp_month: card.exp_month,
    card_exp_year: card.exp_year,
    cardholder_name: billing?.name ?? '',
    cardholder_cpf: encryptedCpf,
    card_fingerprint: card.fingerprint,
    card_country: card.country,
    card_funding: card.funding,
    billing_address: billing?.address ?? null,
    is_default: isDefault,
    is_active: true,
  }).select('id').single()

  if (error) throw createError({ statusCode: 500, statusMessage: 'Erro ao salvar cartão' })

  return { success: true, cardId: newCard.id }
})
