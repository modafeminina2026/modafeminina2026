<script setup lang="ts">
import { Heart, ShoppingBag, MapPin } from 'lucide-vue-next'
import type { Product } from '~/composables/useProducts'

interface Props {
  product: Product
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { loading: false })

const { addToCart } = useCart()
const { toggleWishlist, isInWishlist } = useWishlist()
const { error: toastError } = useToast()

const inWishlist = computed(() => isInWishlist(props.product.id))

const discount = computed(() => {
  if (!props.product.original_price) return null
  return Math.round((1 - props.product.price / props.product.original_price) * 100)
})

function handleAddToCart() {
  if (props.product.stock === 0) { toastError('Produto sem estoque'); return }
  addToCart({
    productId: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.images[0] ?? '',
    quantity: 1,
    availableForPickup: props.product.available_for_pickup,
  })
}
</script>

<template>
  <!-- Skeleton -->
  <div v-if="props.loading" class="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
    <div class="aspect-square bg-gray-200" />
    <div class="p-3 space-y-2">
      <div class="h-3 bg-gray-200 rounded w-3/4" />
      <div class="h-3 bg-gray-200 rounded w-1/2" />
      <div class="h-9 bg-gray-200 rounded-lg mt-3" />
    </div>
  </div>

  <!-- Card -->
  <article v-else class="group rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden bg-gray-50">
      <NuxtLink :to="`/produtos/${props.product.slug}`" :aria-label="props.product.name">
        <img
          :src="props.product.images[0] ?? 'https://picsum.photos/400/400?grayscale'"
          :alt="props.product.name"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
        />
      </NuxtLink>

      <!-- Discount badge -->
      <AppBadge v-if="discount" variant="red" size="sm" class="absolute top-2 left-2">
        -{{ discount }}%
      </AppBadge>

      <!-- Pickup badge -->
      <div
        v-if="props.product.available_for_pickup"
        class="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-full"
      >
        <MapPin class="w-3 h-3 text-rose-500" aria-hidden="true" />
        <span>Retirada</span>
      </div>

      <!-- Wishlist button -->
      <button
        class="absolute top-2 right-2 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors active:scale-95"
        :class="inWishlist ? 'text-rose-600' : 'text-gray-400 hover:text-rose-500'"
        :aria-label="inWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'"
        @click.prevent="toggleWishlist(props.product.id)"
      >
        <Heart class="w-4 h-4" :fill="inWishlist ? 'currentColor' : 'none'" aria-hidden="true" />
      </button>
    </div>

    <!-- Info -->
    <div class="p-3">
      <!-- Category -->
      <p v-if="props.product.categories" class="text-xs text-purple-500 font-medium mb-1 truncate">
        {{ props.product.categories.name }}
      </p>

      <!-- Name -->
      <NuxtLink :to="`/produtos/${props.product.slug}`">
        <h3 class="text-sm font-medium text-gray-800 line-clamp-2 leading-snug hover:text-rose-600 transition-colors">
          {{ props.product.name }}
        </h3>
      </NuxtLink>

      <!-- Price -->
      <div class="flex items-baseline gap-2 mt-1.5">
        <span class="text-base font-bold text-rose-600">
          R$ {{ props.product.price.toFixed(2).replace('.', ',') }}
        </span>
        <span v-if="props.product.original_price" class="text-xs text-gray-400 line-through">
          R$ {{ props.product.original_price.toFixed(2).replace('.', ',') }}
        </span>
      </div>

      <!-- Add to cart -->
      <button
        class="mt-3 w-full h-10 sm:h-11 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-lg transition-colors active:scale-[0.97]"
        :disabled="props.product.stock === 0"
        :aria-label="`Adicionar ${props.product.name} ao carrinho`"
        @click="handleAddToCart"
      >
        <ShoppingBag class="w-4 h-4" aria-hidden="true" />
        {{ props.product.stock === 0 ? 'Sem Estoque' : 'Adicionar' }}
      </button>
    </div>
  </article>
</template>
