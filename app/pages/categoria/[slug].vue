<script setup lang="ts">
import type { ProductFilters } from '~/composables/useProducts'

const route = useRoute()
const { fetchProducts, products, loading, hasMore, loadMore } = useProducts()

const { data: category, error } = await useFetch(`/api/categories/${route.params.slug}`)

if (error.value || !category.value) {
  throw createError({ statusCode: 404, message: 'Categoria não encontrada' })
}

const cat = category.value as { id: string; name: string; slug: string; description?: string }

const filters = ref<ProductFilters>({
  category: cat.id,
  sort: (route.query.ordem as string) || 'featured',
  search: (route.query.busca as string) || '',
  minPrice: route.query.min ? Number(route.query.min) : undefined,
  maxPrice: route.query.max ? Number(route.query.max) : undefined,
  availableForPickup: route.query.retirada === 'true',
})

onMounted(() => fetchProducts(filters.value))

watch(filters, (v) => fetchProducts({ ...v, category: cat.id }), { deep: true })

const categoryDescription = cat.description || `Explore nossa coleção de ${cat.name.toLowerCase()}. Presentes românticos com retirada grátis na loja.`

useHead({
  title: `${cat.name} — Lover's Brasileiras`,
  meta: [
    { name: 'description', content: categoryDescription },
    { property: 'og:title', content: `${cat.name} — Lover's Brasileiras` },
    { property: 'og:description', content: categoryDescription },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-white pb-16 md:pb-0">
    <!-- Category Hero -->
    <div class="bg-gradient-to-r from-rose-500 to-purple-500 py-12 sm:py-16 md:py-20 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4">
          {{ cat.name }}
        </h1>
        <p v-if="cat.description" class="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
          {{ cat.description }}
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="flex flex-col md:flex-row gap-6 md:gap-8">
        <!-- Filters Sidebar (Desktop) -->
        <ProductFilters
          v-model="filters"
          class="hidden md:block"
          @apply="fetchProducts({ ...filters, category: cat.id })"
        />

        <div class="flex-1">
          <!-- Mobile Filters -->
          <div class="md:hidden mb-4">
            <ProductFilters
              v-model="filters"
              @apply="fetchProducts({ ...filters, category: cat.id })"
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
