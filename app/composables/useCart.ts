export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  availableForPickup: boolean
}

export type DeliveryMethod = 'shipping' | 'pickup'

interface CartState {
  items: CartItem[]
  deliveryMethod: DeliveryMethod
}

const CART_KEY = 'lovers-cart'

function loadFromStorage(): CartState {
  if (import.meta.server) return { items: [], deliveryMethod: 'shipping' }
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : { items: [], deliveryMethod: 'shipping' }
  } catch {
    return { items: [], deliveryMethod: 'shipping' }
  }
}

function saveToStorage(state: CartState) {
  if (import.meta.server) return
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state))
  } catch { /* quota exceeded — ignore */ }
}

export function useCart() {
  // useState INSIDE the function — required by Nuxt 4
  const cart = useState<CartState>('cart', loadFromStorage)
  const { playAddToCart } = useSound()

  function persist() {
    saveToStorage(cart.value)
  }

  function addToCart(item: Omit<CartItem, 'id'>) {
    const existing = cart.value.items.find(
      (i) => i.productId === item.productId && i.size === item.size && i.color === item.color,
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      cart.value.items.push({ ...item, id: Math.random().toString(36).slice(2) })
    }
    persist()
    // Play sound + toast client-side only
    if (import.meta.client) {
      playAddToCart()
      // Toast is shown separately — AppToast handles the sound for toast types
      // We use a custom sound here (addToCart) instead of the generic success sound
    }
  }

  function removeFromCart(id: string) {
    cart.value.items = cart.value.items.filter((i) => i.id !== id)
    persist()
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) { removeFromCart(id); return }
    const item = cart.value.items.find((i) => i.id === id)
    if (item) { item.quantity = quantity; persist() }
  }

  function clearCart() {
    cart.value.items = []
    persist()
  }

  function setDeliveryMethod(method: DeliveryMethod) {
    cart.value.deliveryMethod = method
    persist()
  }

  const cartCount = computed(() =>
    cart.value.items.reduce((sum, i) => sum + i.quantity, 0),
  )

  const subtotal = computed(() =>
    cart.value.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  )

  const shippingCost = computed(() =>
    cart.value.deliveryMethod === 'pickup' ? 0 : subtotal.value > 0 ? 15.9 : 0,
  )

  const total = computed(() => subtotal.value + shippingCost.value)

  return {
    cart,
    cartCount,
    subtotal,
    shippingCost,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setDeliveryMethod,
  }
}
