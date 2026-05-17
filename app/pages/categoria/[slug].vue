<script setup lang="ts">
const route = useRoute()
const { fetchProducts, products, loading, hasMore, loadMore } = useProducts()

// Buscar categoria
const { data: category, error } = await useFetch(`/api/categories/${route.params.slug}`)

if (error.value || !category.value) {
  throw createError({ statusCode: 404, message: 'Categoria não encontrada' })
}

// Filtros reativos
const filters = ref({
  category: category.value.id,
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

// SEO com structured data
const categoryDescription = category.value.description || `Explore nossa coleção de ${category.value.name.toLowerCase()}. Presentes românticos com retirada grátis na loja.`

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${category.value.name} — Lover's Brasileiras`,
  description: categoryDescription,
  url: `https://loversbrasileiras.com.br/categoria/${category.value.slug}`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://loversbrasileiras.com.br',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produtos',
        item: 'https://loversbrasileiras.com.br/produtos',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.value.name,
        item: `https://loversbrasileiras.com.br/categoria/${category.value.slug}`,
      },
    ],
  },
}

useHead({
  title: `${category.value.name} — Lover's Brasileiras`,
  meta: [
    { name: 'description', content: categoryDescription },
    { property: 'og:title', content: `${category.value.name} — Lover's Brasileiras` },
    { property: 'og:description', content: categoryDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://loversbrasileiras.com.br/categoria/${category.value.slug}` },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: `${category.value.name} — Lover's Brasileiras` },
    { name: 'twitter:description', content: categoryDescription },
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
  <div class="min-h-screen bg-white pb-16 md:pb-0">
    <!-- Category Hero -->
    <div class="relative bg-gradient-to-r from-rose-500 to-purple-500 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4">
          {{ category.name }}
        </h1>
        <p v-if="category.description" class="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
          {{ category.description }}
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
            :hide-category="true"
            @update:filters="applyFilters"
          />
        </aside>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Mobile Filter Button -->
          <div class="md:hidden mb-4">
            <ProductFilters
              :filters="filters"
              :hide-category="true"
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
