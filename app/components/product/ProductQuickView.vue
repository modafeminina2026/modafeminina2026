<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'
import type { Product } from '~/composables/useProducts'

interface Props {
  modelValue: boolean
  product: Product | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { addToCart } = useCart()
const { error: toastError } = useToast()

const selectedSize  = ref<string | null>(null)
const selectedColor = ref<string | null>(null)

watch(() => props.product, () => {
  selectedSize.value  = null
  selectedColor.value = null
})

function handleAdd() {
  if (!props.product) return
  if (props.product.sizes?.length && !selectedSize.value) {
    toastError('Selecione um tamanho')
    return
  }
  addToCart({
    productId: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.images[0] ?? '',
    quantity: 1,
    size: selectedSize.value ?? undefined,
    color: selectedColor.value ?? undefined,
    availableForPickup: props.product.available_for_pickup,
  })
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal :model-value="props.modelValue" bottom-sheet @update:model-value="emit('update:modelValue', $event)">
    <div v-if="props.product" class="p-4 pb-6">
      <div class="flex gap-4">
        <!-- Image -->
        <div class="w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-gray-50">
          <img
            :src="props.product.images[0] ?? 'https://picsum.photos/200/200?grayscale'"
            :alt="props.product.name"
            loading="lazy"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p v-if="props.product.categories" class="text-xs text-purple-500 font-medium mb-1">
            {{ props.product.categories.name }}
          </p>
          <h3 class="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
            {{ props.product.name }}
          </h3>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-lg font-bold text-rose-600">
              R$ {{ props.product.price.toFixed(2).replace('.', ',') }}
            </span>
            <span v-if="props.product.original_price" class="text-sm text-gray-400 line-through">
              R$ {{ props.product.original_price.toFixed(2).replace('.', ',') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p v-if="props.product.description" class="mt-3 text-sm text-gray-600 line-clamp-3">
        {{ props.product.description }}
      </p>

      <!-- Sizes -->
      <div v-if="props.product.sizes?.length" class="mt-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tamanho</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="size in props.product.sizes"
            :key="size"
            class="w-12 h-12 rounded-lg border text-sm font-medium transition-colors"
            :class="selectedSize === size
              ? 'bg-rose-600 border-rose-600 text-white'
              : 'border-gray-200 text-gray-700 hover:border-rose-300'"
            :aria-pressed="selectedSize === size"
            @click="selectedSize = size"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <!-- Colors -->
      <div v-if="props.product.colors?.length" class="mt-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cor</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in props.product.colors"
            :key="color"
            class="h-10 px-3 rounded-lg border text-sm font-medium transition-colors"
            :class="selectedColor === color
              ? 'bg-rose-600 border-rose-600 text-white'
              : 'border-gray-200 text-gray-700 hover:border-rose-300'"
            :aria-pressed="selectedColor === color"
            @click="selectedColor = color"
          >
            {{ color }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-5 flex flex-col gap-2">
        <button
          class="w-full h-12 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors active:scale-[0.97]"
          :disabled="props.product.stock === 0"
          @click="handleAdd"
        >
          <ShoppingBag class="w-4 h-4" aria-hidden="true" />
          {{ props.product.stock === 0 ? 'Sem Estoque' : 'Adicionar ao Carrinho' }}
        </button>
        <NuxtLink
          :to="`/produtos/${props.product.slug}`"
          class="w-full h-11 flex items-center justify-center text-sm font-medium text-rose-600 hover:underline"
          @click="emit('update:modelValue', false)"
        >
          Ver Detalhes Completos →
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>
