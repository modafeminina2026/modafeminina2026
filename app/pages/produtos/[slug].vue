<script setup lang="ts">
const route = useRoute()
const { addToCart } = useCart()
const { toggleWishlist, isInWishlist } = useWishlist()
const { success: toastSuccess, warning: toastWarning, info: toastInfo } = useToast()

// Buscar produto
const { data: product, error } = await useFetch(`/api/products/${route.params.slug}`)

if (error.value || !product.value) {
  throw createError({ statusCode: 404, message: 'Produto não encontrado' })
}

// Estado do produto
const selectedSize = ref(product.value.sizes?.[0] || '')
const selectedColor = ref(product.value.colors?.[0] || '')
const quantity = ref(1)

// Adicionar ao carrinho
const handleAddToCart = () => {
  if (product.value!.sizes && product.value!.sizes.length > 0 && !selectedSize.value) {
    toastWarning('Por favor, selecione um tamanho')
    return
  }

  addToCart({
    productId: product.value!.id,
    name: product.value!.name,
    price: product.value!.price,
    image: product.value!.images[0],
    size: selectedSize.value,
    color: selectedColor.value,
    quantity: quantity.value,
    availableForPickup: product.value!.available_for_pickup ?? false,
  })
}

// Toggle wishlist
const handleToggleWishlist = () => {
  toggleWishlist(product.value!.id)
  const inWishlist = isInWishlist(product.value!.id)
  if (inWishlist) {
    toastSuccess('Adicionado à lista de desejos 💕')
  } else {
    toastInfo('Removido da lista de desejos')
  }
}

// Calcular desconto
const discount = computed(() => {
  if (!product.value!.original_price) return 0
  return Math.round(((product.value!.original_price - product.value!.price) / product.value!.original_price) * 100)
})

// SEO com structured data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.value.name,
  description: product.value.description,
  image: product.value.images,
  brand: {
    '@type': 'Brand',
    name: 'Lover\'s Brasileiras',
  },
  offers: {
    '@type': 'Offer',
    url: `https://loversbrasileiras.com.br/produtos/${product.value.slug}`,
    priceCurrency: 'BRL',
    price: product.value.price,
    availability: product.value.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Lover\'s Brasileiras',
    },
  },
}

