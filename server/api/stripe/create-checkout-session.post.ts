import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { useStripe } from '../../utils/stripe'

interface CartItem {
  productId: string
  quantity: number
  size?: string
  color?: string
}

interface GuestInfo {
  name: string
  email: string
  cpf?: string
  phone?: string
}

export default defineEventHandler(async (event) => {
  // Tenta pegar usuário logado — mas não obriga
  const user = await serverSupabaseUser(event).catch(() => null)

  const body = await readBody(event)
  const {
    items,
    deliveryMethod,
    shippingAddress,
    giftMessage,
    giftWrap,
    guestInfo,
  } = body as {
    items: CartItem[]
    deliveryMethod: 'shipping' | 'pickup'
    shippingAddress?: Record<string, string>
    giftMessage?: string
    giftWrap?: boolean
    guestInfo?: GuestInfo
  }

  // Validações básicas
  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Carrinho vazio' })
  }
  if (!['shipping', 'pickup'].includes(deliveryMethod)) {
    throw createError({ statusCode: 400, statusMessage: 'Método de entrega inválido' })
  }

  // Convidado precisa informar email e nome
  if (!user && (!guestInfo?.email || !guestInfo?.name)) {
    throw createError({ statusCode: 400, statusMessage: 'Informe seu nome e e-mail para continuar' })
  }

  const config = useRuntimeConfig()

  // Admin client para buscar produtos (sem RLS)
  const adminClient = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
  )

  // Buscar preços do banco — NUNCA confiar no cliente
  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: products, error: dbError } = await adminClient
    .from('products')
    .select('id, name, price, images, stock, active')
    .in('id', productIds)

  if (dbError) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar produtos' })
  }

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? [])

  // Validar estoque e disponibilidade
  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product || !product.active) {
      throw createError({ statusCode: 400, statusMessage: `Produto não encontrado: ${item.productId}` })
    }
    if (product.stock < item.quantity) {
      throw createError({ statusCode: 400, statusMessage: `Estoque insuficiente: ${product.name}` })
    }
  }

  const stripe = useStripe()

  // Determinar APP_URL — em produção usa o host da requisição
  const requestHost = getRequestHeader(event, 'host')
  const requestProto = getRequestHeader(event, 'x-forwarded-proto') ?? 'https'
  const appUrl = requestHost
    ? `${requestProto}://${requestHost}`
    : (config.public.appUrl as string)

  // Montar line items
  const lineItems = items.map((item) => {
    const product = productMap.get(item.productId)!
    const description = [
      item.size && `Tamanho: ${item.size}`,
      item.color && `Cor: ${item.color}`,
    ].filter(Boolean).join(' | ')

    // Validar se a imagem é uma URL HTTPS pública válida
    const imageUrl = product.images?.[0]
    const isValidImageUrl = imageUrl &&
      imageUrl.startsWith('https://') &&
      !imageUrl.includes('localhost') &&
      !imageUrl.includes('127.0.0.1')

    return {
      price_data: {
        currency: 'brl',
        product_data: {
          name: product.name,
          ...(description && { description }),
          ...(isValidImageUrl && { images: [imageUrl] }),
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    }
  })

  // Frete (apenas para entrega)
  if (deliveryMethod === 'shipping') {
    lineItems.push({
      price_data: {
        currency: 'brl',
        product_data: { name: 'Frete' },
        unit_amount: 1590, // R$ 15,90
      },
      quantity: 1,
    })
  }

  // Email para o Stripe (logado ou convidado)
  const customerEmail = user?.email ?? guestInfo?.email

  // CPF para boleto (limpar formatação)
  const cpfRaw = (guestInfo?.cpf ?? '').replace(/\D/g, '')

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'payment',
    line_items: lineItems,
    customer_email: customerEmail,
    metadata: {
      user_id: user?.id ?? '',
      guest_name: guestInfo?.name ?? '',
      guest_email: guestInfo?.email ?? '',
      guest_cpf: guestInfo?.cpf ?? '',
      guest_phone: guestInfo?.phone ?? '',
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
    success_url: `${appUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancelado`,
    payment_method_types: ['card'],
    locale: 'pt-BR',
    custom_text: {
      submit: {
        message: 'Aceitamos apenas Visa, Mastercard e American Express. Cartões Elo e Hipercard não são aceitos.',
      },
    },
  }

  // Adicionar boleto apenas se tiver CPF válido (11 dígitos = CPF, 14 = CNPJ)
  if (cpfRaw.length === 11 || cpfRaw.length === 14) {
    sessionParams.payment_method_types = ['card', 'boleto']
    sessionParams.payment_method_options = {
      boleto: {
        expires_after_days: 3,
      },
    }
  }

  let session
  try {
    session = await stripe.checkout.sessions.create(sessionParams)
  } catch (stripeErr: unknown) {
    const err = stripeErr as { message?: string; code?: string; param?: string; type?: string }
    console.error('[Stripe Error]', JSON.stringify({ message: err.message, code: err.code, param: err.param, type: err.type }))
    throw createError({
      statusCode: 400,
      message: `Stripe: ${err.message ?? 'Erro desconhecido'} (param: ${err.param ?? 'n/a'})`,
    })
  }

  return { url: session.url }
})
