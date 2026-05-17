export interface ShippingAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip: string
}

export interface CheckoutPayload {
  deliveryMethod: 'shipping' | 'pickup'
  shippingAddress?: ShippingAddress
  giftMessage?: string
  giftWrap?: boolean
  savedCardId?: string
  guestInfo?: {
    name: string
    email: string
    cpf?: string
    phone?: string
  }
}

export interface SavedCard {
  id: string
  card_type: 'credit' | 'debit'
  card_brand: string
  card_last4: string
  card_exp_month: number
  card_exp_year: number
  cardholder_name: string
  is_default: boolean
}

export function useCheckout() {
  const { cart } = useCart()
  const { error: toastError } = useToast()
  const loading = ref(false)

  /**
   * Creates a Stripe Checkout Session and redirects to Stripe.
   */
  async function createCheckoutSession(payload: CheckoutPayload): Promise<void> {
    loading.value = true
    try {
      const { url } = await $fetch<{ url: string }>('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: {
          items: cart.value.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          deliveryMethod: payload.deliveryMethod,
          shippingAddress: payload.shippingAddress,
          giftMessage: payload.giftMessage,
          giftWrap: payload.giftWrap,
          guestInfo: payload.guestInfo,
        },
      })
      window.location.href = url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar pagamento'
      toastError(msg)
    } finally {
      loading.value = false
    }
  }

  /**
   * Pay with a saved card via Payment Intent.
   */
  async function payWithSavedCard(payload: CheckoutPayload & { savedCardId: string }): Promise<boolean> {
    loading.value = true
    try {
      await $fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        body: {
          items: cart.value.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          paymentMethodId: payload.savedCardId,
          deliveryMethod: payload.deliveryMethod,
          shippingAddress: payload.shippingAddress,
          giftMessage: payload.giftMessage,
          giftWrap: payload.giftWrap,
        },
      })
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento'
      toastError(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  async function listSavedCards(): Promise<SavedCard[]> {
    try {
      return await $fetch<SavedCard[]>('/api/stripe/list-cards')
    } catch {
      return []
    }
  }

  async function deleteSavedCard(cardId: string): Promise<boolean> {
    try {
      await $fetch(`/api/stripe/delete-card?id=${cardId}`, { method: 'DELETE' })
      return true
    } catch {
      toastError('Erro ao remover cartão')
      return false
    }
  }

  async function setDefaultCard(cardId: string): Promise<boolean> {
    try {
      await $fetch('/api/stripe/save-card', {
        method: 'POST',
        body: { setDefaultId: cardId },
      })
      return true
    } catch {
      toastError('Erro ao definir cartão padrão')
      return false
    }
  }

  return {
    loading,
    createCheckoutSession,
    payWithSavedCard,
    listSavedCards,
    deleteSavedCard,
    setDefaultCard,
  }
}
