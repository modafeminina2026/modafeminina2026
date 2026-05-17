export interface Order {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  delivery_method: 'shipping' | 'pickup'
  pickup_code: string | null
  pickup_status: string | null
  pickup_ready_by: string | null
  gift_message: string | null
  gift_wrap: boolean
  shipping_address: Record<string, unknown> | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  size: string | null
  color: string | null
  products?: { images: string[] } | null
}

const PAGE_SIZE = 10

export function useOrders() {
  const client = useSupabaseClient()
  const user   = useSupabaseUser()
  const { success, error: toastError } = useToast()

  async function fetchOrders(cursor?: string) {
    if (!user.value) return { orders: [], nextCursor: null }

    let query = client
      .from('orders')
      .select('id, order_number, status, total, delivery_method, pickup_code, pickup_status, pickup_ready_by, created_at')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (cursor) query = query.lt('created_at', cursor)

    const { data, error } = await query
    if (error) throw error

    const orders = (data ?? []) as Order[]
    const nextCursor = orders.length === PAGE_SIZE ? orders[orders.length - 1]?.created_at ?? null : null
    return { orders, nextCursor }
  }

  async function fetchOrderById(id: string): Promise<Order | null> {
    if (!user.value) return null
    const { data, error } = await client
      .from('orders')
      .select(`
        *,
        order_items(*, products(images)),
        payment_transactions(card_brand, card_last4, card_type, receipt_url, status)
      `)
      .eq('id', id)
      .eq('user_id', user.value.id)
      .single()
    if (error) return null
    return data as Order
  }

  async function copyPickupCode(code: string) {
    const { playNotification } = useSound()
    try {
      await navigator.clipboard.writeText(code)
      success(`Código ${code} copiado! 📋`)
      playNotification()
    } catch {
      toastError('Não foi possível copiar o código')
    }
  }

  return { fetchOrders, fetchOrderById, copyPickupCode, PAGE_SIZE }
}
