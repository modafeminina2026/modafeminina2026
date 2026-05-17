import { serverSupabaseUser } from '#supabase/server'
import { useStripe } from '../../utils/stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const body = await readBody(event)
  const { items, paymentMethodId, deliveryMethod, shippingAddress, giftMessage, giftWrap } = body as {
    items: Array<{ productId: string; quantity: number; size?: string; color?: string }>
    paymentMethodId: string
    deliveryMethod: 'shipping' | 'pickup'
    shippingAddress?: Record<string, string>
    giftMessage?: string
    giftWrap?: boolean
  }

  if (!items?.length) throw createError({ statusCode: 400, statusMessage: 'Carrinho vazio' })
  if (!paymentMethodId) throw createError({ statusCode: 400, statusMessage: 'Método de pagamento obrigatório' })

  const config = useRuntimeConfig()
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  // Fetch and validate products from DB
  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: products, error: dbError } = await adminClient
    .from('products')
    .select('id, name, price, stock, active, images')
    .in('id', productIds)

  if (dbError) throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar produtos' })

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? [])

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product?.active) throw createError({ statusCode: 400, statusMessage: `Produto indisponível: ${item.productId}` })
    if (product.stock < item.quantity) throw createError({ statusCode: 400, statusMessage: `Estoque insuficiente: ${product.name}` })
  }

  // Calculate total in cents
  const subtotal = items.reduce((sum, item) => {
    return sum + productMap.get(item.productId)!.price * item.quantity
  }, 0)
  const shippingCost = deliveryMethod === 'pickup' ? 0 : 15.9
  const total = Math.round((subtotal + shippingCost) * 100)

  // Get Stripe customer ID from saved card
  const { data: card } = await adminClient
    .from('payment_cards')
    .select('stripe_customer_id')
    .eq('stripe_payment_method_id', paymentMethodId)
    .eq('user_id', user.id)
    .single()

  if (!card) throw createError({ statusCode: 400, statusMessage: 'Cartão não encontrado' })

  const stripe = useStripe()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'brl',
    customer: card.stripe_customer_id,
    payment_method: paymentMethodId,
    confirm: true,
    return_url: `${config.public.appUrl}/checkout/sucesso`,
    metadata: {
      user_id: user.id,
      delivery_method: deliveryMethod,
      gift_message: giftMessage ?? '',
      gift_wrap: giftWrap ? 'true' : 'false',
      shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : '',
      items_snapshot: JSON.stringify(
        items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size ?? '',
          color: i.color ?? '',
          price: productMap.get(i.productId)!.price,
          name: productMap.get(i.productId)!.name,
        })),
      ),
    },
  })

  return { clientSecret: paymentIntent.client_secret, status: paymentIntent.status }
})
