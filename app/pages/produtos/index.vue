<script setup lang="ts">
import type { ProductFilters } from '~/composables/useProducts'

const { fetchProducts, products, loading, hasMore, loadMore } = useProducts()
const route = useRoute()

const filters = ref<ProductFilters>({
  sort: (route.query.ordem as string) || 'featured',
  search: (route.query.busca as string) || '',
  minPrice: route.query.min ? Number(route.query.min) : undefined,
  maxPrice: route.query.max ? Number(route.query.max) : undefined,
  availableForPickup: route.query.retirada === 'true',
})

onMounted(() => fetchProducts(filters.value))

watch(filters, (v) => fetchProducts(v), { deep: true })

useHead({
  title: 'Nossos Presentes — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Explore nossa coleção completa de presentes românticos: lingerie, perfumes, joias e maquiagens.' }],
})
</script>

<template>
  <div class="min-h-screen bg-white pb-16 md:pb-0">
    <!-- Header -->
    <div class="bg-gradient-to-r from-rose-500 to-purple-500 py-8 sm:py-12 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">
          Nossos Presentes 🎁
        </h1>
        <p class="mt-2 text-sm sm:text-base text-white/90">
          Encontre o presente perfeito para surpreender quem você ama
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="flex flex-col md:flex-row gap-6 md:gap-8">
        <!-- Filters Sidebar (Desktop) -->
        <ProductFilters
          v-model="filters"
          class="hidden md:block"
          @apply="fetchProducts(filters)"
        />

        <div class="flex-1">
          <!-- Mobile Filters -->
          <div class="md:hidden mb-4">
            <ProductFilters
              v-model="filters"
              @apply="fetchProducts(filters)"
            />
          </div>

          <!-- Count -->
          <div class="mb-4 text-sm text-gray-600">
            <span v-if="!loading">
              {{ products.length }} {{ products.length === 1 ? 'produto encontrado' : 'produtos encontrados' }}
            </span>
          </div>

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