useHead({
  title: `${product.value.name} — Lover's Brasileiras`,
  meta: [
    { name: 'description', content: product.value.description },
    { property: 'og:title', content: `${product.value.name} — Lover's Brasileiras` },
    { property: 'og:description', content: product.value.description },
    { property: 'og:image', content: product.value.images[0] },
    { property: 'og:type', content: 'product' },
    { property: 'og:url', content: `https://loversbrasileiras.com.br/produtos/${product.value.slug}` },
    { property: 'product:price:amount', content: product.value.price.toString() },
    { property: 'product:price:currency', content: 'BRL' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${product.value.name} — Lover's Brasileiras` },
    { name: 'twitter:description', content: product.value.description },
    { name: 'twitter:image', content: product.value.images[0] },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(structuredData),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-white pb-20 md:pb-8">
    <!-- Breadcrumb -->
    <div class="bg-gray-50 px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
      <div class="max-w-7xl mx-auto">
        <nav class="flex items-center space-x-2 text-sm whitespace-nowrap">
          <NuxtLink to="/" class="text-gray-500 hover:text-rose-600">Home</NuxtLink>
          <span class="text-gray-400">/</span>
          <NuxtLink to="/produtos" class="text-gray-500 hover:text-rose-600">Produtos</NuxtLink>
          <span class="text-gray-400">/</span>
          <span class="text-gray-900 font-medium">{{ product.name }}</span>
        </nav>
      </div>
    </div>

    <!-- Product Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <!-- Gallery -->
        <div class="w-full">
          <ProductGallery :images="product.images" :name="product.name" />
        </div>

        <!-- Product Info -->
        <div class="flex flex-col">
          <!-- Title & Price -->
          <div class="mb-4">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
              {{ product.name }}
            </h1>
            
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl sm:text-4xl font-bold text-rose-600">
                {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) }}
              </span>
              <span v-if="product.original_price" class="text-lg text-gray-400 line-through">
                {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.original_price) }}
              </span>
              <AppBadge v-if="discount > 0" variant="success" size="md">
                -{{ discount }}%
              </AppBadge>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
              <AppBadge v-if="product.featured" variant="primary">Destaque</AppBadge>
              <AppBadge v-if="product.available_for_pickup" variant="info">
                🏪 Retirada Grátis
              </AppBadge>
              <AppBadge v-if="product.stock > 0" variant="success">Em estoque</AppBadge>
              <AppBadge v-else variant="danger">Esgotado</AppBadge>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6 text-sm sm:text-base text-gray-700 leading-relaxed">
            {{ product.description }}
          </div>

          <!-- Size Selection -->
          <div v-if="product.sizes && product.sizes.length > 0" class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Tamanho
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in product.sizes"
                :key="size"
                @click="selectedSize = size"
                :class="[
                  'min-w-[44px] h-11 px-4 rounded-lg border-2 font-medium transition-all',
                  selectedSize === size
                    ? 'border-rose-600 bg-rose-50 text-rose-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-rose-300',
                ]"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Color Selection -->
          <div v-if="product.colors && product.colors.length > 0" class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Cor
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in product.colors"
                :key="color"
                @click="selectedColor = color"
                :class="[
                  'min-w-[44px] h-11 px-4 rounded-lg border-2 font-medium transition-all',
                  selectedColor === color
                    ? 'border-rose-600 bg-rose-50 text-rose-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-rose-300',
                ]"
              >
                {{ color }}
              </button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Quantidade
            </label>
            <div class="flex items-center gap-3">
              <button
                @click="quantity = Math.max(1, quantity - 1)"
                class="w-11 h-11 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-rose-300 transition-colors"
                :disabled="quantity <= 1"
              >
                <span class="text-xl">−</span>
              </button>
              <span class="text-lg font-medium w-12 text-center">{{ quantity }}</span>
              <button
                @click="quantity = Math.min(product.stock, quantity + 1)"
                class="w-11 h-11 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-rose-300 transition-colors"
                :disabled="quantity >= product.stock"
              >
                <span class="text-xl">+</span>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <AppButton
              variant="primary"
              size="lg"
              class="flex-1"
              :disabled="product.stock === 0"
              @click="handleAddToCart"
            >
              Adicionar ao Carrinho
            </AppButton>
            <AppButton
              variant="outline"
              size="lg"
              @click="handleToggleWishlist"
            >
              {{ isInWishlist(product.id) ? '💕' : '🤍' }}
            </AppButton>
          </div>

          <!-- Pickup Info -->
          <div v-if="product.available_for_pickup" class="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🏪</span>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">Retirada Grátis na Loja</h3>
                <p class="text-sm text-gray-700">
                  Disponível em até 3 dias úteis após a confirmação do pagamento.
                  Você receberá um código de 4 dígitos para retirada.
                </p>
                <NuxtLink to="/retirada" class="text-sm text-rose-600 hover:text-rose-700 font-medium mt-2 inline-block">
                  Saiba mais →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="mt-12 sm:mt-16 md:mt-20">
        <ProductRecommendations
          :category-slug="product.categories?.slug ?? ''"
          :exclude-id="product.id"
        />
      </div>
    </div>

    <!-- Sticky Add to Cart (Mobile) -->
    <div class="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
      <AppButton
        variant="primary"
        size="lg"
        class="w-full"
        :disabled="product.stock === 0"
        @click="handleAddToCart"
      >
        Adicionar ao Carrinho — {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) }}
      </AppButton>
    </div>
  </div>
</template>
