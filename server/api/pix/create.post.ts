import { createClient } from '@supabase/supabase-js'

interface PixItem {
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
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { items, deliveryMethod, shippingAddress, giftMessage, giftWrap, guestInfo } = body as {
    items: PixItem[]
    deliveryMethod: 'shipping' | 'pickup'
    shippingAddress?: Record<string, string>
    giftMessage?: string
    giftWrap?: boolean
    guestInfo?: GuestInfo
  }

  if (!items?.length) throw createError({ statusCode: 400, message: 'Carrinho vazio' })
  if (!guestInfo?.email || !guestInfo?.name) throw createError({ statusCode: 400, message: 'Nome e e-mail obrigatórios' })

  // Buscar preços do banco
  const adminClient = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)
  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: products } = await adminClient
    .from('products')
    .select('id, name, price, stock, active')
    .in('id', productIds)

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? [])

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product || !product.active) throw createError({ statusCode: 400, message: `Produto não encontrado: ${item.productId}` })
    if (product.stock < item.quantity) throw createError({ statusCode: 400, message: `Estoque insuficiente: ${product.name}` })
  }

  const subtotal = items.reduce((s, i) => s + productMap.get(i.productId)!.price * i.quantity, 0)
  const shippingCost = deliveryMethod === 'pickup' ? 0 : 15.9
  const total = subtotal + shippingCost

  // Limpar CPF
  const cpfRaw = (guestInfo.cpf ?? '').replace(/\D/g, '')

  // Criar pagamento Pix no Mercado Pago
  const mpBody = {
    transaction_amount: Math.round(total * 100) / 100,
    description: `Lover's Brasileiras — ${items.length} item(s)`,
    payment_method_id: 'pix',
    payer: {
      email: guestInfo.email,
      first_name: guestInfo.name.split(' ')[0],
      last_name: guestInfo.name.split(' ').slice(1).join(' ') || guestInfo.name.split(' ')[0],
      ...(cpfRaw.length === 11 && {
        identification: { type: 'CPF', number: cpfRaw },
      }),
    },
    metadata: {
      guest_name: guestInfo.name,
      guest_email: guestInfo.email,
      guest_phone: guestInfo.phone ?? '',
      delivery_method: deliveryMethod,
      gift_message: giftMessage ?? '',
      gift_wrap: giftWrap ? 'true' : 'false',
      items_snapshot: JSON.stringify(
        items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size ?? '',
          color: i.color ?? '',
          price: productMap.get(i.productId)!.price,
          name: productMap.get(i.productId)!.name,
        }))
      ),
    },
  }

  const mpResponse = await $fetch<{
    id: number
    status: string
    point_of_interaction: {
      transaction_data: {
        qr_code: string
        qr_code_base64: string
      }
    }
  }>('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.mpAccessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `pix-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
    body: mpBody,
  })

  const txData = mpResponse.point_of_interaction?.transaction_data
  if (!txData?.qr_code) {
    throw createError({ statusCode: 500, message: 'Erro ao gerar QR Code Pix' })
  }

  return {
    payment_id: mpResponse.id,
    status: mpResponse.status,
    qr_code: txData.qr_code,
    qr_code_base64: txData.qr_code_base64,
    total,
    expires_in: 30 * 60, // 30 minutos
  }
})
