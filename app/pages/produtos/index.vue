<script setup lang="ts">
const { fetchProducts, products, loading, hasMore, loadMore } = useProducts()
const route = useRoute()

// Filtros reativos
const filters = ref({
  category: (route.query.categoria as string) || '',
  minPrice: route.query.min ? Number(route.query.min) : undefined,
  maxPrice: route.query.max ? Number(route.query.max) : undefined,
  size: (route.query.tamanho as string) || '',
  pickupOnly: route.query.retirada === 'true',
  search: (route.query.busca as string) || '',
  sort: (route.query.ordem as string) || 'featured',
})

// Carregar produtos ao montar
onMounted(() => {
  fetchProducts(filters.value)
})

// Recarregar quando filtros mudarem
watch(filters, (newFilters) => {
  fetchProducts(newFilters)
}, { deep: true })

// Aplicar filtros
const applyFilters = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters }
}

// SEO
useHead({
  title: 'Nossos Presentes — Lover\'s Brasileiras',
  meta: [
    {
      name: 'description',
      content: 'Explore nossa coleção completa de presentes românticos: lingerie, perfumes, joias e maquiagens. Retirada grátis na loja.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-white pb-16 md:pb-0">
    <!-- Header -->
    <div class="bg-gradient-to-r from-rose-500 to-purple-500 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white text-center">
          Nossos Presentes 🎁
        </h1>
        <p class="mt-2 text-sm sm:text-base text-white/90 text-center">
          Encontre o presente perfeito para surpreender quem você ama
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="flex flex-col md:flex-row gap-6 md:gap-8">
        <!-- Filters Sidebar (Desktop) -->
        <aside class="hidden md:block w-64 flex-shrink-0">
          <ProductFilters
            :filters="filters"
            @update:filters="applyFilters"
          />
        </aside>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Mobile Filter Button -->
          <div class="md:hidden mb-4">
            <ProductFilters
              :filters="filters"
              @update:filters="applyFilters"
            />
          </div>

          <!-- Product Count -->
          <div class="mb-4 text-sm text-gray-600">
            <span v-if="!loading">
              {{ products.length }} {{ products.length === 1 ? 'produto encontrado' : 'produtos encontrados' }}
            </span>
          </div>

          <!-- Grid -->
          <ProductGrid
            :products="products"
            :loading="loading"
            :has-more="hasMore"
            @load-more="loadMore"
          />
        </div>
      </div>
    </div>
  </div>
</template>
