<script setup lang="ts">
import type { Product } from '~/composables/useProducts'

interface Props {
  products: Product[]
  loading?: boolean
  hasMore?: boolean
  loadingMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: false,
  loadingMore: false,
})

const emit = defineEmits<{ loadMore: [] }>()
</script>

<template>
  <div>
    <!-- Grid -->
    <div
      v-if="props.loading"
      class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
      aria-busy="true"
      aria-label="Carregando produtos"
    >
      <ProductCard v-for="n in 8" :key="n" :product="{} as never" loading />
    </div>

    <div
      v-else-if="props.products.length"
      class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      <ProductCard
        v-for="product in props.products"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <span class="text-5xl mb-4" aria-hidden="true">🔍</span>
      <p class="text-lg font-medium text-gray-700">Nenhum produto encontrado</p>
      <p class="text-sm text-gray-500 mt-1">Tente ajustar os filtros ou buscar por outro termo.</p>
    </div>

    <!-- Load more -->
    <div v-if="props.hasMore && !props.loading" class="flex justify-center mt-8">
      <button
        class="h-11 px-8 rounded-lg border border-rose-300 text-rose-600 font-medium text-sm hover:bg-rose-50 transition-colors active:scale-[0.97] disabled:opacity-50"
        :disabled="props.loadingMore"
        @click="emit('loadMore')"
      >
        <span v-if="props.loadingMore" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Carregando...
        </span>
        <span v-else>Carregar Mais</span>
      </button>
    </div>
  </div>
</template>
