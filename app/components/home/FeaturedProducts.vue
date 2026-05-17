<script setup lang="ts">
const { fetchFeaturedProducts } = useProducts()

const products = ref<Awaited<ReturnType<typeof fetchFeaturedProducts>>>([])
const loading  = ref(true)

onMounted(async () => {
  try { products.value = await fetchFeaturedProducts(8) }
  finally { loading.value = false }
})
</script>

<template>
  <section aria-label="Presentes em destaque">
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-900">
        Presentes em Destaque ✨
      </h2>
      <NuxtLink to="/produtos" class="text-sm text-rose-600 font-medium hover:underline shrink-0">Ver todos</NuxtLink>
    </div>

    <!-- Mobile: horizontal carousel -->
    <div class="md:hidden">
      <div
        v-if="loading"
        class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
      >
        <div v-for="n in 4" :key="n" class="shrink-0 w-44 snap-start">
          <ProductCard :product="{} as never" loading />
        </div>
      </div>
      <div
        v-else
        class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        role="list"
      >
        <div v-for="p in products" :key="p.id" class="shrink-0 w-44 snap-start" role="listitem">
          <ProductCard :product="p" />
        </div>
      </div>
    </div>

    <!-- Desktop: grid -->
    <div class="hidden md:block">
      <ProductGrid :products="products" :loading="loading" />
    </div>
  </section>
</template>
