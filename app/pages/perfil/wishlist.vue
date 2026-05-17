<script setup lang="ts">
import { Heart, ShoppingBag } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const { fetchWishlistProducts, removeFromWishlist } = useWishlist()
const { addToCart } = useCart()
const { success } = useToast()

interface WishlistProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  available_for_pickup: boolean
}

const products = ref<WishlistProduct[]>([])
const loading = ref(true)

onMounted(async () => {
  products.value = (await fetchWishlistProducts()) as WishlistProduct[]
  loading.value = false
})

async function handleRemove(productId: string) {
  await removeFromWishlist(productId)
  products.value = products.value.filter((p) => p.id !== productId)
}

function handleAddToCart(product: WishlistProduct) {
  addToCart({
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? '',
    quantity: 1,
    availableForPickup: product.available_for_pickup,
  })
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

useHead({
  title: 'Lista de Desejos — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Seus produtos favoritos na Lover\'s Brasileiras.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 md:pb-8">
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink
          to="/perfil"
          class="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Voltar ao perfil"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1 class="text-xl font-semibold text-gray-900">Lista de Desejos</h1>
        <span v-if="products.length > 0" class="ml-auto text-sm text-gray-500">{{ products.length }} {{ products.length === 1 ? 'item' : 'itens' }}</span>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="grid grid-cols-2 gap-3">
        <div v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div class="aspect-square bg-gray-200" />
          <div class="p-3 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-3/4" />
            <div class="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Lista vazia -->
      <div v-else-if="products.length === 0" class="text-center py-16">
        <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart class="w-8 h-8 text-rose-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Sua lista está vazia</h2>
        <p class="text-gray-500 text-sm mb-6">Salve produtos que você ama para comprar depois 💕</p>
        <NuxtLink
          to="/produtos"
          class="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-full min-h-[48px] inline-flex items-center hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
        >
          Explorar Produtos
        </NuxtLink>
      </div>

      <!-- Grid de produtos -->
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm"
        >
          <!-- Imagem -->
          <div class="relative aspect-square">
            <NuxtLink :to="`/produtos/${product.slug}`">
              <img
                :src="product.images[0]"
                :alt="product.name"
                class="w-full h-full object-cover"
                loading="lazy"
              >
            </NuxtLink>
            <!-- Botão remover -->
            <button
              class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 active:scale-[0.95] transition-all"
              aria-label="Remover da lista de desejos"
              @click="handleRemove(product.id)"
            >
              <Heart class="w-4 h-4 text-rose-500 fill-rose-500" />
            </button>
          </div>

          <!-- Info -->
          <div class="p-3">
            <NuxtLink :to="`/produtos/${product.slug}`">
              <p class="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{{ product.name }}</p>
            </NuxtLink>
            <p class="font-bold text-rose-600 text-sm mb-2">{{ formatPrice(product.price) }}</p>
            <button
              class="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold py-2 rounded-lg min-h-[36px] flex items-center justify-center gap-1 hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
              @click="handleAddToCart(product)"
            >
              <ShoppingBag class="w-3.5 h-3.5" />
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
