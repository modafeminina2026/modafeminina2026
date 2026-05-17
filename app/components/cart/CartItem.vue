<script setup lang="ts">
import { Trash2, Minus, Plus } from 'lucide-vue-next'
import type { CartItem } from '~/composables/useCart'

interface Props {
  item: CartItem
}

const props = defineProps<Props>()
const { updateQuantity, removeFromCart } = useCart()
</script>

<template>
  <div class="flex gap-3 py-3">
    <!-- Thumbnail -->
    <div class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50">
      <img
        :src="props.item.image || 'https://picsum.photos/100/100?grayscale'"
        :alt="props.item.name"
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <p class="text-sm font-medium text-gray-800 line-clamp-1">{{ props.item.name }}</p>
        <div class="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          <span v-if="props.item.size" class="text-xs text-gray-500">Tam: {{ props.item.size }}</span>
          <span v-if="props.item.color" class="text-xs text-gray-500">Cor: {{ props.item.color }}</span>
        </div>
        <p class="text-sm font-bold text-rose-600 mt-1">
          R$ {{ (props.item.price * props.item.quantity).toFixed(2).replace('.', ',') }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between mt-2">
        <!-- Quantity -->
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            class="flex items-center justify-center w-11 h-9 text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            :aria-label="`Diminuir quantidade de ${props.item.name}`"
            @click="updateQuantity(props.item.id, props.item.quantity - 1)"
          >
            <Minus class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span class="w-8 text-center text-sm font-medium text-gray-800" aria-live="polite">
            {{ props.item.quantity }}
          </span>
          <button
            class="flex items-center justify-center w-11 h-9 text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            :aria-label="`Aumentar quantidade de ${props.item.name}`"
            @click="updateQuantity(props.item.id, props.item.quantity + 1)"
          >
            <Plus class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <!-- Remove -->
        <button
          class="flex items-center justify-center w-11 h-11 text-gray-400 hover:text-red-500 transition-colors"
          :aria-label="`Remover ${props.item.name} do carrinho`"
          @click="removeFromCart(props.item.id)"
        >
          <Trash2 class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
