export function useWishlist() {
  const client = useSupabaseClient()
  const user   = useSupabaseUser()
  const { error: toastError, success } = useToast()
  const { playWishlist } = useSound()

  const wishlistIds = useState<Set<string>>('wishlist-ids', () => new Set())

  async function loadWishlist() {
    if (!user.value) return
    const { data } = await client
      .from('wishlists')
      .select('product_id')
    wishlistIds.value = new Set((data ?? []).map((w: { product_id: string }) => w.product_id))
  }

  async function addToWishlist(productId: string) {
    if (!user.value) { toastError('Faça login para salvar na lista de desejos'); return }
    const { error } = await client.from('wishlists').insert({ product_id: productId })
    if (error) { toastError('Erro ao adicionar à lista de desejos'); return }
    wishlistIds.value = new Set([...wishlistIds.value, productId])
    success('Adicionado à lista de desejos 💕')
    playWishlist()
  }

  async function removeFromWishlist(productId: string) {
    if (!user.value) return
    const { error } = await client
      .from('wishlists')
      .delete()
      .eq('product_id', productId)
    if (error) { toastError('Erro ao remover da lista de desejos'); return }
    const next = new Set(wishlistIds.value)
    next.delete(productId)
    wishlistIds.value = next
  }

  async function toggleWishlist(productId: string) {
    if (wishlistIds.value.has(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  function isInWishlist(productId: string) {
    return wishlistIds.value.has(productId)
  }

  async function fetchWishlistProducts() {
    if (!user.value) return []
    const { data, error } = await client
      .from('wishlists')
      .select('product_id, products(id, name, slug, price, original_price, images, available_for_pickup, categories(name, slug))')
      .order('created_at', { ascending: false })
    if (error) return []
    return (data ?? []).map((w: Record<string, unknown>) => w.products)
  }

  return {
    wishlistIds,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    fetchWishlistProducts,
  }
}
