<script setup lang="ts">
interface Props {
  categorySlug: string
  excludeId: string
}

const props = defineProps<Props>()

const { fetchProductsByCategory } = useProducts()

const products = ref<Awaited<ReturnType<typeof fetchProductsByCategory>>>([])
const loading  = ref(true)

onMounted(async () => {
  try {
    const all = await fetchProductsByCategory(props.categorySlug)
    products.value = all.filter((p) => p.id !== props.excludeId).slice(0, 8)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section v-if="loading || products.length" aria-label="Produtos recomendados">
    <h2 class="text-lg sm:text-xl font-display font-semibold text-gray-900 mb-4">
      Você Também Pode Gostar 💕
    </h2>

    <!-- Skeleton -->
    <div
      v-if="loading"
      class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="shrink-0 w-44 sm:w-52 rounded-xl bg-gray-100 animate-pulse snap-start"
      >
        <div class="aspect-square rounded-t-xl bg-gray-200" />
        <div class="p-3 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>

    <!-- Carousel -->
    <div
      v-else
      class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
      role="list"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="shrink-0 w-44 sm:w-52 snap-start"
        role="listitem"
      >
        <ProductCard :product="product" />
      </div>
    </div>
  </section>
</template>
